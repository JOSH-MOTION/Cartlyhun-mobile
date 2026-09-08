import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LucideChevronLeft, LucideSend, LucideMessageCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import {
  subscribeToThread,
  subscribeToThreadMessages,
  sendThreadMessage,
  type MessageThread,
  type ThreadMessage,
} from '@/services/messageThreadService';

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user) return undefined;

    const unsubThread = subscribeToThread(id as string, (data) => {
      setThread(data);
      setLoading(false);
    });
    const unsubMessages = subscribeToThreadMessages(id as string, (data) => {
      setMessages(data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => {
      unsubThread();
      unsubMessages();
    };
  }, [id, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    const text = inputText.trim();
    setInputText('');
    try {
      await sendThreadMessage(id as string, text);
    } catch {
      // Message stays in the composer state below if this fails — re-set it
      // so the buyer/seller doesn't lose what they typed.
      setInputText(text);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  const isSeller = user?.uid === thread?.sellerId;
  const otherName = isSeller ? thread?.customerName || 'A buyer' : thread?.sellerStoreName || 'Seller';
  const whatsappUrl =
    !isSeller && thread?.sellerWhatsapp
      ? `https://wa.me/${thread.sellerWhatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
          'Hi! Continuing our chat on Cartly Hub about your status.',
        )}`
      : null;

  const renderMessage = ({ item }: { item: ThreadMessage }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View
          className={`max-w-[75%] p-4 rounded-[24px] ${
            isMe ? 'bg-[#fa8929] rounded-br-none shadow-sm' : 'bg-gray-100 rounded-bl-none'
          }`}
        >
          <Text className={`text-[15px] leading-6 ${isMe ? 'text-white font-black' : 'text-gray-900 font-medium'}`}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-50 bg-white">
          <View className="flex-row items-center flex-1 min-w-0">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
              <LucideChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            {thread?.statusImage ? (
              <Image source={{ uri: thread.statusImage }} className="w-10 h-10 rounded-xl bg-gray-100" />
            ) : (
              <View className="w-10 h-10 rounded-xl bg-gray-100" />
            )}
            <View className="ml-3 flex-1 min-w-0">
              <Text numberOfLines={1} className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {otherName}
              </Text>
              {thread?.statusCaption ? (
                <Text numberOfLines={1} className="text-[10px] text-gray-400 font-bold">
                  {thread.statusCaption}
                </Text>
              ) : null}
            </View>
          </View>
          {whatsappUrl && (
            <TouchableOpacity
              onPress={() => Linking.openURL(whatsappUrl)}
              className="flex-row items-center gap-1.5 bg-[#25D366] px-3 py-2 rounded-xl"
            >
              <LucideMessageCircle size={14} color="#ffffff" />
              <Text className="text-white text-[9px] font-black uppercase tracking-widest">WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text className="text-center text-xs text-gray-400 font-bold mt-8">Say hello — start the conversation.</Text>
          }
        />

        <View className="px-4 py-4 pb-8 border-t border-gray-50 bg-white">
          <View className="flex-row items-center bg-gray-50 rounded-3xl px-4 py-2 border border-gray-100">
            <TextInput
              className="flex-1 h-12 px-2 text-gray-900 font-medium"
              placeholder="Type a message…"
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                inputText.trim() ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <LucideSend size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
