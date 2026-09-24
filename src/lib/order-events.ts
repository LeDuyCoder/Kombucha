import { EventEmitter } from 'events';
import { Order } from '@/types';

// Global singleton EventEmitter across Next.js API routes in development and production
const globalForOrderEvents = globalThis as unknown as {
  __orderEventEmitter?: EventEmitter;
};

export const orderEventEmitter =
  globalForOrderEvents.__orderEventEmitter || new EventEmitter();

// Prevent memory leak warning with multiple SSE connections
orderEventEmitter.setMaxListeners(200);

if (process.env.NODE_ENV !== 'production') {
  globalForOrderEvents.__orderEventEmitter = orderEventEmitter;
}

export type OrderStreamEvent =
  | { type: 'order_created'; order: Order }
  | { type: 'order_updated'; order: Partial<Order> & { id: string } }
  | { type: 'store_updated'; isOpen: boolean }
  | { type: 'ping' };

export function emitOrderCreated(order: Order) {
  try {
    orderEventEmitter.emit('order_event', { type: 'order_created', order });
  } catch (err) {
    console.error('emitOrderCreated error:', err);
  }
}

export function emitOrderUpdated(order: Partial<Order> & { id: string }) {
  try {
    orderEventEmitter.emit('order_event', { type: 'order_updated', order });
  } catch (err) {
    console.error('emitOrderUpdated error:', err);
  }
}

export function emitStoreUpdated(isOpen: boolean) {
  try {
    orderEventEmitter.emit('order_event', { type: 'store_updated', isOpen });
  } catch (err) {
    console.error('emitStoreUpdated error:', err);
  }
}

export function subscribeOrderEvents(listener: (event: OrderStreamEvent) => void): () => void {
  orderEventEmitter.on('order_event', listener);
  return () => {
    orderEventEmitter.off('order_event', listener);
  };
}
