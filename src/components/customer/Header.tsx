'use client';

import React from 'react';
import Image from 'next/image';
import { ClipboardList } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs transition-all">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand info */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs border border-stone-200/80 shrink-0 bg-white p-0.5">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-[10px]"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-stone-900 text-xs sm:text-base leading-tight tracking-tight truncate">
              Kombucha &amp; Tea House
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 truncate">
                {sessionToken ? `Phiên #${sessionToken.replace('SESSION_', '')}` : 'Đang kết nối...'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Room badge & Active Orders tracker */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {tableNumber !== null && (
            <div className="bg-rose-50 text-rose-800 border border-rose-200/80 px-2.5 py-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black tracking-tight whitespace-nowrap shadow-2xs">
              Phòng {String(tableNumber).padStart(2, '0')}
            </div>
          )}

          <button
            onClick={onOpenOrders}
            className="relative p-2 sm:p-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 active:scale-95 transition-transform border border-stone-200/80 shadow-2xs cursor-pointer shrink-0"
            title="Đơn hàng của bạn"
            aria-label="Xem đơn hàng đã gửi"
          >
            <ClipboardList className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-700" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] sm:text-[10px] min-w-4.5 h-4.5 sm:min-w-5 sm:h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
