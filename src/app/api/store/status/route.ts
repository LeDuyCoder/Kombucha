import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { getStoreIsOpen, setStoreIsOpen } from '@/lib/mock-data';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('store_settings')
        .select('is_open')
        .eq('id', 'main')
        .single();

      if (error || !data) {
        // If table doesn't exist yet or no row, fallback to true
        return NextResponse.json({ isOpen: true });
      }

      return NextResponse.json({ isOpen: data.is_open ?? true });
    }

    return NextResponse.json({ isOpen: getStoreIsOpen() });
  } catch (error) {
    console.error('Store Status GET Error:', error);
    return NextResponse.json({ isOpen: getStoreIsOpen() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { isOpen } = body;

    if (typeof isOpen !== 'boolean') {
      return NextResponse.json({ error: 'Dữ liệu isOpen không hợp lệ' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('store_settings')
        .upsert({
          id: 'main',
          is_open: isOpen,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase Store Status Error:', error);
      }
    }

    // Always update in-memory store as well
    setStoreIsOpen(isOpen);

    return NextResponse.json({ success: true, isOpen });
  } catch (error) {
    console.error('Store Status POST Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
