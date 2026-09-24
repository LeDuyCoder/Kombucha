import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '@/lib/mock-data';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { data: categories, error: catError } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .order('sort_order', { ascending: true });

      if (catError || itemsError) {
        console.error('Menu Fetch DB Error:', catError || itemsError);
        return NextResponse.json({
          categories: INITIAL_CATEGORIES,
          items: INITIAL_MENU_ITEMS,
        });
      }

      const formattedItems = (items || []).map((item: any) => ({
        ...item,
        category_name: item.menu_categories?.name || 'Khác',
      }));

      return NextResponse.json({
        categories: categories || INITIAL_CATEGORIES,
        items: formattedItems,
      });
    }

    return NextResponse.json({
      categories: INITIAL_CATEGORIES,
      items: INITIAL_MENU_ITEMS,
    });
  } catch (error) {
    console.error('Menu API GET Error:', error);
    return NextResponse.json({
      categories: INITIAL_CATEGORIES,
      items: INITIAL_MENU_ITEMS,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, available, price, name, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cần ID món' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const updates: any = {};
      if (typeof available === 'boolean') updates.available = available;
      if (typeof price === 'number') updates.price = price;
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;

      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: 'Lỗi cập nhật món' }, { status: 500 });
      }

      return NextResponse.json({ success: true, item: data });
    }

    return NextResponse.json({ success: true, item: { id, available, price } });
  } catch (error) {
    console.error('Menu API PATCH Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
