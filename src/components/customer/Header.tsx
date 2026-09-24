'use client';

import React from 'react';
import { Coffee, ClipboardList } from 'lucide-react';

interface HeaderProps {
  tableNumber: number | null;
  sessionToken: string | null;
  activeOrdersCount: number;
  onOpenOrders: () => void;
}

export const CustomerHeader: React.FC<HeaderProps> = ({
  tableNumber,
  sessionToken,
  activeOrdersCount,
  onOpenOrders,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Brand info */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-blue-700/20">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-stone-900 text-base leading-tight tracking-tight">
              Kombucha &amp; Tea House
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-medium text-stone-500">
                {sessionToken ? `Phiên #${sessionToken.replace('SESSION_', '')}` : 'Đang kết nối...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Room badge & Active Orders tracker */}
        <div className="flex items-center gap-2">
          {tableNumber !== null && (
            <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-xl text-xs font-black tracking-tight">
              Phòng {String(tableNumber).padStart(2, '0')}
            </div>
          )}

          <button
            onClick={onOpenOrders}
            className="relative p-2.5 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 transition-transform border border-stone-200"
            title="Đơn hàng của bạn"
            aria-label="Xem đơn hàng đã gửi"
          >
            <ClipboardList className="w-5 h-5 text-stone-700" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
