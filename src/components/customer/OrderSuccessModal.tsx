'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Order } from '@/types';
import { formatCurrency, formatTime } from '@/lib/utils';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  tableNumber: number | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  order,
  tableNumber,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-[90%] p-6 text-center animate-in zoom-in-90 duration-300">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-5 ring-4 ring-emerald-100">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-black text-stone-900 mb-1">
          Order đã được gửi! 🎉
        </h2>
        <p className="text-stone-500 text-sm mb-5">
          Bếp đang nhận order của bạn
        </p>

        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4 text-left space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Bàn</span>
            <span className="font-bold text-stone-900">
              {String(tableNumber || 0).padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Thời gian</span>
            <span className="font-bold text-stone-900">
              {formatTime(order.created_at)}
            </span>
          </div>

          <div className="border-t border-stone-200 my-2" />

          {order.order_items?.map((item) => (
            <div
              key={item.id || item.menu_item_id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-stone-700">
                <span className="font-bold text-emerald-700">{item.quantity}×</span>{' '}
                {item.item_name}
              </span>
              <span className="text-stone-500 text-xs">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}

          <div className="border-t border-stone-200 my-2" />
          <div className="flex justify-between">
            <span className="font-bold text-stone-900 text-sm">Tổng</span>
            <span className="font-black text-emerald-700 text-base">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 mb-4">
          <p className="text-xs text-amber-800 font-medium">
            ⏳ Trạng thái: <span className="font-bold">Đang chờ bếp nhận</span>
          </p>
          <p className="text-[11px] text-amber-700 mt-1">
            Bạn có thể theo dõi tiến độ đơn hàng ở mục "Đơn hàng"
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all"
        >
          Tiếp tục chọn món
        </button>
      </div>
    </div>
  );
};
