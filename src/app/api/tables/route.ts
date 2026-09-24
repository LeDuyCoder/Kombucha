import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getMockTables, addMockTable } from '@/lib/mock-data';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) {
        console.error('Fetch tables error from Supabase:', error);
        return NextResponse.json({ tables: getMockTables() });
      }

      return NextResponse.json({ tables: data || getMockTables() });
    }

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

    const num = Number(tableNumber);
    if (!tableNumber || isNaN(num) || num <= 0) {
      return NextResponse.json({ error: 'Số phòng không hợp lệ' }, { status: 400 });
    }

    const qrToken = `table-${String(num).padStart(2, '0')}-token`;

    if (isSupabaseConfigured) {
      // Check if tableNumber already exists
      const { data: existing } = await supabase
        .from('restaurant_tables')
        .select('id')
        .eq('table_number', num)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: `Phòng ${num} đã tồn tại trong hệ thống` }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('restaurant_tables')
        .insert({
          table_number: num,
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

    // Mock fallback
    const mockList = getMockTables();
    if (mockList.some((t) => t.table_number === num)) {
      return NextResponse.json({ error: `Phòng ${num} đã tồn tại trong hệ thống` }, { status: 400 });
    }

    const newTable = {
      id: `tbl-${num}-${Date.now()}`,
      table_number: num,
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
