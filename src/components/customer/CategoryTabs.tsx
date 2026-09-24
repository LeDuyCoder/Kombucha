'use client';

import React from 'react';
import { MenuCategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => {
  const allCategories = [
    { id: 'all', name: 'Tất cả', sort_order: 0 },
    ...categories,
  ];

  return (
    <div className="sticky top-16 z-20 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/70 shadow-2xs py-2.5 transition-all">
      <div className="max-w-2xl mx-auto overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 px-4 min-w-max">
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 ease-out active:scale-95 shadow-2xs cursor-pointer',
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.02]'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
