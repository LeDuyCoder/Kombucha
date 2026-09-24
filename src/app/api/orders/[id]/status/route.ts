import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { OrderStatus } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ['WAITING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update order status error:', error);
        return NextResponse.json({ error: 'Không thể cập nhật trạng thái order' }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    } else {
      // In-memory mock response
      return NextResponse.json({
        success: true,
        order: { id, status, updated_at: new Date().toISOString() },
      });
    }
  } catch (error) {
    console.error('Update Order Status API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
