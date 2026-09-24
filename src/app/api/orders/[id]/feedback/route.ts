import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { updateMockOrderFeedback } from '@/lib/mock-data';

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

    // Fallback: extract from URL path
    if (!orderId) {
      const pathname = req.nextUrl.pathname;
      const parts = pathname.split('/');
      const feedbackIdx = parts.indexOf('feedback');
      if (feedbackIdx > 1) {
        orderId = decodeURIComponent(parts[feedbackIdx - 1]);
      }
    }

    const body = await req.json().catch(() => ({}));
    if (!orderId && body.id) {
      orderId = body.id;
    }

    const { rating, feedback_note } = body;

    if (!orderId || rating === undefined) {
      return NextResponse.json({ error: 'Mã đơn và đánh giá là bắt buộc' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          rating,
          feedback_note,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update feedback error:', error);
        return NextResponse.json({ error: 'Không thể cập nhật đánh giá' }, { status: 500 });
      }

      return NextResponse.json({ success: true, order: data });
    } else {
      const updated = updateMockOrderFeedback(orderId, rating, feedback_note || '');
      if (!updated) {
        return NextResponse.json({ error: 'Order không tồn tại trong bộ nhớ' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        order: updated,
      });
    }
  } catch (error) {
    console.error('Update Feedback API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
