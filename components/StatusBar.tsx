import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, ActivityIndicator, Linking, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LucideX, LucideChevronLeft, LucideChevronRight, LucideSend, LucideMessageCircle, LucideStore, LucidePlus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { formatCurrency } from '@/constants/marketplace';
import { startThreadForStatus } from '@/services/messageThreadService';

const AUTO_ADVANCE_MS = 5000;
const VIEWED_KEY = 'cartly-viewed-statuses';

type Status = {
  id: string;
  image: string;
  caption?: string;
  price?: number;
  createdAt?: string;
  storeName?: string;
  whatsappNumber?: string | null;
  sellerId: string;
};

type SellerGroup = {
  sellerId: string;
  storeName: string;
  storeLogo?: string | null;
  statuses: Status[];
};

const timeAgo = (date?: string) => {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

/** Ephemeral seller status strip — live 24h, gone after (permanently deleted server-side). */
export default function StatusBar() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [openSellerIndex, setOpenSellerIndex] = useState<number | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(VIEWED_KEY)
      .then((raw) => setViewedIds(new Set(raw ? JSON.parse(raw) : [])))
      .catch(() => {});
  }, []);

  const { data: sellers = [] } = useQuery({
    queryKey: ['statuses', 'active'],
    queryFn: async () => (await apiFetch<{ sellers: SellerGroup[] }>('/api/statuses')).sellers,
    refetchInterval: 60000,
  });

  const openSeller = openSellerIndex !== null ? sellers[openSellerIndex] : null;
  const status = openSeller?.statuses?.[statusIndex];

  useEffect(() => {
    if (!status) return;
    if (viewedIds.has(status.id)) return;
    const next = new Set(viewedIds);
    next.add(status.id);
    setViewedIds(next);
    AsyncStorage.setItem(VIEWED_KEY, JSON.stringify([...next])).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.id]);

  const closeViewer = () => {
    setOpenSellerIndex(null);
    progress.stopAnimation();
  };

  const next = () => {
    if (!openSeller || openSellerIndex === null) return;
    if (statusIndex < openSeller.statuses.length - 1) {
      setStatusIndex(statusIndex + 1);
    } else if (openSellerIndex < sellers.length - 1) {
      setOpenSellerIndex(openSellerIndex + 1);
      setStatusIndex(0);
    } else {
      closeViewer();
    }
  };

  const prev = () => {
    if (openSellerIndex === null) return;
    if (statusIndex > 0) {
      setStatusIndex(statusIndex - 1);
    } else if (openSellerIndex > 0) {
      const prevSeller = sellers[openSellerIndex - 1];
      setOpenSellerIndex(openSellerIndex - 1);
      setStatusIndex(prevSeller.statuses.length - 1);
    }
  };

  useEffect(() => {
    if (!status) return undefined;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) next();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.id]);

  if (sellers.length === 0 && profile?.role !== 'seller') return null;

  const openViewer = (index: number) => {
    setOpenSellerIndex(index);
    setStatusIndex(0);
  };

  const handleMessageSeller = async () => {
    if (!status) return;
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    setIsStartingChat(true);
    try {
      const { id } = await startThreadForStatus(status.id);
      closeViewer();
      router.push(`/messages/${id}`);
    } catch {
      // Swallow — the button just stops spinning and the sheet stays open.
    } finally {
      setIsStartingChat(false);
    }
  };

  const whatsappUrl = status?.whatsappNumber
    ? `https://wa.me/${status.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hi! I saw your status on Cartly Hub${status.caption ? ` — "${status.caption}"` : ''}. Still available?`,
      )}`
    : null;

  return (
    <View className="mb-8">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {profile?.role === 'seller' && (
          <TouchableOpacity onPress={() => router.push('/seller/status')} className="items-center gap-1.5">
            <View className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50">
              <LucidePlus size={22} color="#94a3b8" />
            </View>
            <Text className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">Add status</Text>
          </TouchableOpacity>
        )}

        {sellers.map((seller, index) => {
          const allViewed = seller.statuses.every((s) => viewedIds.has(s.id));
          const avatarUri = seller.statuses[0]?.image || seller.storeLogo;
          return (
            <TouchableOpacity key={seller.sellerId} onPress={() => openViewer(index)} className="items-center gap-1.5" style={{ maxWidth: 68 }}>
              <View
                className="h-16 w-16 rounded-full items-center justify-center"
                style={{ backgroundColor: allViewed ? '#e5e7eb' : '#fa8929', padding: 2 }}
              >
                <View className="h-full w-full rounded-full border-2 border-white overflow-hidden bg-gray-100 items-center justify-center">
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <LucideStore size={22} color="#94a3b8" />
                  )}
                </View>
              </View>
              <Text numberOfLines={1} className="text-[9px] font-bold text-gray-600 uppercase tracking-wide">
                {seller.storeName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={!!status} animationType="fade" onRequestClose={closeViewer}>
        {status && openSeller && (
          <View className="flex-1 bg-black">
            <View className="absolute top-12 left-3 right-3 flex-row gap-1 z-10">
              {openSeller.statuses.map((_, i) => (
                <View key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                  {i < statusIndex ? (
                    <View className="h-full w-full bg-white" />
                  ) : i === statusIndex ? (
                    <Animated.View
                      className="h-full bg-white"
                      style={{
                        width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                      }}
                    />
                  ) : null}
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={closeViewer} className="absolute top-16 right-4 z-10 h-9 w-9 bg-black/40 rounded-full items-center justify-center">
              <LucideX size={18} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-[5]" activeOpacity={1} />
            <TouchableOpacity onPress={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-[5]" activeOpacity={1} />

            <View className="flex-1 justify-center">
              <Image source={{ uri: status.image }} className="w-full h-2/3" resizeMode="contain" />
              <View className="bg-black/80 p-5 gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="text-[10px] font-black uppercase tracking-widest text-white/60">{status.storeName}</Text>
                  <Text className="text-[10px] font-bold text-white/40">· {timeAgo(status.createdAt)}</Text>
                </View>
                {status.caption ? <Text className="text-sm text-white font-medium leading-relaxed">{status.caption}</Text> : null}
                {status.price ? <Text className="text-lg font-black text-white">{formatCurrency(status.price)}</Text> : null}

                {status.sellerId !== user?.uid && (
                  <View className="flex-row gap-2 mt-1">
                    <TouchableOpacity
                      onPress={handleMessageSeller}
                      disabled={isStartingChat}
                      className="flex-1 flex-row items-center justify-center gap-2 bg-white py-3 rounded-xl"
                    >
                      {isStartingChat ? (
                        <ActivityIndicator size="small" color="#000000" />
                      ) : (
                        <>
                          <LucideSend size={14} color="#000000" />
                          <Text className="text-black font-black uppercase tracking-widest text-[10px]">Message seller</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    {whatsappUrl && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(whatsappUrl)}
                        className="items-center justify-center bg-[#25D366] px-4 py-3 rounded-xl"
                      >
                        <LucideMessageCircle size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}
