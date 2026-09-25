import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  getMockMenuItems,
  updateMockMenuItem,
  INITIAL_TABLES,
  getMockTables,
  getMockOrders,
  addMockOrder,
  getNextMockOrderId,
} from '@/lib/mock-data';
import { Order, OrderItem, OrderStatus } from '@/types';
import { emitOrderCreated } from '@/lib/order-events';

// Global Sequential Async Order Queue to prevent Race Conditions / Duplicate Stock Deductions
class AsyncOrderQueue {
  private queue: Promise<any> = Promise.resolve();

  public enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue
        .catch(() => {}) // Prevent previous rejections from breaking the queue
        .then(() => task())
        .then(resolve)
        .catch(reject);
    });
  }
}

const globalForQueue = globalThis as unknown as {
  __orderQueue?: AsyncOrderQueue;
};

const orderQueue = globalForQueue.__orderQueue || new AsyncOrderQueue();
if (process.env.NODE_ENV !== 'production') {
  globalForQueue.__orderQueue = orderQueue;
}

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

    // Process order inside the strictly serialized FIFO Queue
    return await orderQueue.enqueue(async () => {
      if (isSupabaseConfigured) {
        // 1. Get Table UUID
        const { data: tableData, error: tableError } = await supabase
          .from('restaurant_tables')
          .select('id, table_number')
          .eq('table_number', tableNumber)
          .single();

        if (tableError || !tableData) {
          return NextResponse.json({ error: 'Không tìm thấy phòng yêu cầu' }, { status: 404 });
        }

        // 2. Fetch official item prices & real-time stock from DB
        const itemIds = items.map((i: { menu_item_id: string }) => i.menu_item_id);
        const { data: dbItems, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, price, available, stock_quantity')
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

        // Validate stock sufficiency for all requested items
        for (const item of items) {
          const menuItem = itemMap.get(item.menu_item_id);
          if (!menuItem) {
            return NextResponse.json({ error: 'Món ăn không tồn tại' }, { status: 400 });
          }

          if (!menuItem.available) {
            return NextResponse.json(
              { error: `Món "${menuItem.name}" hiện tại đã hết món` },
              { status: 400 }
            );
          }

          const qty = Math.max(1, Number(item.quantity) || 1);

          if (menuItem.stock_quantity !== null && menuItem.stock_quantity !== undefined) {
            if (menuItem.stock_quantity < qty) {
              return NextResponse.json(
                {
                  error: `Món "${menuItem.name}" chỉ còn ${menuItem.stock_quantity} phần trong kho, không đủ để đặt ${qty} phần. Vui lòng giảm số lượng.`,
                },
                { status: 400 }
              );
            }
          }

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

        // Deduct stock in Supabase
        for (const item of items) {
          const menuItem = itemMap.get(item.menu_item_id);
          if (menuItem && menuItem.stock_quantity !== null && menuItem.stock_quantity !== undefined) {
            const qty = Math.max(1, Number(item.quantity) || 1);
            const newStock = Math.max(0, menuItem.stock_quantity - qty);
            await supabase
              .from('menu_items')
              .update({
                stock_quantity: newStock,
                available: newStock > 0,
              })
              .eq('id', menuItem.id);
          }
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

        const createdOrderPayload = {
          ...newOrder,
          table_number: tableData.table_number,
          order_items: insertedItems || [],
        };

        emitOrderCreated(createdOrderPayload);

        return NextResponse.json({
          success: true,
          order: createdOrderPayload,
        });
      } else {
        // Fallback in-memory atomic mode (Local / Mock)
        const currentMenuItems = getMockMenuItems();
        const itemMap = new Map(currentMenuItems.map((item) => [item.id, item]));

        let totalAmount = 0;
        const orderId = getNextMockOrderId();
        const orderItems: OrderItem[] = [];

        // 1. Stock & availability pre-check
        for (const item of items) {
          const menuItem = itemMap.get(item.menu_item_id);
          if (!menuItem) {
            return NextResponse.json({ error: 'Món ăn không tồn tại' }, { status: 400 });
          }

          if (!menuItem.available) {
            return NextResponse.json(
              { error: `Món "${menuItem.name}" hiện tại đã hết món` },
              { status: 400 }
            );
          }

          const qty = Math.max(1, Number(item.quantity) || 1);

          if (menuItem.stock_quantity !== null && menuItem.stock_quantity !== undefined) {
            if (menuItem.stock_quantity < qty) {
              return NextResponse.json(
                {
                  error: `Món "${menuItem.name}" chỉ còn ${menuItem.stock_quantity} phần trong kho, không đủ để đặt ${qty} phần. Vui lòng giảm số lượng.`,
                },
                { status: 400 }
              );
            }
          }

          totalAmount += menuItem.price * qty;

          orderItems.push({
            id: `item-${Date.now()}-${Math.random()}`,
            order_id: orderId,
            menu_item_id: menuItem.id,
            item_name: menuItem.name,
            price: menuItem.price,
            quantity: qty,
            note: item.note || '',
          });
        }

        // 2. Safe Atomic Stock Deduction
        for (const item of items) {
          const menuItem = itemMap.get(item.menu_item_id);
          if (menuItem && menuItem.stock_quantity !== null && menuItem.stock_quantity !== undefined) {
            const qty = Math.max(1, Number(item.quantity) || 1);
            const newStock = Math.max(0, menuItem.stock_quantity - qty);
            updateMockMenuItem(menuItem.id, {
              stock_quantity: newStock,
              available: newStock > 0,
            });
          }
        }

        const tables = getMockTables();
        const table = tables.find((t) => String(t.table_number).toLowerCase() === String(tableNumber).toLowerCase());

        const newOrder: Order = {
          id: orderId,
          session_id: sessionId,
          table_id: table?.id || 'tbl-1',
          table_number: tableNumber,
          status: 'WAITING',
          note: note || '',
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          order_items: orderItems,
        };

        addMockOrder(newOrder);
        emitOrderCreated(newOrder);

        return NextResponse.json({
          success: true,
          order: newOrder,
        });
      }
    });
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
          rating,
          feedback_note,
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
      let results = [...getMockOrders()];
      if (sessionId) {
        results = results.filter((o) => o.session_id === sessionId);
      }
      if (tableNumber) {
        results = results.filter((o) => String(o.table_number).toLowerCase() === String(tableNumber).toLowerCase());
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
