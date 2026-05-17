import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useWishlist from '@/store/useWishlist';
import { 
  LucideHeart, 
  LucideChevronRight, 
  LucideTrash2, 
  LucideShoppingBag, 
  LucideSearch,
  LucideArrowRight,
  LucideSparkles
} from 'lucide-react-native';
import { useProducts } from '@/hooks/useProducts';

const { width } = Dimensions.get('window');

export default function WishlistScreen() {
  const { items, toggleWishlist } = useWishlist();
  const { data: allProducts, isLoading } = useProducts();
  const router = useRouter();

  // Filter products that are in the wishlist
  const wishlistItems = allProducts?.filter(p => items?.includes(p.id)) || [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#fa8929" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-8 pt-4 pb-6 flex-row justify-between items-end">
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[4px] mb-1">My Collection</Text>
            <Text className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Wishlist</Text>
          </View>
          <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-primary font-black text-[10px] uppercase">{wishlistItems.length} Items</Text>
          </View>
        </View>
      </SafeAreaView>

      {wishlistItems.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 bg-gray-50 rounded-[40px] items-center justify-center mb-8 border border-gray-100 shadow-sm">
            <LucideHeart size={40} color="#cbd5e1" />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Your Bag is Empty</Text>
          <Text className="text-center text-gray-400 font-medium mb-10 leading-6 px-4">
            Items you save will appear here. Start exploring our premium collection to find something you love.
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)')}
            className="bg-primary px-10 h-16 rounded-[24px] items-center justify-center flex-row shadow-xl shadow-primary/20"
          >
            <LucideSearch size={18} color="#fff" />
            <Text className="text-white font-black uppercase tracking-widest text-xs ml-3">Explore Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8 flex-row items-center">
              <View className="p-3 bg-white rounded-2xl mr-4 shadow-sm">
                <LucideSparkles size={20} color="#fa8929" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Premium Curator</Text>
                <Text className="text-gray-500 font-medium text-xs">Your personal selection of Ghana's finest.</Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => router.push(`/product/${item.id}`)}
              className="flex-row items-center mb-6 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm"
            >
              <View className="relative">
                <Image 
                  source={{ uri: item.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-24 h-24 rounded-[24px] bg-gray-50"
                />
                {item.isFeatured && (
                  <View className="absolute top-2 left-2 bg-primary px-2 py-1 rounded-lg">
                    <Text className="text-[8px] font-black text-white uppercase">TOP</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1 ml-5">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1" numberOfLines={1}>
                  {item.categoryId || item.category}
                </Text>
                <Text className="text-lg font-black text-gray-900 mb-1 tracking-tight uppercase" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-primary font-black text-sm">₵{Number(item.basePrice || item.price).toLocaleString()}</Text>
                
                <View className="flex-row items-center mt-3">
                   <View className="bg-gray-50 px-3 py-1 rounded-full flex-row items-center">
                     <LucideArrowRight size={10} color="#64748b" />
                     <Text className="ml-2 text-gray-500 font-bold text-[9px] uppercase">Details</Text>
                   </View>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => toggleWishlist(item.id)}
                className="p-3 bg-red-50 rounded-2xl border border-red-100"
              >
                <LucideTrash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
