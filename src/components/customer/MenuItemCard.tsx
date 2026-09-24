'use client';

import React from 'react';
import Image from 'next/image';
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
    <div className="bg-white rounded-2xl p-3 border border-stone-100 shadow-xs hover:shadow-md transition-all flex gap-3.5 items-center relative overflow-hidden group">
      {/* Product Image */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? 'grayscale opacity-50' : ''
            }`}
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold text-xs p-2 text-center">
            {item.name}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-900/80">
              Hết món
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h3 className="font-bold text-stone-900 text-sm md:text-base leading-tight truncate">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="font-extrabold text-stone-900 text-sm md:text-base tracking-tight text-emerald-700">
            {formatCurrency(item.price)}
          </span>

          {/* Action buttons */}
          {!isOutOfStock && (
            <div className="flex items-center">
              {quantityInCart > 0 ? (
                <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                  <button
                    onClick={() => onRemoveFromCart(item)}
                    className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-stone-700 active:scale-90 transition-transform"
                    aria-label="Giảm"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center font-bold text-xs text-stone-800">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="w-7 h-7 rounded-lg bg-emerald-600 text-white shadow-xs flex items-center justify-center active:scale-90 transition-transform"
                    aria-label="Tăng"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(item)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
