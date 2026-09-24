'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';

interface PortalLockGateProps {
  onSuccess?: () => void;
  redirectUrl?: string;
}

export function PortalLockGate({ onSuccess, redirectUrl }: PortalLockGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const resp = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (resp.ok) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        const data = await resp.json();
        setError(data.error || 'Mật khẩu không chính xác');
        setPassword('');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center p-6 selection:bg-blue-100 relative overflow-hidden">
      {/* Background soft ambient blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-white text-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-stone-200 animate-in zoom-in-95">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Trung Tâm Quản Trị
            </h1>
            <p className="text-sm text-stone-500 font-medium mt-1 max-w-xs mx-auto">
              Nhập mật khẩu hệ thống để mở khóa trang điều hành và quản lý
            </p>
          </div>
        </div>

        {/* Lock Card Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-200/60 border border-stone-200/80 backdrop-blur-sm">
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold text-center border border-rose-100 animate-in shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Mật khẩu truy cập
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Nhập mật khẩu (vd: 1234)"
                  autoFocus
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full h-13 px-4 pr-12 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 text-base font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-stone-400 placeholder:font-normal"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Mở Khóa Truy Cập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bảo mật phiên 7 ngày</span>
            </span>
            <span>Mặc định: <strong>1234</strong></span>
          </div>
        </div>

        {/* Footer info for customers */}
        <div className="mt-6 text-center">
          <p className="text-xs text-stone-400 font-medium">
            Nếu bạn là khách hàng quét mã tại phòng, hãy quét mã QR trực tiếp tại phòng để đặt món.
          </p>
        </div>

      </div>
    </div>
  );
}
