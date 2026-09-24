import Link from 'next/link';
import { Coffee, ChefHat, QrCode, UtensilsCrossed, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-center items-center p-6 selection:bg-emerald-200">
      <div className="max-w-xl w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/20 shadow-xs">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-linear-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent">
            Kombucha & Tea Order System
          </h1>
          <p className="text-stone-500 text-sm max-w-md mx-auto">
            Hệ thống đặt món tại bàn bằng QR code và quản lý order realtime cho quầy bar / bếp.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Order Page */}
          <Link
            href="/order?table=5"
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-800 group-hover:text-emerald-700 transition-colors">
                  Trang Khách Đặt Món
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Mở menu với tư cách khách hàng ngồi tại Bàn 05.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Thử đặt món ngay</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Kitchen Display */}
          <Link
            href="/kitchen"
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-800 group-hover:text-amber-700 transition-colors">
                  Màn Hình Bếp (Kitchen)
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Kanban board nhận order realtime và cập nhật trạng thái làm món.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Mở Kitchen Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* QR Generator */}
          <Link
            href="/admin/tables"
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-blue-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-800 group-hover:text-blue-700 transition-colors">
                  Quản Lý Bàn & Mã QR
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Xem danh sách bàn, tạo mã QR và in mã đặt lên bàn.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Xem danh sách bàn</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Menu Management */}
          <Link
            href="/admin/menu"
            className="group p-5 rounded-2xl bg-white border border-stone-200 hover:border-purple-300 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-800 group-hover:text-purple-700 transition-colors">
                  Quản Lý Menu
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Xem menu, bật/tắt trạng thái Còn món / Hết món tức thì.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>Quản lý món</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>

        {/* Quick Demo Tables */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-center space-y-2">
          <p className="text-xs text-stone-500 font-medium">Truy cập nhanh menu từng bàn:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((t) => (
              <Link
                key={t}
                href={`/order?table=${t}`}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 border border-stone-200 transition-colors"
              >
                Bàn {String(t).padStart(2, '0')}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
