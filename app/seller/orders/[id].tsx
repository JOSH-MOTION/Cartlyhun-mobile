import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  LucideUser,
  LucideMapPin,
  LucideMessageCircle,
  LucideCreditCard,
} from 'lucide-react-native';
import { apiFetch } from '@/lib/api';
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
  LoadingState,
  EmptyState,
} from '@/components/seller/ui';

/** Statuses a vendor can set, in the order they normally happen. */
const VENDOR_ACTIONS = [
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

export default function SellerOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/orders/${id}`)
      .then((data: any) => !cancelled && setOrder(data.order))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateStatus = async (status: string) => {
    setSaving(status);
    try {
      await apiFetch(`/api/orders/${id}`, { method: 'PATCH', body: { status } });
      setOrder((current: any) => ({ ...current, status }));
      Alert.alert('Updated', `Order marked ${ORDER_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (e: any) {
      Alert.alert('Could not update', e.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingState label="Loading order" />;

  if (error || !order) {
    return (
      <View className="flex-1 bg-surface">
        <ScreenHeader title="Order" />
        <EmptyState title="Order not found" description={error || undefined} />
      </View>
    );
  }

  const isPaid = order.paymentStatus === PAYMENT_STATUS.PAID;
  const isWhatsapp = order.channel === ORDER_CHANNELS.WHATSAPP;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title={order.orderNumber || 'Order'}
        subtitle={order.createdAt ? new Date(order.createdAt).toLocaleString() : undefined}
      />

      <Screen>
        <View className="flex-row gap-2 flex-wrap">
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: isWhatsapp ? '#dcfce7' : '#ecfdf5' }}
          >
            {isWhatsapp ? (
              <LucideMessageCircle size={10} color="#128C7E" />
            ) : (
              <LucideCreditCard size={10} color="#059669" />
            )}
            <Text
              className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: isWhatsapp ? '#128C7E' : '#059669' }}
            >
              {isWhatsapp ? 'WhatsApp order' : 'Online order'}
            </Text>
          </View>
          <Pill tone={isPaid ? 'positive' : 'warning'} label={isPaid ? 'Paid' : 'Unpaid'} />
          <Pill tone="dark" label={ORDER_STATUS_LABELS[order.status] || order.status} />
        </View>

        <View className="flex-row gap-3">
          <StatCard label="Order total" value={formatCurrency(order.totalAmount, order.currency)} />
          <StatCard
            label={`Commission ${order.commissionRate || 0}%`}
            value={formatCurrency(order.commissionAmount, order.currency)}
          />
        </View>

        <StatCard
          label="Your earnings"
          value={formatCurrency(order.vendorEarnings, order.currency)}
          hint={order.walletCredited ? 'Credited to your wallet' : 'Credited once paid'}
          tone="dark"
        />

        <Panel title="Items">
          {(order.items || []).map((item: any, index: number) => (
            <View
              key={`${item.productId}-${index}`}
              className="flex-row items-center justify-between gap-3 py-2.5 border-b border-gray-50"
            >
              <View className="flex-row items-center gap-3 flex-1 min-w-0">
                <View className="w-11 h-14 rounded-lg bg-gray-100 overflow-hidden">
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {item.productName}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    Qty {item.quantity}
                    {item.variantInfo?.size ? ` · ${item.variantInfo.size}` : ''}
                    {item.variantInfo?.color ? ` · ${item.variantInfo.color}` : ''}
                  </Text>
                </View>
              </View>
              <Text className="text-sm font-black text-gray-900">
                {formatCurrency(item.lineTotal ?? item.price * item.quantity, order.currency)}
              </Text>
            </View>
          ))}
        </Panel>

        <Panel title="Customer">
          <View className="flex-row gap-3 mb-3">
            <LucideUser size={14} color="#cbd5e1" />
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900">
                {order.customerName || 'Guest'}
              </Text>
              <Text className="text-[11px] text-gray-400 mt-0.5">
                {order.customerPhone || 'No phone'}
              </Text>
              <Text className="text-[11px] text-gray-400">
                {order.customerEmail || 'No email'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <LucideMapPin size={14} color="#cbd5e1" />
            <Text className="flex-1 text-[11px] text-gray-500 leading-relaxed">
              {[order.deliveryAddress?.details, order.deliveryAddress?.city]
                .filter(Boolean)
                .join(', ') || 'No address supplied'}
            </Text>
          </View>
        </Panel>

        <Panel title="Update status">
          <View className="flex-row flex-wrap -m-1">
            {VENDOR_ACTIONS.map((status) => {
              const isCurrent = order.status === status;
              const isCancel = status === ORDER_STATUS.CANCELLED;

              return (
                <View key={status} className="w-1/2 p-1">
                  <TouchableOpacity
                    disabled={isCurrent || saving === status}
                    onPress={() => updateStatus(status)}
                    className={`py-3.5 rounded-xl items-center ${
                      isCurrent ? 'bg-gray-100' : isCancel ? 'bg-red-50' : 'bg-gray-900'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isCurrent ? 'text-gray-400' : isCancel ? 'text-red-600' : 'text-white'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <Text className="text-[10px] text-gray-400 mt-3 leading-relaxed">
            The customer is notified in the app each time you change this.
          </Text>
        </Panel>
      </Screen>
    </View>
  );
}
