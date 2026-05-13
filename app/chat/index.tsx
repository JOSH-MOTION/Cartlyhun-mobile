import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { chatService, Conversation } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { LucideChevronLeft, LucideMessageSquare, LucideSearch } from 'lucide-react-native';
import { getTimeAgo } from '@/utils/helpers';

export default function ChatListScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = chatService.subscribeToConversations(user.uid, (data) => {
      setConversations(data);
      setLoading(false);
    });
    
    return unsubscribe;
  }, [user]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    // Determine the other participant
    const otherId = item.participants.find(id => id !== user?.uid);
    const otherUser = item.participantDetails?.[otherId || ''] || { name: 'Unknown User', photoURL: '' };
    
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/chat/${item.id}`)}
        className="flex-row items-center p-4 border-b border-gray-50 hover:bg-gray-50 transition-all"
      >
        <View className="relative">
          <Image 
            source={{ uri: otherUser.photoURL || 'https://via.placeholder.com/100' }} 
            className="w-14 h-14 rounded-2xl bg-gray-100"
          />
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        </View>
        
        <div className="flex-1 ml-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-900 font-black text-sm uppercase tracking-tight">{otherUser.name}</Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase">
              {item.updatedAt ? getTimeAgo(item.updatedAt) : 'Just now'}
            </Text>
          </View>
          <Text 
            className="text-gray-500 text-xs font-medium"
            numberOfLines={1}
          >
            {item.lastMessage?.text || 'Start a conversation...'}
          </Text>
        </div>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <LucideChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter">Messages</Text>
        <TouchableOpacity className="p-2 -mr-2">
          <LucideSearch size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 bg-gray-50 rounded-[30px] items-center justify-center mb-6">
            <LucideMessageSquare size={32} color="#cbd5e1" />
          </View>
          <Text className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">No messages yet</Text>
          <Text className="text-gray-400 text-center font-medium leading-relaxed">
            Reach out to sellers and start trading. Your conversations will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
