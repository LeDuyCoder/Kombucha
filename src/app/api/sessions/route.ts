import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { generateSessionToken } from '@/lib/utils';
import { Session } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableNumber, sessionToken: providedToken } = body;

    if (!tableNumber) {
      return NextResponse.json({ error: 'Cần số bàn (tableNumber)' }, { status: 400 });
    }

    const token = providedToken || generateSessionToken();

    if (isSupabaseConfigured) {
      // 1. Get Table
      const { data: tableData, error: tableError } = await supabase
        .from('restaurant_tables')
        .select('id, table_number')
        .eq('table_number', tableNumber)
        .single();

      if (tableError || !tableData) {
        return NextResponse.json({ error: `Phòng ${tableNumber} không tồn tại trong hệ thống` }, { status: 404 });
      }

      // 2. Check if this session token already exists and is active
      if (providedToken) {
        const { data: existingSession } = await supabase
          .from('sessions')
          .select('*')
          .eq('session_token', providedToken)
          .eq('table_id', tableData.id)
          .eq('status', 'ACTIVE')
          .single();

        if (existingSession) {
          return NextResponse.json({
            session: existingSession,
            table: tableData,
          });
        }
      }

      // 3. Or create a new session
      const { data: newSession, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          table_id: tableData.id,
          session_token: token,
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        console.error('Supabase Session Create Error:', sessionError);
        return NextResponse.json({ error: 'Không thể tạo session' }, { status: 500 });
      }

      return NextResponse.json({
        session: newSession,
        table: tableData,
      });
    } else {
      // Mock session
      const mockSession: Session = {
        id: `mock-sess-${token}`,
        table_id: `tbl-${tableNumber}`,
        session_token: token,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        session: mockSession,
        table: { id: `tbl-${tableNumber}`, table_number: tableNumber },
      });
    }
  } catch (error) {
    console.error('Session API Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
