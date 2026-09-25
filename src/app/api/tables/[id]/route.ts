import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { updateMockTable, deleteMockTable } from '@/lib/mock-data';

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
      const rawVal = String(tableNumber || '').trim();
      if (!rawVal) {
        return NextResponse.json({ error: 'Tên hoặc số phòng không hợp lệ' }, { status: 400 });
      }

      const cleanSlug = rawVal.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'room';
      updates.table_number = rawVal;
      updates.qr_token = `table-${cleanSlug}-${Date.now().toString(36)}`;
    }

    if (active !== undefined) {
      updates.active = Boolean(active);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu thay đổi' }, { status: 400 });
    }

    // 1. Try Supabase if configured
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

    // 2. Try direct PostgreSQL
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;

      if (updates.table_number !== undefined) {
        setClauses.push(`table_number = $${idx++}`);
        values.push(updates.table_number);
        setClauses.push(`qr_token = $${idx++}`);
        values.push(updates.qr_token);
      }
      if (updates.active !== undefined) {
        setClauses.push(`active = $${idx++}`);
        values.push(updates.active);
      }

      values.push(id);
      const res = await query(
        `UPDATE restaurant_tables SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );

      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ success: true, table: res.rows[0] });
      }
    } catch (pgErr) {
      console.warn('PostgreSQL update table fallback:', pgErr);
    }

    // 3. Mock fallback
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

    // 1. Try Supabase if configured
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

    // 2. Try direct PostgreSQL
    try {
      const res = await query('DELETE FROM restaurant_tables WHERE id = $1 RETURNING id', [id]);
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ success: true });
      }
    } catch (pgErr) {
      console.warn('PostgreSQL delete table fallback:', pgErr);
    }

    // 3. Mock fallback
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
