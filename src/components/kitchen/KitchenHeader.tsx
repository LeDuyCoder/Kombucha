'use client';

import React, { useEffect, useState } from 'react';
import { Coffee, Clock, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
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
    <header className="flex-none bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between shadow-xs z-10">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-600/20">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-stone-900 font-bold text-lg leading-tight tracking-tight">
            Bếp – Kombucha &amp; Tea House
          </h1>
          <p className="text-stone-500 text-xs font-medium">Kitchen Display System</p>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <div className="flex items-center gap-2 text-stone-800">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-2xl font-mono font-bold tabular-nums tracking-widest">
            {timeStr}
          </span>
        </div>
        <p className="text-stone-500 text-xs text-center capitalize mt-0.5 font-medium">{dateStr}</p>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Realtime status */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border',
            connected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          )}
          title={connected ? 'Realtime đang kết nối' : 'Mất kết nối realtime'}
        >
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Realtime</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Mute toggle */}
        <button
          onClick={toggleMuted}
          title={isMuted ? 'Bật âm thanh thông báo' : 'Tắt âm thanh thông báo'}
          className={cn(
            'p-2.5 rounded-xl border transition-all duration-200 active:scale-95 shadow-xs',
            isMuted
              ? 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
              : 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500 shadow-amber-600/20'
          )}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
