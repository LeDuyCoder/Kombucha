import React, { Suspense } from 'react';
import CustomerOrderPage from '@/components/customer/CustomerOrderPage';

export const metadata = {
  title: 'Order Menu | Kombucha & Tea House',
  description: 'Quét mã QR và gọi món ngay tại bàn',
};

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerOrderPage />
    </Suspense>
  );
}
