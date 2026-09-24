'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { playOrderChime } from '@/lib/audio';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KanbanColumn } from '@/components/kitchen/KanbanColumn';
import { OrderCard } from '@/components/kitchen/OrderCard';
import { RefreshCw } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Track known order IDs to avoid chiming on initial load or duplicates
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  // Ref so realtime callbacks always see the latest muted value
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // ------- Fetch orders from API -------
  const fetchOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const resp = await fetch('/api/orders');
      if (resp.ok) {
        const data = await resp.json();
        const fetchedOrders: Order[] = data.orders || [];
        setOrders(fetchedOrders);
        // Seed knownIds so existing orders don't trigger chime on reconnect
        knownOrderIdsRef.current = new Set(fetchedOrders.map((o) => o.id));
      }
    } catch (err) {
      console.error('Kitchen: failed to fetch orders', err);
    } finally {
      setLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ------- Supabase Realtime Subscription -------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback: poll every 15s in mock / non-configured mode
      setConnected(true);
      const poll = setInterval(() => fetchOrders(), 15000);
      return () => clearInterval(poll);
    }

    const channel = supabase
      .channel('kitchen-orders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new as Order;

          // Skip if we already know this order (e.g. from initial load)
          if (knownOrderIdsRef.current.has(newOrder.id)) return;
          knownOrderIdsRef.current.add(newOrder.id);

          // Play chime for new WAITING orders (unless muted)
          if (newOrder.status === 'WAITING' && !isMutedRef.current) {
            playOrderChime();
          }

          // Fetch full order with items & table_number, then merge into state
          try {
            const resp = await fetch('/api/orders');
            if (resp.ok) {
              const data = await resp.json();
              const fullList: Order[] = data.orders || [];
              const fullNewOrder = fullList.find((o) => o.id === newOrder.id);
              if (fullNewOrder) {
                setOrders((prev) => {
                  if (prev.some((o) => o.id === fullNewOrder.id)) return prev;
                  return [fullNewOrder, ...prev];
                });
              }
            }
          } catch (err) {
            console.error('Kitchen: failed to enrich INSERT order', err);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === updated.id
                ? { ...o, status: updated.status as OrderStatus, updated_at: updated.updated_at }
                : o
            )
          );
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // ------- Optimistic Status Update -------
  const handleUpdateStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      // Optimistic UI
      setUpdatingIds((prev) => new Set(prev).add(orderId));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
            : o
        )
      );

      try {
        const resp = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!resp.ok) {
          console.error('Status update failed — reverting');
          fetchOrders();
        }
      } catch (err) {
        console.error('Update status error:', err);
        fetchOrders();
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    },
    [fetchOrders]
  );

  // ------- Group & sort orders by status -------
  const { waitingOrders, preparingOrders, readyOrders, completedOrders } = useMemo(() => {
    const waiting: Order[] = [];
    const preparing: Order[] = [];
    const ready: Order[] = [];
    const completed: Order[] = [];

    for (const order of orders) {
      switch (order.status) {
        case 'WAITING':
          waiting.push(order);
          break;
        case 'PREPARING':
          preparing.push(order);
          break;
        case 'READY':
          ready.push(order);
          break;
        case 'COMPLETED':
          completed.push(order);
          break;
        // CANCELLED orders: not shown in Kanban
      }
    }

    // Active orders: oldest first (FIFO queue for kitchen)
    const byOldest = (a: Order, b: Order) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    waiting.sort(byOldest);
    preparing.sort(byOldest);
    ready.sort(byOldest);

    // Completed: newest first, capped at 20
    completed.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    return {
      waitingOrders: waiting,
      preparingOrders: preparing,
      readyOrders: ready,
      completedOrders: completed.slice(0, 20),
    };
  }, [orders]);

  // ------- Loading screen -------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-stone-400 font-medium text-sm">Đang tải dữ liệu bếp…</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-950 flex flex-col overflow-hidden text-stone-100 font-sans">
      {/* Header */}
      <KitchenHeader
        isMuted={isMuted}
        toggleMuted={() => setIsMuted((m) => !m)}
        connected={connected}
      />

      {/* Toolbar */}
      <div className="flex-none bg-stone-900/80 border-b border-stone-800 px-5 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Dashboard bếp
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-700" />
          <span className="text-xs text-stone-400">
            {waitingOrders.length + preparingOrders.length + readyOrders.length} đơn đang xử lý
          </span>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          title="Tải lại danh sách"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition active:scale-95 border border-stone-700/60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Kanban Board */}
      <main className="flex-1 flex gap-3 p-3 overflow-hidden min-h-0">
        {/* Column 1: WAITING */}
        <KanbanColumn
          title="Chờ tiếp nhận"
          count={waitingOrders.length}
          statusColor="waiting"
        >
          {waitingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
            />
          ))}
        </KanbanColumn>

        {/* Column 2: PREPARING */}
        <KanbanColumn
          title="Đang làm"
          count={preparingOrders.length}
          statusColor="preparing"
        >
          {preparingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
            />
          ))}
        </KanbanColumn>

        {/* Column 3: READY */}
        <KanbanColumn
          title="Sẵn sàng phục vụ"
          count={readyOrders.length}
          statusColor="ready"
        >
          {readyOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
            />
          ))}
        </KanbanColumn>

        {/* Column 4: COMPLETED */}
        <KanbanColumn
          title="Hoàn thành"
          count={completedOrders.length}
          statusColor="completed"
        >
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
            />
          ))}
        </KanbanColumn>
      </main>
    </div>
  );
};
