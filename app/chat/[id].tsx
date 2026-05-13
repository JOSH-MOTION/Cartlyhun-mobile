import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { chatService, Message, Conversation } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { 
  LucideChevronLeft, 
  LucideSend, 
  LucideImage, 
  LucidePlus,
  LucideMoreVertical,
  LucideCheckCheck
} from 'lucide-react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChatRoomScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user) return;

    // Fetch conversation details
    const fetchConv = async () => {
      const docRef = doc(db, 'conversations', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConversation({ id: docSnap.id, ...docSnap.data() } as Conversation);
      }
    };
    fetchConv();

    // Subscribe to messages
    const unsubscribe = chatService.subscribeToMessages(id as string, (data) => {
      setMessages(data);
      setLoading(false);
      // Auto scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  }, [id, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !id) return;
    
    const text = inputText.trim();
    setInputText('');
    await chatService.sendMessage(id as string, text, user.uid);
  };

  const otherId = conversation?.participants.find(pid => pid !== user?.uid);
  const otherUser = conversation?.participantDetails?.[otherId || ''] || { name: 'Chat', photoURL: '' };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;
    
    return (
      <View 
        className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        {!isMe && (
          <Image 
            source={{ uri: otherUser.photoURL || 'https://via.placeholder.com/100' }} 
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 mr-2 self-end mb-1"
          />
        )}
        <View 
          className={`max-w-[75%] p-4 rounded-[24px] ${
            isMe 
              ? 'bg-[#fa8929] rounded-br-none shadow-sm' 
              : 'bg-gray-100 dark:bg-slate-800 rounded-bl-none'
          }`}
        >
          <Text className={`text-[15px] leading-6 ${isMe ? 'text-white font-black' : 'text-gray-900 dark:text-white font-medium'}`}>
            {item.text}
          </Text>
          <View className="flex-row items-center justify-end mt-1">
             <Text className={`text-[9px] uppercase font-bold mr-1 ${isMe ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
             </Text>
             {isMe && <LucideCheckCheck size={10} color="rgba(255,255,255,0.6)" />}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white dark:bg-slate-950" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
              <LucideChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Image 
                source={{ uri: otherUser.photoURL || 'https://via.placeholder.com/100' }} 
                className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800"
              />
              <View className="ml-3">
                <Text className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{otherUser.name}</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-1.5" />
                  <Text className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Online</Text>
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <LucideMoreVertical size={20} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id!}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View className="px-4 py-4 pb-8 border-t border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <View className="flex-row items-center bg-gray-50 dark:bg-slate-800 rounded-3xl px-4 py-2 border border-gray-100 dark:border-slate-700">
            <TouchableOpacity className="p-2">
              <LucidePlus size={22} color="#fa8929" />
            </TouchableOpacity>
            <TextInput
              className="flex-1 h-12 px-2 text-gray-900 dark:text-white font-medium"
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!inputText.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-primary' : (isDark ? 'bg-slate-700' : 'bg-gray-200')}`}
            >
              <LucideSend size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
