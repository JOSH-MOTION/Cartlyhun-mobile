import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { 
  LucideChevronLeft, 
  LucideStore, 
  LucideTrendingUp, 
  LucidePackage, 
  LucideUsers, 
  LucidePlus,
  LucideSettings
} from 'lucide-react-native';

export default function SellerDashboard() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100 shadow-sm z-10">
        <View className="px-4 h-16 flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
          >
            <LucideChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-black text-gray-900 uppercase tracking-widest">Dashboard</Text>
          <TouchableOpacity 
            onPress={() => router.push('/store-setup')}
            className="w-10 h-10 items-center justify-center"
          >
            <LucideSettings size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Stats */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-2">{profile?.storeName || 'My Store'}</Text>
          <Text className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-6">Overview</Text>

          <View className="flex-row gap-4">
            <View className="flex-1 bg-primary/10 p-5 rounded-3xl border border-primary/20">
              <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mb-3">
                <LucideTrendingUp size={20} color="#2563eb" />
              </View>
              <Text className="text-[10px] font-black text-primary uppercase tracking-widest">Total Sales</Text>
              <Text className="text-xl font-black text-gray-900 mt-1">GH₵0.00</Text>
            </View>
            <View className="flex-1 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mb-3">
                <LucidePackage size={20} color="#0f172a" />
              </View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Items</Text>
              <Text className="text-xl font-black text-gray-900 mt-1">0</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4">Quick Actions</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/sell')}
            className="bg-primary p-6 rounded-3xl flex-row items-center justify-between mb-4 shadow-xl shadow-primary/20"
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 p-3 rounded-2xl mr-4">
                <LucidePlus size={24} color="#fff" />
              </View>
              <View>
                <Text className="text-white font-black uppercase tracking-widest">Add New Product</Text>
                <Text className="text-white/80 font-bold text-[10px] mt-1">List an item in your inventory</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-white p-6 rounded-3xl flex-row items-center justify-between border border-gray-100 shadow-sm"
          >
            <View className="flex-row items-center">
              <View className="bg-gray-50 p-3 rounded-2xl mr-4">
                <LucideUsers size={24} color="#0f172a" />
              </View>
              <View>
                <Text className="text-gray-900 font-black uppercase tracking-widest">Manage Orders</Text>
                <Text className="text-gray-400 font-bold text-[10px] mt-1">View and process customer orders</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
