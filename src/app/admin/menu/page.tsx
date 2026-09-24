'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MenuItem, MenuCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Coffee, ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/menu');
      if (resp.ok) {
        const data = await resp.json();
        setCategories(data.categories || []);
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Fetch menu error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.available;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
    );

    try {
      await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          available: newStatus,
        }),
      });
    } catch (err) {
      console.error('Toggle availability error:', err);
      fetchMenu();
    }
  };

  const filteredItems =
    selectedCategory === 'ALL'
      ? items
      : items.filter((i) => i.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                <Coffee className="w-5 h-5 text-purple-400" />
                <span>Quản Lý Menu Món</span>
              </h1>
              <p className="text-xs text-stone-400">
                Bật/tắt trạng thái Còn món hoặc Hết món tức thì
              </p>
            </div>
          </div>

          <button
            onClick={fetchMenu}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-purple-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`}
          >
            Tất cả ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === c.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu Items Table / List */}
        <div className="bg-stone-800/80 border border-stone-700 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-stone-500">Đang tải danh sách món...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-stone-500">Không có món nào</div>
          ) : (
            <div className="divide-y divide-stone-700">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-stone-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.available ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-purple-400">
                          {formatCurrency(item.price)}
                        </span>
                        <span className="text-xs text-stone-400">• {item.category_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        item.available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.available ? 'Còn món' : 'Hết món'}
                    </span>

                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        item.available
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Đánh dấu hết</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mở bán lại</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
