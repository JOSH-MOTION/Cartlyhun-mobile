import React, { useMemo, useState } from 'react';
import { View, Text, Image, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LucideBoxes } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getSellerProducts } from '@/utils/firebaseData';
import { formatCurrency } from '@/constants/marketplace';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  Pill,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

const LOW_STOCK_THRESHOLD = 5;

/**
 * Stock per variant. Paid orders reduce these numbers automatically on the
 * server, so this is the vendor's early warning for anything running out.
 */
export default function SellerInventory() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['seller', 'products', user?.uid],
    queryFn: () => getSellerProducts(user?.uid),
    enabled: !!user?.uid,
  });

  const rows = useMemo(
    () =>
      (products as any[]).flatMap((product) =>
        (product.variants || []).map((variant: any, index: number) => ({
          key: `${product.id}-${variant.id || index}`,
          productName: product.name,
          image: variant.images?.[0] || product.images?.[0] || null,
          size: variant.size || null,
          color: variant.colorName || variant.color || null,
          price: Number(variant.price || product.basePrice || 0),
          stock: Number(variant.stock ?? 0),
        })),
      ),
    [products],
  );

  if (isLoading) return <LoadingState label="Loading inventory" />;

  const outOfStock = rows.filter((r) => r.stock <= 0).length;
  const lowStock = rows.filter((r) => r.stock > 0 && r.stock <= LOW_STOCK_THRESHOLD).length;
  const stockValue = rows.reduce((sum, r) => sum + r.price * r.stock, 0);

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Inventory" subtitle={`${rows.length} variants`} />

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
          <StatCard label="Low stock" value={lowStock} hint={`${LOW_STOCK_THRESHOLD} or fewer`} />
          <StatCard label="Out of stock" value={outOfStock} />
        </View>

        <StatCard label="Stock value" value={formatCurrency(stockValue)} tone="dark" />

        <Panel title="Stock levels">
          {rows.length === 0 ? (
            <EmptyState
              icon={LucideBoxes}
              title="Nothing in stock yet"
              description="Add a product with sizes and colours to start tracking stock."
            />
          ) : (
            rows
              .slice()
              .sort((a, b) => a.stock - b.stock)
              .map((row) => (
                <View
                  key={row.key}
                  className="flex-row items-center gap-3 py-3 border-b border-gray-50"
                >
                  <View className="w-10 h-12 rounded-lg bg-gray-100 overflow-hidden">
                    {row.image ? (
                      <Image
                        source={{ uri: row.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : null}
                  </View>

                  <View className="flex-1 min-w-0">
                    <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                      {row.productName}
                    </Text>
                    <Text className="text-[11px] text-gray-400 mt-0.5">
                      {[row.size, row.color].filter(Boolean).join(' · ') || 'One option'} ·{' '}
                      {formatCurrency(row.price)}
                    </Text>
                  </View>

                  <View className="items-end gap-1">
                    <Text className="text-sm font-black text-gray-900">{row.stock}</Text>
                    <Pill
                      tone={
                        row.stock <= 0
                          ? 'danger'
                          : row.stock <= LOW_STOCK_THRESHOLD
                            ? 'warning'
                            : 'positive'
                      }
                      label={
                        row.stock <= 0 ? 'Out' : row.stock <= LOW_STOCK_THRESHOLD ? 'Low' : 'OK'
                      }
                    />
                  </View>
                </View>
              ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}
