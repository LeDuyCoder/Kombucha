'use client';

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Printer } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | number;
  qrUrl: string;
}

export function QRModal({ isOpen, onClose, tableNumber, qrUrl }: QRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `phong-${tableNumber}-qr.png`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:p-0 print:bg-white print:inset-0" data-qr-print="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative p-6 flex flex-col items-center print:shadow-none print:w-full print:max-w-none">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors print:hidden"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div 
          ref={qrRef} 
          className="flex flex-col items-center p-8 border-4 border-double border-stone-200 rounded-xl bg-white"
        >
          <h2 className="text-3xl font-black text-stone-900 mb-4 uppercase tracking-wider">
            PHÒNG {String(tableNumber).padStart(2, '0')}
          </h2>
          
          <div className="p-4 bg-white rounded-lg shadow-sm border border-stone-100">
            <QRCodeCanvas 
              value={qrUrl} 
              size={200} 
              level="H" 
              includeMargin={false} 
            />
          </div>

          <p className="mt-6 text-lg font-bold text-stone-800 text-center">
            Quét để gọi món
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Sử dụng camera điện thoại hoặc Zalo để quét mã QR
          </p>
        </div>

        <div className="mt-8 flex gap-3 print:hidden">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs shadow-xs active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tải về</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all font-bold text-xs shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>In mã QR</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          [data-qr-print], [data-qr-print] * {
            visibility: visible;
          }
          [data-qr-print] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}} />
    </div>
  );
}
