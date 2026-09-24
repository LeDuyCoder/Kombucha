'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RestaurantTable } from '@/types';
import { QRModal } from '@/components/admin/QRModal';
import { QrCode, Plus, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [newTableNum, setNewTableNum] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/tables');
      if (resp.ok) {
        const data = await resp.json();
        setTables(data.tables || []);
      }
    } catch (err) {
      console.error('Fetch tables error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(newTableNum);
    if (!num || isNaN(num)) return;

    try {
      setIsAdding(true);
      const resp = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: num }),
      });

      if (resp.ok) {
        setNewTableNum('');
        fetchTables();
      } else {
        const err = await resp.json();
        alert(err.error || 'Lỗi thêm bàn');
      }
    } catch (err) {
      console.error('Add table error:', err);
    } finally {
      setIsAdding(false);
    }
  };

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
                <QrCode className="w-5 h-5 text-blue-400" />
                <span>Quản Lý Bàn &amp; Mã QR</span>
              </h1>
              <p className="text-xs text-stone-400">
                Tạo mã QR cho từng bàn để khách quét và đặt món
              </p>
            </div>
          </div>

          <button
            onClick={fetchTables}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Add Table Form */}
        <div className="bg-stone-800/80 border border-stone-700 rounded-2xl p-4">
          <form onSubmit={handleAddTable} className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Thêm bàn mới
              </label>
              <input
                type="number"
                min="1"
                placeholder="Nhập số bàn (vd: 6)"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newTableNum}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm bàn</span>
            </button>
          </form>
        </div>

        {/* Tables Grid */}
        <div>
          <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
            Danh Sách Bàn ({tables.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Đang tải danh sách bàn...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-stone-500">Chưa có bàn nào trong hệ thống</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map((table) => {
                const qrUrl = `${baseUrl || 'http://localhost:3000'}/order?table=${table.table_number}`;
                return (
                  <div
                    key={table.id || table.table_number}
                    className="bg-stone-800/60 border border-stone-700/80 rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Bàn {String(table.table_number).padStart(2, '0')}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hoạt động" />
                      </div>
                      <p className="text-xs text-stone-400 truncate mb-4" title={qrUrl}>
                        {qrUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-700/50">
                      <button
                        onClick={() => setSelectedTable(table)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Mã QR &amp; In</span>
                      </button>

                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
                        title="Mở menu bàn này"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* QR Modal */}
        {selectedTable && (
          <QRModal
            isOpen={!!selectedTable}
            onClose={() => setSelectedTable(null)}
            tableNumber={selectedTable.table_number}
            qrUrl={`${baseUrl || 'http://localhost:3000'}/order?table=${selectedTable.table_number}`}
          />
        )}
      </div>
    </div>
  );
}
