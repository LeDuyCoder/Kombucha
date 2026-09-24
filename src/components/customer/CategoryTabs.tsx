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
    <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-100 shadow-xs">
      <div className="max-w-xl mx-auto overflow-x-auto">
        <div className="flex gap-1.5 px-4 py-2 min-w-max">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                'shrink-0 px-4 py-2 rounded-xl text-sm font-bold tracking-tight transition-all duration-200 active:scale-95',
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
