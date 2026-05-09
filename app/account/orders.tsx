import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '@/utils/firebaseData';
import { LucideChevronLeft, LucideBox, LucideChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function OrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.uid],
    queryFn: () => getUserOrders(user?.uid),
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-8 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 bg-surface rounded-2xl mr-4 border border-white/5"
          >
            <LucideChevronLeft size={20} color="#d4af37" />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-bold text-muted uppercase tracking-[2px] mb-1">Purchase History</Text>
            <Text className="text-3xl font-black text-white">My Orders</Text>
          </View>
        </View>
      </SafeAreaView>

      {orders?.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6 border border-white/5">
            <LucideBox size={32} color="#444" />
          </View>
          <Text className="text-xl font-black text-white mb-2">No Orders Yet</Text>
          <Text className="text-center text-muted font-medium">When you buy items, they will appear here for tracking.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="bg-surface p-6 rounded-[32px] mb-6 border border-white/5 shadow-2xl">
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Order ID</Text>
                  <Text className="font-bold text-white">#{item.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  <Text className="text-primary font-black text-[10px] uppercase">{item.status || 'PROCESSING'}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-6">
                <Image 
                  source={{ uri: item.items?.[0]?.product?.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-16 h-16 rounded-2xl bg-background"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-black text-white" numberOfLines={1}>
                    {item.items?.[0]?.product?.name || 'Multiple Items'}
                  </Text>
                  <Text className="text-muted text-xs font-bold uppercase mt-1">
                    {item.items?.length || 1} item(s) • <Text className="text-primary font-black">₵{item.totalAmount}</Text>
                  </Text>
                </View>
                <TouchableOpacity className="p-3 bg-background rounded-xl border border-white/5">
                  <LucideChevronRight size={18} color="#444" />
                </TouchableOpacity>
              </View>

              <View className="h-[1px] bg-white/5 w-full mb-6" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[10px] font-black text-muted uppercase tracking-widest">
                  Ordered {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-xs uppercase">Track Delivery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
