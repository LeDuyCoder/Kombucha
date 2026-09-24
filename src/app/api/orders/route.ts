import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { INITIAL_MENU_ITEMS, INITIAL_TABLES } from '@/lib/mock-data';
import { Order, OrderItem, OrderStatus } from '@/types';

// In-memory store for fallback demo when Supabase is not configured yet
// This allows immediate testing out of the box!
const mockOrders: Order[] = [];
let mockOrderIdCounter = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, sessionId, note, items } = body;

    if (!tableNumber || !sessionId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Dữ liệu order không hợp lệ (cần tableNumber, sessionId, và danh sách món)' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured) {
      // 1. Get Table UUID
      const { data: tableData, error: tableError } = await supabase
        .from('restaurant_tables')
        .select('id, table_number')
        .eq('table_number', Number(tableNumber))
        .single();

      if (tableError || !tableData) {
        return NextResponse.json({ error: 'Không tìm thấy bàn yêu cầu' }, { status: 404 });
      }

      // 2. Fetch official item prices from DB (Security: Price is calculated on server)
      const itemIds = items.map((i: { menu_item_id: string }) => i.menu_item_id);
      const { data: dbItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('id, name, price, available')
        .in('id', itemIds);

      if (itemsError || !dbItems || dbItems.length === 0) {
        return NextResponse.json({ error: 'Lỗi truy vấn danh sách món ăn' }, { status: 400 });
      }

      const itemMap = new Map(dbItems.map((item) => [item.id, item]));

      let totalAmount = 0;
      const orderItemsToInsert: {
        menu_item_id: string;
        item_name: string;
        price: number;
        quantity: number;
        note?: string;
      }[] = [];

      for (const item of items) {
        const menuItem = itemMap.get(item.menu_item_id);
        if (!menuItem) continue;
        if (!menuItem.available) {
          return NextResponse.json(
            { error: `Món "${menuItem.name}" hiện tại đã hết` },
            { status: 400 }
          );
        }

        const qty = Math.max(1, Number(item.quantity) || 1);
        const itemPrice = menuItem.price;
        totalAmount += itemPrice * qty;

        orderItemsToInsert.push({
          menu_item_id: menuItem.id,
          item_name: menuItem.name,
          price: itemPrice,
          quantity: qty,
          note: item.note || '',
        });
      }

      // 3. Create Order in Supabase
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          session_id: sessionId,
          table_id: tableData.id,
          status: 'WAITING',
          note: note || '',
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (orderError || !newOrder) {
        console.error('Supabase Order Insert Error:', orderError);
        return NextResponse.json({ error: 'Không thể tạo order vào cơ sở dữ liệu' }, { status: 500 });
      }

      // 4. Insert Order Items
      const itemsWithOrderId = orderItemsToInsert.map((i) => ({
        ...i,
        order_id: newOrder.id,
      }));

      const { data: insertedItems, error: orderItemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)
        .select();

      if (orderItemsError) {
        console.error('Order Items Insert Error:', orderItemsError);
      }

      return NextResponse.json({
        success: true,
        order: {
          ...newOrder,
          table_number: tableData.table_number,
          order_items: insertedItems || [],
        },
      });
    } else {
      // Fallback in-memory mock mode
      const itemMap = new Map(INITIAL_MENU_ITEMS.map((item) => [item.id, item]));
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const menuItem = itemMap.get(item.menu_item_id);
        if (!menuItem) continue;
        const qty = Math.max(1, Number(item.quantity) || 1);
        totalAmount += menuItem.price * qty;

        orderItems.push({
          id: `item-${Date.now()}-${Math.random()}`,
          order_id: `mock-order-${mockOrderIdCounter}`,
          menu_item_id: menuItem.id,
          item_name: menuItem.name,
          price: menuItem.price,
          quantity: qty,
          note: item.note || '',
        });
      }

      const table = INITIAL_TABLES.find((t) => t.table_number === Number(tableNumber));
      const orderId = `order-#${String(mockOrderIdCounter++).padStart(3, '0')}`;

      const newOrder: Order = {
        id: orderId,
        session_id: sessionId,
        table_id: table?.id || 'tbl-1',
        table_number: Number(tableNumber),
        status: 'WAITING',
        note: note || '',
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        order_items: orderItems,
      };

      mockOrders.unshift(newOrder);

      return NextResponse.json({
        success: true,
        order: newOrder,
      });
    }
  } catch (error) {
    console.error('Order Creation API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const tableNumber = searchParams.get('tableNumber');
    const status = searchParams.get('status');

    if (isSupabaseConfigured) {
      let query = supabase
        .from('orders')
        .select(`
          id,
          session_id,
          table_id,
          status,
          note,
          total_amount,
          created_at,
          updated_at,
          restaurant_tables!inner(table_number),
          order_items (
            id,
            menu_item_id,
            item_name,
            price,
            quantity,
            note
          )
        `)
        .order('created_at', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase Fetch Orders Error:', error);
        return NextResponse.json({ error: 'Lỗi tải danh sách order' }, { status: 500 });
      }

      // Format table_number
      const formatted = data.map((o: any) => ({
        ...o,
        table_number: o.restaurant_tables?.table_number,
      }));

      return NextResponse.json({ orders: formatted });
    } else {
      let results = [...mockOrders];
      if (sessionId) {
        results = results.filter((o) => o.session_id === sessionId);
      }
      if (tableNumber) {
        results = results.filter((o) => o.table_number === Number(tableNumber));
      }
      if (status) {
        results = results.filter((o) => o.status === status);
      }

      return NextResponse.json({ orders: results });
    }
  } catch (error) {
    console.error('Orders GET API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
