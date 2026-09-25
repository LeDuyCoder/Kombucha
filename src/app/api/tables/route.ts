import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getMockTables, addMockTable } from '@/lib/mock-data';

export async function GET() {
  try {
    // 1. Try Supabase if configured (Cloud / Production)
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*')
          .order('table_number', { ascending: true });

        if (!error && data && data.length > 0) {
          return NextResponse.json({ tables: data });
        }
      } catch (err) {
        console.warn('Supabase fetch tables warning:', err);
      }
    }

    // 2. Query direct Docker PostgreSQL fallback
    try {
      const res = await query('SELECT * FROM restaurant_tables ORDER BY table_number ASC');
      if (res && res.rows && res.rows.length > 0) {
        return NextResponse.json({ tables: res.rows });
      }
    } catch (pgErr) {
      // PostgreSQL local offline
    }

    // 3. Fallback
    return NextResponse.json({ tables: getMockTables() });
  } catch (error) {
    console.error('Tables API GET Error:', error);
    return NextResponse.json({ tables: getMockTables() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber } = body;

    const rawVal = String(tableNumber || '').trim();
    if (!rawVal) {
      return NextResponse.json({ error: 'Tên hoặc số phòng không hợp lệ' }, { status: 400 });
    }

    const cleanSlug = rawVal.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'room';
    const qrToken = `table-${cleanSlug}-${Date.now().toString(36)}`;

    // 1. Try Supabase if configured
    if (isSupabaseConfigured) {
      const { data: existing } = await supabase
        .from('restaurant_tables')
        .select('id')
        .eq('table_number', rawVal)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: `Phòng "${rawVal}" đã tồn tại trong hệ thống` }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('restaurant_tables')
        .insert({
          table_number: rawVal,
          qr_token: qrToken,
          active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Lỗi thêm phòng: ' + error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, table: data });
    }

    // 2. Try direct PostgreSQL
    try {
      const existing = await query('SELECT id FROM restaurant_tables WHERE table_number = $1', [rawVal]);
      if (existing.rows && existing.rows.length > 0) {
        return NextResponse.json({ error: `Phòng "${rawVal}" đã tồn tại trong hệ thống` }, { status: 400 });
      }

      const inserted = await query(
        'INSERT INTO restaurant_tables (table_number, qr_token, active) VALUES ($1, $2, true) RETURNING *',
        [rawVal, qrToken]
      );
      if (inserted.rows && inserted.rows.length > 0) {
        return NextResponse.json({ success: true, table: inserted.rows[0] });
      }
    } catch (pgErr) {
      console.warn('PostgreSQL insert table fallback:', pgErr);
    }

    // 3. Mock fallback
    const mockList = getMockTables();
    if (mockList.some((t) => String(t.table_number).toLowerCase() === rawVal.toLowerCase())) {
      return NextResponse.json({ error: `Phòng "${rawVal}" đã tồn tại trong hệ thống` }, { status: 400 });
    }

    const newTable = {
      id: `tbl-${cleanSlug}-${Date.now()}`,
      table_number: rawVal,
      qr_token: qrToken,
      active: true,
    };
    addMockTable(newTable);

    return NextResponse.json({
      success: true,
      table: newTable,
    });
  } catch (error) {
    console.error('Tables API POST Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
