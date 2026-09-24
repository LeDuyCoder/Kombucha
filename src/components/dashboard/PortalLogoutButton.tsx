'use client';

import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

export function PortalLogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch('/api/portal/logout', { method: 'POST' });
      window.location.reload();
    } catch {
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
      title="Khóa hệ thống / Đăng xuất"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-stone-500" />
      )}
      <span className="hidden sm:inline">Khóa trang</span>
    </button>
  );
}
