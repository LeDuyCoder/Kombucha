'use client';

import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
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
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const getPriority = (name: string) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('kombucha')) return 1;
        if (lower.includes('trà') || lower.includes('tea')) return 2;
        if (lower.includes('nước ngọt') || lower.includes('ngọt') || lower.includes('soda')) return 3;
        return 99;
      };
      const pA = getPriority(a.name);
      const pB = getPriority(b.name);
      if (pA !== pB) return pA - pB;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  }, [categories]);

  const allCategories = useMemo(() => {
    return [
      { id: 'all', name: 'Tất cả', sort_order: 0 },
      ...sortedCategories,
    ];
  }, [sortedCategories]);

  // Measure and position the sliding pill
  useLayoutEffect(() => {
    const activeEl = tabsRef.current[activeCategory];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });

      // Smoothly center the active tab if on mobile or scrolled
      if (containerRef.current) {
        const container = containerRef.current;
        const targetScroll = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [activeCategory, allCategories]);

  return (
    <div className="sticky top-14 sm:top-16 z-20 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/70 shadow-2xs py-2 sm:py-2.5 transition-all">
      <div
        ref={containerRef}
        className="max-w-2xl mx-auto overflow-x-auto scrollbar-none"
      >
        <div className="relative flex items-center gap-2 px-4 min-w-max py-0.5">
          {/* Animated Background Slider Indicator */}
          {indicatorStyle && (
            <div
              className="absolute top-0.5 bottom-0.5 rounded-2xl bg-rose-600 shadow-md shadow-rose-600/30 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          )}

          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                ref={(el) => {
                  tabsRef.current[cat.id] = el;
                }}
                onClick={() => onSelect(cat.id)}
                className={cn(
                  'relative z-10 shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 ease-out active:scale-95 cursor-pointer select-none',
                  isActive
                    ? 'text-white drop-shadow-xs font-black'
                    : 'text-stone-600 hover:text-stone-900 bg-white/90 border border-stone-200/80 hover:border-stone-300 hover:bg-white shadow-2xs'
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
