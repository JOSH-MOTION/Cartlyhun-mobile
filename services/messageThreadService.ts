import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { apiFetch } from '@/lib/api';

/**
 * Status-originated buyer/seller chat — separate from chatService.ts's
 * generic `conversations` model. This one is keyed by (statusId, customerId)
 * and matches the shape the web app already writes into `messageThreads` /
 * `threadMessages`. Starting a thread and sending a message go through the
 * server (so the notification/email side effects fire); reads are live
 * Firestore listeners, same pattern chatService.ts already uses.
 */

export type MessageThread = {
  id: string;
  statusId: string;
  statusImage?: string | null;
  statusCaption?: string | null;
  sellerId: string;
  sellerStoreName?: string;
  sellerWhatsapp?: string | null;
  customerId: string;
  customerName?: string;
  lastMessage?: string | null;
  lastMessageAt?: any;
};

export type ThreadMessage = {
  id: string;
  threadId: string;
  senderId: string;
  senderRole: 'seller' | 'customer';
  text: string;
  createdAt?: any;
};

export const startThreadForStatus = async (statusId: string) =>
  apiFetch<{ id: string }>('/api/messages/start', { method: 'POST', body: { statusId } });

export const sendThreadMessage = async (threadId: string, text: string) =>
  apiFetch(`/api/messages/${threadId}/send`, { method: 'POST', body: { text } });

export const subscribeToThread = (threadId: string, callback: (thread: MessageThread | null) => void) =>
  onSnapshot(doc(db, 'messageThreads', threadId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as MessageThread) : null);
  });

export const subscribeToThreadMessages = (threadId: string, callback: (messages: ThreadMessage[]) => void) =>
  onSnapshot(query(collection(db, 'threadMessages'), where('threadId', '==', threadId)), (snap) => {
    const list = snap.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }) as ThreadMessage)
      .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    callback(list);
  });

export const subscribeToMyThreads = (
  userId: string,
  role: 'customer' | 'seller',
  callback: (threads: MessageThread[]) => void,
) =>
  onSnapshot(
    query(collection(db, 'messageThreads'), where(role === 'seller' ? 'sellerId' : 'customerId', '==', userId)),
    (snap) => {
      callback(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as MessageThread));
    },
  );
