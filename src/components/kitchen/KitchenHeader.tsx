'use client';

import React, { useEffect, useState } from 'react';
import {
  Coffee,
  Clock,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  LogOut,
  FileText,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenHeaderProps {
  isMuted: boolean;
  toggleMuted: () => void;
  connected: boolean;
  isStoreOpen: boolean;
  onToggleStoreOpen: () => void;
  onOpenReceipt: () => void;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  isMuted,
  toggleMuted,
  connected,
  isStoreOpen,
  onToggleStoreOpen,
  onOpenReceipt,
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
    <header className="flex-none bg-white border-b border-stone-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs z-10">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-600/20">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-stone-900 font-bold text-base md:text-lg leading-tight tracking-tight">
            Bếp – Kombucha &amp; Tea House
          </h1>
          <p className="text-stone-500 text-xs font-medium">Kitchen Display System</p>
        </div>
      </div>

      {/* Center: Clock (Desktop) */}
      <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <div className="flex items-center gap-2 text-stone-800 justify-center">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-2xl font-mono font-bold tabular-nums tracking-widest">
            {timeStr}
          </span>
        </div>
        <p className="text-stone-500 text-xs text-center capitalize mt-0.5 font-medium">{dateStr}</p>
      </div>

      {/* Right: Store Toggle, Receipt, Audio, Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Store Open / Close Toggle Button */}
        <button
          onClick={onToggleStoreOpen}
          title={isStoreOpen ? 'Nhấn để đóng cửa quán' : 'Nhấn để mở cửa quán'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs border',
            isStoreOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          )}
        >
          {isStoreOpen ? (
            <>
              <DoorOpen className="w-4 h-4 text-emerald-600" />
              <span>Đang Mở Cửa</span>
            </>
          ) : (
            <>
              <DoorClosed className="w-4 h-4 text-rose-600" />
              <span>Đã Đóng Cửa</span>
            </>
          )}
        </button>

        {/* Daily Receipt Button */}
        <button
          onClick={onOpenReceipt}
          title="Xuất biên lai & doanh thu trong ngày"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold transition-all duration-200 active:scale-95 shadow-xs"
        >
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Biên Lai Ngày</span>
        </button>

        {/* Realtime status */}
        <div
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border',
            connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          )}
          title={connected ? 'Realtime đang kết nối' : 'Mất kết nối realtime'}
        >
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Realtime</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Offline</span>
            </>
          )}
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMuted}
          title={isMuted ? 'Bật âm thanh thông báo' : 'Tắt âm thanh thông báo'}
          className={cn(
            'p-2 rounded-xl border transition-all duration-200 active:scale-95 shadow-xs',
            isMuted
              ? 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
              : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500 shadow-amber-600/20'
          )}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Logout button */}
        <button
          onClick={async () => {
            await fetch('/api/kitchen/logout', { method: 'POST' });
            window.location.href = '/kitchen/login';
          }}
          title="Đăng xuất khỏi Bếp"
          className="p-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-200 active:scale-95 shadow-xs"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
