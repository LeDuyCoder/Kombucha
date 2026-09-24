'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, Delete, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function LoginForm() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle successful login
  const handleLogin = async (currentPin: string) => {
    if (currentPin.length === 0 || loading) return;
    
    setLoading(true);
    setError('');

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin }),
      });

      if (resp.ok) {
        const redirectUrl = searchParams.get('redirect') || '/';
        window.location.href = redirectUrl;
      } else {
        const data = await resp.json();
        setError(data.error || 'Mã PIN không đúng');
        setPin(''); // Reset on error
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (loading) return;
    setError('');
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const newPin = prev + num;
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
      return newPin;
    });
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  // Support physical keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        if (pin.length === 4) {
          handleLogin(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, pin]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 4) {
      handleLogin(pin);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="text-center mb-8 space-y-4">
        <div className="inline-flex rounded-3xl overflow-hidden shadow-lg shadow-amber-600/10 ring-1 ring-stone-200 w-20 h-20">
          <Image
            src="/logo.jpg"
            alt="Logo"
            width={80}
            height={80}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Quản Trị Hệ Thống
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Nhập mã PIN để truy cập
          </p>
        </div>
      </div>

      {/* Auth Box */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-stone-200/50 border border-stone-200">
        
        {/* Custom Password Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx}
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-300',
                pin.length > idx 
                  ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-500/50' 
                  : 'bg-stone-200'
              )}
            />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold text-center border border-red-100 animate-in shake">
            {error}
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              disabled={loading}
              className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-xl font-bold text-stone-900 transition-all border border-stone-100 flex items-center justify-center active:scale-95 disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          
          {/* Blank key */}
          <div className="h-14"></div>
          
          {/* 0 Key */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            disabled={loading}
            className="h-14 rounded-2xl bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-xl font-bold text-stone-900 transition-all border border-stone-100 flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            0
          </button>

          {/* Delete Key */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-14 rounded-2xl bg-stone-50 hover:bg-rose-50 active:bg-rose-100 text-rose-500 transition-all border border-stone-100 flex items-center justify-center active:scale-95 disabled:opacity-50"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={handleManualSubmit}
          disabled={loading || pin.length === 0}
          className="w-full h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold tracking-wide transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-8 text-center text-xs font-medium text-stone-400">
        <p>Vui lòng nhập mã PIN bảo mật của hệ thống để tiếp tục</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 selection:bg-amber-200">
      <Suspense fallback={<div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
