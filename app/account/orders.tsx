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
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-8 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 bg-slate-50 rounded-2xl mr-4"
          >
            <LucideChevronLeft size={20} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-bold text-gray-400 uppercase tracking-[2px] mb-1">Purchase History</Text>
            <Text className="text-3xl font-black text-black">My Orders</Text>
          </View>
        </View>
      </SafeAreaView>

      {orders?.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
            <LucideBox size={32} color="#cbd5e1" />
          </View>
          <Text className="text-xl font-black text-slate-800 mb-2">No Orders Yet</Text>
          <Text className="text-center text-slate-400 font-medium">When you buy items, they will appear here for tracking.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-white">
              <View className="flex-row justify-between items-start mb-6">
                <View>
                  <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Order ID</Text>
                  <Text className="font-bold text-slate-800">#{item.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View className="bg-blue-50 px-4 py-2 rounded-full">
                  <Text className="text-blue-600 font-black text-[10px] uppercase">{item.status || 'PROCESSING'}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-6">
                <Image 
                  source={{ uri: item.items?.[0]?.product?.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-16 h-16 rounded-2xl bg-slate-100"
                />
                <View className="flex-1 ml-4">
                  <Text className="font-black text-slate-900" numberOfLines={1}>
                    {item.items?.[0]?.product?.name || 'Multiple Items'}
                  </Text>
                  <Text className="text-slate-400 text-xs font-bold uppercase mt-1">
                    {item.items?.length || 1} item(s) • ₵{item.totalAmount}
                  </Text>
                </View>
                <TouchableOpacity className="p-3 bg-slate-50 rounded-xl">
                  <LucideChevronRight size={18} color="#cbd5e1" />
                </TouchableOpacity>
              </View>

              <View className="h-[1px] bg-slate-50 w-full mb-6" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Ordered {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity>
                  <Text className="text-blue-500 font-bold text-xs uppercase">Track Delivery</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
