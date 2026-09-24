'use client';

import React from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const isOutOfStock = !item.available;

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md relative overflow-hidden group ${
        isOutOfStock
          ? 'border-stone-200 bg-stone-50/60 opacity-60'
          : quantityInCart > 0
          ? 'border-blue-300 ring-1 ring-blue-400/40 bg-blue-50/10'
          : 'border-stone-200 hover:border-blue-200'
      }`}
    >
      {/* Top Part: Item Name & Description */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-stone-900 text-base md:text-lg leading-snug group-hover:text-blue-700 transition-colors tracking-tight">
            {item.name}
          </h3>
          {quantityInCart > 0 && (
            <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
              {quantityInCart}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-xs md:text-sm text-stone-600 mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        )}
      </div>

      {/* Bottom Part: Price & Add / Adjust Buttons */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[11px] text-stone-500 font-bold block leading-none mb-1">
            Giá tiền
          </span>
          <span className="font-black text-blue-700 text-base md:text-lg tracking-tight font-mono">
            {formatCurrency(item.price)}
          </span>
        </div>

        {/* Action Button */}
        {isOutOfStock ? (
          <span className="px-2.5 py-1 rounded-xl bg-stone-200 text-stone-500 text-[11px] font-bold">
            Hết món
          </span>
        ) : quantityInCart > 0 ? (
          <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
            <button
              onClick={() => onRemoveFromCart(item)}
              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 active:scale-90 transition-transform"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-stone-900">
              {quantityInCart}
            </span>
            <button
              onClick={() => onAddToCart(item)}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white shadow-xs flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(item)}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        )}
      </div>
    </div>
  );
};
