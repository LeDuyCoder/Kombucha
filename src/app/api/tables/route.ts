import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { INITIAL_TABLES } from '@/lib/mock-data';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_number', { ascending: true });

      if (error) {
        console.error('Fetch tables error:', error);
        return NextResponse.json({ tables: INITIAL_TABLES });
      }

      return NextResponse.json({ tables: data || INITIAL_TABLES });
    }

    return NextResponse.json({ tables: INITIAL_TABLES });
  } catch (error) {
    console.error('Tables API GET Error:', error);
    return NextResponse.json({ tables: INITIAL_TABLES });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Cần số bàn' }, { status: 400 });
    }

    const qrToken = `table-${String(tableNumber).padStart(2, '0')}-token`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .insert({
          table_number: Number(tableNumber),
          qr_token: qrToken,
          active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Lỗi thêm bàn: ' + error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, table: data });
    }

    return NextResponse.json({
      success: true,
      table: {
        id: `tbl-${tableNumber}`,
        table_number: Number(tableNumber),
        qr_token: qrToken,
        active: true,
      },
    });
  } catch (error) {
    console.error('Tables API POST Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
