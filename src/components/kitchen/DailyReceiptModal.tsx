'use client';

import React, { useEffect, useState, useRef } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  Printer,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
  Coffee,
} from 'lucide-react';

interface DailyReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  date: string;
  summary: {
    totalOrders: number;
    completedOrdersCount: number;
    waitingOrdersCount: number;
    preparingOrdersCount: number;
    readyOrdersCount: number;
    cancelledOrdersCount: number;
    completedRevenue: number;
    totalPotentialRevenue: number;
    totalItemsSold: number;
  };
  itemBreakdown: {
    name: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  tableBreakdown: {
    tableNumber: number;
    orderCount: number;
    totalAmount: number;
  }[];
}

export const DailyReceiptModal: React.FC<DailyReceiptModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  const fetchReport = async (dateStr: string) => {
    try {
      setLoading(true);
      const resp = await fetch(`/api/reports/daily?date=${dateStr}`);
      if (resp.ok) {
        const data = await resp.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Fetch daily report error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport(selectedDate);
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Export CSV with UTF-8 BOM so Excel displays Vietnamese correctly
  const handleExportCSV = () => {
    if (!report) return;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += `BÁO CÁO DOANH THU & BIÊN LAI TỔNG KẾT NGÀY - KOMBUCHA & TEA HOUSE\n`;
    csvContent += `Ngày: ${report.date}\n`;
    csvContent += `Thời gian xuất: ${new Date().toLocaleTimeString('vi-VN')}\n\n`;

    csvContent += `TỔNG QUAN\n`;
    csvContent += `Tổng số đơn,${report.summary.totalOrders}\n`;
    csvContent += `Đơn hoàn thành,${report.summary.completedOrdersCount}\n`;
    csvContent += `Tổng số ly bán ra,${report.summary.totalItemsSold}\n`;
    csvContent += `Doanh thu hoàn thành (VNĐ),${report.summary.completedRevenue}\n\n`;

    csvContent += `CHI TIẾT MÓN BÁN RA\n`;
    csvContent += `Tên món,Đơn giá (VNĐ),Số lượng,Thành tiền (VNĐ)\n`;
    report.itemBreakdown.forEach((item) => {
      csvContent += `"${item.name}",${item.price},${item.quantity},${item.total}\n`;
    });

    csvContent += `\nCHI TIẾT THEO BÀN\n`;
    csvContent += `Số bàn,Số lượt gọi,Tổng tiền (VNĐ)\n`;
    report.tableBreakdown.forEach((tbl) => {
      csvContent += `Bàn ${tbl.tableNumber},${tbl.orderCount},${tbl.totalAmount}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bien-lai-doanh-thu-${report.date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      data-receipt-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header - Screen Only */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                Biên Lai &amp; Doanh Thu Trong Ngày
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Tổng hợp đơn hàng và doanh thu theo ngày
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-700">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-hidden text-xs cursor-pointer"
              />
            </div>

            <button
              onClick={() => fetchReport(selectedDate)}
              className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div
          ref={receiptRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible print:max-h-none"
          id="printable-daily-receipt"
        >
          {loading ? (
            <div className="text-center py-16 text-stone-400 space-y-2">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Đang kết xuất báo cáo...</p>
            </div>
          ) : !report ? (
            <div className="text-center py-16 text-stone-400 text-sm">
              Không có dữ liệu cho ngày đã chọn
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white p-6 rounded-2xl border border-stone-200 shadow-xs print:shadow-none print:border-none print:p-2">
              {/* Receipt Header Banner */}
              <div className="text-center border-b border-dashed border-stone-300 pb-4 mb-4">
                <div className="inline-flex p-2 rounded-xl bg-stone-100 mb-2">
                  <Coffee className="w-6 h-6 text-stone-800" />
                </div>
                <h1 className="text-lg font-black tracking-wider uppercase text-stone-900">
                  KOMBUCHA &amp; TEA HOUSE
                </h1>
                <p className="text-[11px] text-stone-500 font-medium">
                  Đ/c: Bàn &amp; Quầy Bar Realtime Order
                </p>
                <div className="mt-2 text-xs font-bold text-stone-800 tracking-wide uppercase">
                  BIÊN LAI TỔNG KẾT DOANH THU NGÀY
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Ngày: <span className="font-bold text-stone-800">{report.date}</span> • Xuất lúc:{' '}
                  {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 gap-2.5 mb-5 text-center">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">
                    Doanh thu thực thu
                  </p>
                  <p className="text-lg font-black text-emerald-700 mt-0.5">
                    {formatCurrency(report.summary.completedRevenue)}
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    Từ {report.summary.completedOrdersCount} đơn hoàn thành
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <p className="text-[11px] font-bold text-stone-700 uppercase tracking-tight">
                    Tổng ly / món bán
                  </p>
                  <p className="text-lg font-black text-stone-900 mt-0.5">
                    {report.summary.totalItemsSold} ly
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Tổng cộng: {report.summary.totalOrders} lượt order
                  </p>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="border-t border-dashed border-stone-300 pt-3 mb-4">
                <div className="flex justify-between text-xs font-extrabold text-stone-800 uppercase tracking-wider mb-2">
                  <span>Món Nước</span>
                  <div className="flex gap-4">
                    <span className="w-8 text-center">SL</span>
                    <span className="w-20 text-right">T.Tiền</span>
                  </div>
                </div>

                {report.itemBreakdown.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-4 italic">
                    Chưa có món nào bán ra trong ngày
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100 text-xs">
                    {report.itemBreakdown.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-stone-800 leading-tight truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex gap-4 items-center shrink-0">
                          <span className="w-8 text-center font-bold text-stone-700 bg-stone-100 px-1 py-0.5 rounded">
                            {item.quantity}
                          </span>
                          <span className="w-20 text-right font-extrabold text-stone-900">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table Breakdown */}
              {report.tableBreakdown.length > 0 && (
                <div className="border-t border-dashed border-stone-300 pt-3 mb-4">
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                    Doanh thu theo từng phòng
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {report.tableBreakdown.map((tbl) => (
                      <div
                        key={tbl.tableNumber}
                        className="p-2 bg-stone-50 rounded-lg flex items-center justify-between border border-stone-100"
                      >
                        <span className="font-bold text-stone-700">Phòng {tbl.tableNumber}</span>
                        <div className="text-right">
                          <span className="font-extrabold text-stone-900 block">
                            {formatCurrency(tbl.totalAmount)}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {tbl.orderCount} order
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Totals Footer */}
              <div className="border-t-2 border-stone-800 pt-3 mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Tổng giá trị order tạm tính:</span>
                  <span className="font-bold text-stone-800">
                    {formatCurrency(report.summary.totalPotentialRevenue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1 border-t border-stone-200">
                  <span className="uppercase">THỰC THU TRONG NGÀY:</span>
                  <span className="text-base text-emerald-700">
                    {formatCurrency(report.summary.completedRevenue)}
                  </span>
                </div>
                <p className="text-[10px] text-center text-stone-400 italic pt-3">
                  Cảm ơn và hẹn gặp lại quý khách!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer - Screen Only */}
        <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleExportCSV}
            disabled={loading || !report}
            className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={loading || !report}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>In Biên Lai Tổng Kết</span>
          </button>
        </div>
      </div>

      {/* Print-specific style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-daily-receipt, #printable-daily-receipt * {
            visibility: visible;
          }
          #printable-daily-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};
