'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  Save, 
  Check, 
  Eye, 
  EyeOff, 
  Store, 
  RefreshCw,
  Loader2,
  Copy,
  Info
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  const [loadingPin, setLoadingPin] = useState(true);
  const [savingPin, setSavingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');
  const [copied, setCopied] = useState(false);

  // Store status
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);
  const [savingStore, setSavingStore] = useState(false);

  // Fetch current PIN & Store status
  const fetchData = async () => {
    try {
      setLoadingPin(true);
      setLoadingStore(true);

      const [pinRes, storeRes] = await Promise.all([
        fetch('/api/settings/pin'),
        fetch('/api/store/status')
      ]);

      if (pinRes.ok) {
        const pinData = await pinRes.json();
        setCurrentPin(pinData.pin || '9999');
      }

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setIsStoreOpen(storeData.isOpen ?? true);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    } finally {
      setLoadingPin(false);
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update PIN
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!newPin.trim()) {
      setPinError('Vui lòng nhập mã PIN mới');
      return;
    }

    if (newPin.trim().length < 4 || newPin.trim().length > 8) {
      setPinError('Mã PIN phải từ 4 đến 8 ký tự số');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setPinError('Mã PIN xác nhận không khớp');
      return;
    }

    try {
      setSavingPin(true);
      const resp = await fetch('/api/settings/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin.trim() }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setCurrentPin(res.pin || newPin.trim());
        setNewPin('');
        setConfirmPin('');
        setPinSuccess('Đổi mã PIN Bếp thành công!');
        setTimeout(() => setPinSuccess(''), 4000);
      } else {
        setPinError(res.error || 'Lỗi cập nhật mã PIN');
      }
    } catch (err) {
      setPinError('Lỗi kết nối máy chủ');
    } finally {
      setSavingPin(false);
    }
  };

  // Toggle Store Open
  const handleToggleStore = async () => {
    try {
      setSavingStore(true);
      const nextState = !isStoreOpen;
      const resp = await fetch('/api/store/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: nextState }),
      });

      if (resp.ok) {
        setIsStoreOpen(nextState);
      }
    } catch (err) {
      console.error('Toggle store error:', err);
    } finally {
      setSavingStore(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 selection:bg-amber-100">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <span>Cài Đặt Hệ Thống &amp; Mật Khẩu</span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Quản lý mã PIN bảo mật Bếp &amp; Bar, trạng thái hoạt động của quán
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loadingPin || loadingStore}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${(loadingPin || loadingStore) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* Card 1: Kitchen PIN Setting */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/50">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Mã PIN Bếp &amp; Bar (Kitchen PIN)</h2>
                <p className="text-xs text-stone-500">Mã PIN dùng để đăng nhập vào Màn hình điều phối Bếp (/kitchen)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">PIN hiện tại:</span>
              <div className="flex items-center gap-1 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
                <span className="font-mono font-black text-sm text-stone-800">
                  {showCurrentPin ? currentPin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentPin)}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title="Sao chép PIN"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {pinSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pinSuccess}</span>
            </div>
          )}

          {pinError && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 animate-in fade-in">
              {pinError}
            </div>
          )}

          {/* Form change PIN */}
          <form onSubmit={handleUpdatePin} className="space-y-4 pt-2 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Mã PIN mới
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    placeholder="Nhập mã PIN mới (vd: 8888)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    maxLength={8}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">Tối thiểu 4 chữ số</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Xác nhận mã PIN mới
                </label>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  placeholder="Nhập lại mã PIN mới"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={8}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPin || !newPin.trim()}
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs shadow-amber-600/20 transition-all flex items-center gap-1.5"
              >
                {savingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Lưu Mã PIN Mới</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Store Status */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/50">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Trạng Thái Mở / Đóng Cửa Quán</h2>
              <p className="text-xs text-stone-500">
                {isStoreOpen ? 'Quán đang mở cửa và nhận order từ khách tại phòng' : 'Quán đang đóng cửa, khách hàng tạm thời không thể gửi order'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleStore}
            disabled={savingStore}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              isStoreOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {savingStore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isStoreOpen ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Đang Mở Cửa</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Đang Đóng Cửa</span>
              </span>
            )}
          </button>
        </div>

        {/* Card 3: Database Info Box */}
        <div className="bg-stone-100/70 border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600">
          <Info className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-stone-800">Cơ chế lưu trữ mật khẩu động:</p>
            <p>
              Mã PIN được lưu và đồng bộ trực tiếp qua bảng <code>store_settings</code>. Nếu bạn muốn lưu cột riêng trên Supabase, hãy chạy lệnh:
            </p>
            <code className="block bg-white p-2 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800 select-all">
              alter table store_settings add column if not exists kitchen_pin text default &apos;9999&apos;;
            </code>
          </div>
        </div>

      </div>
    </div>
  );
}
