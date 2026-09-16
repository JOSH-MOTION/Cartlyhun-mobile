import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideChevronLeft, LucideBell, LucideBellOff, LucideCheck, LucideChevronRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToNotifications } from '@/utils/marketplaceData';
import { apiFetch } from '@/lib/api';

/** Buyer-facing counterpart to app/seller/notifications.tsx — order updates and messages. */
export default function AccountNotifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[] | null>(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return subscribeToNotifications(user.uid, setNotifications);
  }, [user?.uid]);

  const markAll = async () => {
    setMarking(true);
    try {
      await apiFetch('/api/notifications', { method: 'PATCH', body: {} });
    } catch {
      // The live listener will still reflect whatever did change.
    } finally {
      setMarking(false);
    }
  };

  const open = (notification: any) => {
    if (!notification.read) {
      apiFetch('/api/notifications', {
        method: 'PATCH',
        body: { notificationId: notification.id },
      }).catch(() => {});
    }

    // Web hrefs map onto the mobile routes for the sections that exist here.
    const href: string = notification.ctaHref || '';
    if (href.startsWith('/messages/')) router.push(href as any);
    else if (href.startsWith('/orders/')) router.push('/account/orders');
  };

  const unread = (notifications || []).filter((n) => !n.read).length;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white shadow-sm">
        <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-3 bg-gray-50 rounded-2xl mr-4 border border-gray-100"
            >
              <LucideChevronLeft size={20} color="#000" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-1">
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </Text>
              <Text className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Notifications</Text>
            </View>
          </View>
          {unread > 0 ? (
            <TouchableOpacity
              onPress={markAll}
              disabled={marking}
              className="p-3 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <LucideCheck size={20} color="#000" />
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>

      {notifications === null ? (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#fa8929" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 bg-gray-50 rounded-[40px] items-center justify-center mb-8 border border-gray-100 shadow-sm">
            <LucideBellOff size={40} color="#fa8929" />
          </View>
          <Text className="text-xl font-black text-gray-900 mb-2 text-center uppercase tracking-tight">Nothing here yet</Text>
          <Text className="text-center text-gray-400 font-medium leading-6">
            We'll tell you the moment your order status changes or a seller messages you.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          <View className="bg-white rounded-[44px] overflow-hidden border border-gray-100 shadow-sm">
            {notifications.map((notification, idx) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => open(notification)}
                className={`flex-row items-start p-6 ${idx !== notifications.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <View
                  className={`w-11 h-11 rounded-2xl items-center justify-center mr-4 ${
                    notification.read ? 'bg-gray-50' : 'bg-primary'
                  }`}
                >
                  <LucideBell size={18} color={notification.read ? '#cbd5e1' : '#fff'} />
                </View>

                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center gap-2 flex-wrap mb-1">
                    <Text className="font-black text-gray-900 text-xs uppercase tracking-tight flex-shrink">
                      {notification.title}
                    </Text>
                    {!notification.read ? (
                      <View className="bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                        <Text className="text-primary font-black text-[8px] uppercase">New</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[11px] text-gray-500 font-medium leading-relaxed mb-1.5">
                    {notification.message}
                  </Text>
                  <Text className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </View>

                {notification.ctaHref ? (
                  <LucideChevronRight size={16} color="#cbd5e1" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
