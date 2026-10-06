import { NextRequest, NextResponse } from 'next/server';
import { addMockMenuCategory, getMockMenuCategories } from '@/lib/mock-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import type { MenuCategory } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';

    if (!name || name.length > 60) {
      return NextResponse.json({ error: 'Vui long nhap ten danh muc (toi da 60 ky tu).' }, { status: 400 });
    }

    let existingCategories: MenuCategory[];
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('menu_categories').select('id, name, sort_order');
      if (error) {
        console.error('Fetch menu categories error:', error);
        return NextResponse.json({ error: 'Khong the tai danh muc hien co.' }, { status: 500 });
      }
      existingCategories = data || [];
    } else {
      existingCategories = getMockMenuCategories();
    }

    const duplicate = existingCategories.find(
      (category) => category.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({ error: 'Danh muc nay da ton tai.', category: duplicate }, { status: 409 });
    }

    const sort_order = existingCategories.reduce(
      (highest, category) => Math.max(highest, category.sort_order || 0),
      0
    ) + 1;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({ name, sort_order })
        .select('id, name, sort_order')
        .single();

      if (error) {
        console.error('Create menu category error:', error);
        return NextResponse.json({ error: 'Khong the tao danh muc moi.' }, { status: 500 });
      }

      return NextResponse.json({ category: data }, { status: 201 });
    }

    const category = addMockMenuCategory({
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      sort_order,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create menu category API error:', error);
    return NextResponse.json({ error: 'Da xay ra loi may chu.' }, { status: 500 });
  }
}
