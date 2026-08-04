import React from 'react';
import { View, Text } from 'react-native';
import type { Pricing } from '@/utils/pricing';

/**
 * Price display for React Native.
 *
 * When an item is on sale the original is struck through and the payable
 * figure reads first, matching the web storefront.
 */
const SIZES = {
  sm: { price: 'text-sm', compare: 'text-[10px]', badge: 'text-[8px]' },
  md: { price: 'text-lg', compare: 'text-xs', badge: 'text-[9px]' },
  lg: { price: 'text-3xl', compare: 'text-sm', badge: 'text-[10px]' },
} as const;

export default function Price({
  pricing,
  size = 'md',
  showBadge = true,
}: {
  pricing: Pricing;
  size?: keyof typeof SIZES;
  showBadge?: boolean;
}) {
  const scale = SIZES[size] || SIZES.md;

  if (!pricing?.isDiscounted) {
    return (
      <Text className={`font-black text-gray-900 ${scale.price}`}>
        ₵{Number(pricing?.price || 0).toLocaleString()}
      </Text>
    );
  }

  return (
    <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1">
      <Text className={`font-black ${scale.price}`} style={{ color: '#dc2626' }}>
        ₵{pricing.price.toLocaleString()}
      </Text>

      <Text
        className={`font-bold text-gray-400 line-through ${scale.compare}`}
        style={{ textDecorationLine: 'line-through' }}
      >
        ₵{pricing.compareAtPrice!.toLocaleString()}
      </Text>

      {showBadge ? (
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fef2f2' }}>
          <Text
            className={`font-black uppercase tracking-widest ${scale.badge}`}
            style={{ color: '#dc2626' }}
          >
            -{pricing.percentOff}%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Corner badge for product cards. */
export const DiscountBadge = ({ pricing }: { pricing: Pricing }) => {
  if (!pricing?.isDiscounted) return null;

  return (
    <View
      className="absolute top-2 left-2 px-2 py-1 rounded-full z-10"
      style={{ backgroundColor: '#dc2626' }}
    >
      <Text className="text-[9px] font-black uppercase tracking-widest text-white">
        -{pricing.percentOff}%
      </Text>
    </View>
  );
};
