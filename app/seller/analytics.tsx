import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LucideBarChart3, LucideTrophy } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getVendorOrders } from '@/utils/marketplaceData';
import { formatCurrency, ORDER_CHANNELS, PAYMENT_STATUS } from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Sales performance, derived from this vendor's paid orders. */
export default function SellerAnalytics() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller', 'orders', user?.uid],
    queryFn: () => getVendorOrders(user?.uid),
    enabled: !!user?.uid,
  });

  const analytics = useMemo(() => {
    const list = orders as any[];
    const paid = list.filter((o) => o.paymentStatus === PAYMENT_STATUS.PAID);

    const months = new Map<string, number>();
    for (const order of paid) {
      const key = monthKey(order.createdAt);
      months.set(key, (months.get(key) || 0) + Number(order.totalAmount || 0));
    }

    const products = new Map<string, { name: string; units: number; revenue: number }>();
    for (const order of paid) {
      for (const item of order.items || []) {
        const entry = products.get(item.productId) || {
          name: item.productName,
          units: 0,
          revenue: 0,
        };
        entry.units += Number(item.quantity || 0);
        entry.revenue += Number(item.lineTotal || item.price * item.quantity || 0);
        products.set(item.productId, entry);
      }
    }

    const revenue = paid.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    return {
      revenue,
      earnings: paid.reduce((sum, o) => sum + Number(o.vendorEarnings || 0), 0),
      commission: paid.reduce((sum, o) => sum + Number(o.commissionAmount || 0), 0),
      averageOrder: paid.length ? revenue / paid.length : 0,
      onlineCount: list.filter((o) => o.channel === ORDER_CHANNELS.ONLINE).length,
      whatsappCount: list.filter((o) => o.channel === ORDER_CHANNELS.WHATSAPP).length,
      total: list.length,
      months: Array.from(months.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6),
      topProducts: Array.from(products.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5),
    };
  }, [orders]);

  if (isLoading) return <LoadingState label="Crunching your numbers" />;

  const peak = Math.max(...analytics.months.map(([, value]) => value), 1);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Analytics" subtitle="Paid orders only" />

      <Screen>
        <View className="flex-row gap-3">
          <StatCard label="Gross sales" value={formatCurrency(analytics.revenue)} />
          <StatCard
            label="You earned"
            value={formatCurrency(analytics.earnings)}
            hint="After commission"
            tone="dark"
          />
        </View>

        <View className="flex-row gap-3">
          <StatCard label="Commission paid" value={formatCurrency(analytics.commission)} />
          <StatCard label="Average order" value={formatCurrency(analytics.averageOrder)} />
        </View>

        <Panel title="Last 6 months">
          {analytics.months.length === 0 ? (
            <EmptyState
              icon={LucideBarChart3}
              title="Not enough data yet"
              description="Your monthly trend appears once you have paid orders."
            />
          ) : (
            <View className="flex-row items-end justify-between gap-2 h-40">
              {analytics.months.map(([month, value]) => (
                <View key={month} className="flex-1 items-center gap-2">
                  <Text className="text-[9px] font-bold text-gray-400">
                    {Math.round(value)}
                  </Text>
                  <View
                    className="w-full bg-gray-900 rounded-t-lg"
                    style={{ height: Math.max(4, (value / peak) * 100) }}
                  />
                  <Text className="text-[9px] font-bold text-gray-400 uppercase">
                    {month.slice(5)}/{month.slice(2, 4)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Panel>

        <Panel title="Order channels">
          <ChannelBar
            label="Online payments"
            count={analytics.onlineCount}
            total={analytics.total}
            color="#0f172a"
          />
          <View className="h-4" />
          <ChannelBar
            label="WhatsApp orders"
            count={analytics.whatsappCount}
            total={analytics.total}
            color="#25D366"
          />
        </Panel>

        <Panel title="Best sellers">
          {analytics.topProducts.length === 0 ? (
            <EmptyState icon={LucideTrophy} title="No sales yet" />
          ) : (
            analytics.topProducts.map((product) => (
              <View
                key={product.name}
                className="flex-row items-center justify-between gap-3 py-3 border-b border-gray-50"
              >
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {product.name}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {product.units} sold
                  </Text>
                </View>
                <Text className="text-sm font-black text-gray-900">
                  {formatCurrency(product.revenue)}
                </Text>
              </View>
            ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}

const ChannelBar = ({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) => {
  const share = total ? Math.round((count / total) * 100) : 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </Text>
        <Text className="text-[10px] font-bold text-gray-900">
          {count} · {share}%
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${share}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
};
