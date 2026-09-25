'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  LogOut,
  FileText,
  DoorOpen,
  DoorClosed,
  KeyRound,
  MessageSquareHeart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenHeaderProps {
  isMuted: boolean;
  toggleMuted: () => void;
  connected: boolean;
  isStoreOpen: boolean;
  onToggleStoreOpen: () => void;
  onOpenReceipt: () => void;
  onOpenFeedback: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  isMuted,
  toggleMuted,
  connected,
  isStoreOpen,
  onToggleStoreOpen,
  onOpenReceipt,
  onOpenFeedback,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateStr = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="flex-none bg-white border-b border-stone-200 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs z-20 gap-3">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs shrink-0 border border-stone-200">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-stone-900 font-bold text-sm sm:text-base leading-tight tracking-tight whitespace-nowrap">
            Bếp – Kombucha &amp; Tea
          </h1>
          <p className="text-stone-500 text-[10px] sm:text-xs font-medium whitespace-nowrap hidden sm:block">
            Kitchen Display System
          </p>
        </div>
      </div>

      {/* Center: Clock (In-flow flex layout to guarantee zero overlap) */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center px-2 text-center pointer-events-none min-w-0">
        <div className="flex items-center gap-1.5 text-stone-800 justify-center">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-lg sm:text-xl font-mono font-bold tabular-nums tracking-wider whitespace-nowrap">
            {timeStr}
          </span>
        </div>
        <p className="text-stone-500 text-[11px] text-center capitalize font-medium whitespace-nowrap truncate max-w-full">
          {dateStr}
        </p>
      </div>

      {/* Right: Store Toggle, Receipt, Audio, Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Store Open / Close Toggle Button */}
        <button
          onClick={onToggleStoreOpen}
          title={isStoreOpen ? 'Nhấn để đóng cửa quán' : 'Nhấn để mở cửa quán'}
          className={cn(
            'flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-2xs border shrink-0 cursor-pointer',
            isStoreOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          )}
        >
          {isStoreOpen ? (
            <>
              <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Đang Mở Cửa</span>
            </>
          ) : (
            <>
              <DoorClosed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">Đã Đóng Cửa</span>
            </>
          )}
        </button>

        {/* Daily Receipt Button */}
        <button
          onClick={onOpenReceipt}
          title="Xuất biên lai & doanh thu trong ngày"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold transition-all duration-200 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span className="hidden xl:inline whitespace-nowrap">Biên Lai Ngày</span>
        </button>

        {/* Feedback Button */}
        <button
          onClick={onOpenFeedback}
          title="Xem đánh giá và phản hồi của khách hàng"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all duration-200 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
        >
          <MessageSquareHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
          <span className="hidden xl:inline whitespace-nowrap">Đánh giá</span>
        </button>

        {/* Realtime status */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border shrink-0',
            connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          )}
          title={connected ? 'Realtime đang kết nối' : 'Mất kết nối realtime'}
        >
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden 2xl:inline whitespace-nowrap">Realtime</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="hidden 2xl:inline whitespace-nowrap">Offline</span>
            </>
          )}
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMuted}
          title={isMuted ? 'Bật âm thanh thông báo' : 'Tắt âm thanh thông báo'}
          className={cn(
            'p-1.5 sm:p-2 rounded-xl border transition-all duration-200 active:scale-95 shadow-2xs shrink-0 cursor-pointer',
            isMuted
              ? 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
              : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500 shadow-amber-600/20'
          )}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Settings button */}
        <Link
          href="/admin/settings"
          title="Cài đặt hệ thống & đổi mã PIN Bếp"
          className="p-1.5 sm:p-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all duration-200 active:scale-95 shadow-2xs shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>

        {/* Logout button */}
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          title="Đăng xuất khỏi hệ thống"
          className="p-1.5 sm:p-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-200 active:scale-95 shadow-2xs shrink-0 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </header>
  );
};
