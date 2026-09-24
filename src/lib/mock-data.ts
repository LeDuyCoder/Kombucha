import { MenuCategory, MenuItem, RestaurantTable } from '@/types';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'cat-kombucha', name: 'KOMBUCHA', sort_order: 1 },
  { id: 'cat-tra', name: 'TRÀ', sort_order: 2 },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // KOMBUCHA
  {
    id: 'kb-1',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Nguyên vị',
    description: 'Vị lên men tự nhiên nguyên bản thanh mát, giàu men vi sinh tốt cho tiêu hóa.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&auto=format&fit=crop&q=60',
    available: true,
    stock_quantity: 20,
    sort_order: 1,
  },
  {
    id: 'kb-2',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Ổi',
    description: 'Hương ổi hồng ngọt dịu kết hợp vị chua thanh tươi mát.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=60',
    available: true,
    stock_quantity: 15,
    sort_order: 2,
  },
  {
    id: 'kb-3',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Đào',
    description: 'Hương đào thơm lừng mọng nước, giải nhiệt sảng khoái.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60',
    available: true,
    stock_quantity: 10,
    sort_order: 3,
  },
  {
    id: 'kb-4',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Táo',
    description: 'Vị táo giòn ngọt tự nhiên hòa cùng men kombucha sủi tăm.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1576158113840-43db9ff3ef09?w=500&auto=format&fit=crop&q=60',
    available: true,
    stock_quantity: 12,
    sort_order: 4,
  },
  {
    id: 'kb-5',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Vải',
    description: 'Vị vải nhiệt đới thơm ngọt ngào đậm đà.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60',
    available: true,
    stock_quantity: 8,
    sort_order: 5,
  },
  {
    id: 'kb-6',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Nho',
    description: 'Hương nho tím đậm vị, chua ngọt hài hòa.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 6,
  },
  {
    id: 'kb-7',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Hibiscus',
    description: 'Sắc đỏ rực rỡ từ hoa atisô đỏ, vị chua nhẹ kích thích vị giác.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 7,
  },
  {
    id: 'kb-8',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Dâu tây',
    description: 'Vị dâu tây tươi mọng, ngọt ngào và thơm mát.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 8,
  },
  {
    id: 'kb-9',
    category_id: 'cat-kombucha',
    category_name: 'KOMBUCHA',
    name: 'Kombucha Việt quất',
    description: 'Việt quất giàu chất chống oxy hóa, hương vị quyến rũ.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 9,
  },

  // TRÀ
  {
    id: 'tra-1',
    category_id: 'cat-tra',
    category_name: 'TRÀ',
    name: 'Trà Atisô Cam Đào',
    description: 'Trà thanh lọc atisô kết hợp cùng cam tươi và đào mọng thơm ngát.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 1,
  },
  {
    id: 'tra-2',
    category_id: 'cat-tra',
    category_name: 'TRÀ',
    name: 'Trà Atisô Cam Xoài',
    description: 'Vị ngọt nhiệt đới của xoài chín hòa cùng cam tươi mát.',
    price: 30000,
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 2,
  },
  {
    id: 'tra-3',
    category_id: 'cat-tra',
    category_name: 'TRÀ',
    name: 'Trà Hibiscus',
    description: 'Hồng trà hoa atisô đỏ chua thanh, màu sắc bắt mắt giải nhiệt cực đã.',
    price: 25000,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60',
    available: true,
    sort_order: 3,
  },
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', table_number: 1, qr_token: 'table-01-token', active: true },
  { id: 'tbl-2', table_number: 2, qr_token: 'table-02-token', active: true },
  { id: 'tbl-3', table_number: 3, qr_token: 'table-03-token', active: true },
  { id: 'tbl-620', table_number: 620, qr_token: 'table-620-token', active: true },
];

// Shared global in-memory store for fallback / dev demo mode
// Stored on globalThis to persist across Next.js dev route compilations
const globalForOrders = globalThis as unknown as {
  mockOrders: import('@/types').Order[];
  mockTables: RestaurantTable[];
  mockMenuItems: MenuItem[];
  mockOrderIdCounter: number;
  isStoreOpen?: boolean;
  kitchenPin?: string;
};

if (!globalForOrders.mockOrders) {
  globalForOrders.mockOrders = [];
  globalForOrders.mockOrderIdCounter = 1;
  globalForOrders.isStoreOpen = true;
}

if (!globalForOrders.mockTables) {
  globalForOrders.mockTables = [...INITIAL_TABLES];
}

if (!globalForOrders.mockMenuItems) {
  globalForOrders.mockMenuItems = [...INITIAL_MENU_ITEMS];
}

if (globalForOrders.isStoreOpen === undefined) {
  globalForOrders.isStoreOpen = true;
}

export const getMockMenuItems = () => globalForOrders.mockMenuItems || INITIAL_MENU_ITEMS;

export const addMockMenuItem = (item: MenuItem) => {
  if (!globalForOrders.mockMenuItems) globalForOrders.mockMenuItems = [...INITIAL_MENU_ITEMS];
  globalForOrders.mockMenuItems.push(item);
  return item;
};

export const updateMockMenuItem = (id: string, updates: Partial<MenuItem>) => {
  if (!globalForOrders.mockMenuItems) globalForOrders.mockMenuItems = [...INITIAL_MENU_ITEMS];
  const idx = globalForOrders.mockMenuItems.findIndex((m) => m.id === id);
  if (idx !== -1) {
    globalForOrders.mockMenuItems[idx] = { ...globalForOrders.mockMenuItems[idx], ...updates };
    return globalForOrders.mockMenuItems[idx];
  }
  return null;
};

export const deleteMockMenuItem = (id: string) => {
  if (!globalForOrders.mockMenuItems) globalForOrders.mockMenuItems = [...INITIAL_MENU_ITEMS];
  const initialLen = globalForOrders.mockMenuItems.length;
  globalForOrders.mockMenuItems = globalForOrders.mockMenuItems.filter((m) => m.id !== id);
  return globalForOrders.mockMenuItems.length < initialLen;
};

export const getMockTables = () => globalForOrders.mockTables || INITIAL_TABLES;

export const addMockTable = (table: RestaurantTable) => {
  if (!globalForOrders.mockTables) globalForOrders.mockTables = [...INITIAL_TABLES];
  globalForOrders.mockTables.push(table);
  return table;
};

export const updateMockTable = (id: string, updates: Partial<RestaurantTable>) => {
  if (!globalForOrders.mockTables) globalForOrders.mockTables = [...INITIAL_TABLES];
  const idx = globalForOrders.mockTables.findIndex((t) => t.id === id);
  if (idx !== -1) {
    globalForOrders.mockTables[idx] = { ...globalForOrders.mockTables[idx], ...updates };
    return globalForOrders.mockTables[idx];
  }
  return null;
};

export const deleteMockTable = (id: string) => {
  if (!globalForOrders.mockTables) globalForOrders.mockTables = [...INITIAL_TABLES];
  const initialLength = globalForOrders.mockTables.length;
  globalForOrders.mockTables = globalForOrders.mockTables.filter((t) => t.id !== id);
  return globalForOrders.mockTables.length < initialLength;
};

export const getStoreIsOpen = () => globalForOrders.isStoreOpen ?? true;

export const setStoreIsOpen = (open: boolean) => {
  globalForOrders.isStoreOpen = open;
  return globalForOrders.isStoreOpen;
};

export const getStoreKitchenPin = () => globalForOrders.kitchenPin || process.env.KITCHEN_PIN || '9999';

export const setStoreKitchenPin = (pin: string) => {
  globalForOrders.kitchenPin = pin;
  return globalForOrders.kitchenPin;
};

export const getMockOrders = () => globalForOrders.mockOrders;

export const addMockOrder = (order: import('@/types').Order) => {
  globalForOrders.mockOrders.unshift(order);
};

export const updateMockOrderStatus = (id: string, status: import('@/types').OrderStatus) => {
  const found = globalForOrders.mockOrders.find((o) => o.id === id);
  if (found) {
    found.status = status;
    found.updated_at = new Date().toISOString();
    return found;
  }
  return null;
};

export const updateMockOrderFeedback = (id: string, rating: number, feedback_note: string) => {
  const found = globalForOrders.mockOrders.find((o) => o.id === id);
  if (found) {
    found.rating = rating;
    found.feedback_note = feedback_note;
    found.updated_at = new Date().toISOString();
    return found;
  }
  return null;
};

export function getNextMockOrderId(): string {
  if (!globalForOrders.mockOrderIdCounter) {
    globalForOrders.mockOrderIdCounter = 1;
  }
  const idNum = String(globalForOrders.mockOrderIdCounter++).padStart(3, '0');
  return `ord-${idNum}`;
}

