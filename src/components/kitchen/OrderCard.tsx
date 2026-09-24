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
  Star,
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
        'rounded-2xl border transition-all duration-200 shadow-xs flex flex-col overflow-hidden select-none bg-white',
        // Status border & background styling
        order.status === 'WAITING' && isUrgent && 'border-red-400 ring-2 ring-red-400/30',
        order.status === 'WAITING' && isWarning && !isUrgent && 'border-amber-400 ring-1 ring-amber-400/30',
        order.status === 'WAITING' && !isUrgent && !isWarning && 'border-amber-200 hover:border-amber-300',
        order.status === 'PREPARING' && 'border-blue-200 hover:border-blue-300',
        order.status === 'READY' && 'border-emerald-200 hover:border-emerald-300',
        order.status === 'COMPLETED' && 'border-stone-200 opacity-75',
        order.status === 'CANCELLED' && 'border-red-200 opacity-50'
      )}
    >
      {/* Top Banner: Table Number, Order ID & Time */}
      <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 text-amber-900 border border-amber-300/80 font-black px-2.5 py-0.5 rounded-lg text-xs tracking-tight">
            Phòng {order.table_number ? String(order.table_number).padStart(2, '0') : 'N/A'}
          </div>
          <span className="text-xs text-stone-500 font-mono tracking-wider font-semibold">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-600 font-mono font-medium">{formatTime(order.created_at)}</span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ml-1',
              isUrgent
                ? 'bg-red-100 text-red-700 animate-pulse'
                : isWarning
                ? 'bg-amber-100 text-amber-700'
                : 'bg-stone-100 text-stone-600'
            )}
          >
            {elapsedMinutes}m
          </span>
        </div>
      </div>

      {/* Special Order Note if present */}
      {order.note && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[11px]">Ghi chú: </span>
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
              className="flex items-start justify-between gap-3 pb-2 border-b border-stone-100 last:border-b-0 last:pb-0"
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="font-bold text-stone-800 text-sm leading-snug block">
                  {item.item_name}
                </span>
                {item.note && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                    <MessageSquare className="w-3 h-3 shrink-0" />
                    <span>{item.note}</span>
                  </div>
                )}
              </div>

              {/* Quantity bubble */}
              <div className="shrink-0 flex items-center justify-center bg-stone-100 text-stone-900 font-mono font-black text-xs px-2.5 py-1 rounded-lg min-w-[32px] border border-stone-200">
                x{item.quantity}
              </div>
            </div>
          ))
        ) : (
          <div className="py-2 text-center text-xs text-stone-400 italic">
            Không có món chi tiết
          </div>
        )}
      </div>

      {order.rating && (
        <div className="mx-3 mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Khách đánh giá: {order.rating}/5 sao</span>
          </div>
          {order.feedback_note && (
            <p className="text-[11px] italic text-amber-700 leading-relaxed bg-amber-100/50 p-1.5 rounded-lg border border-amber-200/50">
              "{order.feedback_note}"
            </p>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="p-3 border-t border-stone-100 bg-stone-50/50">
        {showCancelConfirm ? (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in duration-150">
            <p className="text-xs text-red-800 font-semibold text-center">
              Xác nhận hủy đơn hàng này?
            </p>
            <div className="flex gap-2">
              <button
                disabled={isUpdating}
                onClick={() => {
                  setShowCancelConfirm(false);
                  onUpdateStatus(order.id, 'CANCELLED');
                }}
                className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                Hủy đơn
              </button>
              <button
                disabled={isUpdating}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-1.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-xs font-semibold transition active:scale-95"
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
                className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 border border-stone-200 hover:border-red-200 transition active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {/* WAITING: Bắt đầu làm -> sets to PREPARING */}
            {order.status === 'WAITING' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xs shadow-blue-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bắt đầu làm</span>
              </button>
            )}

            {/* PREPARING: Đã xong -> sets to READY */}
            {order.status === 'PREPARING' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'READY')}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã xong</span>
              </button>
            )}

            {/* READY: Hoàn thành -> sets to COMPLETED */}
            {order.status === 'READY' && (
              <button
                disabled={isUpdating}
                onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Hoàn thành</span>
              </button>
            )}

            {/* COMPLETED */}
            {order.status === 'COMPLETED' && (
              <div className="flex-1 py-1.5 px-3 rounded-xl bg-stone-100 text-stone-500 text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-stone-200">
                <ChefHat className="w-3.5 h-3.5" />
                <span>Đã phục vụ</span>
              </div>
            )}

            {/* CANCELLED */}
            {order.status === 'CANCELLED' && (
              <div className="flex-1 py-1.5 px-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center flex items-center justify-center gap-1.5 border border-red-200">
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
