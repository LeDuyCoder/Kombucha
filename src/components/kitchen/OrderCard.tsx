'use client';

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { formatTime, cn } from '@/lib/utils';
import {
  Clock,
  MessageSquare,
  AlertCircle,
  Play,
  CheckCircle2,
  CheckCheck,
  XCircle,
  ChefHat,
  Sparkles,
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  isUpdating?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  isUpdating = false,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Calculate elapsed minutes
  const createdTime = new Date(order.created_at).getTime();
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));

  // Determine urgency for waiting orders
  const isUrgent = order.status === 'WAITING' && elapsedMinutes >= 15;
  const isWarning = order.status === 'WAITING' && elapsedMinutes >= 8;

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 shadow-md flex flex-col overflow-hidden select-none',
        // Status border & background styling
        order.status === 'WAITING' && isUrgent && 'bg-stone-900 border-red-500/80 shadow-red-950/40 ring-1 ring-red-500/50',
        order.status === 'WAITING' && isWarning && !isUrgent && 'bg-stone-900 border-amber-500/80 shadow-amber-950/30',
        order.status === 'WAITING' && !isUrgent && !isWarning && 'bg-stone-900 border-stone-800 hover:border-amber-500/50',
        order.status === 'PREPARING' && 'bg-stone-900 border-blue-500/40 hover:border-blue-500/70 shadow-blue-950/20',
        order.status === 'READY' && 'bg-stone-900 border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/20',
        order.status === 'COMPLETED' && 'bg-stone-900/60 border-stone-800/80 opacity-75',
        order.status === 'CANCELLED' && 'bg-stone-900/40 border-red-900/30 opacity-50'
      )}
    >
      {/* Top Banner: Table Number, Order ID & Time */}
      <div className="px-4 py-3 border-b border-stone-800 flex items-center justify-between bg-stone-950/40">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/15 text-amber-300 border border-amber-500/30 font-black px-3 py-1 rounded-xl text-sm tracking-tight shadow-xs">
            Bàn {order.table_number ? String(order.table_number).padStart(2, '0') : 'N/A'}
          </div>
          <span className="text-xs text-stone-400 font-mono tracking-wider">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-300 font-mono font-medium">{formatTime(order.created_at)}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ml-1',
              isUrgent
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-stone-800 text-stone-400'
            )}
          >
            {elapsedMinutes}m
          </span>
        </div>
      </div>

      {/* Special Order Note if present */}
      {order.note && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">Ghi chú: </span>
            {order.note}
          </div>
        </div>
      )}

      {/* Item List */}
      <div className="p-3.5 space-y-2.5 flex-1">
        {order.order_items && order.order_items.length > 0 ? (
          order.order_items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-start justify-between gap-3 pb-2.5 border-b border-stone-800/60 last:border-b-0 last:pb-0"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-semibold text-stone-100 text-sm leading-snug block">
                  {item.item_name}
                </span>
                {item.note && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span>{item.note}</span>
                  </div>
                )}
              </div>

              {/* Quantity bubble */}
              <div className="shrink-0 flex items-center justify-center bg-stone-800 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded-lg min-w-[32px] border border-stone-700/60">
                x{item.quantity}
              </div>
            </div>
          ))
        ) : (
          <div className="py-2 text-center text-xs text-stone-500 italic">
            Không có món chi tiết
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-stone-800/80 bg-stone-950/30">
        {showCancelConfirm ? (
          <div className="p-2.5 bg-red-950/70 border border-red-800/70 rounded-xl space-y-2 animate-in fade-in duration-150">
            <p className="text-xs text-red-200 font-semibold text-center">
              Xác nhận hủy đơn hàng này?
            </p>
            <div className="flex gap-2">
              <button
                disabled={isUpdating}
                onClick={() => {
                  setShowCancelConfirm(false);
                  onUpdateStatus(order.id, 'CANCELLED');
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50"
              >
                Hủy đơn
              </button>
              <button
                disabled={isUpdating}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-semibold transition active:scale-95"
              >
                Quay lại
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Cancel Button (available for WAITING, PREPARING, READY) */}
            {['WAITING', 'PREPARING', 'READY'].includes(order.status) && (
              <button
                disabled={isUpdating}
                onClick={() => setShowCancelConfirm(true)}
                title="Hủy đơn"
                aria-label="Hủy đơn"
                className="p-2.5 rounded-xl bg-stone-850 hover:bg-red-950/60 text-stone-400 hover:text-red-400 border border-stone-800 hover:border-red-800/60 transition active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {/* WAITING: Bắt đầu làm -> sets to PREPARING */}
            {order.status === 'WAITING' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-blue-900/30 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu làm</span>
              </button>
            )}

            {/* PREPARING: Đã xong -> sets to READY */}
            {order.status === 'PREPARING' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'READY')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Đã xong</span>
              </button>
            )}

            {/* READY: Hoàn thành -> sets to COMPLETED */}
            {order.status === 'READY' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md shadow-purple-900/30 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Hoàn thành</span>
              </button>
            )}

            {/* COMPLETED */}
            {order.status === 'COMPLETED' && (
              <div className="flex-1 py-2 px-3 rounded-xl bg-stone-850 text-stone-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-stone-800">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Đã phục vụ</span>
              </div>
            )}

            {/* CANCELLED */}
            {order.status === 'CANCELLED' && (
              <div className="flex-1 py-2 px-3 rounded-xl bg-red-950/40 text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-red-900/40">
                <XCircle className="w-3.5 h-3.5" />
                <span>Đã hủy</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
