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
    link.download = `table-${tableNumber}-qr.png`;
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
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors print:hidden"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div 
          ref={qrRef} 
          className="flex flex-col items-center p-8 border-4 border-double border-gray-200 rounded-xl bg-white"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4 uppercase tracking-wider">
            BÀN {tableNumber}
          </h2>
          
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCodeCanvas 
              value={qrUrl} 
              size={200} 
              level="H" 
              includeMargin={false} 
            />
          </div>

          <p className="mt-6 text-lg font-medium text-gray-600 text-center">
            Quét để gọi món
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Sử dụng camera điện thoại để quét mã QR
          </p>
        </div>

        <div className="mt-8 flex gap-3 print:hidden">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Tải về
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            <Printer className="w-4 h-4" />
            In mã QR
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
