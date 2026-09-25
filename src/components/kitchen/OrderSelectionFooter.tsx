'use client';

import React from 'react';
import { Order } from '@/types';
import { formatCurrency, cn } from '@/lib/utils';
import { CheckSquare, Square, X } from 'lucide-react';

interface OrderSelectionFooterProps {
  selectedCount: number;
  totalAmount: number;
  selectedOrders?: Order[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  totalOrdersCount: number;
  onBatchUpdateStatus?: (newStatus: any) => void;
  isUpdating?: boolean;
}

export const OrderSelectionFooter: React.FC<OrderSelectionFooterProps> = ({
  selectedCount,
  totalAmount,
  selectedOrders = [],
  onClearSelection,
  onSelectAll,
  isAllSelected,
  totalOrdersCount,
}) => {
  // Extract unique room names and counts from selected orders
  const uniqueRooms = React.useMemo(() => {
    if (!selectedOrders || selectedOrders.length === 0) return [];
    const map = new Map<string, number>();
    selectedOrders.forEach((o) => {
      const roomStr = o.table_number
        ? (/^phòng/i.test(String(o.table_number).trim())
            ? String(o.table_number).trim()
            : (/^\d+$/.test(String(o.table_number).trim())
                ? `Phòng ${String(o.table_number).trim().padStart(2, '0')}`
                : `Phòng ${String(o.table_number).trim()}`))
        : 'Phòng N/A';
      map.set(roomStr, (map.get(roomStr) || 0) + 1);
    });
    return Array.from(map.entries()).map(([room, count]) => ({ room, count }));
  }, [selectedOrders]);

  // Only render when at least 1 order is selected to keep the board clean
  if (selectedCount === 0 || totalOrdersCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]',
        'animate-in fade-in slide-in-from-bottom-3 duration-200 ease-out'
      )}
    >
      <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.15)] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 sm:gap-3.5 text-stone-900">
        
        {/* Selection Badge */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/90 px-2.5 py-1 rounded-xl text-xs font-bold text-amber-900 shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>
            Đã chọn: <strong className="font-black text-amber-950 font-mono">{selectedCount}</strong> đơn
          </span>
        </div>

        {/* Room Chips Breakdown - No scrollbars, clean pills */}
        {uniqueRooms.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            {uniqueRooms.slice(0, 3).map(({ room, count }) => (
              <span
                key={room}
                className="px-2.5 py-1 rounded-xl bg-stone-100/90 text-stone-700 border border-stone-200/80 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <span>{room}</span>
                <span className="text-amber-600 font-mono font-black">({count})</span>
              </span>
            ))}
            {uniqueRooms.length > 3 && (
              <span className="px-2 py-1 rounded-xl bg-stone-100 text-stone-500 border border-stone-200/60 text-xs font-bold whitespace-nowrap shrink-0">
                +{uniqueRooms.length - 3} phòng
              </span>
            )}
          </div>
        )}

        {/* Select All Toggle Button */}
        <button
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          {isAllSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Square className="w-3.5 h-3.5 text-stone-400" />
          )}
          <span className="hidden sm:inline">{isAllSelected ? 'Bỏ chọn' : 'Chọn tất cả'}</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-stone-200 shrink-0 hidden sm:block" />

        {/* Total Amount Display */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
            Tổng cộng:
          </span>
          <span className="text-lg sm:text-2xl font-black text-stone-900 font-mono tracking-tight">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-stone-200 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition active:scale-95 cursor-pointer shrink-0"
          title="Bỏ chọn (Đóng)"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
