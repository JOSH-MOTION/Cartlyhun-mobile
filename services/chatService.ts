import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp,
  getDocs,
  getDoc,
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: Record<string, { name: string, photoURL: string }>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: any;
  };
  updatedAt: any;
}

export const chatService = {
  // Get or create a conversation between two users
  async getOrCreateConversation(user1: {uid: string, name: string, photoURL: string}, user2: {uid: string, name: string, photoURL: string}) {
    const participants = [user1.uid, user2.uid].sort();
    const convId = participants.join('_');
    
    const convRef = doc(db, 'conversations', convId);
    
    // We use setDoc with merge to ensure it exists without overwriting if it does
    await setDoc(convRef, {
      participants,
      participantDetails: {
        [user1.uid]: { name: user1.name, photoURL: user1.photoURL || '' },
        [user2.uid]: { name: user2.name, photoURL: user2.photoURL || '' }
      },
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return convId;
  },

  // Send a message
  async sendMessage(conversationId: string, text: string, senderId: string) {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);
    
    // Fetch conversation to find recipient
    const convSnap = await getDoc(convRef);
    const convData = convSnap.data();
    const recipientId = convData?.participants.find((id: string) => id !== senderId);
    
    const messageData = {
      text,
      senderId,
      createdAt: serverTimestamp()
    };
    
    // 1. Add message to subcollection
    await addDoc(messagesRef, messageData);
    
    // 2. Update conversation's last message and mark as unread for recipient
    await updateDoc(convRef, {
      lastMessage: messageData,
      updatedAt: serverTimestamp(),
      unreadBy: recipientId || null // Mark that the recipient hasn't read this yet
    });

    // 3. Create a notification trigger for Cloud Functions (or internal listener)
    if (recipientId) {
      await addDoc(collection(db, 'notifications'), {
        type: 'new_message',
        recipientId,
        senderId,
        senderName: convData?.participantDetails?.[senderId]?.name || 'Someone',
        text,
        conversationId,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
    }
  },

  // Mark conversation as read
  async markAsRead(conversationId: string, userId: string) {
    const convRef = doc(db, 'conversations', conversationId);
    await updateDoc(convRef, {
      unreadBy: null
    });
  },

  // Stream conversations for a user
  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      callback(conversations);
    }, (error) => {
      console.error("Error subscribing to conversations:", error);
      callback([]);
    });
  },

  // Stream messages for a conversation
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages.reverse()); // Show newest at bottom
    });
  }
};
