import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LucidePackage, LucidePlus, LucideChevronRight } from 'lucide-react-native';
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

export default function SellerProducts() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['seller', 'products', user?.uid],
    queryFn: () => getSellerProducts(user?.uid),
    enabled: !!user?.uid,
  });

  if (isLoading) return <LoadingState label="Loading products" />;

  const list = products as any[];
  const active = list.filter((p) => p.isActive !== false).length;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader
        title="Products"
        subtitle={`${list.length} listed`}
        right={
          <TouchableOpacity onPress={() => router.push('/(tabs)/sell')}>
            <LucidePlus size={20} color="#0f172a" />
          </TouchableOpacity>
        }
      />

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
          <StatCard label="Listed" value={list.length} />
          <StatCard label="Active" value={active} hint={`${list.length - active} inactive`} />
        </View>

        <Panel title="Your catalogue">
          {list.length === 0 ? (
            <EmptyState
              icon={LucidePackage}
              title="No products yet"
              description="List your first product to start selling."
              action={
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/sell')}
                  className="flex-row items-center gap-2 bg-gray-900 px-5 py-3 rounded-xl mt-2"
                >
                  <LucidePlus size={14} color="#ffffff" />
                  <Text className="text-white text-[10px] font-black uppercase tracking-widest">
                    Add product
                  </Text>
                </TouchableOpacity>
              }
            />
          ) : (
            list.map((product) => (
              <TouchableOpacity
                key={product.id}
                onPress={() => router.push(`/product/${product.id}`)}
                className="flex-row items-center gap-3 py-3 border-b border-gray-50"
              >
                <View className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden">
                  {product.images?.[0] ? (
                    <Image
                      source={{ uri: product.images[0] }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : null}
                </View>

                <View className="flex-1 min-w-0">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900">
                    {product.name}
                  </Text>
                  <Text className="text-[11px] text-gray-400 mt-0.5">
                    {formatCurrency(product.basePrice || product.price || 0)}
                  </Text>
                  <View className="mt-1.5">
                    <Pill
                      tone={product.isActive !== false ? 'positive' : 'neutral'}
                      label={product.isActive !== false ? 'Active' : 'Inactive'}
                    />
                  </View>
                </View>

                <LucideChevronRight size={16} color="#cbd5e1" />
              </TouchableOpacity>
            ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}
