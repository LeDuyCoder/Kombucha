'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RestaurantTable } from '@/types';
import { QRModal } from '@/components/admin/QRModal';
import { 
  QrCode, 
  Plus, 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Power, 
  CheckCircle2, 
  XCircle,
  Loader2,
  X
} from 'lucide-react';

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [baseUrl, setBaseUrl] = useState('');

  // Add Room Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Room Modal State
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [editTableNum, setEditTableNum] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Room Modal State
  const [deletingTable, setDeletingTable] = useState<RestaurantTable | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // CREATE: Add Room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = newTableNum.trim();
    if (!val) {
      setAddError('Vui lòng nhập tên hoặc số phòng hợp lệ');
      return;
    }

    try {
      setAddLoading(true);
      setAddError('');
      const resp = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableNumber: val }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setNewTableNum('');
        setIsAddOpen(false);
        await fetchTables();
      } else {
        setAddError(res.error || 'Lỗi thêm phòng mới');
      }
    } catch (err) {
      setAddError('Lỗi kết nối khi thêm phòng');
    } finally {
      setAddLoading(false);
    }
  };

  // UPDATE: Toggle Active Status directly
  const handleToggleStatus = async (table: RestaurantTable) => {
    try {
      const resp = await fetch(`/api/tables/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !table.active }),
      });

      if (resp.ok) {
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, active: !t.active } : t))
        );
      } else {
        const res = await resp.json();
        alert(res.error || 'Lỗi cập nhật trạng thái phòng');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // UPDATE: Open Edit Modal
  const openEditModal = (table: RestaurantTable) => {
    setEditingTable(table);
    setEditTableNum(String(table.table_number));
    setEditActive(table.active ?? true);
    setEditError('');
  };

  // UPDATE: Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    const val = editTableNum.trim();
    if (!val) {
      setEditError('Vui lòng nhập tên hoặc số phòng hợp lệ');
      return;
    }

    try {
      setEditLoading(true);
      setEditError('');
      const resp = await fetch(`/api/tables/${editingTable.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: val,
          active: editActive,
        }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setEditingTable(null);
        await fetchTables();
      } else {
        setEditError(res.error || 'Lỗi cập nhật phòng');
      }
    } catch (err) {
      setEditError('Lỗi kết nối máy chủ');
    } finally {
      setEditLoading(false);
    }
  };

  // DELETE: Confirm Delete
  const handleDeleteRoom = async () => {
    if (!deletingTable) return;

    try {
      setDeleteLoading(true);
      const resp = await fetch(`/api/tables/${deletingTable.id}`, {
        method: 'DELETE',
      });

      if (resp.ok) {
        setDeletingTable(null);
        await fetchTables();
      } else {
        const res = await resp.json();
        alert(res.error || 'Lỗi xóa phòng');
      }
    } catch (err) {
      console.error('Delete room error:', err);
      alert('Lỗi kết nối khi xóa phòng');
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeCount = tables.filter((t) => t.active).length;
  const inactiveCount = tables.length - activeCount;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 selection:bg-rose-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="flex items-center gap-3.5">
            <Link
              href="/"
              className="p-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 shadow-xs hover:shadow-sm transition-all active:scale-95 shrink-0"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-stone-200 shadow-xs shrink-0 relative bg-white p-0.5">
              <div className="w-full h-full rounded-[12px] overflow-hidden relative">
                <Image src="/logo.jpg" alt="Logo" fill className="object-cover" priority />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-tight">
                  Quản Lý Phòng &amp; Mã QR
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 hidden xs:inline-block">
                  QR Master
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Tạo, chỉnh sửa, khóa và in mã QR cho từng phòng đặt món
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTables}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-xs transition-colors text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Tải lại danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={() => {
                setNewTableNum('');
                setAddError('');
                setIsAddOpen(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm phòng mới</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tổng số phòng</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{tables.length}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang hoạt động</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Tạm khóa</span>
            </div>
            <div className="text-2xl font-black text-stone-400 mt-1">{inactiveCount}</div>
          </div>
        </div>

        {/* Room Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Danh Sách Phòng Hiện Tại ({tables.length})
            </h2>
          </div>

          {loading ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-400 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
              <p className="text-sm font-medium">Đang tải danh sách phòng...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500 space-y-3">
              <p className="text-sm font-bold">Chưa có phòng nào trong hệ thống</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm phòng đầu tiên (vd: 620)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => {
                const qrUrl = `${baseUrl || 'http://localhost:3000'}/order?table=${encodeURIComponent(String(table.table_number))}`;
                const isActive = table.active ?? true;

                return (
                  <div
                    key={table.id || table.table_number}
                    className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                      isActive 
                        ? 'border-stone-200 hover:border-rose-300 hover:shadow-md' 
                        : 'border-stone-200 opacity-60 bg-stone-50/50'
                    }`}
                  >
                    <div>
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black px-3.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                            {/^phòng/i.test(String(table.table_number).trim()) ? String(table.table_number).trim() : `Phòng ${String(table.table_number).trim()}`}
                          </span>
                        </div>

                        {/* Toggle active badge button */}
                        <button
                          onClick={() => handleToggleStatus(table)}
                          title={isActive ? 'Nhấn để tạm khóa phòng' : 'Nhấn để mở hoạt động'}
                          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                          <span>{isActive ? 'Hoạt động' : 'Tạm khóa'}</span>
                        </button>
                      </div>

                      {/* URL Preview */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                          Đường link đặt món
                        </span>
                        <p className="text-xs text-stone-600 truncate font-mono bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-lg" title={qrUrl}>
                          {qrUrl}
                        </p>
                      </div>
                    </div>

                    {/* Actions Bottom Bar */}
                    <div className="space-y-2 pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        {/* QR Code & Print Button */}
                        <button
                          onClick={() => setSelectedTable(table)}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs shadow-rose-600/20 transition-all active:scale-95"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Mã QR &amp; In</span>
                        </button>

                        {/* Open Menu link */}
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                          title="Mở menu thử đặt món"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Edit & Delete row */}
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => openEditModal(table)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Chỉnh sửa thông tin phòng"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => setDeletingTable(table)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Xóa phòng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CREATE MODAL */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-stone-200 relative">
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Thêm phòng mới</h3>
                  <p className="text-xs text-stone-500">Nhập tên hoặc số phòng để tạo mã QR đặt món</p>
                </div>
              </div>

              {addError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tên / Số phòng
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 620 hoặc VIP 1"
                    value={newTableNum}
                    onChange={(e) => setNewTableNum(e.target.value)}
                    autoFocus
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-bold"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Hệ thống sẽ tự động tạo mã QR đặt món duy nhất cho phòng này.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading || !newTableNum}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Thêm phòng</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {editingTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-stone-200 relative">
              <button
                onClick={() => setEditingTable(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Sửa thông tin phòng</h3>
                  <p className="text-xs text-stone-500">Chỉnh sửa tên, số phòng hoặc trạng thái</p>
                </div>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tên / Số phòng
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 620 hoặc VIP 1"
                    value={editTableNum}
                    onChange={(e) => setEditTableNum(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-bold"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-800">Trạng thái phòng</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTable(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !editTableNum}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu thay đổi</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM MODAL */}
        {deletingTable && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-stone-900 mb-1">
                Xác nhận xóa {/^phòng/i.test(String(deletingTable.table_number).trim()) ? String(deletingTable.table_number).trim() : `Phòng ${String(deletingTable.table_number).trim()}`}?
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Mã QR và phiên gọi món của phòng này sẽ bị gỡ bỏ. Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingTable(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRoom}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Xóa phòng</span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR & Print Modal */}
        {selectedTable && (
          <QRModal
            isOpen={!!selectedTable}
            onClose={() => setSelectedTable(null)}
            tableNumber={selectedTable.table_number}
            qrUrl={`${baseUrl || 'http://localhost:3000'}/order?table=${encodeURIComponent(String(selectedTable.table_number))}`}
          />
        )}
      </div>
    </div>
  );
}
