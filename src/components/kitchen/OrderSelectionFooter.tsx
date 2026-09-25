'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import {
  CheckSquare,
  Square,
  X,
  Play,
  CheckCircle2,
  CheckCheck,
  Receipt,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface OrderSelectionFooterProps {
  selectedCount: number;
  totalAmount: number;
  selectedOrders: Order[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  totalOrdersCount: number;
  onBatchUpdateStatus: (newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

export const OrderSelectionFooter: React.FC<OrderSelectionFooterProps> = ({
  selectedCount,
  totalAmount,
  selectedOrders,
  onClearSelection,
  onSelectAll,
  isAllSelected,
  totalOrdersCount,
  onBatchUpdateStatus,
  isUpdating = false,
}) => {
  // Extract unique room names from selected orders
  const uniqueRooms = React.useMemo(() => {
    const map = new Map<string, number>();
    selectedOrders.forEach((o) => {
      const roomStr = o.table_number
        ? (/^phòng/i.test(String(o.table_number).trim())
            ? String(o.table_number).trim()
            : `Phòng ${String(o.table_number).trim()}`)
        : 'Phòng N/A';
      map.set(roomStr, (map.get(roomStr) || 0) + 1);
    });
    return Array.from(map.entries()).map(([room, count]) => ({ room, count }));
  }, [selectedOrders]);

  // Total items inside selected orders
  const totalItemsCount = React.useMemo(() => {
    return selectedOrders.reduce((sum, order) => {
      return sum + (order.order_items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0);
    }, 0);
  }, [selectedOrders]);

  if (totalOrdersCount === 0) return null;

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out',
        selectedCount > 0
          ? 'translate-y-0 opacity-100 shadow-2xl'
          : 'translate-y-0 opacity-95'
      )}
    >
      {/* Expanded Selection & Total Bar when orders are selected */}
      {selectedCount > 0 ? (
        <div className="bg-stone-900/95 text-white backdrop-blur-md border-t border-stone-700/80 px-4 py-3 sm:px-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Selection Counter & Room Pills */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-2">
                <button
                  onClick={isAllSelected ? onClearSelection : onSelectAll}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold border border-stone-700 cursor-pointer active:scale-95"
                  title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả đơn'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400" />
                  )}
                  <span>{isAllSelected ? 'Bỏ chọn' : 'Tất cả'}</span>
                </button>

                <div className="flex items-baseline gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/60">
                  <span className="text-xs font-medium text-stone-400">Đã chọn:</span>
                  <span className="text-sm font-black text-rose-400 font-mono">
                    {selectedCount}
                  </span>
                  <span className="text-xs text-stone-400">
                    đơn ({totalItemsCount} món)
                  </span>
                </div>
              </div>

              {/* Room tags list (hidden on small phone, visible on sm+) */}
              <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-xs scrollbar-hide">
                {uniqueRooms.slice(0, 3).map(({ room, count }) => (
                  <span
                    key={room}
                    className="px-2 py-0.5 rounded-lg bg-stone-800 text-stone-300 text-[11px] font-bold border border-stone-700 whitespace-nowrap"
                  >
                    {room} <span className="text-rose-400">({count})</span>
                  </span>
                ))}
                {uniqueRooms.length > 3 && (
                  <span className="text-[11px] text-stone-400 font-bold">
                    +{uniqueRooms.length - 3} phòng
                  </span>
                )}
              </div>

              {/* Clear button (Mobile) */}
              <button
                onClick={onClearSelection}
                className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
                title="Bỏ chọn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Prominent TOTAL AMOUNT Display */}
            <div className="flex items-center justify-center gap-3 bg-stone-800/90 border border-amber-500/30 px-5 py-2 rounded-2xl shadow-inner w-full md:w-auto">
              <div className="text-left md:text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Tổng tiền đã chọn</span>
                </div>
                <div className="text-xs text-stone-400 hidden sm:block">
                  {selectedCount} đơn hàng
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight drop-shadow-sm">
                {formatCurrency(totalAmount)}
              </div>
            </div>

            {/* Right: Batch Actions for Kitchen */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-end">
              <span className="text-[11px] font-bold text-stone-400 hidden lg:inline mr-1">
                Chuyển hàng loạt:
              </span>

              {/* Batch -> PREPARING */}
              <button
                disabled={isUpdating}
                onClick={() => onBatchUpdateStatus('PREPARING')}
                className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                title="Chuyển các đơn đã chọn sang trạng thái Đang làm"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Đang làm</span>
              </button>

              {/* Batch -> READY */}
              <button
                disabled={isUpdating}
                onClick={() => onBatchUpdateStatus('READY')}
                className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                title="Chuyển các đơn đã chọn sang trạng thái Sẵn sàng phục vụ"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Sẵn sàng</span>
              </button>

              {/* Batch -> COMPLETED */}
              <button
                disabled={isUpdating}
                onClick={() => onBatchUpdateStatus('COMPLETED')}
                className="flex-1 md:flex-initial px-3 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                title="Hoàn thành các đơn đã chọn"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Xong tất cả</span>
              </button>

              {/* Clear button (Desktop) */}
              <button
                onClick={onClearSelection}
                className="hidden md:flex p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition active:scale-95 cursor-pointer"
                title="Bỏ chọn tất cả"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Collapsed bar when 0 orders selected: Quick selection prompt */
        <div className="bg-white/90 backdrop-blur-md border-t border-stone-200/80 px-4 py-2 sm:px-6 shadow-md transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <Layers className="w-4 h-4 text-stone-400" />
              <span className="font-medium text-stone-500 hidden sm:inline">
                Mẹo: Tích chọn ô vuông trên từng đơn để tính tổng tiền hoặc đổi trạng thái hàng loạt.
              </span>
              <span className="font-medium text-stone-500 sm:hidden">
                Tích chọn đơn để tính tổng tiền.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-stone-200"
              >
                <CheckSquare className="w-3.5 h-3.5 text-rose-600" />
                <span>Chọn tất cả ({totalOrdersCount} đơn)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
