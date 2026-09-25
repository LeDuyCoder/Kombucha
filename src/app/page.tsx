'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  QrCode,
  ArrowRight,
  KeyRound,
  Layers,
  ArrowUpRight,
  DoorOpen,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [tableInput, setTableInput] = useState('');
  const [tables, setTables] = useState<{ id: string; table_number: string | number; active: boolean }[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const resp = await fetch('/api/tables');
        if (resp.ok) {
          const data = await resp.json();
          const activeList = (data.tables || []).filter((t: { active?: boolean }) => t.active !== false);
          setTables(activeList);
        }
      } catch (err) {
        console.error('Fetch tables error:', err);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

  const goToTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableInput.trim()) return;
    const cleanNum = tableInput.trim().replace(/^phòng\s*/i, '');
    router.push(`/order?table=${encodeURIComponent(cleanNum)}`);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800 flex flex-col justify-between items-center px-4 py-8 sm:py-12 selection:bg-rose-100 selection:text-rose-900 font-sans">
      <div className="w-full max-w-xl my-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-1 rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/80">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative">
              <Image
                src="/logo.jpg"
                alt="Logo"
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200/60 mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Tiệm Trà &amp; Kombucha</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
              Kombucha &amp; Tea House
            </h1>
            <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
              Hệ thống gọi món tại phòng &amp; Quản trị vận hành
            </p>
          </div>
        </div>

        {/* Customer Quick-Order Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm shadow-stone-200/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <DoorOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-stone-800">
                Thực Khách Gọi Món
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              Nhập số phòng
            </span>
          </div>

          <form onSubmit={goToTable} className="flex gap-2">
            <input
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              placeholder="Nhập tên/số phòng (vd: 620, VIP 1)..."
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 outline-none focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all"
            />
            <button
              type="submit"
              className="rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 shadow-sm shadow-rose-200 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Vào Menu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Room Badges from real database */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-stone-400 text-[11px] mr-1">Phòng nhanh:</span>
            {loadingTables ? (
              <span className="text-[11px] text-stone-400 italic">Đang tải...</span>
            ) : tables.length === 0 ? (
              <span className="text-[11px] text-stone-400 italic">Chưa có phòng nào</span>
            ) : (
              tables.map((t) => (
                <Link
                  key={t.id || t.table_number}
                  href={`/order?table=${encodeURIComponent(String(t.table_number))}`}
                  className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-600 border border-transparent text-[11px] font-bold transition-all active:scale-95"
                >
                  {/^phòng/i.test(String(t.table_number).trim()) ? String(t.table_number).trim() : (/^\d+$/.test(String(t.table_number).trim()) ? `Phòng ${String(t.table_number).trim().padStart(2, '0')}` : `Phòng ${String(t.table_number).trim()}`)}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Operational Modules - Refined Modern List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ModuleCard
            href="/kitchen"
            icon={<ChefHat className="w-5 h-5" />}
            title="Màn Hình Bếp"
            subtitle="Nhận đơn Realtime"
            color="amber"
          />
          <ModuleCard
            href="/admin/tables"
            icon={<QrCode className="w-5 h-5" />}
            title="Phòng &amp; Mã QR"
            subtitle="Tạo &amp; in mã để bàn"
            color="emerald"
          />
          <ModuleCard
            href="/admin/menu"
            icon={<Layers className="w-5 h-5" />}
            title="Quản Lý Menu"
            subtitle="Bật/tắt món &amp; giá"
            color="sky"
          />
          <ModuleCard
            href="/admin/settings"
            icon={<KeyRound className="w-5 h-5" />}
            title="Cài Đặt Hệ Thống"
            subtitle="Mã PIN &amp; Đóng mở quán"
            color="purple"
          />
        </div>

      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-[11px] text-stone-400 font-medium">
        © {new Date().getFullYear()} Kombucha &amp; Tea House • Hệ thống vận hành quán
      </footer>
    </main>
  );
}

/* ── Modern Compact Module Card ── */
type ModuleColor = 'amber' | 'emerald' | 'sky' | 'purple';

const colorStyles: Record<
  ModuleColor,
  { bg: string; text: string; ring: string; border: string }
> = {
  amber: {
    bg: 'bg-amber-50 text-amber-700',
    text: 'group-hover:text-amber-700',
    ring: 'group-hover:ring-amber-200',
    border: 'hover:border-amber-300',
  },
  emerald: {
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'group-hover:text-emerald-700',
    ring: 'group-hover:ring-emerald-200',
    border: 'hover:border-emerald-300',
  },
  sky: {
    bg: 'bg-sky-50 text-sky-700',
    text: 'group-hover:text-sky-700',
    ring: 'group-hover:ring-sky-200',
    border: 'hover:border-sky-300',
  },
  purple: {
    bg: 'bg-purple-50 text-purple-700',
    text: 'group-hover:text-purple-700',
    ring: 'group-hover:ring-purple-200',
    border: 'hover:border-purple-300',
  },
};

function ModuleCard({
  href,
  icon,
  title,
  subtitle,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: ModuleColor;
}) {
  const c = colorStyles[color];

  return (
    <Link
      href={href}
      className={`group flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200/80 ${c.border} hover:shadow-md hover:shadow-stone-200/60 transition-all duration-200 active:scale-[0.98]`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-stone-800 truncate group-hover:text-stone-950 transition-colors">
            {title}
          </div>
          <div className="text-[11px] text-stone-400 font-medium truncate mt-0.5">
            {subtitle}
          </div>
        </div>
      </div>

      <div className="w-8 h-8 rounded-full bg-stone-50 group-hover:bg-stone-100 flex items-center justify-center text-stone-400 group-hover:text-stone-700 shrink-0 ml-2 transition-colors">
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}
