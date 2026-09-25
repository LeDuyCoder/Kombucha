'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { playOrderChime } from '@/lib/audio';
import { KitchenHeader } from '@/components/kitchen/KitchenHeader';
import { KanbanColumn } from '@/components/kitchen/KanbanColumn';
import { OrderCard } from '@/components/kitchen/OrderCard';
import { OrderSelectionFooter } from '@/components/kitchen/OrderSelectionFooter';
import { DailyReceiptModal } from '@/components/kitchen/DailyReceiptModal';
import { CustomerFeedbackModal } from '@/components/kitchen/CustomerFeedbackModal';
import { RefreshCw, Filter, Calendar } from 'lucide-react';

export const KitchenDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | number | 'ALL'>('ALL');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Selection states
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [batchUpdating, setBatchUpdating] = useState(false);

  // Date Filter: defaults to today
  const todayStr = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

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

  // ------- Store Open / Close State -------
  const fetchStoreStatus = useCallback(async () => {
    try {
      const resp = await fetch('/api/store/status');
      if (resp.ok) {
        const data = await resp.json();
        setIsStoreOpen(data.isOpen ?? true);
      }
    } catch (err) {
      console.error('Fetch store status error:', err);
    }
  }, []);

  // ------- Fetch Tables (Real Data for Rooms) -------
  const fetchTables = useCallback(async () => {
    try {
      const resp = await fetch('/api/tables');
      if (resp.ok) {
        const data = await resp.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
    }
  }, []);

  const handleToggleStoreOpen = async () => {
    const nextState = !isStoreOpen;
    setIsStoreOpen(nextState);
    try {
      await fetch('/api/store/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: nextState }),
      });
    } catch (err) {
      console.error('Toggle store open error:', err);
      fetchStoreStatus();
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStoreStatus();
    fetchTables();
  }, [fetchOrders, fetchStoreStatus, fetchTables]);

  // ------- Multi-layer Realtime Engine (SSE + Polling + Supabase) -------
  useEffect(() => {
    // 1. Server-Sent Events (SSE) Stream Connection
    let eventSource: EventSource | null = null;
    let sseConnected = false;

    try {
      eventSource = new EventSource('/api/orders/stream');

      eventSource.onmessage = (event) => {
        try {
          if (event.data.trim() === 'heartbeat') return;
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            setConnected(true);
            sseConnected = true;
          }
          
          if (data.type === 'order_created') {
            const newOrder = data.order as Order;
            if (!knownOrderIds.current.has(newOrder.id)) {
              knownOrderIds.current.add(newOrder.id);
              if (!isMuted) playOrderChime();
              // Instantly fetch orders to get fully joined items
              fetchOrders();
            }
          }
          
          if (data.type === 'order_updated') {
            const updated = data.order as Partial<Order> & { id: string };
            setOrders((prev) =>
              prev.map((o) =>
                o.id === updated.id ? { ...o, ...updated } : o
              )
            );
          }

          if (data.type === 'store_updated') {
            setIsStoreOpen(data.isOpen);
          }
        } catch (e) {
          // ignore parse error
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        sseConnected = false;
        // EventSource will automatically retry connecting
      };
    } catch (err) {
      console.warn('SSE not available:', err);
    }

    // 2. Supabase Realtime (Parallel backup if configured)
    let channel: any = null;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel('kitchen-realtime-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
          const newOrder = payload.new as Order;
          if (!knownOrderIds.current.has(newOrder.id)) {
            knownOrderIds.current.add(newOrder.id);
            if (!isMuted) playOrderChime();
            fetchOrders();
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setConnected(true);
        });
    }

    // 3. Smart Sync Heartbeat (Fail-safe polling every 2.5 seconds)
    // Ensures zero dropped orders even if SSE/WebSockets fail on bad WiFi
    const heartbeat = setInterval(async () => {
      try {
        const resp = await fetch('/api/orders');
        if (resp.ok) {
          const data = await resp.json();
          const fetched: Order[] = data.orders || [];
          let hasNew = false;
          
          fetched.forEach((o) => {
            if (!knownOrderIds.current.has(o.id)) {
              knownOrderIds.current.add(o.id);
              hasNew = true;
            }
          });
          
          if (hasNew) {
            if (!isMuted) playOrderChime();
            setOrders(fetched);
          } else if (!sseConnected) {
            // Only force full update if SSE is dead to prevent UI jitter
            setOrders((prev) => {
              if (JSON.stringify(prev) !== JSON.stringify(fetched)) return fetched;
              return prev;
            });
          }
        }
      } catch (err) {
        // silent fail
      }
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      if (channel) supabase.removeChannel(channel);
      clearInterval(heartbeat);
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
        const resp = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!resp.ok) {
          const errData = await resp.json().catch(() => ({}));
          console.error('Status update failed — reverting:', resp.status, errData);
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

  // Filter orders by table and date if selected
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Filter by Table
      if (selectedTable !== 'ALL' && String(o.table_number) !== String(selectedTable)) {
        return false;
      }

      // 2. Filter by Date (in local timezone)
      if (selectedDate) {
        const d = new Date(o.created_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const orderDateStr = `${year}-${month}-${day}`;
        if (orderDateStr !== selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedTable, selectedDate]);

  // Derived selection data
  const handleSelectAll = useCallback(() => {
    const allFilteredIds = filteredOrders.map((o) => o.id);
    setSelectedOrderIds((prev) => {
      const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.has(id));
      if (areAllSelected) return new Set();
      return new Set(allFilteredIds);
    });
  }, [filteredOrders]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedOrderIds(new Set());
  }, []);

  const handleSelectColumn = useCallback((columnOrders: Order[]) => {
    const columnIds = columnOrders.map((o) => o.id);
    setSelectedOrderIds((prev) => {
      const areAllSelected = columnIds.length > 0 && columnIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (areAllSelected) {
        columnIds.forEach((id) => next.delete(id));
      } else {
        columnIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const handleBatchUpdateStatus = useCallback(
    async (newStatus: OrderStatus) => {
      if (selectedOrderIds.size === 0) return;
      try {
        setBatchUpdating(true);
        const idsToUpdate = Array.from(selectedOrderIds);

        // Optimistic UI Update
        setOrders((prev) =>
          prev.map((o) =>
            selectedOrderIds.has(o.id)
              ? { ...o, status: newStatus, updated_at: new Date().toISOString() }
              : o
          )
        );

        // Clear selection
        setSelectedOrderIds(new Set());

        await Promise.all(
          idsToUpdate.map((id) =>
            fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
            })
          )
        );

        await fetchOrders();
      } catch (err) {
        console.error('Batch update status error:', err);
      } finally {
        setBatchUpdating(false);
      }
    },
    [selectedOrderIds, fetchOrders]
  );

  const selectedOrders = useMemo(
    () => orders.filter((o) => selectedOrderIds.has(o.id)),
    [orders, selectedOrderIds]
  );
  const selectedTotalAmount = useMemo(
    () => selectedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    [selectedOrders]
  );
  const isAllSelected = useMemo(
    () => filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds.has(o.id)),
    [filteredOrders, selectedOrderIds]
  );

  // ------- Dynamic Room List -------
  const roomNumbers = useMemo(() => {
    const set = new Set<string | number>();
    
    // 1. Add all configured tables
    tables.forEach((t) => {
      if (t.table_number) set.add(t.table_number);
    });
    
    // 2. Add any table that currently has orders (in case it was deleted but still has active orders)
    orders.forEach((o) => {
      if (o.table_number) set.add(o.table_number);
    });
    
    // Sort
    return Array.from(set).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b), 'vi');
    });
  }, [tables, orders]);

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

  const [mobileTab, setMobileTab] = useState<'WAITING' | 'PREPARING' | 'READY' | 'COMPLETED'>('WAITING');

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
    <div className="h-screen bg-stone-100 flex flex-col overflow-hidden text-stone-900 font-sans pb-[100px] sm:pb-24">
      {/* Header */}
      <KitchenHeader
        isMuted={isMuted}
        toggleMuted={() => setIsMuted((m) => !m)}
        connected={connected}
        isStoreOpen={isStoreOpen}
        onToggleStoreOpen={handleToggleStoreOpen}
        onOpenReceipt={() => setReceiptOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      {/* Toolbar */}
      <div className="flex-none bg-white border-b border-stone-200 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-3 shadow-2xs overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1 shrink-0 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-xs font-bold text-stone-700 hidden sm:inline">Ngày:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 outline-hidden cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors cursor-pointer"
                title="Xem đơn hôm nay"
              >
                Hôm nay
              </button>
            )}
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="px-1.5 py-0.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 text-[11px] font-bold transition-colors cursor-pointer"
                title="Xem tất cả các ngày"
              >
                Tất cả
              </button>
            )}
          </div>

          <span className="w-px h-5 bg-stone-200 shrink-0 hidden sm:inline" />

          {/* Room Filter */}
          <div className="flex items-center gap-1.5 text-stone-500 shrink-0">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400" />
            <span className="text-xs font-bold">Phòng:</span>
          </div>
          <div className="flex gap-1 overflow-x-auto py-0.5 scrollbar-hide">
            <button
              onClick={() => setSelectedTable('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedTable === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tất cả
            </button>
            {roomNumbers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedTable === t
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {/^phòng/i.test(String(t).trim()) ? String(t).trim() : (/^\d+$/.test(String(t).trim()) ? `Phòng ${String(t).trim().padStart(2, '0')}` : `Phòng ${String(t).trim()}`)}
              </button>
            ))}
          </div>

          <span className="w-1 h-1 rounded-full bg-stone-300 mx-1 shrink-0 hidden sm:inline" />
          <span className="text-xs text-stone-500 font-medium shrink-0 hidden sm:inline">
            {waitingOrders.length + preparingOrders.length + readyOrders.length} đơn đang xử lý
          </span>
        </div>

        <button
          onClick={() => {
            fetchOrders(true);
            fetchTables();
          }}
          disabled={isRefreshing}
          title="Tải lại danh sách"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition active:scale-95 border border-stone-200 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Làm mới</span>
        </button>
      </div>

      {/* Mobile Segmented Status Tabs (Phone / Small Tablet) */}
      <div className="flex-none md:hidden bg-stone-50 border-b border-stone-200 px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setMobileTab('WAITING')}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
            mobileTab === 'WAITING'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>Chờ nhận</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              mobileTab === 'WAITING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {waitingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setMobileTab('PREPARING')}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
            mobileTab === 'PREPARING'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>Đang làm</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              mobileTab === 'PREPARING'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {preparingOrders.length}
          </span>
        </button>

        <button
          onClick={() => setMobileTab('READY')}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
            mobileTab === 'READY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>Sẵn sàng</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              mobileTab === 'READY'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setMobileTab('COMPLETED')}
          className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
            mobileTab === 'COMPLETED'
              ? 'bg-stone-800 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
          }`}
        >
          <span>Đã xong</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              mobileTab === 'COMPLETED'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {completedOrders.length}
          </span>
        </button>
      </div>

      {/* Mobile Kanban Single-Column View */}
      <div className="flex-1 md:hidden p-2.5 overflow-hidden flex flex-col min-h-0">
        {mobileTab === 'WAITING' && (
          <KanbanColumn
            title="Chờ tiếp nhận"
            count={waitingOrders.length}
            statusColor="waiting"
            onSelectColumn={() => handleSelectColumn(waitingOrders)}
            isColumnSelected={waitingOrders.length > 0 && waitingOrders.every((o) => selectedOrderIds.has(o.id))}
          >
            {waitingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingIds.has(order.id)}
                isSelected={selectedOrderIds.has(order.id)}
                onSelectToggle={handleToggleSelect}
              />
            ))}
          </KanbanColumn>
        )}

        {mobileTab === 'PREPARING' && (
          <KanbanColumn
            title="Đang làm"
            count={preparingOrders.length}
            statusColor="preparing"
            onSelectColumn={() => handleSelectColumn(preparingOrders)}
            isColumnSelected={preparingOrders.length > 0 && preparingOrders.every((o) => selectedOrderIds.has(o.id))}
          >
            {preparingOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingIds.has(order.id)}
                isSelected={selectedOrderIds.has(order.id)}
                onSelectToggle={handleToggleSelect}
              />
            ))}
          </KanbanColumn>
        )}

        {mobileTab === 'READY' && (
          <KanbanColumn
            title="Sẵn sàng phục vụ"
            count={readyOrders.length}
            statusColor="ready"
            onSelectColumn={() => handleSelectColumn(readyOrders)}
            isColumnSelected={readyOrders.length > 0 && readyOrders.every((o) => selectedOrderIds.has(o.id))}
          >
            {readyOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingIds.has(order.id)}
                isSelected={selectedOrderIds.has(order.id)}
                onSelectToggle={handleToggleSelect}
              />
            ))}
          </KanbanColumn>
        )}

        {mobileTab === 'COMPLETED' && (
          <KanbanColumn
            title="Hoàn thành"
            count={completedOrders.length}
            statusColor="completed"
            onSelectColumn={() => handleSelectColumn(completedOrders)}
            isColumnSelected={completedOrders.length > 0 && completedOrders.every((o) => selectedOrderIds.has(o.id))}
          >
            {completedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
                isUpdating={updatingIds.has(order.id)}
                isSelected={selectedOrderIds.has(order.id)}
                onSelectToggle={handleToggleSelect}
              />
            ))}
          </KanbanColumn>
        )}
      </div>

      {/* Desktop / Tablet Kanban Board (All 4 columns side by side) */}
      <main className="hidden md:flex flex-1 gap-3 p-3 overflow-x-auto min-h-0">
        {/* Column 1: WAITING */}
        <KanbanColumn
          title="Chờ tiếp nhận"
          count={waitingOrders.length}
          statusColor="waiting"
          onSelectColumn={() => handleSelectColumn(waitingOrders)}
          isColumnSelected={waitingOrders.length > 0 && waitingOrders.every((o) => selectedOrderIds.has(o.id))}
        >
          {waitingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
              isSelected={selectedOrderIds.has(order.id)}
              onSelectToggle={handleToggleSelect}
            />
          ))}
        </KanbanColumn>

        {/* Column 2: PREPARING */}
        <KanbanColumn
          title="Đang làm"
          count={preparingOrders.length}
          statusColor="preparing"
          onSelectColumn={() => handleSelectColumn(preparingOrders)}
          isColumnSelected={preparingOrders.length > 0 && preparingOrders.every((o) => selectedOrderIds.has(o.id))}
        >
          {preparingOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
              isSelected={selectedOrderIds.has(order.id)}
              onSelectToggle={handleToggleSelect}
            />
          ))}
        </KanbanColumn>

        {/* Column 3: READY */}
        <KanbanColumn
          title="Sẵn sàng phục vụ"
          count={readyOrders.length}
          statusColor="ready"
          onSelectColumn={() => handleSelectColumn(readyOrders)}
          isColumnSelected={readyOrders.length > 0 && readyOrders.every((o) => selectedOrderIds.has(o.id))}
        >
          {readyOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
              isSelected={selectedOrderIds.has(order.id)}
              onSelectToggle={handleToggleSelect}
            />
          ))}
        </KanbanColumn>

        {/* Column 4: COMPLETED */}
        <KanbanColumn
          title="Hoàn thành"
          count={completedOrders.length}
          statusColor="completed"
          onSelectColumn={() => handleSelectColumn(completedOrders)}
          isColumnSelected={completedOrders.length > 0 && completedOrders.every((o) => selectedOrderIds.has(o.id))}
        >
          {completedOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updatingIds.has(order.id)}
              isSelected={selectedOrderIds.has(order.id)}
              onSelectToggle={handleToggleSelect}
            />
          ))}
        </KanbanColumn>
      </main>

      {/* Order Selection & Total Amount Footer */}
      <OrderSelectionFooter
        selectedCount={selectedOrderIds.size}
        totalAmount={selectedTotalAmount}
        selectedOrders={selectedOrders}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
        totalOrdersCount={filteredOrders.length}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        isUpdating={batchUpdating}
      />

      {/* Daily Receipt Modal */}
      <DailyReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />

      {/* Customer Feedback Modal */}
      <CustomerFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        orders={orders}
      />
    </div>
  );
};
