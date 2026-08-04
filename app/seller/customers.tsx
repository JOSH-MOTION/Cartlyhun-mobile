import React, { useState } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LucideUsers, LucidePhone, LucideMail } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getVendorCustomers } from '@/utils/marketplaceData';
import { formatCurrency } from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

/** People who have ordered from this store, ranked by spend. */
export default function SellerCustomers() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['seller', 'customers', user?.uid],
    queryFn: () => getVendorCustomers(user?.uid),
    enabled: !!user?.uid,
  });

  if (isLoading) return <LoadingState label="Loading customers" />;

  const list = customers as any[];
  const repeat = list.filter((c) => c.orderCount > 1).length;
  const totalSpend = list.reduce((sum, c) => sum + c.totalSpend, 0);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Customers" subtitle={`${list.length} total`} />

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
          <StatCard label="Repeat buyers" value={repeat} />
          <StatCard label="Total spend" value={formatCurrency(totalSpend)} tone="dark" />
        </View>

        <Panel title="Customer list">
          {list.length === 0 ? (
            <EmptyState
              icon={LucideUsers}
              title="No customers yet"
              description="Anyone who orders from your store appears here automatically."
            />
          ) : (
            list.map((customer) => (
              <View
                key={customer.id}
                className="flex-row items-start justify-between gap-3 py-3 border-b border-gray-50"
              >
                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {customer.name}
                  </Text>
                  {customer.phone ? (
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <LucidePhone size={10} color="#cbd5e1" />
                      <Text className="text-[11px] text-gray-400">{customer.phone}</Text>
                    </View>
                  ) : null}
                  {customer.email ? (
                    <View className="flex-row items-center gap-1.5 mt-0.5">
                      <LucideMail size={10} color="#cbd5e1" />
                      <Text numberOfLines={1} className="text-[11px] text-gray-400">
                        {customer.email}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="items-end">
                  <Text className="text-sm font-black text-gray-900">
                    {formatCurrency(customer.totalSpend)}
                  </Text>
                  <Text className="text-[10px] text-gray-400 mt-0.5">
                    {customer.orderCount} order{customer.orderCount === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}
