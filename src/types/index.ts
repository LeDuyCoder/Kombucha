export type OrderStatus = 'WAITING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface RestaurantTable {
  id: string;
  table_number: string | number;
  qr_token: string;
  active: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  description?: string | null;
  price: number;
  original_price?: number | null;
  image_url?: string | null;
  available: boolean;
  stock_quantity?: number | null;
  sort_order: number;
}

export interface Session {
  id: string;
  table_id: string;
  session_token: string;
  status: 'ACTIVE' | 'CLOSED';
  created_at: string;
  closed_at?: string | null;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  note?: string | null;
}

export interface Order {
  id: string;
  session_id: string;
  table_id: string;
  table_number?: string | number;
  status: OrderStatus;
  note?: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  rating?: number | null;
  feedback_note?: string | null;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export interface CreateOrderPayload {
  tableNumber: string | number;
  sessionId: string;
  note?: string;
  items: {
    menu_item_id: string;
    quantity: number;
    note?: string;
  }[];
}
