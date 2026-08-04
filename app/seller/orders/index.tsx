import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LucideShoppingBag, LucideMessageCircle, LucideCreditCard } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getVendorOrders } from '@/utils/marketplaceData';
import {
  formatCurrency,
  ORDER_CHANNELS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
} from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
  TONE,
  ToneName,
} from '@/components/seller/ui';

const STATUS_TONES: Record<string, ToneName> = {
  [ORDER_STATUS.AWAITING_PAYMENT]: 'warning',
  [ORDER_STATUS.AWAITING_VENDOR]: 'whatsapp',
  [ORDER_STATUS.CONFIRMED]: 'dark',
  [ORDER_STATUS.PROCESSING]: 'warning',
  [ORDER_STATUS.SHIPPED]: 'info',
  [ORDER_STATUS.DELIVERED]: 'positive',
  [ORDER_STATUS.CANCELLED]: 'danger',
  [ORDER_STATUS.REFUNDED]: 'danger',
};

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'open', label: 'To fulfil' },
];

export default function SellerOrders() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['seller', 'orders', user?.uid],
    queryFn: () => getVendorOrders(user?.uid),
    enabled: !!user?.uid,
  });

  const stats = useMemo(() => {
    const paid = (orders as any[]).filter((o) => o.paymentStatus === PAYMENT_STATUS.PAID);
    return {
      paidCount: paid.length,
      revenue: paid.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
      earnings: paid.reduce((sum, o) => sum + Number(o.vendorEarnings || 0), 0),
    };
  }, [orders]);

  const visible = useMemo(() => {
    const list = orders as any[];
    switch (filter) {
      case 'paid':
        return list.filter((o) => o.paymentStatus === PAYMENT_STATUS.PAID);
      case 'whatsapp':
        return list.filter((o) => o.channel === ORDER_CHANNELS.WHATSAPP);
      case 'open':
        return list.filter(
          (o) =>
            ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(
              o.status,
            ),
        );
      default:
        return list;
    }
  }, [orders, filter]);

  if (isLoading) return <LoadingState label="Loading orders" />;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Orders" subtitle={`${(orders as any[]).length} total`} />

      <Screen
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refetch();
              setRefreshing(false);
            }}
          />
        }
      >
        <View className="flex-row gap-3">
          <StatCard label="Gross sales" value={formatCurrency(stats.revenue)} />
          <StatCard
            label="You earn"
            value={formatCurrency(stats.earnings)}
            hint="After commission"
            tone="dark"
          />
        </View>

        <View className="flex-row gap-2 flex-wrap">
          {FILTERS.map((entry) => (
            <TouchableOpacity
              key={entry.value}
              onPress={() => setFilter(entry.value)}
              className={`px-3.5 py-2 rounded-full ${
                filter === entry.value ? 'bg-gray-900' : 'bg-white border border-gray-100'
              }`}
            >
              <Text
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  filter === entry.value ? 'text-white' : 'text-gray-400'
                }`}
              >
                {entry.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Panel title={`${visible.length} order${visible.length === 1 ? '' : 's'}`}>
          {visible.length === 0 ? (
            <EmptyState
              icon={LucideShoppingBag}
              title="Nothing here"
              description="Orders appear the moment a customer pays or messages you."
            />
          ) : (
            visible.map((order: any) => {
              const isWhatsapp = order.channel === ORDER_CHANNELS.WHATSAPP;
              const isPaid = order.paymentStatus === PAYMENT_STATUS.PAID;

              return (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => router.push(`/seller/orders/${order.id}`)}
                  className="py-3.5 border-b border-gray-50"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 min-w-0">
                      <Text numberOfLines={1} className="text-sm font-black text-gray-900">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </Text>
                      <Text numberOfLines={1} className="text-[11px] text-gray-400 mt-0.5">
                        {order.customerName || 'Guest'} ·{' '}
                        {order.createdAt?.toLocaleDateString?.() || ''}
                      </Text>
                    </View>
                    <Text className="text-sm font-black text-gray-900">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2 mt-2.5">
                    <View
                      className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: isWhatsapp ? TONE.whatsapp.bg : TONE.positive.bg,
                      }}
                    >
                      {isWhatsapp ? (
                        <LucideMessageCircle size={10} color={TONE.whatsapp.fg} />
                      ) : (
                        <LucideCreditCard size={10} color={TONE.positive.fg} />
                      )}
                      <Text
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: isWhatsapp ? TONE.whatsapp.fg : TONE.positive.fg }}
                      >
                        {isWhatsapp ? 'WhatsApp' : isPaid ? 'Paid online' : 'Unpaid'}
                      </Text>
                    </View>

                    <Pill
                      tone={STATUS_TONES[order.status] || 'neutral'}
                      label={ORDER_STATUS_LABELS[order.status] || order.status || '—'}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </Panel>
      </Screen>
    </View>
  );
}
