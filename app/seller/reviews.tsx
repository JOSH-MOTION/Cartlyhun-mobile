import React, { useState } from 'react';
import { View, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LucideStar, LucideMessageSquare } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { getSeller, getSellerReviews } from '@/utils/firebaseData';
import {
  ScreenHeader,
  Screen,
  StatCard,
  Panel,
  EmptyState,
  LoadingState,
} from '@/components/seller/ui';

const Stars = ({ rating }: { rating: number }) => (
  <View className="flex-row gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <LucideStar
        key={star}
        size={12}
        color={star <= rating ? '#f59e0b' : '#e2e8f0'}
        fill={star <= rating ? '#f59e0b' : 'transparent'}
      />
    ))}
  </View>
);

export default function SellerReviews() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const seller = useQuery({
    queryKey: ['seller', 'profile', user?.uid],
    queryFn: () => getSeller(user!.uid),
    enabled: !!user?.uid,
  });

  const storeName = (seller.data as any)?.storeName;

  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['seller', 'reviews', storeName],
    queryFn: () => getSellerReviews(storeName),
    enabled: !!storeName,
  });

  if (seller.isLoading || isLoading) return <LoadingState label="Loading reviews" />;

  const list = reviews as any[];
  const average = list.length
    ? list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length
    : 0;
  const fiveStar = list.filter((r) => (r.rating || 0) >= 5).length;

  return (
    <View className="flex-1 bg-surface">
      <ScreenHeader title="Reviews" subtitle={storeName} />

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
          <StatCard
            label="Average rating"
            value={average > 0 ? average.toFixed(1) : '—'}
            hint={`${list.length} review${list.length === 1 ? '' : 's'}`}
            tone="dark"
          />
          <StatCard label="5-star" value={fiveStar} />
        </View>

        <Panel title="What customers say">
          {list.length === 0 ? (
            <EmptyState
              icon={LucideMessageSquare}
              title="No reviews yet"
              description="Reviews customers leave on your products show up here."
            />
          ) : (
            list.map((review) => (
              <View key={review.id} className="py-3 border-b border-gray-50 gap-1.5">
                <View className="flex-row items-center justify-between gap-3">
                  <Text numberOfLines={1} className="text-sm font-bold text-gray-900 flex-1">
                    {review.userName || review.customerName || 'Customer'}
                  </Text>
                  <Stars rating={review.rating || 0} />
                </View>

                {review.comment || review.message ? (
                  <Text className="text-[11px] text-gray-500 leading-relaxed">
                    {review.comment || review.message}
                  </Text>
                ) : null}

                <Text className="text-[10px] text-gray-300">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ''}
                </Text>
              </View>
            ))
          )}
        </Panel>
      </Screen>
    </View>
  );
}
