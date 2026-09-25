'use client';

import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ColumnStatusColor = 'waiting' | 'preparing' | 'ready' | 'completed';

interface KanbanColumnProps {
  title: string;
  count: number;
  statusColor: ColumnStatusColor;
  children: React.ReactNode;
  onSelectColumn?: () => void;
  isColumnSelected?: boolean;
}

const colorMap: Record<
  ColumnStatusColor,
  {
    headerBg: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    accentDot: string;
  }
> = {
  waiting: {
    headerBg: 'bg-amber-50/80 border-b border-amber-200',
    badgeBg: 'bg-amber-100 border border-amber-300',
    badgeText: 'text-amber-800',
    border: 'border-amber-200',
    accentDot: 'bg-amber-500',
  },
  preparing: {
    headerBg: 'bg-blue-50/80 border-b border-blue-200',
    badgeBg: 'bg-blue-100 border border-blue-300',
    badgeText: 'text-blue-800',
    border: 'border-blue-200',
    accentDot: 'bg-blue-500',
  },
  ready: {
    headerBg: 'bg-emerald-50/80 border-b border-emerald-200',
    badgeBg: 'bg-emerald-100 border border-emerald-300',
    badgeText: 'text-emerald-800',
    border: 'border-emerald-200',
    accentDot: 'bg-emerald-500',
  },
  completed: {
    headerBg: 'bg-stone-100/80 border-b border-stone-200',
    badgeBg: 'bg-stone-200 border border-stone-300',
    badgeText: 'text-stone-700',
    border: 'border-stone-200',
    accentDot: 'bg-stone-400',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  statusColor,
  children,
  onSelectColumn,
  isColumnSelected = false,
}) => {
  const styles = colorMap[statusColor];

  return (
    <div
      className={cn(
        'flex-1 flex flex-col w-full md:min-w-[260px] lg:min-w-[280px] md:max-w-sm rounded-2xl bg-white border shadow-xs overflow-hidden transition-all',
        styles.border
      )}
    >
      {/* Column Header */}
      <div className={cn('px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between', styles.headerBg)}>
        <div className="flex items-center gap-2">
          {onSelectColumn && count > 0 && (
            <button
              onClick={onSelectColumn}
              className="w-5 h-5 flex items-center justify-center transition-colors shrink-0 active:scale-90 cursor-pointer"
              title={isColumnSelected ? 'Bỏ chọn cả cột' : 'Chọn tất cả cột này'}
            >
              {isColumnSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-600 stroke-[2.5]" />
              ) : (
                <Square className="w-4 h-4 text-stone-400 hover:text-stone-600" />
              )}
            </button>
          )}
          <span className={cn('w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full animate-pulse', styles.accentDot)} />
          <h2 className="font-bold text-stone-900 text-xs sm:text-sm tracking-tight">{title}</h2>
        </div>
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-xs font-black',
            styles.badgeBg,
            styles.badgeText
          )}
        >
          {count}
        </span>
      </div>

      {/* Column Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 pb-24 space-y-3 bg-stone-50/50">
        {React.Children.count(children) === 0 ? (
          <div className="h-40 flex items-center justify-center text-stone-400 text-xs italic">
            Chưa có đơn hàng
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
