'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Minus, Coffee } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onViewDetail?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onViewDetail,
}) => {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = !item.available || (typeof item.stock_quantity === 'number' && item.stock_quantity === 0);

  return (
    <div
      onClick={() => onViewDetail && onViewDetail(item)}
      className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border transition-all duration-300 ease-out flex items-center gap-3 sm:gap-3.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer ${
        isOutOfStock
          ? 'border-stone-200 bg-stone-50/50 opacity-60'
          : quantityInCart > 0
          ? 'border-rose-300 ring-1 ring-rose-400/30 bg-rose-50/5'
          : 'border-stone-200/80 hover:border-rose-300'
      }`}
    >
      {/* Left: Square Rounded Thumbnail (Smooth Hover Zoom) */}
      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 relative bg-stone-100 border border-stone-200/70 shadow-2xs">
        {item.image_url && !imageError ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-stone-100 text-stone-400">
            <Coffee className="w-6 h-6 text-rose-300" />
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex items-center justify-center animate-in fade-in duration-200">
            <span className="text-[10px] font-black text-white uppercase tracking-wider">Hết</span>
          </div>
        )}

        {quantityInCart > 0 && (
          <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-1 ring-white shadow-xs animate-in zoom-in-75 duration-200">
            {quantityInCart}
          </span>
        )}
      </div>

      {/* Right: Info & Actions */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          {/* Title & Stock Badge */}
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-rose-600 transition-colors duration-200 tracking-tight line-clamp-1">
              {item.name}
            </h3>

            {item.stock_quantity !== null && item.stock_quantity !== undefined && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  item.stock_quantity === 0
                    ? 'bg-rose-100 text-rose-700'
                    : item.stock_quantity <= 5
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {item.stock_quantity === 0
                  ? 'Hết hàng'
                  : item.stock_quantity <= 5
                  ? `Còn ${item.stock_quantity}`
                  : `Còn ${item.stock_quantity}`}
              </span>
            )}
          </div>

          {/* Description line */}
          {item.description && (
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 line-clamp-1 leading-relaxed font-normal">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom Row: Price & Action Stepper */}
        <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <span className="font-black text-rose-600 text-sm sm:text-base tracking-tight font-mono">
            {formatCurrency(item.price)}
          </span>

          {/* Action Button */}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-400 text-[10px] font-bold">
              Hết món
            </span>
          ) : quantityInCart > 0 ? (
            <div
              className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200 shadow-2xs animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCart(item);
                }}
                className="w-5 h-5 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 active:scale-90 transition-transform duration-150"
                aria-label="Giảm"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-5 text-center font-bold text-xs text-stone-900">
                {quantityInCart}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    item.stock_quantity !== null &&
                    item.stock_quantity !== undefined &&
                    quantityInCart >= item.stock_quantity
                  ) {
                    alert(`Món "${item.name}" chỉ còn ${item.stock_quantity} phần!`);
                    return;
                  }
                  onAddToCart(item);
                }}
                disabled={
                  item.stock_quantity !== null &&
                  item.stock_quantity !== undefined &&
                  quantityInCart >= item.stock_quantity
                }
                className={`w-5 h-5 rounded-lg shadow-xs flex items-center justify-center active:scale-90 transition-transform duration-150 ${
                  item.stock_quantity !== null &&
                  item.stock_quantity !== undefined &&
                  quantityInCart >= item.stock_quantity
                    ? 'bg-stone-300 text-stone-400 cursor-not-allowed'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
                aria-label="Tăng"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              className="h-7 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-90 text-white text-xs font-bold flex items-center gap-1 shadow-xs shadow-rose-600/20 transition-all duration-150"
              title="Thêm món"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Thêm</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
