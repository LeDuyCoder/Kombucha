'use client';

import React, { useState } from 'react';
import { CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Loader2 } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cart: CartItem[];
  tableNumber: number | null;
  onAddToCart: (item: CartItem['menuItem']) => void;
  onRemoveFromCart: (item: CartItem['menuItem']) => void;
  onClearCart: () => void;
  onSubmitOrder: (note: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  cart,
  tableNumber,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onSubmitOrder,
  isSubmitting,
}) => {
  const [orderNote, setOrderNote] = useState('');

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const handleOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    await onSubmitOrder(orderNote);
    setOrderNote('');
  };

  if (cart.length === 0 && !isOpen) {
    return null;
  }

  return (
    <>
      {/* Sticky Bottom Bar (when drawer is closed) */}
      {!isOpen && totalQuantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <button
              onClick={onOpen}
              className="w-full bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl shadow-stone-900/30 flex items-center justify-between hover:bg-stone-800 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-stone-900">
                    {totalQuantity}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs text-stone-300 font-medium">Phòng {tableNumber || '--'}</div>
                  <div className="font-extrabold text-white text-base">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-blue-400 font-bold text-sm">
                <span>Xem giỏ hàng</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Drawer Overlay & Content */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">Đơn order món</h2>
                  <p className="text-xs text-stone-500 font-medium">Phòng {tableNumber || '--'} • {totalQuantity} món</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="p-2 text-stone-400 hover:text-rose-600 rounded-lg transition-colors text-xs flex items-center gap-1"
                    title="Xóa giỏ hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-stone-500 hover:bg-stone-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium text-sm">Giỏ hàng của bạn đang trống</p>
                  <p className="text-xs text-stone-400 mt-1">Hãy chọn đồ uống yêu thích từ menu nhé!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h4 className="font-bold text-stone-800 text-sm truncate">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-xs text-blue-700 font-extrabold mt-0.5">
                        {formatCurrency(item.menuItem.price)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center bg-white rounded-xl p-1 border border-stone-200 shadow-2xs">
                      <button
                        onClick={() => onRemoveFromCart(item.menuItem)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onAddToCart(item.menuItem)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-700 hover:bg-blue-50 active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Order note input */}
              {cart.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Ghi chú cho bếp (tuỳ chọn)
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Ví dụ: Ít đá, ít ngọt, không lấy ống hút..."
                    rows={2}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer Summary & Submit */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-100 bg-white space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 font-medium">Tổng tiền dự kiến</span>
                  <span className="text-lg font-black text-stone-900">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang gửi order xuống bếp...</span>
                    </>
                  ) : (
                    <>
                      <span>GỬI ORDER</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-stone-400">
                  Không cần thanh toán ngay • Nhân viên sẽ phục vụ tại phòng
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
