import React from 'react';
import { KitchenDashboard } from '@/components/kitchen/KitchenDashboard';

export const metadata = {
  title: 'Màn hình Bếp (Kitchen Display) | Realtime',
  description: 'Màn hình nhận order realtime cho bếp và quầy pha chế',
};

export default function KitchenPage() {
  return <KitchenDashboard />;
}
