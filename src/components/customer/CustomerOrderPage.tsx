'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { MenuCategory, MenuItem, CartItem, Order, Session, OrderStatus } from '@/types';
import { generateSessionToken } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { CustomerHeader } from '@/components/customer/Header';
import { CategoryTabs } from '@/components/customer/CategoryTabs';
import { MenuItemCard } from '@/components/customer/MenuItemCard';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { OrderHistoryDrawer } from '@/components/customer/OrderHistoryDrawer';
import { OrderSuccessModal } from '@/components/customer/OrderSuccessModal';

export default function CustomerOrderPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [loading, setLoading] = useState(true);

  // Check store open status
  useEffect(() => {
    const checkStore = async () => {
      try {
        const resp = await fetch('/api/store/status');
        if (resp.ok) {
          const data = await resp.json();
          setIsStoreOpen(data.isOpen ?? true);
        }
      } catch (err) {
        console.error('Check store status error:', err);
      }
    };
    checkStore();
    const interval = setInterval(checkStore, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. Initialize table & session
  useEffect(() => {
    const initSession = async () => {
      const tNum = Number(tableParam);
      if (!tNum || isNaN(tNum)) {
        setLoading(false);
        return;
      }
      setTableNumber(tNum);

      // Check localStorage for existing session
      const storageKey = `session_table_${tNum}`;
      const existingToken = localStorage.getItem(storageKey);
      const token = existingToken || generateSessionToken();

      try {
        const resp = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber: tNum,
            sessionToken: token,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          setSessionId(data.session.id);
          setSessionToken(data.session.session_token);

          // Persist session token
          if (!existingToken) {
            localStorage.setItem(storageKey, data.session.session_token);
          }
        }
      } catch (error) {
        console.error('Session init error:', error);
        // Fallback
        setSessionId(`mock-sess-${token}`);
        setSessionToken(token);
        if (!existingToken) {
          localStorage.setItem(storageKey, token);
        }
      }
    };

    initSession();
  }, [tableParam]);

  // 2. Load menu
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const resp = await fetch('/api/menu');
        if (resp.ok) {
          const data = await resp.json();
          setCategories(data.categories || []);
          setMenuItems(data.items || []);
        }
      } catch (error) {
        console.error('Menu load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  // 3. Load orders for current session
  const loadOrders = useCallback(async () => {
    if (!sessionId) return;

    try {
      const resp = await fetch(`/api/orders?sessionId=${sessionId}`);
      if (resp.ok) {
        const data = await resp.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 4. Realtime subscription for order status updates
  useEffect(() => {
    if (!isSupabaseConfigured || !sessionId) return;

    const channel = supabase
      .channel('customer-orders')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status as OrderStatus, updated_at: updated.updated_at } : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Cart operations
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((c) => c.menuItem.id !== item.id);
      }
      return prev.map((c) =>
        c.menuItem.id === item.id ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartOpen(false);
  }, []);

  // Submit order
  const submitOrder = useCallback(
    async (note: string) => {
      if (!tableNumber || !sessionId || cart.length === 0) return;

      if (!isStoreOpen) {
        alert('Quán hiện đang tạm đóng cửa. Không thể gửi order lúc này!');
        return;
      }

      setIsSubmitting(true);

      try {
        const resp = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber,
            sessionId,
            note: note || '',
            items: cart.map((item) => ({
              menu_item_id: item.menuItem.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          setSuccessOrder(data.order);
          setOrders((prev) => [data.order, ...prev]);
          setCart([]);
          setCartOpen(false);
        } else {
          const err = await resp.json();
          alert(err.error || 'Lỗi gửi order');
        }
      } catch (error) {
        console.error('Submit order error:', error);
        alert('Lỗi kết nối máy chủ. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [tableNumber, sessionId, cart, isStoreOpen]
  );

  // Filter items by active category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return menuItems.filter((i) => i.available);
    return menuItems.filter(
      (i) => i.category_id === activeCategory && i.available
    );
  }, [menuItems, activeCategory]);

  // Build quantity lookup
  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.menuItem.id, item.quantity));
    return map;
  }, [cart]);

  // Active (non-completed) orders count
  const activeOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length,
    [orders]
  );

  // Invalid table
  if (!tableParam || !Number(tableParam)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="text-center space-y-4 max-w-xs">
          <div className="text-6xl">📱</div>
          <h1 className="text-xl font-bold text-stone-900">
            Vui lòng quét mã QR
          </h1>
          <p className="text-stone-500 text-sm">
            Quét mã QR code trên bàn của bạn để bắt đầu đặt món.
          </p>
          <p className="text-xs text-stone-400">
            URL cần chứa tham số <code className="bg-stone-200 px-1 rounded">?table=số_bàn</code>
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-stone-500 text-sm font-medium">Đang tải menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header */}
      <CustomerHeader
        tableNumber={tableNumber}
        sessionToken={sessionToken}
        activeOrdersCount={activeOrdersCount}
        onOpenOrders={() => setOrdersOpen(true)}
      />

      {/* Store Closed Alert Banner */}
      {!isStoreOpen && (
        <div className="max-w-xl mx-auto px-4 pt-3">
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-rose-900">Quán hiện đang tạm đóng cửa</p>
              <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                Quán tạm ngừng nhận đơn trực tuyến. Quý khách có thể xem trước menu hoặc liên hệ trực tiếp nhân viên!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Menu Items */}
      <main className="max-w-xl mx-auto px-4 pt-4 mb-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="font-medium text-sm">Không có món nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantityInCart={cartQuantityMap.get(item.id) || 0}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpen={() => setCartOpen(true)}
        cart={cart}
        tableNumber={tableNumber}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onSubmitOrder={submitOrder}
        isSubmitting={isSubmitting}
      />

      {/* Order History */}
      <OrderHistoryDrawer
        isOpen={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        orders={orders}
        tableNumber={tableNumber}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        order={successOrder}
        tableNumber={tableNumber}
      />
    </div>
  );
}
