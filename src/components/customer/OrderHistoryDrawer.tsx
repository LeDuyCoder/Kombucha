'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatTime } from '@/lib/utils';
import { X, Clock, ChefHat, Check, CircleDot } from 'lucide-react';

interface OrderHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  tableNumber: number | null;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  WAITING: {
    label: 'Đang chờ',
    icon: <Clock className="w-3.5 h-3.5" />,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    icon: <ChefHat className="w-3.5 h-3.5" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  READY: {
    label: 'Món đã sẵn sàng',
    icon: <Check className="w-3.5 h-3.5" />,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    icon: <CircleDot className="w-3.5 h-3.5" />,
    color: 'text-stone-500',
    bgColor: 'bg-stone-50 border-stone-200',
  },
  CANCELLED: {
    label: 'Đã huỷ',
    icon: <X className="w-3.5 h-3.5" />,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
  },
};

export const OrderHistoryDrawer: React.FC<OrderHistoryDrawerProps> = ({
  isOpen,
  onClose,
  orders,
  tableNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-stone-900 text-lg">Đơn hàng của bạn</h2>
            <p className="text-xs text-stone-500">Phòng {tableNumber || '--'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <p className="font-medium text-sm">Chưa có đơn hàng nào</p>
              <p className="text-xs mt-1">Hãy chọn món và gửi đơn order đầu tiên!</p>
            </div>
          ) : (
            orders.map((order, index) => {
              const orderStatus = statusConfig[order.status] || statusConfig.WAITING;
              return (
                <div
                  key={order.id}
                  className="bg-stone-50 rounded-2xl border border-stone-100 overflow-hidden"
                >
                  <div className="p-3 flex items-center justify-between border-b border-stone-100">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        Order #{String(orders.length - index).padStart(3, '0')}
                      </span>
                      <span className="text-xs text-stone-500 ml-2">
                        {formatTime(order.created_at)}
                      </span>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${orderStatus.color} ${orderStatus.bgColor}`}
                    >
                      {orderStatus.icon}
                      {orderStatus.label}
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5">
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
                  </div>

                  {order.note && (
                    <div className="px-3 pb-2">
                      <span className="text-xs text-stone-400 italic">"{order.note}"</span>
                    </div>
                  )}

                  <div className="px-3 pb-3 flex justify-end">
                    <span className="text-xs font-bold text-stone-800">
                      Tổng: {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
