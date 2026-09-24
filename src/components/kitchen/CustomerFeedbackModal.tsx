'use client';

import React, { useState, useMemo } from 'react';
import { Order } from '@/types';
import { formatTime, cn } from '@/lib/utils';
import {
  X,
  Star,
  MessageSquareHeart,
  Calendar,
  Filter,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface CustomerFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const CustomerFeedbackModal: React.FC<CustomerFeedbackModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const [selectedStar, setSelectedStar] = useState<number | 'ALL'>('ALL');
  const [selectedTable, setSelectedTable] = useState<number | 'ALL'>('ALL');

  // Filter orders that have ratings
  const ratedOrders = useMemo(() => {
    return orders
      .filter((o) => typeof o.rating === 'number' && o.rating > 0)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = ratedOrders.length;
    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const sum = ratedOrders.reduce((acc, o) => acc + (o.rating || 0), 0);
    const avg = Number((sum / total).toFixed(1));

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedOrders.forEach((o) => {
      const r = o.rating as 1 | 2 | 3 | 4 | 5;
      if (distribution[r] !== undefined) {
        distribution[r]++;
      }
    });

    return {
      average: avg,
      total,
      distribution,
    };
  }, [ratedOrders]);

  // Available room numbers for filtering
  const availableRooms = useMemo(() => {
    const set = new Set<number>();
    ratedOrders.forEach((o) => {
      if (o.table_number) set.add(o.table_number);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [ratedOrders]);

  // Filtered list
  const filteredList = useMemo(() => {
    return ratedOrders.filter((o) => {
      const matchStar = selectedStar === 'ALL' || o.rating === selectedStar;
      const matchTable = selectedTable === 'ALL' || o.table_number === selectedTable;
      return matchStar && matchTable;
    });
  }, [ratedOrders, selectedStar, selectedTable]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs border border-amber-200">
              <MessageSquareHeart className="w-5 h-5 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>Đánh Giá &amp; Ý Kiến Khách Hàng</span>
                {stats.total > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    {stats.total} lượt
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Xem phản hồi trực tiếp từ khách tại các phòng order
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rating Overview Summary Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-white to-stone-50 border-b border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Score Big Display */}
            <div className="sm:col-span-5 flex flex-col items-center sm:items-start justify-center border-b sm:border-b-0 sm:border-r border-stone-200/80 pb-3 sm:pb-0 sm:pr-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-stone-900 font-mono tracking-tight">
                  {stats.total > 0 ? stats.average : '0.0'}
                </span>
                <span className="text-stone-400 font-bold text-sm">/ 5.0</span>
              </div>
              
              {/* Golden Stars row */}
              <div className="flex items-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      'w-4 h-4',
                      stats.average >= s
                        ? 'fill-amber-400 text-amber-400'
                        : stats.average >= s - 0.5
                        ? 'fill-amber-300 text-amber-400'
                        : 'text-stone-300'
                    )}
                  />
                ))}
              </div>

              <p className="text-[11px] text-stone-500 font-medium">
                {stats.total > 0 ? `Dựa trên ${stats.total} lượt khách chấm điểm` : 'Chưa có lượt đánh giá nào'}
              </p>
            </div>

            {/* Star Distribution Bars */}
            <div className="sm:col-span-7 space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = stats.distribution[starNum as 1 | 2 | 3 | 4 | 5] || 0;
                const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                return (
                  <div key={starNum} className="flex items-center gap-2">
                    <span className="w-8 font-bold text-stone-600 flex items-center gap-0.5 justify-end">
                      {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-stone-200/80 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-[11px] text-stone-500 font-mono text-right">
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-stone-200 bg-white flex flex-wrap items-center justify-between gap-2">
          {/* Star Filter */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
            <button
              onClick={() => setSelectedStar('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                selectedStar === 'ALL'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              Tất cả ({ratedOrders.length})
            </button>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.distribution[s as 1 | 2 | 3 | 4 | 5];
              return (
                <button
                  key={s}
                  onClick={() => setSelectedStar(s)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                    selectedStar === s
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  )}
                >
                  <span>{s}</span>
                  <Star className="w-3 h-3 fill-current text-current" />
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Room Filter */}
          {availableRooms.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <span className="font-semibold text-stone-400">Phòng:</span>
              <select
                value={selectedTable}
                onChange={(e) =>
                  setSelectedTable(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                }
                className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Tất cả phòng</option>
                {availableRooms.map((r) => (
                  <option key={r} value={r}>
                    Phòng {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Feedback List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <MessageSquareHeart className="w-12 h-12 mx-auto text-stone-300 opacity-60" />
              <p className="font-bold text-stone-700 text-sm">Chưa có đánh giá nào phù hợp</p>
              <p className="text-xs text-stone-400">
                Khi khách hàng hoàn tất đơn và gửi nhận xét, phản hồi sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            filteredList.map((order) => {
              const rating = order.rating || 5;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 hover:border-amber-300 transition-all shadow-2xs space-y-2.5"
                >
                  {/* Top Bar: Room + Order ID + Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300/80 font-black text-xs font-mono">
                        Phòng {order.table_number ? String(order.table_number).padStart(2, '0') : '--'}
                      </span>
                      <span className="text-xs text-stone-400 font-mono font-medium">
                        #{order.id.slice(-5).toUpperCase()}
                      </span>
                    </div>

                    <span className="text-xs text-stone-500 font-medium">
                      {formatTime(order.created_at)}
                    </span>
                  </div>

                  {/* Stars Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            'w-4 h-4',
                            s <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-extrabold text-amber-800">
                      {rating === 5
                        ? 'Tuyệt vời'
                        : rating === 4
                        ? 'Rất tốt'
                        : rating === 3
                        ? 'Bình thường'
                        : 'Cần cải thiện'}
                    </span>
                  </div>

                  {/* Customer Comment Note */}
                  {order.feedback_note ? (
                    <div className="p-3 rounded-xl bg-white border border-amber-200/80 shadow-2xs">
                      <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed italic">
                        "{order.feedback_note}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      (Khách không để lại lời nhận xét bằng chữ)
                    </p>
                  )}

                  {/* Order items consumed */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-200/60">
                      <span className="text-[11px] text-stone-400 font-semibold flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> Đã gọi:
                      </span>
                      {order.order_items.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200/60 text-stone-700 font-medium"
                        >
                          {item.quantity}× {item.item_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 font-medium">
          <span>
            {stats.total > 0
              ? `Hiển thị ${filteredList.length} trên tổng ${stats.total} đánh giá`
              : 'Hệ thống lắng nghe ý kiến khách hàng tự động'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
