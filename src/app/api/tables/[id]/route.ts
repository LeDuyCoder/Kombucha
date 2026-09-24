import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { updateMockTable, deleteMockTable, getMockTables } from '@/lib/mock-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tableNumber, active } = body;

    const updates: Record<string, any> = {};

    if (tableNumber !== undefined) {
      const num = Number(tableNumber);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json({ error: 'Số phòng không hợp lệ' }, { status: 400 });
      }

      // Check collision with another table
      if (isSupabaseConfigured) {
        const { data: existing } = await supabase
          .from('restaurant_tables')
          .select('id')
          .eq('table_number', num)
          .neq('id', id)
          .maybeSingle();

        if (existing) {
          return NextResponse.json({ error: `Phòng ${num} đã được sử dụng` }, { status: 400 });
        }
      } else {
        const mockList = getMockTables();
        if (mockList.some((t) => t.table_number === num && t.id !== id)) {
          return NextResponse.json({ error: `Phòng ${num} đã được sử dụng` }, { status: 400 });
        }
      }

      updates.table_number = num;
      updates.qr_token = `table-${String(num).padStart(2, '0')}-token`;
    }

    if (active !== undefined) {
      updates.active = Boolean(active);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu thay đổi' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Update table error in Supabase:', error);
        return NextResponse.json({ error: 'Lỗi cập nhật phòng: ' + error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, table: data });
    }

    // Mock mode
    const updated = updateMockTable(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy phòng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, table: updated });
  } catch (error) {
    console.error('Tables API PATCH Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('restaurant_tables')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete table error in Supabase:', error);
        return NextResponse.json({ error: 'Lỗi xóa phòng: ' + error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // Mock mode
    const deleted = deleteMockTable(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy phòng để xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tables API DELETE Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
