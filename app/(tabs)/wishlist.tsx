import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useWishlist from '@/store/useWishlist';
import { LucideHeart, LucideShoppingBag, LucideChevronRight, LucideTrash2 } from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';
import useCart from '@/store/useCart';

export default function WishlistScreen() {
  const { items, toggleWishlist } = useWishlist();
  const { data: allProducts } = useProducts();
  const { addItem } = useCart();

  // Filter products that are in the wishlist
  const wishlistItems = allProducts?.filter(p => items?.includes(p.id)) || [];

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-8 pt-4 pb-6 border-b border-white/5">
          <Text className="text-sm font-bold text-muted uppercase tracking-[2px] mb-1">Your Collection</Text>
          <Text className="text-3xl font-black text-white">Wishlist</Text>
        </View>
      </SafeAreaView>

      {wishlistItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-white/5">
            <LucideHeart size={40} color="#333" />
          </View>
          <Text className="text-xl font-bold text-white mb-2">No Favorites</Text>
          <Text className="text-center text-muted font-medium">Save items you love to see them here later.</Text>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9}
              className="flex-row items-center mb-6 bg-surface p-5 rounded-[32px] border border-white/5 shadow-2xl"
            >
              <Image 
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} 
                className="w-24 h-24 rounded-3xl bg-background"
              />
              <View className="flex-1 ml-5">
                <Text className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                  {item.category}
                </Text>
                <Text className="text-lg font-black text-white mb-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-primary font-bold mb-3">₵{item.basePrice || item.price}</Text>
                
                <View className="flex-row items-center">
                   <TouchableOpacity 
                     onPress={() => {
                       const variant = item.variants?.[0] || { id: 'default', price: item.basePrice || item.price };
                       addItem(item, variant, 1, {});
                     }}
                     className="bg-primary px-4 py-2 rounded-xl flex-row items-center"
                   >
                     <LucideShoppingBag size={14} color="#121212" />
                     <Text className="ml-2 text-background font-bold text-xs">ADD TO CART</Text>
                   </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => toggleWishlist(item.id)}
                className="p-3 bg-red-500/10 rounded-2xl"
              >
                <LucideTrash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
