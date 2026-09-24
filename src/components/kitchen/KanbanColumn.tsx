'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type KanbanStatusType =
  | 'waiting'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'WAITING'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | string;

interface KanbanColumnProps {
  title: string;
  count: number;
  statusColor: KanbanStatusType;
  children: React.ReactNode;
}

const statusThemes: Record<
  string,
  {
    bg: string;
    border: string;
    badge: string;
    title: string;
    dot: string;
    headerBorder: string;
  }
> = {
  waiting: {
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40',
    title: 'text-amber-400',
    dot: 'bg-amber-400',
    headerBorder: 'border-amber-500/20',
  },
  preparing: {
    bg: 'bg-blue-950/20',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40',
    title: 'text-blue-400',
    dot: 'bg-blue-400',
    headerBorder: 'border-blue-500/20',
  },
  ready: {
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40',
    title: 'text-emerald-400',
    dot: 'bg-emerald-400',
    headerBorder: 'border-emerald-500/20',
  },
  completed: {
    bg: 'bg-stone-900/30',
    border: 'border-stone-700/40',
    badge: 'bg-stone-700/50 text-stone-300 ring-1 ring-stone-600/40',
    title: 'text-stone-300',
    dot: 'bg-stone-400',
    headerBorder: 'border-stone-750/30',
  },
};

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  statusColor,
  children,
}) => {
  const normalizedKey = statusColor.toLowerCase();
  const theme = statusThemes[normalizedKey] || statusThemes['completed'];

  return (
    <div
      className={cn(
        'flex-1 min-w-[280px] lg:min-w-0 flex flex-col rounded-2xl border backdrop-blur-xs overflow-hidden',
        theme.bg,
        theme.border
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex-none flex items-center justify-between px-4 py-3.5 border-b bg-stone-900/60',
          theme.headerBorder
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              theme.dot,
              normalizedKey === 'waiting' && count > 0 && 'animate-pulse'
            )}
          />
          <h2
            className={cn(
              'font-bold text-sm tracking-wide uppercase',
              theme.title
            )}
          >
            {title}
          </h2>
        </div>

        <span
          className={cn(
            'text-xs font-bold px-2.5 py-0.5 rounded-full',
            theme.badge
          )}
        >
          {count}
        </span>
      </div>

      {/* Column Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
        {count === 0 ? (
          <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-stone-600 text-xs italic">
            <span>Không có đơn nào</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
