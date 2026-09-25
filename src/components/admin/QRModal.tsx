'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Download, Printer, Loader2 } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string | number;
  qrUrl: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function generateStandeeCard(tableNumber: string | number, qrCanvas: HTMLCanvasElement): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // 1. Fill entire background with white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Card rounded rectangle
  const cardX = 30;
  const cardY = 30;
  const cardW = width - 60; // 740
  const cardH = height - 60; // 1040
  const cardRadius = 40;

  // Background Gradient
  const grad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
  grad.addColorStop(0, '#FFF1F2'); // rose-50
  grad.addColorStop(0.35, '#FFFFFF'); // white
  grad.addColorStop(1, '#FAFAF9'); // stone-50

  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E7E5E4'; // stone-200
  ctx.stroke();
  ctx.restore();

  // 3. Brand Logo (72x72)
  try {
    const logoImg = new window.Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = '/logo.jpg';
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      const logoSize = 72;
      const logoX = width / 2 - logoSize / 2;
      const logoY = cardY + 50;
      
      ctx.save();
      drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 18);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // Logo border
      ctx.save();
      drawRoundedRect(ctx, logoX, logoY, logoSize, logoSize, 18);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E7E5E4';
      ctx.stroke();
      ctx.restore();
    }
  } catch (e) {
    console.error('Logo draw error', e);
  }

  // 4. Subtitle Text: "KOMBUCHA & TEA HOUSE"
  ctx.save();
  ctx.font = '800 18px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#E11D48'; // rose-600
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('KOMBUCHA & TEA HOUSE', width / 2, cardY + 160);
  ctx.restore();

  // 5. Room Title: "PHÒNG XX"
  ctx.save();
  ctx.font = '900 46px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#1C1917'; // stone-900
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const str = String(tableNumber).trim();
  const titleText = /^phòng/i.test(str) ? str.toUpperCase() : (/^\d+$/.test(str) ? `PHÒNG ${str.padStart(2, '0')}` : `PHÒNG ${str.toUpperCase()}`);
  ctx.fillText(titleText, width / 2, cardY + 220);
  ctx.restore();

  // 6. QR Code Outer Frame
  const qrFrameSize = 480;
  const qrFrameX = width / 2 - qrFrameSize / 2;
  const qrFrameY = cardY + 275;

  // Ring around QR frame
  ctx.save();
  drawRoundedRect(ctx, qrFrameX - 6, qrFrameY - 6, qrFrameSize + 12, qrFrameSize + 12, 36);
  ctx.fillStyle = '#FFE4E6'; // rose-100
  ctx.fill();
  ctx.restore();

  // QR Frame Background
  ctx.save();
  drawRoundedRect(ctx, qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 30);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#F5F5F4';
  ctx.stroke();
  ctx.restore();

  // 7. Draw QR Code into Frame
  const qrSize = 420;
  const qrX = width / 2 - qrSize / 2;
  const qrY = qrFrameY + (qrFrameSize - qrSize) / 2;
  ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // 8. Footer CTA Text
  // "Quét mã để đặt món"
  ctx.save();
  ctx.font = '800 30px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#292524'; // stone-800
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Quét mã để đặt món', width / 2, cardY + 830);
  ctx.restore();

  // "Sử dụng camera điện thoại hoặc Zalo"
  ctx.save();
  ctx.font = '500 20px "Inter", "Segoe UI", system-ui, sans-serif';
  ctx.fillStyle = '#78716C'; // stone-500
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Sử dụng camera điện thoại hoặc Zalo', width / 2, cardY + 878);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export function QRModal({ isOpen, onClose, tableNumber, qrUrl }: QRModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!isOpen) return null;

  // 1. Download as High-Resolution PNG Stand Card Image
  const handleDownload = async () => {
    if (!qrRef.current || downloading) return;
    try {
      setDownloading(true);
      const qrCanvas = qrRef.current.querySelector('canvas');
      if (!qrCanvas) {
        throw new Error('Không tìm thấy mã QR');
      }

      const standeeDataUrl = await generateStandeeCard(tableNumber, qrCanvas);
      
      const link = document.createElement('a');
      link.href = standeeDataUrl;
      const str = String(tableNumber).trim();
      const filenameStr = /^phòng/i.test(str) ? str.toLowerCase().replace(/\s+/g, '-') : (/^\d+$/.test(str) ? str.padStart(2, '0') : str.toLowerCase().replace(/\s+/g, '-'));
      link.download = `the-de-ban-phong-${filenameStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR card error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // 2. Print Stand Card Image with Pixel-Perfect Colors and Fonts
  const handlePrint = async () => {
    if (!qrRef.current || printing) return;
    try {
      setPrinting(true);
      const qrCanvas = qrRef.current.querySelector('canvas');
      if (!qrCanvas) return;

      const standeeDataUrl = await generateStandeeCard(tableNumber, qrCanvas);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>In Thẻ Để Bàn - Phòng ${String(tableNumber).trim()}</title>
              <style>
                @page {
                  size: auto;
                  margin: 15mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 90vh;
                  background: white;
                }
                img {
                  max-width: 380px;
                  width: 100%;
                  height: auto;
                  display: block;
                  border-radius: 24px;
                }
              </style>
            </head>
            <body>
              <img src="${standeeDataUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 250);" />
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print QR error:', err);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm relative p-6 sm:p-7 flex flex-col items-center border border-stone-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable & Downloadable Stand Card Preview */}
        <div 
          ref={qrRef} 
          className="flex flex-col items-center w-full p-6 sm:p-7 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #fff1f2, #ffffff, #fafaf9)',
            border: '1px solid #e7e5e4',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-3">
            <div 
              className="w-10 h-10 rounded-xl overflow-hidden relative bg-white flex items-center justify-center mb-2"
              style={{
                border: '1px solid #e7e5e4',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover" 
                priority 
                unoptimized
              />
            </div>
            <span 
              className="text-[10px] font-extrabold tracking-[0.2em] uppercase"
              style={{ color: '#e11d48' }}
            >
              Kombucha &amp; Tea House
            </span>
          </div>

          {/* Room Title */}
          <h2 
            className="text-2xl sm:text-3xl font-black tracking-tight mb-4 uppercase"
            style={{ color: '#1c1917' }}
          >
            {/^phòng/i.test(String(tableNumber).trim()) ? String(tableNumber).trim().toUpperCase() : (/^\d+$/.test(String(tableNumber).trim()) ? `PHÒNG ${String(tableNumber).trim().padStart(2, '0')}` : `PHÒNG ${String(tableNumber).trim().toUpperCase()}`)}
          </h2>
          
          {/* QR Canvas Frame */}
          <div 
            className="p-3.5 bg-white rounded-2xl"
            style={{
              border: '1px solid #f5f5f4',
              boxShadow: '0 0 0 4px rgba(255, 241, 242, 0.8), 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            <QRCodeCanvas 
              value={qrUrl} 
              size={190} 
              level="H" 
              includeMargin={false}
              imageSettings={{
                src: "/logo.jpg",
                height: 44,
                width: 44,
                excavate: true,
              }}
            />
          </div>

          {/* Call to action */}
          <div className="text-center mt-4 space-y-0.5">
            <p 
              className="text-sm sm:text-base font-extrabold"
              style={{ color: '#292524' }}
            >
              Quét mã để đặt món
            </p>
            <p 
              className="text-[11px] font-medium"
              style={{ color: '#a8a29e' }}
            >
              Sử dụng camera điện thoại hoặc Zalo
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5 w-full">
          <button 
            onClick={handleDownload}
            disabled={downloading || printing}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-2xl font-bold text-xs shadow-sm shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{downloading ? 'Đang xuất...' : 'Tải hình ảnh'}</span>
          </button>
          
          <button 
            onClick={handlePrint}
            disabled={downloading || printing}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white rounded-2xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {printing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Printer className="w-4 h-4" />
            )}
            <span>{printing ? 'Đang chuẩn bị...' : 'In mã QR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
