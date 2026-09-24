'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { playOrderChime } from '@/lib/audio';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KanbanColumn } from '@/components/kitchen/KanbanColumn';
import { OrderCard } from '@/components/kitchen/OrderCard';
import { RefreshCw, Filter } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | 'ALL'>('ALL');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Track known order IDs to avoid chiming on initial load or duplicates
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // ------- Fetch Orders from API -------
  const fetchOrders = useCallback(async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) setIsRefreshing(true);
      const resp = await fetch('/api/orders');
      if (resp.ok) {
        const data = await resp.json();
        const fetched: Order[] = data.orders || [];

        // Register initial order IDs silently
        if (isInitialLoad.current) {
          fetched.forEach((o) => knownOrderIds.current.add(o.id));
          isInitialLoad.current = false;
        }

        setOrders(fetched);
      }
    } catch (err) {
      console.error('Fetch kitchen orders error:', err);
    } finally {
      setLoading(false);
      if (showRefreshingState) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ------- Realtime Subscription via Supabase -------
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo/fallback mode: show connected
      setConnected(true);
      return;
    }

    const channel = supabase
      .channel('kitchen-realtime-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const newOrder = payload.new as Order;

          // Only chime if this is a newly seen order and audio isn't muted
          if (!knownOrderIds.current.has(newOrder.id)) {
            knownOrderIds.current.add(newOrder.id);
            if (!isMuted) {
              playOrderChime();
            }
          }

          // Refetch to get items joined properly
          fetchOrders();
        }
      )
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
  }, [fetchOrders, isMuted]);

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

  // Filter orders by table if selected
  const filteredOrders = useMemo(() => {
    if (selectedTable === 'ALL') return orders;
    return orders.filter((o) => o.table_number === selectedTable);
  }, [orders, selectedTable]);

  // ------- Group & sort orders by status -------
  const { waitingOrders, preparingOrders, readyOrders, completedOrders } = useMemo(() => {
    const waiting: Order[] = [];
    const preparing: Order[] = [];
    const ready: Order[] = [];
    const completed: Order[] = [];

    for (const order of filteredOrders) {
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
  }, [filteredOrders]);

  // ------- Loading screen -------
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-stone-600 font-medium text-sm">Đang tải dữ liệu bếp…</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-stone-100 flex flex-col overflow-hidden text-stone-900 font-sans">
      {/* Header */}
      <KitchenHeader
        isMuted={isMuted}
        toggleMuted={() => setIsMuted((m) => !m)}
        connected={connected}
      />

      {/* Toolbar */}
      <div className="flex-none bg-white border-b border-stone-200 px-5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-stone-500">
            <Filter className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-bold">Lọc bàn:</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedTable('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTable === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tất cả
            </button>
            {[1, 2, 3, 4, 5].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedTable === t
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Bàn {t}
              </button>
            ))}
          </div>

          <span className="w-1 h-1 rounded-full bg-stone-300 mx-1" />
          <span className="text-xs text-stone-500 font-medium">
            {waitingOrders.length + preparingOrders.length + readyOrders.length} đơn đang xử lý
          </span>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          title="Tải lại danh sách"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 border border-stone-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Kanban Board */}
      <main className="flex-1 flex gap-3 p-3 overflow-x-auto min-h-0">
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
