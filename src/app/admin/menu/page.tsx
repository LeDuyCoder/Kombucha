'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuItem, MenuCategory, MenuSize } from '@/types';
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
  DollarSign,
  Minus,
  ChevronDown
} from 'lucide-react';

const CustomCategorySelect = ({ value, onChange, categories, onCreateCategory }: { value: string, onChange: (val: string) => void, categories: MenuCategory[], onCreateCategory: (name: string) => Promise<MenuCategory> }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [createError, setCreateError] = React.useState('');
  const [createLoading, setCreateLoading] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCat = categories.find(c => c.id === value);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCreateError('Vui lòng nhập tên danh mục.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    try {
      const category = await onCreateCategory(newCategoryName.trim());
      onChange(category.id);
      setNewCategoryName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Không thể tạo danh mục.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-stone-50 border rounded-xl pl-3.5 pr-3 py-2.5 text-sm font-bold flex items-center justify-between transition-all ${
          isOpen ? 'border-rose-500 bg-white ring-2 ring-rose-500/20' : 'border-stone-200 text-stone-900 hover:border-stone-300'
        }`}
      >
        <span className="truncate">{selectedCat ? selectedCat.name : 'Chọn danh mục'}</span>
        <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-stone-100 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-200 max-h-52 overflow-y-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 text-sm font-bold transition-colors ${
                value === c.id
                  ? 'bg-rose-50 text-rose-700'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.name}
            </button>
          ))}
          <div className="mt-1 border-t border-stone-100 pt-1">
            {isCreating ? (
              <div className="space-y-2 px-3 py-2">
                <input
                  autoFocus
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleCreateCategory();
                    }
                  }}
                  placeholder="Tên danh mục mới"
                  maxLength={60}
                  className="w-full rounded-lg border border-stone-200 px-2.5 py-2 text-sm font-medium outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />
                {createError && <p className="text-xs font-medium text-rose-600">{createError}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setIsCreating(false); setCreateError(''); }} className="flex-1 rounded-lg border border-stone-200 py-2 text-xs font-bold text-stone-600">Hủy</button>
                  <button type="button" onClick={() => void handleCreateCategory()} disabled={createLoading} className="flex-1 rounded-lg bg-rose-600 py-2 text-xs font-bold text-white disabled:opacity-60">
                    {createLoading ? 'Đang lưu...' : 'Tạo danh mục'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full px-3.5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                + Tạo danh mục mới
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SizeOptionsEditor = ({ sizes, onChange }: { sizes: MenuSize[]; onChange: (sizes: MenuSize[]) => void }) => (
  <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-2.5">
    <div className="flex items-center justify-between">
      <div>
        <span className="block text-xs font-bold text-violet-900">Size và giá riêng</span>
        <span className="text-[11px] text-violet-700">Để trống nếu món không có size</span>
      </div>
      <button type="button" onClick={() => onChange([...sizes, { name: '', price: 0 }])} className="rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-bold text-white">+ Thêm size</button>
    </div>
    {sizes.map((size, index) => (
      <div key={index} className="rounded-xl border border-violet-100 bg-white p-2.5 space-y-2">
        <div className="flex gap-2">
          <input aria-label="Tên size" placeholder="Tên size (vd: M)" value={size.name} onChange={(event) => onChange(sizes.map((value, row) => row === index ? { ...value, name: event.target.value } : value))} className="min-w-0 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold" />
          <button type="button" aria-label="Xóa size" onClick={() => onChange(sizes.filter((_, row) => row !== index))} className="rounded-lg px-2 text-rose-600 hover:bg-rose-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0 text-[11px] font-bold text-stone-600">Giá bán
            <input aria-label="Giá bán size" type="number" min="0" step="1000" placeholder="Giá bán" value={size.price} onChange={(event) => onChange(sizes.map((value, row) => row === index ? { ...value, price: Number(event.target.value) } : value))} className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900" />
          </label>
          <label className="min-w-0 text-[11px] font-bold text-stone-600">Giá gốc <span className="font-normal">(tùy chọn)</span>
            <input aria-label="Giá gốc size" type="number" min="0" step="1000" placeholder="Không giảm giá" value={size.original_price ?? ''} onChange={(event) => onChange(sizes.map((value, row) => row === index ? { ...value, original_price: event.target.value === '' ? null : Number(event.target.value) } : value))} className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900" />
          </label>
        </div>
      </div>
    ))}
  </div>
);

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
  const [addSizes, setAddSizes] = useState<MenuSize[]>([]);
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addAvailable, setAddAvailable] = useState(true);
  const [addIsUnlimitedStock, setAddIsUnlimitedStock] = useState(true);
  const [addStockQuantity, setAddStockQuantity] = useState('');
  const [addHasDiscount, setAddHasDiscount] = useState(false);
  const [addOriginalPrice, setAddOriginalPrice] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSizes, setEditSizes] = useState<MenuSize[]>([]);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editIsUnlimitedStock, setEditIsUnlimitedStock] = useState(true);
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [editHasDiscount, setEditHasDiscount] = useState(false);
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
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

  const createCategory = async (name: string) => {
    const resp = await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const result = await resp.json();
    if (resp.status === 409 && result.category) {
      setCategories((current) => current.some((category) => category.id === result.category.id)
        ? current
        : [...current, result.category].sort((a, b) => a.sort_order - b.sort_order));
      return result.category as MenuCategory;
    }
    if (!resp.ok) throw new Error(result.error || 'Không thể tạo danh mục.');
    setCategories((current) => [...current, result.category].sort((a, b) => a.sort_order - b.sort_order));
    return result.category as MenuCategory;
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Quick Toggle Availability
  const toggleAvailability = async (item: MenuItem) => {
    let newStatus = !item.available;
    let newStock = item.stock_quantity;
    
    // If toggling on, and stock was 0, default it to 10
    if (newStatus && newStock === 0) {
      newStock = 10;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, available: newStatus, stock_quantity: newStock } : i))
    );

    try {
      const resp = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: newStatus, stock_quantity: newStock }),
      });

      if (!resp.ok) {
        fetchMenu();
      }
    } catch (err) {
      console.error('Toggle availability error:', err);
      fetchMenu();
    }
  };

  const adjustStock = async (item: MenuItem, delta: number) => {
    const current = item.stock_quantity ?? 0;
    const nextStock = Math.max(0, current + delta);
    const nextAvailable = nextStock > 0;

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, stock_quantity: nextStock, available: nextAvailable } : i
      )
    );

    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: nextStock, available: nextAvailable }),
      });
    } catch {
      fetchMenu();
    }
  };

  const setStockDirect = async (item: MenuItem, newStock: number | null) => {
    const nextAvailable = newStock === null ? true : newStock > 0;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, stock_quantity: newStock, available: nextAvailable } : i
      )
    );

    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_quantity: newStock, available: nextAvailable }),
      });
    } catch {
      fetchMenu();
    }
  };

  const handlePromptSetStock = (item: MenuItem) => {
    const current = item.stock_quantity !== null && item.stock_quantity !== undefined ? item.stock_quantity : '';
    const input = window.prompt(
      `Nhập số lượng tồn kho còn lại cho món "${item.name}" (hoặc để trống để đặt Vô hạn):`,
      String(current)
    );
    if (input === null) return;
    if (input.trim() === '') {
      setStockDirect(item, null);
    } else {
      const num = Number(input.trim());
      if (!isNaN(num) && num >= 0) {
        setStockDirect(item, Math.floor(num));
      } else {
        alert('Số lượng không hợp lệ');
      }
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

    const priceNum = addPrice.trim()
      ? Number(addPrice)
      : Math.min(...addSizes.filter((size) => size.name.trim()).map((size) => size.price));
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
          sizes: addSizes.filter((size) => size.name.trim()),
          category_id: addCategoryId || null,
          description: addDescription.trim() || null,
          image_url: addImageUrl.trim() || null,
          available: addAvailable,
          stock_quantity: addIsUnlimitedStock ? null : Number(addStockQuantity) || 0,
          original_price: addHasDiscount && addOriginalPrice ? Number(addOriginalPrice) : null,
        }),
      });

      const res = await resp.json();
      if (resp.ok) {
        setIsAddOpen(false);
        setAddName('');
        setAddPrice('');
        setAddSizes([]);
        setAddDescription('');
        setAddImageUrl('');
        setAddAvailable(true);
        setAddIsUnlimitedStock(true);
        setAddStockQuantity('');
        setAddHasDiscount(false);
        setAddOriginalPrice('');
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
    setEditSizes(item.sizes || []);
    setEditCategoryId(item.category_id || (categories[0]?.id ?? ''));
    setEditDescription(item.description || '');
    setEditImageUrl(item.image_url || '');
    setEditAvailable(item.available);
    
    if (item.stock_quantity === null || item.stock_quantity === undefined) {
      setEditIsUnlimitedStock(true);
      setEditStockQuantity('');
    } else {
      setEditIsUnlimitedStock(false);
      setEditStockQuantity(String(item.stock_quantity));
    }
    
    setEditHasDiscount(Boolean(item.original_price && item.original_price > item.price));
    setEditOriginalPrice(item.original_price ? String(item.original_price) : '');
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

    const priceNum = editPrice.trim()
      ? Number(editPrice)
      : Math.min(...editSizes.filter((size) => size.name.trim()).map((size) => size.price));
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
          sizes: editSizes.filter((size) => size.name.trim()),
          category_id: editCategoryId || null,
          description: editDescription.trim() || null,
          image_url: editImageUrl.trim() || null,
          available: editAvailable,
          stock_quantity: editIsUnlimitedStock ? null : Number(editStockQuantity) || 0,
          original_price: editHasDiscount && editOriginalPrice ? Number(editOriginalPrice) : null,
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
                  Quản Lý Thực Đơn
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 hidden xs:inline-block">
                  Menu Admin
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                Thêm món mới, chỉnh sửa thông tin, giá bán và trạng thái còn/hết
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMenu}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-xs transition-colors text-xs font-bold flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={() => {
                setAddError('');
                setIsAddOpen(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm shadow-rose-200 transition-all"
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
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/20'
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
                    ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/20'
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
              className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Menu Items List */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="text-center py-16 text-stone-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
              <p className="text-sm font-medium">Đang tải danh sách món...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 text-stone-400 space-y-3">
              <p className="text-sm font-medium">Không tìm thấy món nào</p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
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

                      <div className="text-sm font-black text-rose-700 mt-1 flex items-center gap-2">
                        <span>{formatCurrency(item.price)}</span>
                        {item.original_price && item.original_price > item.price && (
                          <span className="text-[10px] text-stone-400 line-through font-medium">
                            {formatCurrency(item.original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    
                    {/* Stock Controller */}
                    <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200">
                      {item.stock_quantity !== null && item.stock_quantity !== undefined ? (
                        <>
                          <button
                            onClick={() => adjustStock(item, -1)}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 active:scale-90 transition-transform font-bold text-xs"
                            title="Giảm 1 phần"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <button
                            onClick={() => handlePromptSetStock(item)}
                            className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono hover:bg-white transition-colors ${
                              item.stock_quantity === 0
                                ? 'text-rose-600 bg-rose-50'
                                : item.stock_quantity <= 5
                                ? 'text-amber-600 bg-amber-50'
                                : 'text-stone-700'
                            }`}
                            title="Bấm để chỉnh số lượng chính xác"
                          >
                            <span>Còn: <strong>{item.stock_quantity}</strong></span>
                          </button>

                          <button
                            onClick={() => adjustStock(item, 1)}
                            className="w-6 h-6 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 flex items-center justify-center text-stone-600 active:scale-90 transition-transform font-bold text-xs"
                            title="Tăng 1 phần"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handlePromptSetStock(item)}
                          className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors flex items-center gap-1"
                          title="Bấm để đặt giới hạn số lượng"
                        >
                          <span className="text-[11px] font-bold text-stone-400">Kho:</span>
                          <span className="font-bold text-emerald-600">Vô hạn</span>
                          <span className="text-[10px] text-stone-400 underline ml-0.5">Sửa</span>
                        </button>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                        item.available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in">
            <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-2xl max-w-lg w-full border border-white/80 relative max-h-[90dvh] overflow-y-auto">
              <button
                onClick={() => setIsAddOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block min-h-10 text-xs font-bold text-stone-700 mb-1.5">
                      Giá mặc định (nếu món không có size)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="Tự lấy giá thấp nhất nếu có size"
                      value={addPrice}
                      onChange={(e) => setAddPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block min-h-10 text-xs font-bold text-stone-700 mb-1.5">
                      Danh mục
                    </label>
                    <CustomCategorySelect
                      value={addCategoryId}
                      onChange={setAddCategoryId}
                      categories={categories}
                      onCreateCategory={createCategory}
                    />
                  </div>
                </div>

                <SizeOptionsEditor sizes={addSizes} onChange={setAddSizes} />

                {/* Discount Section Add Modal */}
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-800 block">Chương trình Giảm giá</span>
                      <span className="text-[11px] text-rose-600/80 font-medium">Bật để hiển thị giá gốc gạch ngang</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addHasDiscount}
                        onChange={(e) => setAddHasDiscount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {addHasDiscount && (
                    <div className="pt-3 border-t border-rose-100 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-rose-800">
                        Giá gốc trước khi giảm (VNĐ):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="vd: 45000"
                        value={addOriginalPrice}
                        onChange={(e) => setAddOriginalPrice(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                      {addPrice && addOriginalPrice && Number(addOriginalPrice) > Number(addPrice) && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">
                          Hiển thị nổi bật mức giảm: {Math.round(((Number(addOriginalPrice) - Number(addPrice)) / Number(addOriginalPrice)) * 100)}%
                        </p>
                      )}
                    </div>
                  )}
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                {/* Stock Quantity Control in Add Modal */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">Quản lý số lượng còn lại</span>
                      <span className="text-[11px] text-stone-500 font-medium">Bật nếu muốn giới hạn số phần có thể bán</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!addIsUnlimitedStock}
                        onChange={(e) => {
                          const hasLimit = e.target.checked;
                          setAddIsUnlimitedStock(!hasLimit);
                          if (hasLimit && !addStockQuantity) {
                            setAddStockQuantity('20');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {!addIsUnlimitedStock && (
                    <div className="pt-2 border-t border-stone-200/70 flex items-center gap-2">
                      <label className="text-xs font-bold text-stone-700 shrink-0">
                        Số lượng trong kho:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="vd: 20"
                        value={addStockQuantity}
                        onChange={(e) => setAddStockQuantity(e.target.value)}
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                      <span className="text-xs font-medium text-stone-500">phần</span>
                    </div>
                  )}
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
                    disabled={addLoading || !addName.trim() || (!addPrice && addSizes.every((size) => !size.name.trim()))}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in">
            <div className="bg-white rounded-[28px] p-5 sm:p-7 shadow-2xl max-w-lg w-full border border-white/80 relative max-h-[90dvh] overflow-y-auto">
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block min-h-10 text-xs font-bold text-stone-700 mb-1.5">
                      Giá mặc định (nếu món không có size)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block min-h-10 text-xs font-bold text-stone-700 mb-1.5">
                      Danh mục
                    </label>
                    <CustomCategorySelect
                      value={editCategoryId}
                      onChange={setEditCategoryId}
                      categories={categories}
                      onCreateCategory={createCategory}
                    />
                  </div>
                </div>

                <SizeOptionsEditor sizes={editSizes} onChange={setEditSizes} />

                {/* Discount Section Edit Modal */}
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-800 block">Chương trình Giảm giá</span>
                      <span className="text-[11px] text-rose-600/80 font-medium">Bật để hiển thị giá gốc gạch ngang</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editHasDiscount}
                        onChange={(e) => setEditHasDiscount(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {editHasDiscount && (
                    <div className="pt-3 border-t border-rose-100 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-rose-800">
                        Giá gốc trước khi giảm (VNĐ):
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="vd: 45000"
                        value={editOriginalPrice}
                        onChange={(e) => setEditOriginalPrice(e.target.value)}
                        className="w-full bg-white border border-rose-200 rounded-xl px-3.5 py-2 text-sm text-stone-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                      {editPrice && editOriginalPrice && Number(editOriginalPrice) > Number(editPrice) && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">
                          Hiển thị nổi bật mức giảm: {Math.round(((Number(editOriginalPrice) - Number(editPrice)) / Number(editOriginalPrice)) * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mô tả món
                  </label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                {/* Stock Quantity Control in Edit Modal */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">Quản lý số lượng còn lại</span>
                      <span className="text-[11px] text-stone-500 font-medium">Bật nếu muốn giới hạn số phần có thể bán</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!editIsUnlimitedStock}
                        onChange={(e) => {
                          const hasLimit = e.target.checked;
                          setEditIsUnlimitedStock(!hasLimit);
                          if (hasLimit && !editStockQuantity) {
                            setEditStockQuantity('20');
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>

                  {!editIsUnlimitedStock && (
                    <div className="pt-2 border-t border-stone-200/70 flex items-center gap-2">
                      <label className="text-xs font-bold text-stone-700 shrink-0">
                        Số lượng trong kho:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="vd: 20"
                        value={editStockQuantity}
                        onChange={(e) => setEditStockQuantity(e.target.value)}
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                      />
                      <span className="text-xs font-medium text-stone-500">phần</span>
                    </div>
                  )}
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
                    disabled={editLoading || !editName.trim() || (!editPrice && editSizes.every((size) => !size.name.trim()))}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs shadow-xs shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
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
