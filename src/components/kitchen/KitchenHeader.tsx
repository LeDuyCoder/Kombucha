'use client';

import React, { useEffect, useState } from 'react';
import { Utensils, Clock, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenHeaderProps {
  isMuted: boolean;
  toggleMuted: () => void;
  connected: boolean;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  isMuted,
  toggleMuted,
  connected,
}) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime
    ? currentTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    : '--:--:--';

  const dateStr = currentTime
    ? currentTime.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <header className="flex-none bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-6 py-3.5 flex items-center justify-between shadow-xl z-20">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-950/40 text-white">
          <Utensils className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-extrabold text-base md:text-lg leading-tight tracking-tight flex items-center gap-2">
            Màn hình Bếp &amp; Pha Chế
          </h1>
          <p className="text-stone-400 text-xs font-medium">
            Kombucha &amp; Tea House &bull; KDS
          </p>
        </div>
      </div>

      {/* Center: Live Clock */}
      <div className="hidden sm:flex flex-col items-center">
        <div className="flex items-center gap-2 text-stone-100">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xl md:text-2xl font-mono font-black tabular-nums tracking-widest text-amber-300">
            {timeStr}
          </span>
        </div>
        {dateStr && (
          <p className="text-stone-400 text-[11px] font-medium capitalize mt-0.5">
            {dateStr}
          </p>
        )}
      </div>

      {/* Right: Realtime status & Sound Mute Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Realtime status pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors',
            connected
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60'
              : 'bg-red-950/50 text-red-300 border-red-800/60'
          )}
          title={connected ? 'Realtime đang kết nối' : 'Đang thử kết nối lại...'}
        >
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Realtime</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Audio Mute/Unmute Button */}
        <button
          onClick={toggleMuted}
          title={isMuted ? 'Bật chuông thông báo' : 'Tắt chuông thông báo'}
          aria-label={isMuted ? 'Bật chuông thông báo' : 'Tắt chuông thông báo'}
          className={cn(
            'p-2.5 rounded-xl border font-semibold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer',
            isMuted
              ? 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
          )}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-stone-400" />
              <span className="hidden lg:inline text-stone-400">Tắt chuông</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span className="hidden lg:inline text-amber-200">Chuông bật</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
