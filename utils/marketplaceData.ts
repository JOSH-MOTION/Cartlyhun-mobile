import {
  collection,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PAYMENT_STATUS } from '@/constants/marketplace';

/**
 * Read-only Firestore helpers for the seller screens.
 *
 * Anything that moves money goes through lib/api.ts instead — these are
 * listings only. Sorting is done in memory so none of these queries need a
 * composite index created first.
 */

const toDate = (value: any): Date | null =>
  value?.toDate ? value.toDate() : value ? new Date(value) : null;

const hydrateOrder = (entry: any) => {
  const data = entry.data();
  return {
    id: entry.id,
    ...data,
    createdAt: toDate(data.createdAt) || new Date(),
    updatedAt: toDate(data.updatedAt),
    paidAt: toDate(data.paidAt),
    estimatedDeliveryAt: toDate(data.estimatedDeliveryAt),
  };
};

const newestFirst = (a: any, b: any) => b.createdAt - a.createdAt;

export const getVendorOrders = async (vendorId?: string) => {
  if (!vendorId) return [];
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('vendorId', '==', vendorId)),
  );
  return snapshot.docs.map(hydrateOrder).sort(newestFirst);
};

export const getCustomerOrders = async (customerId?: string) => {
  if (!customerId) return [];
  const snapshot = await getDocs(
    query(collection(db, 'orders'), where('customerId', '==', customerId)),
  );
  return snapshot.docs.map(hydrateOrder).sort(newestFirst);
};

/** Aggregates a vendor's orders into a customer list. */
export const getVendorCustomers = async (vendorId?: string) => {
  const orders = await getVendorOrders(vendorId);
  const customers = new Map<string, any>();

  for (const order of orders as any[]) {
    const key =
      order.customerPhone || order.customerEmail || order.customerName || order.id;

    if (!customers.has(key)) {
      customers.set(key, {
        id: key,
        name: order.customerName || 'Guest',
        phone: order.customerPhone || null,
        email: order.customerEmail || null,
        orderCount: 0,
        totalSpend: 0,
        lastOrderAt: order.createdAt,
      });
    }

    const customer = customers.get(key);
    customer.orderCount += 1;
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      customer.totalSpend += Number(order.totalAmount || 0);
    }
    if (order.createdAt > customer.lastOrderAt) customer.lastOrderAt = order.createdAt;
  }

  return Array.from(customers.values()).sort((a, b) => b.totalSpend - a.totalSpend);
};

/** Live notification feed. Handles both producers' owner fields. */
export const subscribeToNotifications = (
  userId: string | undefined,
  callback: (items: any[]) => void,
) => {
  if (!userId) return () => {};

  return onSnapshot(
    query(collection(db, 'notifications'), where('userId', '==', userId), fsLimit(100)),
    (snapshot) => {
      const items = snapshot.docs
        .map((entry) => {
          const data = entry.data();
          return { id: entry.id, ...data, createdAt: toDate(data.createdAt) || new Date() };
        })
        .sort(newestFirst);
      callback(items);
    },
    (error) => console.error('Notification stream error:', error),
  );
};

export const getNotificationsOnce = async (userId?: string) => {
  if (!userId) return [];
  const snapshot = await getDocs(
    query(collection(db, 'notifications'), where('userId', '==', userId), fsLimit(100)),
  );
  return snapshot.docs
    .map((entry) => {
      const data = entry.data();
      return { id: entry.id, ...data, createdAt: toDate(data.createdAt) || new Date() };
    })
    .sort(newestFirst);
};
