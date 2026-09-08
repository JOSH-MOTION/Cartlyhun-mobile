import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { chatService, Conversation } from '@/services/chatService';
import { subscribeToMyThreads, MessageThread } from '@/services/messageThreadService';
import { useAuth } from '@/hooks/useAuth';
import { LucideMessageCircle, LucideSearch } from 'lucide-react-native';
import { getTimeAgo } from '@/utils/helpers';

// A row is either an old-style general conversation or a status-linked
// thread — two different Firestore shapes, merged here into one inbox so a
// user doesn't need to know there are two chat systems under the hood.
type Row =
  | { kind: 'conversation'; id: string; sortAt: number; data: Conversation }
  | { kind: 'thread'; id: string; sortAt: number; data: MessageThread };

export default function MessagesTab() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [threadsAsCustomer, setThreadsAsCustomer] = useState<MessageThread[]>([]);
  const [threadsAsSeller, setThreadsAsSeller] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return undefined;

    const unsubConversations = chatService.subscribeToConversations(user.uid, (data) => {
      setConversations(data);
      setLoading(false);
    });
    const unsubCustomerThreads = subscribeToMyThreads(user.uid, 'customer', setThreadsAsCustomer);
    const unsubSellerThreads = subscribeToMyThreads(user.uid, 'seller', setThreadsAsSeller);

    return () => {
      unsubConversations();
      unsubCustomerThreads();
      unsubSellerThreads();
    };
  }, [user]);

  const rows: Row[] = [
    ...conversations.map((c) => ({
      kind: 'conversation' as const,
      id: c.id,
      sortAt: c.updatedAt?.toMillis?.() || 0,
      data: c,
    })),
    ...[...threadsAsCustomer, ...threadsAsSeller].map((t) => ({
      kind: 'thread' as const,
      id: t.id,
      sortAt: t.lastMessageAt?.toMillis?.() || 0,
      data: t,
    })),
  ].sort((a, b) => b.sortAt - a.sortAt);

  const renderRow = ({ item }: { item: Row }) => {
    if (item.kind === 'conversation') {
      const otherId = item.data.participants.find((pid) => pid !== user?.uid);
      const otherUser = item.data.participantDetails?.[otherId || ''] || { name: 'Unknown User', photoURL: '' };
      return (
        <TouchableOpacity
          onPress={() => router.push(`/chat/${item.id}`)}
          className="flex-row items-center p-4 border-b border-gray-50"
        >
          <View className="relative">
            <Image
              source={{ uri: otherUser.photoURL || 'https://via.placeholder.com/100' }}
              className="w-14 h-14 rounded-2xl bg-gray-100"
            />
            <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
          </View>
          <View className="flex-1 ml-4">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-gray-900 font-black text-sm uppercase tracking-tight">{otherUser.name}</Text>
              <Text className="text-[10px] font-bold text-gray-400 uppercase">
                {item.data.updatedAt ? getTimeAgo(item.data.updatedAt) : 'Just now'}
              </Text>
            </View>
            <Text className="text-gray-500 text-xs font-medium" numberOfLines={1}>
              {item.data.lastMessage ? (
                <>
                  {item.data.lastMessage.senderId === user?.uid && <Text className="text-primary font-bold">You: </Text>}
                  {item.data.lastMessage.text}
                </>
              ) : (
                'Start a conversation...'
              )}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    const isSeller = user?.uid === item.data.sellerId;
    const otherName = isSeller ? item.data.customerName || 'A buyer' : item.data.sellerStoreName || 'Seller';
    return (
      <TouchableOpacity
        onPress={() => router.push(`/messages/${item.id}`)}
        className="flex-row items-center p-4 border-b border-gray-50"
      >
        {item.data.statusImage ? (
          <Image source={{ uri: item.data.statusImage }} className="w-14 h-14 rounded-2xl bg-gray-100" />
        ) : (
          <View className="w-14 h-14 rounded-2xl bg-gray-100" />
        )}
        <View className="flex-1 ml-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text numberOfLines={1} className="text-gray-900 font-black text-sm uppercase tracking-tight">
              {otherName}
            </Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase">
              {item.data.lastMessageAt ? getTimeAgo(item.data.lastMessageAt) : 'Just now'}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs font-medium" numberOfLines={1}>
            {item.data.lastMessage || 'Say hello'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-10">
        <View className="w-20 h-20 bg-gray-50 rounded-[30px] items-center justify-center mb-6 border border-gray-100">
          <LucideMessageCircle size={32} color="#cbd5e1" />
        </View>
        <Text className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2 text-center">Sign in to message</Text>
        <Text className="text-gray-400 text-center font-medium leading-relaxed mb-8">
          You need to be signed in to view your conversations and message sellers.
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/auth/signin')}
          className="w-full bg-primary h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-white font-black uppercase tracking-widest">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-8 py-6 flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Messages</Text>
        <TouchableOpacity className="p-3 bg-gray-50 rounded-2xl">
          <LucideSearch size={22} color="#fa8929" />
        </TouchableOpacity>
      </View>

      {rows.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 bg-gray-50 rounded-[30px] items-center justify-center mb-6 border border-gray-100">
            <LucideMessageCircle size={32} color="#cbd5e1" />
          </View>
          <Text className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No messages yet</Text>
          <Text className="text-gray-400 text-center font-medium leading-relaxed">
            Reach out to sellers and start trading. Your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          renderItem={renderRow}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
