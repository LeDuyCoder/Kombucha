'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuItem, MenuCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  Coffee, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search,
  X,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Item Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addAvailable, setAddAvailable] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Item Modal
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/menu');
      if (resp.ok) {
        const data = await resp.json();
        setCategories(data.categories || []);
        setItems(data.items || []);
        if (data.categories?.length > 0 && !addCategoryId) {
          setAddCategoryId(data.categories[0].id);
        }
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

  // Quick Toggle Availability
  const toggleAvailability = async (item: MenuItem) => {
    const newStatus = !item.available;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus } : i))
    );

    try {
      const resp = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus }),
      });

      if (!resp.ok) {
        fetchMenu();
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
      fetchMenu();
    }
  };

  // CREATE: Add new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!addName.trim()) {
      setAddError('Vui lòng nhập tên món');
      return;
    }

    const priceNum = Number(addPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setAddError('Giá tiền không hợp lệ');
      return;
    }

    try {
      setAddLoading(true);
      const resp = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          price: priceNum,
          category_id: addCategoryId || null,
          description: addDescription.trim() || null,
          image_url: addImageUrl.trim() || null,
          available: addAvailable,
        }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setIsAddOpen(false);
        setAddName('');
        setAddPrice('');
        setAddDescription('');
        setAddImageUrl('');
        setAddAvailable(true);
        await fetchMenu();
      } else {
        setAddError(res.error || 'Lỗi thêm món mới');
      }
    } catch {
      setAddError('Lỗi kết nối máy chủ');
    } finally {
      setAddLoading(false);
    }
  };

  // UPDATE: Open edit modal
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditCategoryId(item.category_id || (categories[0]?.id ?? ''));
    setEditDescription(item.description || '');
    setEditImageUrl(item.image_url || '');
    setEditAvailable(item.available);
    setEditError('');
  };

  // UPDATE: Save edited item
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('Tên món không được để trống');
      return;
    }

    const priceNum = Number(editPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setEditError('Giá tiền không hợp lệ');
      return;
    }

    try {
      setEditLoading(true);
      const resp = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          price: priceNum,
          category_id: editCategoryId || null,
          description: editDescription.trim() || null,
          image_url: editImageUrl.trim() || null,
          available: editAvailable,
        }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setEditingItem(null);
        await fetchMenu();
      } else {
        setEditError(res.error || 'Lỗi lưu thay đổi món');
      }
    } catch {
      setEditError('Lỗi kết nối máy chủ');
    } finally {
      setEditLoading(false);
    }
  };

  // DELETE: Delete item
  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      setDeleteLoading(true);
      const resp = await fetch(`/api/menu/${deletingItem.id}`, {
        method: 'DELETE',
      });

      if (resp.ok) {
        setDeletingItem(null);
        await fetchMenu();
      } else {
        const res = await resp.json();
        alert(res.error || 'Lỗi xóa món');
      }
    } catch {
      alert('Lỗi kết nối khi xóa món');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter & Search
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const availableCount = items.filter((i) => i.available).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-6 selection:bg-purple-100">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-purple-600" />
                <span>Quản Lý Menu Món</span>
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Thêm món mới, chỉnh sửa thông tin, giá bán và trạng thái còn/hết
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMenu}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={() => {
                setAddError('');
                setIsAddOpen(true);
              }}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-purple-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm món mới</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Tổng số món</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{items.length}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đang mở bán</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{availableCount}</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs">
            <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Tạm hết món</span>
            </div>
            <div className="text-2xl font-black text-rose-500 mt-1">{unavailableCount}</div>
          </div>
        </div>

        {/* Filter Categories & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Categories pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              Tất cả ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/20'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm món nước..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Menu Items List */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="text-center py-16 text-stone-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <p className="text-sm font-medium">Đang tải danh sách món...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-3">
              <p className="text-sm font-medium">Không tìm thấy món nào</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm món đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5">
                    {/* Thumbnail Image */}
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback on broken image
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Coffee className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900">{item.name}</h3>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                          {item.category_name || 'Khác'}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 max-w-md">
                          {item.description}
                        </p>
                      )}

                      <div className="text-sm font-black text-purple-700 mt-1">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {item.available ? 'Còn món' : 'Hết món'}
                    </span>

                    {/* Quick Toggle Button */}
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                        item.available
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hết món</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Mở bán</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                      title="Chỉnh sửa món"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-2 rounded-xl border border-stone-200 hover:bg-rose-50 text-stone-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                      title="Xóa món này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD ITEM MODAL */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full border border-stone-200 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Thêm Món Mới Vào Menu</h3>
                  <p className="text-xs text-stone-500">Nhập thông tin chi tiết món nước</p>
                </div>
              </div>

              {addError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Tên món <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Kombucha Lựu Đỏ"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    autoFocus
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Giá tiền (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="vd: 35000"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Danh mục
                    </label>
                    <select
                      value={addCategoryId}
                      onChange={(e) => setAddCategoryId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mô tả món
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả hương vị, nguyên liệu..."
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Đường dẫn ảnh (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={addImageUrl}
                    onChange={(e) => setAddImageUrl(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-800">Trạng thái mở bán ngay</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addAvailable}
                      onChange={(e) => setAddAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading || !addName.trim() || !addPrice}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Thêm món</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT ITEM MODAL */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl max-w-md w-full border border-stone-200 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Chỉnh Sửa Món</h3>
                  <p className="text-xs text-stone-500">Cập nhật giá, thông tin hoặc trạng thái món</p>
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
                    Tên món <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Giá tiền (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Danh mục
                    </label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mô tả món
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Đường dẫn ảnh (URL)
                  </label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-stone-800">Trạng thái Còn món</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAvailable}
                      onChange={(e) => setEditAvailable(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || !editName.trim() || !editPrice}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lưu thay đổi</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE ITEM CONFIRM MODAL */}
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-stone-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-stone-900 mb-1">
                Xóa món &quot;{deletingItem.name}&quot;?
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Món này sẽ bị xóa khỏi menu của quán và khách hàng sẽ không thể đặt món này nữa.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingItem(null)}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleDeleteItem}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Xóa món</span>}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
