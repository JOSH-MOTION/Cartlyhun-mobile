import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LucideBell, LucideBellOff, LucideCheck, LucideChevronRight } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToNotifications } from '@/utils/marketplaceData';
import { apiFetch } from '@/lib/api';
import {
  ScreenHeader,
  Screen,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

/** In-app feed: paid orders, WhatsApp orders and payout updates. */
export default function SellerNotifications() {
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

  const open = async (notification: any) => {
    if (!notification.read) {
      apiFetch('/api/notifications', {
        method: 'PATCH',
        body: { notificationId: notification.id },
      }).catch(() => {});
    }

    // Web hrefs map onto the mobile routes for the sections that exist here.
    const href: string = notification.ctaHref || '';
    if (href.startsWith('/seller/orders/')) router.push(href as any);
    else if (href.startsWith('/seller/withdrawals')) router.push('/seller/withdrawals');
    else if (href.startsWith('/seller')) router.push('/seller');
  };

  if (notifications === null) return <LoadingState label="Loading notifications" />;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        right={
          unread > 0 ? (
            <TouchableOpacity onPress={markAll} disabled={marking}>
              <LucideCheck size={20} color="#0f172a" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <Screen>
        <Panel>
          {notifications.length === 0 ? (
            <EmptyState
              icon={LucideBellOff}
              title="Nothing here yet"
              description="We'll tell you the moment a customer pays or sends an order."
            />
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => open(notification)}
                className="flex-row gap-3 py-3.5 border-b border-gray-50"
              >
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center ${
                    notification.read ? 'bg-gray-50' : 'bg-gray-900'
                  }`}
                >
                  <LucideBell size={14} color={notification.read ? '#cbd5e1' : '#ffffff'} />
                </View>

                <View className="flex-1 min-w-0 gap-1">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-sm font-bold text-gray-900">
                      {notification.title}
                    </Text>
                    {!notification.read ? <Pill tone="positive" label="New" /> : null}
                  </View>
                  <Text className="text-[11px] text-gray-500 leading-relaxed">
                    {notification.message}
                  </Text>
                  <Text className="text-[10px] text-gray-300">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </View>

                {notification.ctaHref ? (
                  <LucideChevronRight size={16} color="#cbd5e1" />
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}
