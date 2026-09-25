import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { INITIAL_CATEGORIES, getMockMenuItems, addMockMenuItem, updateMockMenuItem } from '@/lib/mock-data';

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
          items: getMockMenuItems(),
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
      items: getMockMenuItems(),
    });
  } catch (error) {
    console.error('Menu API GET Error:', error);
    return NextResponse.json({
      categories: INITIAL_CATEGORIES,
      items: getMockMenuItems(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, original_price, category_id, description, image_url, available, stock_quantity, sort_order } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Tên món không được để trống' }, { status: 400 });
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Giá tiền không hợp lệ' }, { status: 400 });
    }

    const origPriceNum =
      original_price === null || original_price === undefined || original_price === ''
        ? null
        : Math.max(0, Number(original_price));

    const stockVal =
      stock_quantity === null || stock_quantity === undefined || stock_quantity === ''
        ? null
        : Math.max(0, Number(stock_quantity));

    const newItemData = {
      name: name.trim(),
      price: priceNum,
      original_price: origPriceNum,
      category_id: category_id || null,
      description: description ? String(description).trim() : null,
      image_url: image_url ? String(image_url).trim() : null,
      available: stockVal === 0 ? false : available !== undefined ? Boolean(available) : true,
      stock_quantity: stockVal,
      sort_order: sort_order ? Number(sort_order) : 0,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(newItemData)
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Insert menu item error in Supabase:', error);
        return NextResponse.json({ error: 'Lỗi thêm món: ' + error.message }, { status: 400 });
      }

      const formatted = {
        ...data,
        category_name: data.menu_categories?.name || 'Khác',
      };

      return NextResponse.json({ success: true, item: formatted });
    }

    // Mock mode
    const cat = INITIAL_CATEGORIES.find((c) => c.id === category_id);
    const mockItem = {
      id: `m-${Date.now()}`,
      ...newItemData,
      category_name: cat ? cat.name : 'Khác',
    };
    addMockMenuItem(mockItem);

    return NextResponse.json({ success: true, item: mockItem });
  } catch (error) {
    console.error('Menu API POST Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, available, stock_quantity, price, original_price, name, description, category_id, image_url, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Cần ID món' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (typeof available === 'boolean') updates.available = available;
    if (stock_quantity !== undefined) {
      const stockVal =
        stock_quantity === null || stock_quantity === ''
          ? null
          : Math.max(0, Number(stock_quantity));
      updates.stock_quantity = stockVal;
      if (stockVal === 0) {
        updates.available = false;
      }
    }
    if (typeof price === 'number') updates.price = price;
    if (original_price !== undefined) {
      updates.original_price =
        original_price === null || original_price === ''
          ? null
          : Math.max(0, Number(original_price));
    }
    if (name) updates.name = String(name).trim();
    if (description !== undefined) updates.description = description ? String(description).trim() : null;
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (image_url !== undefined) updates.image_url = image_url ? String(image_url).trim() : null;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          menu_categories (
            name
          )
        `)
        .maybeSingle();

      if (error) {
        console.error('Update menu item in Supabase error:', error);
        return NextResponse.json({ error: 'Lỗi cập nhật món: ' + error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'Không tìm thấy món cần cập nhật' }, { status: 404 });
      }

      const formatted = {
        ...data,
        category_name: data.menu_categories?.name || 'Khác',
      };

      return NextResponse.json({ success: true, item: formatted });
    }

    // Mock mode
    const updated = updateMockMenuItem(id, updates);
    return NextResponse.json({ success: true, item: updated || { id, ...updates } });
  } catch (error) {
    console.error('Menu API PATCH Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
