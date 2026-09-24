import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { updateMockOrderStatus } from '@/lib/mock-data';
import { OrderStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    let orderId: string | undefined;

    // Handle both Promise params (Next.js 15+) and synchronous params
    if (context?.params) {
      const resolved = await context.params;
      orderId = resolved?.id;
    }

    // Fallback: extract from URL path /api/orders/[id]/status
    if (!orderId) {
      const pathname = req.nextUrl.pathname;
      const parts = pathname.split('/');
      const statusIdx = parts.indexOf('status');
      if (statusIdx > 1) {
        orderId = decodeURIComponent(parts[statusIdx - 1]);
      }
    }

    const body = await req.json().catch(() => ({}));
    if (!orderId && body.id) {
      orderId = body.id;
    }

    const { status } = body as { status: OrderStatus };
    const validStatuses: OrderStatus[] = ['WAITING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

    if (!orderId || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái hoặc mã đơn không hợp lệ' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update order status error:', error);
        return NextResponse.json({ error: 'Không thể cập nhật trạng thái order' }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    } else {
      const updated = updateMockOrderStatus(orderId, status);
      if (!updated) {
        return NextResponse.json({ error: 'Order không tồn tại trong bộ nhớ' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: updated,
      });
    }
  } catch (error) {
    console.error('Update Order Status API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
