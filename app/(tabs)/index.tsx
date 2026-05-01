import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '@/hooks/useProducts';
import { useRouter } from 'expo-router';
import { LucideShoppingBag, LucideSearch, LucideMapPin, LucideBell, LucidePlusCircle, LucideHeart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import useWishlist from '@/store/useWishlist';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: '🔥' },
  { id: 'fashion', name: 'Fashion', icon: '👗' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '💄' },
];

export default function HomeScreen() {
  const { data: products, isLoading, refetch } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      {/* Background Gradient Effect (Simulated) */}
      <View className="absolute top-0 left-0 right-0 h-96 bg-white" />

      {/* Glossy Header Overlay */}
      <BlurView intensity={90} tint="light" style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View className="px-6 pb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Image 
                  source={require('@/assets/images/logo.png')} 
                  style={{ width: 120, height: 40 }}
                  resizeMode="contain"
                  className="-ml-2"
                />
                <View className="flex-row items-center mt-1">
                  <Text className="text-2xl font-black text-black">Explore</Text>
                  <View className="ml-2 w-2 h-2 rounded-full bg-blue-500" />
                </View>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <LucideBell size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Pill */}
            <View className="flex-row items-center mb-4">
              <LucideMapPin size={14} color="#3b82f6" />
              <Text className="ml-1 text-sm font-semibold text-blue-500">Accra, Ghana</Text>
            </View>

            {/* Futuristic Search Bar */}
            <TouchableOpacity 
              activeOpacity={0.9}
              className="flex-row items-center bg-gray-100/80 p-4 rounded-3xl border border-white"
            >
              <LucideSearch size={20} color="#64748b" />
              <Text className="ml-3 text-slate-400 font-medium">Search the marketplace...</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Main Content */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingTop: 200, paddingBottom: 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListHeaderComponent={() => (
          <View className="mb-6">
            <Text className="text-xl font-black text-black mb-4">Top Categories</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              renderItem={({ item }) => (
                <TouchableOpacity className="mr-3 bg-white px-5 py-3 rounded-2xl flex-row items-center shadow-sm border border-gray-100">
                  <Text className="text-lg mr-2">{item.icon}</Text>
                  <Text className="font-bold text-slate-700">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Text className="text-xl font-black text-black mt-8 mb-4">Recommended for You</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white rounded-[32px] mb-6 w-[48%] shadow-xl shadow-slate-200/50 overflow-hidden border border-white"
            activeOpacity={0.8}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <View className="relative">
              <Image 
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }} 
                className="w-full h-56"
                resizeMode="cover"
              />
              <BlurView intensity={30} tint="dark" className="absolute top-3 right-3 px-3 py-1 rounded-full overflow-hidden">
                <Text className="text-white text-xs font-bold">₵{item.basePrice || item.price}</Text>
              </BlurView>
              <TouchableOpacity 
                onPress={() => toggleWishlist(item.id)}
                className="absolute top-3 left-3 p-2 bg-white/20 rounded-full"
              >
                <LucideHeart size={16} color={isInWishlist(item.id) ? '#ef4444' : '#fff'} fill={isInWishlist(item.id) ? '#ef4444' : 'transparent'} />
              </TouchableOpacity>
            </View>
            <View className="p-4">
              <Text className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
                {item.category}
              </Text>
              <Text className="text-sm font-bold text-slate-800 mb-2" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-[10px] text-slate-400 font-bold">NEW</Text>
                </View>
                <TouchableOpacity className="bg-slate-100 p-2 rounded-full">
                  <LucidePlusCircle size={14} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  }
});
