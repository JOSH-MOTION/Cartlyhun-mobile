import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { getSellerProducts } from '@/utils/firebaseData';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  LucideChevronLeft, 
  LucideStore, 
  LucideTrendingUp, 
  LucidePackage, 
  LucideUsers, 
  LucidePlus,
  LucideSettings,
  LucideAlertCircle
} from 'lucide-react-native';

export default function SellerDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      getSellerProducts(user.uid).then(res => {
        setProducts(res);
        setLoading(false);
      });

      // Fetch global broadcast alert
      getDoc(doc(db, "settings", "seller_broadcast")).then(docSnap => {
        if (docSnap.exists() && docSnap.data().isActive) {
          setAnnouncement(docSnap.data());
        }
      }).catch(err => console.error("Error fetching mobile broadcast announcement:", err));
    }
  }, [user?.uid]);

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

          {/* Announcement Alert Banner */}
          {announcement && (
            <View className="bg-red-50 border border-red-100 p-5 rounded-[24px] mb-6 flex-row items-start">
              <View className="bg-red-500 p-2.5 rounded-xl mr-3 shadow-md shadow-red-200">
                <LucideAlertCircle size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-[8px] font-black text-red-600 uppercase tracking-wider mb-1">Global System Update</Text>
                <Text className="text-xs font-black text-gray-900 uppercase tracking-tight leading-tight mb-1">{announcement.title}</Text>
                <Text className="text-[10px] text-gray-600 font-semibold leading-relaxed">{announcement.message}</Text>
              </View>
            </View>
          )}

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
              <Text className="text-xl font-black text-gray-900 mt-1">{loading ? "..." : products.length}</Text>
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

        {/* Active Products List */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">My Products</Text>
            <Text className="text-[10px] font-black text-primary uppercase">{products.length} Items</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#fa8929" size="small" className="py-6" />
          ) : products.length === 0 ? (
            <View className="bg-white p-8 rounded-3xl border border-gray-100 items-center justify-center">
              <Text className="text-gray-400 font-bold uppercase text-xs">No products uploaded yet</Text>
            </View>
          ) : (
            <View className="gap-y-4">
              {products.map((item) => (
                <View key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex-row items-center justify-between shadow-sm">
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden mr-3">
                      {item.images?.[0] ? (
                        <Image source={{ uri: item.images[0] }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-gray-100">
                          <LucidePackage size={20} color="#cbd5e1" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-black text-gray-900 uppercase tracking-tight text-[11px]" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                        ₵{item.basePrice || item.price} • {item.totalStock || 0} in stock
                      </Text>
                    </View>
                  </View>
                  
                  {/* Action/View details */}
                  <TouchableOpacity 
                    onPress={() => router.push(`/product/${item.id}`)}
                    className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-primary font-black uppercase text-[8px] tracking-widest">Details</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
