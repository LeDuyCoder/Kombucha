'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { FeedbackModal } from '@/components/customer/FeedbackModal';
import { MenuItemDetailModal } from '@/components/customer/MenuItemDetailModal';
import { LayoutList, LayoutGrid } from 'lucide-react';

export default function CustomerOrderPage() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');

  const [tableNumber, setTableNumber] = useState<string | number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [loading, setLoading] = useState(true);

  // Track previous status to detect transition to COMPLETED
  const prevStatusRef = useRef<Record<string, OrderStatus>>({});
  const hasInitializedOrders = useRef(false);

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
      const tVal = tableParam ? decodeURIComponent(tableParam).trim() : null;
      if (!tVal) {
        setLoading(false);
        return;
      }
      setTableNumber(tVal);

      // Check localStorage for existing session
      const storageKey = `session_table_${tVal}`;
      const existingToken = localStorage.getItem(storageKey);
      const token = existingToken || generateSessionToken();

      try {
        const resp = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber: tVal,
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
  const loadMenu = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadMenu();
    // Refresh periodically to keep stock up to date across tables
    const interval = setInterval(loadMenu, 15000);
    return () => clearInterval(interval);
  }, [loadMenu]);

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
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // 4. Realtime subscription for order status updates (SSE + Supabase)
  useEffect(() => {
    if (!sessionId) return;

    // A. Server-Sent Events (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/orders/stream');
      eventSource.onmessage = (event) => {
        try {
          if (event.data.trim() === 'heartbeat') return;
          const data = JSON.parse(event.data);
          if (data.type === 'order_updated') {
            const updated = data.order as Partial<Order> & { id: string };
            setOrders((prev) =>
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
          if (data.type === 'store_updated') {
            setIsStoreOpen(data.isOpen);
          }
        } catch {
          // ignore
        }
      };
    } catch (err) {
      console.warn('Customer SSE error:', err);
    }

    // B. Supabase Realtime (Backup)
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel(`customer-orders-${sessionId}`)
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
              prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
            );
          }
        )
        .subscribe();
    }

    return () => {
      if (eventSource) eventSource.close();
      if (channel) supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // 5. Detect transition to COMPLETED to trigger Feedback popup
  useEffect(() => {
    if (!hasInitializedOrders.current) {
      if (orders.length > 0) {
        orders.forEach((o) => {
          prevStatusRef.current[o.id] = o.status;
        });
        hasInitializedOrders.current = true;
      }
      return;
    }

    for (const o of orders) {
      const prev = prevStatusRef.current[o.id];
      if (prev && prev !== 'COMPLETED' && o.status === 'COMPLETED' && !o.rating) {
        setFeedbackOrder(o);
      }
      prevStatusRef.current[o.id] = o.status;
    }
  }, [orders]);

  // Handle feedback submission
  const handleFeedbackSubmit = useCallback(
    async (orderId: string, rating: number, note: string) => {
      const resp = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback_note: note }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Lỗi gửi đánh giá');
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, rating, feedback_note: note } : o))
      );
    },
    []
  );

  // Cart operations
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      const currentQty = existing ? existing.quantity : 0;
      if (typeof item.stock_quantity === 'number' && currentQty >= item.stock_quantity) {
        alert(`Món "${item.name}" chỉ còn ${item.stock_quantity} phần!`);
        return prev;
      }
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
          // Refresh live menu stock immediately
          loadMenu();
        } else {
          const err = await resp.json();
          alert(err.error || 'Lỗi gửi order');
          // Refresh menu immediately so stock limits and unavailable items reflect in UI
          loadMenu();
        }
      } catch (error) {
        console.error('Submit order error:', error);
        alert('Lỗi kết nối máy chủ. Vui lòng thử lại.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [tableNumber, sessionId, cart, isStoreOpen, loadMenu]
  );

  const getCategoryPriority = (name: string) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('kombucha')) return 1;
    if (lower.includes('trà') || lower.includes('tea')) return 2;
    if (lower.includes('nước ngọt') || lower.includes('ngọt') || lower.includes('soda')) return 3;
    return 99;
  };

  // Group items by category for 'all' tab or specific category tab
  const groupedCategories = useMemo(() => {
    // Sort categories explicitly: 1. KOMBUCHA, 2. TRÀ, 3. NƯỚC NGỌT
    const sortedCats = [...categories].sort((a, b) => {
      const pA = getCategoryPriority(a.name);
      const pB = getCategoryPriority(b.name);
      if (pA !== pB) return pA - pB;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    if (activeCategory !== 'all') {
      const cat = sortedCats.find((c) => c.id === activeCategory);
      const items = menuItems.filter((i) => i.category_id === activeCategory && i.available);
      return cat ? [{ category: cat, items }] : [];
    }

    // When 'all': group all items by sorted categories (Mục 1: KOMBUCHA, Mục 2: TRÀ, Mục 3: NƯỚC NGỌT)
    const groups = sortedCats
      .map((cat) => {
        const items = menuItems.filter((i) => i.category_id === cat.id && i.available);
        return { category: cat, items };
      })
      .filter((g) => g.items.length > 0);

    // Any items without matched category
    const uncategorizedItems = menuItems.filter(
      (i) => i.available && (!i.category_id || !sortedCats.some((c) => c.id === i.category_id))
    );
    if (uncategorizedItems.length > 0) {
      groups.push({
        category: { id: 'other', name: 'MÓN KHÁC', sort_order: 999 },
        items: uncategorizedItems,
      });
    }

    return groups;
  }, [categories, menuItems, activeCategory]);

  const totalServingCount = useMemo(() => {
    if (activeCategory === 'all') {
      return menuItems.filter((i) => i.available).length;
    }
    return menuItems.filter((i) => i.category_id === activeCategory && i.available).length;
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

  const handleSelectCategory = useCallback((catId: string) => {
    setActiveCategory(catId);
    // Smooth scroll back to top of menu content if scrolled down
    const menuEl = document.getElementById('menu-main-content');
    if (menuEl) {
      const topOffset = menuEl.getBoundingClientRect().top + window.pageYOffset - 120;
      if (window.pageYOffset > topOffset) {
        window.scrollTo({
          top: Math.max(0, topOffset),
          behavior: 'smooth',
        });
      }
    }
  }, []);

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
        onSelect={handleSelectCategory}
      />

      {/* Menu Items List */}
      <main id="menu-main-content" className="max-w-2xl mx-auto px-4 pt-4 mb-8">
        <div className="flex items-center justify-between pb-3 mb-1">
          <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            {totalServingCount} món đang phục vụ
          </p>
          <span className="text-[10px] text-stone-400 font-medium">Chạm vào món để xem chi tiết</span>
        </div>

        {groupedCategories.length === 0 ? (
          <div className="text-center py-12 text-stone-400 animate-in fade-in duration-300">
            <p className="font-medium text-sm">Không có món nào trong danh mục này</p>
          </div>
        ) : (
          <div
            key={activeCategory}
            className="space-y-6 sm:space-y-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out"
          >
            {groupedCategories.map(({ category, items }, index) => (
              <section key={category.id} id={`category-${category.id}`} className="space-y-3">
                {/* Category Section Header */}
                <div className="py-2 flex items-center justify-between gap-3 border-b border-stone-200/90">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    {activeCategory === 'all' && (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 font-mono text-[11px] font-black shrink-0 tracking-tight">
                        Mục {index + 1}
                      </span>
                    )}
                    <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight uppercase">
                      {category.name}
                    </h2>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80">
                      {items.length} món
                    </span>
                  </div>

                  {activeCategory === 'all' && (
                    <button
                      onClick={() => handleSelectCategory(category.id)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-0.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50/60 transition-colors"
                      title={`Chỉ xem danh mục ${category.name}`}
                    >
                      <span>Xem riêng</span>
                    </button>
                  )}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((item, itemIdx) => {
                    // Calculate a stagger delay for smooth sequential appearance
                    const staggerDelay = (index * 5 + itemIdx) * 40;
                    
                    return (
                      <div
                        key={item.id}
                        className="animate-card-enter"
                        style={{ animationDelay: `${staggerDelay}ms` }}
                      >
                        <MenuItemCard
                          item={item}
                          quantityInCart={cartQuantityMap.get(item.id) || 0}
                          onAddToCart={addToCart}
                          onRemoveFromCart={removeFromCart}
                          onViewDetail={setSelectedDetailItem}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
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
        onOpenFeedback={(order) => setFeedbackOrder(order)}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        order={successOrder}
        tableNumber={tableNumber}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackOrder}
        onClose={() => setFeedbackOrder(null)}
        order={feedbackOrder}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Item Detail Modal */}
      {selectedDetailItem && (
        <MenuItemDetailModal
          item={selectedDetailItem}
          isOpen={!!selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          quantityInCart={cartQuantityMap.get(selectedDetailItem.id) || 0}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
        />
      )}
    </div>
  );
}
