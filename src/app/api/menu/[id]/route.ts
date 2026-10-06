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
    const { name, price, original_price, category_id, description, image_url, available, stock_quantity, sort_order, sizes } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (price !== undefined) updates.price = Number(price);
    if (original_price !== undefined) {
      updates.original_price =
        original_price === null || original_price === ''
          ? null
          : Math.max(0, Number(original_price));
    }
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
    if (sizes !== undefined) {
      if (!Array.isArray(sizes)) return NextResponse.json({ error: 'Danh sách size không hợp lệ' }, { status: 400 });
      updates.sizes = sizes.filter((size: { name?: unknown }) => typeof size?.name === 'string' && size.name.trim()).map((size: { name: string; price: number; original_price?: number | string | null }) => ({
        name: String(size.name).trim(),
        price: Number(size.price),
        original_price: size.original_price === null || size.original_price === undefined || size.original_price === '' ? null : Number(size.original_price),
      }));
      if (updates.sizes.some((size: { name: string; price: number; original_price: number | null }) =>
        !Number.isFinite(size.price) || size.price < 0 ||
        (size.original_price !== null && (!Number.isFinite(size.original_price) || size.original_price <= size.price)))) {
        return NextResponse.json({ error: 'Giá size hoặc giá gốc không hợp lệ' }, { status: 400 });
      }
      if (new Set(updates.sizes.map((size: { name: string }) => size.name.toLocaleLowerCase())).size !== updates.sizes.length) {
        return NextResponse.json({ error: 'Tên các size phải khác nhau' }, { status: 400 });
      }
    }

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
        return NextResponse.json({ error: 'Lỗi cập nhật món: ' + error.message }, { status: 400 });
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
