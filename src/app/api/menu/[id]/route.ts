import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { updateMockMenuItem, deleteMockMenuItem } from '@/lib/mock-data';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, price, category_id, description, image_url, available, stock_quantity, sort_order } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (price !== undefined) updates.price = Number(price);
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (description !== undefined) updates.description = description ? String(description).trim() : null;
    if (image_url !== undefined) updates.image_url = image_url ? String(image_url).trim() : null;
    if (available !== undefined) updates.available = Boolean(available);
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
        .single();

      if (error) {
        console.error('Update menu item in Supabase error:', error);
        return NextResponse.json({ error: 'Lỗi cập nhật món: ' + error.message }, { status: 400 });
      }

      const formatted = {
        ...data,
        category_name: data.menu_categories?.name || 'Khác',
      };

      return NextResponse.json({ success: true, item: formatted });
    }

    // Mock mode
    const updated = updateMockMenuItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Không tìm thấy món' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Menu API [id] PATCH Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Delete menu item in Supabase error:', error);
        return NextResponse.json({ error: 'Lỗi xóa món: ' + error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    // Mock mode
    const deleted = deleteMockMenuItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Không tìm thấy món để xóa' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Menu API [id] DELETE Error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 });
  }
}
