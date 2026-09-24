'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ColumnStatusColor = 'waiting' | 'preparing' | 'ready' | 'completed';

interface KanbanColumnProps {
  title: string;
  count: number;
  statusColor: ColumnStatusColor;
  children: React.ReactNode;
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
}) => {
  const styles = colorMap[statusColor];

  return (
    <div
      className={cn(
        'flex-1 flex flex-col min-w-[280px] max-w-sm rounded-2xl bg-white border shadow-xs overflow-hidden transition-all',
        styles.border
      )}
    >
      {/* Column Header */}
      <div className={cn('px-4 py-3 flex items-center justify-between', styles.headerBg)}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2.5 h-2.5 rounded-full animate-pulse', styles.accentDot)} />
          <h2 className="font-bold text-stone-900 text-sm tracking-tight">{title}</h2>
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-stone-50/50">
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
