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
        alert(err.error || 'Lỗi thêm phòng');
      }
    } catch (err) {
      console.error('Add table error:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
                <QrCode className="w-5 h-5 text-blue-600" />
                <span>Quản Lý Phòng &amp; Mã QR</span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Tạo mã QR cho từng phòng để khách quét và đặt món
              </p>
            </div>
          </div>

          <button
            onClick={fetchTables}
            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors text-xs font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Add Table / Room Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
          <form onSubmit={handleAddTable} className="flex gap-3 items-end">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Thêm phòng mới
              </label>
              <input
                type="number"
                min="1"
                placeholder="Nhập số phòng (vd: 6)"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding || !newTableNum}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-xs shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm phòng</span>
            </button>
          </form>
        </div>

        {/* Tables / Rooms Grid */}
        <div>
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
            Danh Sách Phòng ({tables.length})
          </h2>

          {loading ? (
            <div className="text-center py-12 text-stone-400">Đang tải danh sách phòng...</div>
          ) : tables.length === 0 ? (
            <div className="text-center py-12 text-stone-400">Chưa có phòng nào trong hệ thống</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map((table) => {
                const qrUrl = `${baseUrl || 'http://localhost:3000'}/order?table=${table.table_number}`;
                return (
                  <div
                    key={table.id || table.table_number}
                    className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          Phòng {String(table.table_number).padStart(2, '0')}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Hoạt động
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 truncate mb-4 font-mono" title={qrUrl}>
                        {qrUrl}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => setSelectedTable(table)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shadow-blue-600/20 transition-all active:scale-95"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Mã QR &amp; In</span>
                      </button>

                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                        title="Mở menu phòng này"
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
