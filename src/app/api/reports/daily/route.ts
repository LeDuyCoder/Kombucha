import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getMockOrders } from '@/lib/mock-data';
import { Order } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Date string YYYY-MM-DD (e.g. 2026-09-24)
    const targetDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let orders: Order[] = [];

    if (isSupabaseConfigured) {
      // Calculate start and end of the target day in UTC
      const startOfDay = `${targetDate}T00:00:00.000Z`;
      const endOfDay = `${targetDate}T23:59:59.999Z`;

      const { data, error } = await supabase
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
          restaurant_tables (table_number),
          order_items (
            id,
            menu_item_id,
            item_name,
            price,
            quantity,
            note
          )
        `)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Daily Report Error:', error);
        return NextResponse.json({ error: 'Lỗi tải dữ liệu báo cáo' }, { status: 500 });
      }

      orders = (data || []).map((o: any) => ({
        ...o,
        table_number: o.restaurant_tables?.table_number,
      }));
    } else {
      // Mock orders filtering by date prefix
      const allMock = getMockOrders();
      orders = allMock.filter((o) => {
        const orderDate = o.created_at.split('T')[0];
        return orderDate === targetDate;
      });
    }

    // 1. Overall Summary
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const waitingOrders = orders.filter((o) => o.status === 'WAITING');
    const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
    const readyOrders = orders.filter((o) => o.status === 'READY');
    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

    // Revenue from completed orders (and total from all non-cancelled)
    const completedRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalPotentialRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    // 2. Item Breakdown
    const itemMap = new Map<string, { name: string; price: number; quantity: number; total: number }>();

    for (const order of orders) {
      if (order.status === 'CANCELLED') continue;
      if (order.order_items) {
        for (const item of order.order_items) {
          const existing = itemMap.get(item.item_name);
          if (existing) {
            existing.quantity += item.quantity;
            existing.total += item.price * item.quantity;
          } else {
            itemMap.set(item.item_name, {
              name: item.item_name,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity,
            });
          }
        }
      }
    }

    const itemBreakdown = Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity);
    const totalItemsSold = itemBreakdown.reduce((sum, i) => sum + i.quantity, 0);

    // 3. Table Breakdown
    const tableMap = new Map<string | number, { tableNumber: string | number; orderCount: number; totalAmount: number }>();
    for (const order of orders) {
      if (order.status === 'CANCELLED') continue;
      const tNum = order.table_number || 'N/A';
      const existing = tableMap.get(tNum);
      if (existing) {
        existing.orderCount += 1;
        existing.totalAmount += order.total_amount || 0;
      } else {
        tableMap.set(tNum, {
          tableNumber: tNum,
          orderCount: 1,
          totalAmount: order.total_amount || 0,
        });
      }
    }

    const tableBreakdown = Array.from(tableMap.values()).sort((a, b) => {
      const numA = Number(a.tableNumber);
      const numB = Number(b.tableNumber);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.tableNumber).localeCompare(String(b.tableNumber), 'vi');
    });

    return NextResponse.json({
      date: targetDate,
      summary: {
        totalOrders,
        completedOrdersCount: completedOrders.length,
        waitingOrdersCount: waitingOrders.length,
        preparingOrdersCount: preparingOrders.length,
        readyOrdersCount: readyOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        completedRevenue,
        totalPotentialRevenue,
        totalItemsSold,
      },
      itemBreakdown,
      tableBreakdown,
      orders,
    });
  } catch (error) {
    console.error('Daily Report API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tạo báo cáo' }, { status: 500 });
  }
}
