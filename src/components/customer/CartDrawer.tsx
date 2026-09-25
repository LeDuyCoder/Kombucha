'use client';

import React, { useState } from 'react';
import { CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  cart: CartItem[];
  tableNumber: string | number | null;
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
      {/* Sticky Bottom Floating Bar (when drawer is closed) */}
      {!isOpen && totalQuantity > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={onOpen}
              className="w-full bg-white/95 backdrop-blur-md text-stone-900 p-2.5 sm:p-3 rounded-2xl sm:rounded-[22px] shadow-xl shadow-stone-900/10 border border-stone-200/90 flex items-center justify-between hover:border-rose-300 hover:shadow-rose-950/10 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-500/30 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {totalQuantity}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-[11px] text-stone-500 font-semibold tracking-wide">
                    {tableNumber ? (/^\d+$/.test(String(tableNumber).trim()) ? `Phòng ${String(tableNumber).trim().padStart(2, '0')}` : (/^phòng/i.test(String(tableNumber).trim()) ? String(tableNumber).trim() : `Phòng ${String(tableNumber).trim()}`)) : 'Phòng --'} • <span className="text-stone-700">{totalQuantity} món</span>
                  </div>
                  <div className="font-black text-rose-600 text-base sm:text-lg tracking-tight font-mono">
                    {formatCurrency(totalPrice)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-rose-600 group-hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-sm shadow-rose-600/25 transition-all">
                <span>Xem đơn</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Drawer Overlay & Sheet */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[32px] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden border-t border-stone-200 animate-in slide-in-from-bottom duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-stone-300/80" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center shadow-2xs">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-extrabold text-stone-900 text-base leading-tight">
                    Đơn gọi món
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {tableNumber ? (/^\d+$/.test(String(tableNumber).trim()) ? `Phòng ${String(tableNumber).trim().padStart(2, '0')}` : (/^phòng/i.test(String(tableNumber).trim()) ? String(tableNumber).trim() : `Phòng ${String(tableNumber).trim()}`)) : 'Phòng --'} • {totalQuantity} món đã chọn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {cart.length > 0 && (
                  <button
                    onClick={onClearCart}
                    className="py-1 px-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Xóa toàn bộ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hết</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all cursor-pointer"
                  title="Đóng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-300">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-stone-700 text-sm">Giỏ hàng của bạn đang trống</p>
                  <p className="text-xs text-stone-400 mt-1">Hãy chọn các món thơm ngon từ menu nhé!</p>
                </div>
              ) : (
                cart.map((item) => {
                  const maxStock = item.menuItem.stock_quantity;
                  const isMax = typeof maxStock === 'number' && item.quantity >= maxStock;

                  return (
                    <div
                      key={item.menuItem.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-stone-50/70 border border-stone-200/70 hover:border-stone-300/80 transition-all shadow-2xs"
                    >
                      {/* Item Info */}
                      <div className="min-w-0 flex-1 pr-3">
                        <h4 className="font-bold text-stone-900 text-sm truncate leading-snug">
                          {item.menuItem.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-rose-600 font-extrabold font-mono">
                            {formatCurrency(item.menuItem.price)}
                          </span>
                          {item.menuItem.original_price && item.menuItem.original_price > item.menuItem.price && (
                            <span className="text-[10px] text-stone-400 line-through font-mono">
                              {formatCurrency(item.menuItem.original_price)}
                            </span>
                          )}
                          {typeof maxStock === 'number' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-200/70 text-stone-600 font-medium">
                              Kho: {maxStock}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compact Modern Stepper */}
                      <div className="flex items-center bg-white rounded-xl p-0.5 border border-stone-200 shadow-2xs">
                        <button
                          onClick={() => onRemoveFromCart(item.menuItem)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-600 hover:bg-stone-100 hover:text-stone-900 active:scale-90 transition-all cursor-pointer"
                          title="Giảm 1"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="w-7 text-center font-black text-xs text-stone-900 font-mono select-none">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => {
                            if (isMax) {
                              alert(`Món "${item.menuItem.name}" chỉ còn ${maxStock} phần!`);
                              return;
                            }
                            onAddToCart(item.menuItem);
                          }}
                          disabled={isMax}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-all cursor-pointer ${
                            isMax
                              ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                          }`}
                          title="Tăng 1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Order note input */}
              {cart.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 mb-1.5 text-stone-700">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                    <label className="text-xs font-bold text-stone-700">
                      Ghi chú cho quầy pha chế (tuỳ chọn)
                    </label>
                  </div>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Ví dụ: Ít ngọt, nhiều đá, không lấy ống hút nhựa..."
                    rows={2}
                    className="w-full text-xs p-3 rounded-2xl border border-stone-200 bg-stone-50/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none placeholder:text-stone-400 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Footer Summary & Submit */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-stone-100 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500 font-semibold block">
                      Tổng thanh toán dự kiến
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      ({totalQuantity} phần đồ uống)
                    </span>
                  </div>
                  <span className="text-xl font-black text-stone-900 font-mono tracking-tight">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi order...</span>
                    </>
                  ) : (
                    <>
                      <span>GỬI ORDER</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-stone-400 font-medium flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 inline shrink-0" />
                  <span>Không cần thanh toán ngay • Nhân viên sẽ phục vụ tại phòng</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
