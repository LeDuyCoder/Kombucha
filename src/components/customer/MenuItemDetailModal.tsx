'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Minus, Info } from 'lucide-react';

interface MenuItemDetailModalProps {
  item: MenuItem;
  quantityInCart: number;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export const MenuItemDetailModal: React.FC<MenuItemDetailModalProps> = ({
  item,
  quantityInCart,
  isOpen,
  onClose,
  onAddToCart,
  onRemoveFromCart,
}) => {
  if (!isOpen) return null;

  const isOutOfStock = !item.available;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image (Optional) or Color Block */}
        <div className="relative h-48 bg-stone-100 flex items-center justify-center overflow-hidden shrink-0">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-50 to-stone-50 flex items-center justify-center">
              <Info className="w-12 h-12 text-rose-200" />
            </div>
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight">
              {item.name}
            </h2>
            <div className="shrink-0 text-right">
              <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-0.5">Giá bán</p>
              <p className="font-black text-rose-700 text-xl font-mono tracking-tight">
                {formatCurrency(item.price)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-bold uppercase tracking-widest">
              {item.category_name || 'Món nước'}
            </div>
            {item.stock_quantity !== null && item.stock_quantity !== undefined && (
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest ${
                item.stock_quantity === 0
                  ? 'bg-rose-100 text-rose-700'
                  : item.stock_quantity <= 5
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {item.stock_quantity === 0 ? 'Hết hàng' : item.stock_quantity <= 5 ? `Chỉ còn ${item.stock_quantity} ly` : `Còn: ${item.stock_quantity} ly`}
              </span>
            )}
          </div>

          <p className="text-sm text-stone-600 leading-relaxed font-medium">
            {item.description || 'Chưa có mô tả chi tiết cho món này.'}
          </p>
        </div>

        {/* Footer / Actions */}
        <div className="p-5 border-t border-stone-100 bg-stone-50/80 mt-auto shrink-0">
          {isOutOfStock ? (
            <button disabled className="w-full py-3.5 rounded-2xl bg-stone-200 text-stone-500 font-bold text-sm">
              Món này hiện đang hết
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white border border-rose-200 shadow-xs">
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFromCart(item); }}
                className="w-12 h-12 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-rose-600 font-bold uppercase tracking-widest">Đã chọn</span>
                <span className="text-xl font-black text-stone-900 leading-none">{quantityInCart}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isMaxReached = typeof item.stock_quantity === 'number' && quantityInCart >= item.stock_quantity;
                  if (isMaxReached) {
                    alert(`Món "${item.name}" chỉ còn ${item.stock_quantity} phần!`);
                    return;
                  }
                  onAddToCart(item);
                }}
                disabled={typeof item.stock_quantity === 'number' && quantityInCart >= item.stock_quantity}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  typeof item.stock_quantity === 'number' && quantityInCart >= item.stock_quantity
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95 shadow-md shadow-rose-600/20'
                }`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm tracking-wide shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào giỏ hàng</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Background overlay click to close */}
      <div className="fixed inset-0 z-[-1]" onClick={onClose} />
    </div>
  );
};
