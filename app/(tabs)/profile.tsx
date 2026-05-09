import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import { 
  LucideUser, 
  LucideMail, 
  LucideLogOut, 
  LucideCalendar, 
  LucideShield, 
  LucideChevronRight,
  LucideShoppingBag,
  LucideHeart,
  LucideSettings
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-8">
        <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6 border border-gray-100">
          <LucideUser size={40} color="#fa8929" />
        </View>
        <Text className="text-2xl font-black text-gray-900 mb-2">Welcome to CartlyHub</Text>
        <Text className="text-center text-gray-500 font-medium mb-8">
          Sign in to track your orders, save items to your wishlist, and manage your boutique.
        </Text>
        <TouchableOpacity 
          className="w-full bg-primary h-16 rounded-2xl items-center justify-center mb-4"
          onPress={() => router.push('/auth/signin')}
        >
          <Text className="text-white font-black uppercase tracking-widest">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-full bg-gray-50 border border-gray-100 h-16 rounded-2xl items-center justify-center"
          onPress={() => router.push('/auth/signup')}
        >
          <Text className="text-gray-900 font-black uppercase tracking-widest">Create Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-8 pt-4 pb-6 flex-row justify-between items-end">
          <View>
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-[2px] mb-1">Account</Text>
            <Text className="text-3xl font-black text-gray-900">Profile</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSignOut}
            className="p-3 bg-red-500/10 rounded-2xl"
          >
            <LucideLogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header Card */}
        <View className="bg-gray-50 mx-6 mt-6 p-8 rounded-[40px] border border-gray-100 items-center shadow-2xl">
          <View className="w-24 h-24 bg-white rounded-full overflow-hidden mb-4 border-4 border-primary/20 shadow-sm">
            {profile?.photoURL ? (
              <Image source={{ uri: profile.photoURL }} className="w-full h-full" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <LucideUser size={40} color="#333" />
              </View>
            )}
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-1">{profile?.name || "Premium User"}</Text>
          <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest">{user.email}</Text>
          
          <View className="flex-row gap-4 mt-6">
            <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Text className="text-primary font-black text-[10px] uppercase">{profile?.role || "CUSTOMER"}</Text>
            </View>
            <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Text className="text-primary font-black text-[10px] uppercase">VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-4 ml-2">Quick Actions</Text>
          <View className="bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100">
            <TouchableOpacity 
              onPress={() => router.push('/account/orders')}
              className="flex-row items-center p-6 border-b border-white/5"
            >
              <View className="p-3 bg-white rounded-xl mr-4 border border-gray-100">
                <LucideShoppingBag size={20} color="#fa8929" />
              </View>
              <Text className="flex-1 font-black text-gray-900 uppercase tracking-tight">My Orders</Text>
              <LucideChevronRight size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-6 border-b border-white/5">
              <View className="p-3 bg-white rounded-xl mr-4 border border-gray-100">
                <LucideHeart size={20} color="#fa8929" />
              </View>
              <Text className="flex-1 font-black text-gray-900 uppercase tracking-tight">Wishlist</Text>
              <LucideChevronRight size={20} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-6">
              <View className="p-3 bg-white rounded-xl mr-4 border border-gray-100">
                <LucideSettings size={20} color="#fa8929" />
              </View>
              <Text className="flex-1 font-black text-gray-900 uppercase tracking-tight">Settings</Text>
              <LucideChevronRight size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Info */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-4 ml-2">Account Info</Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="bg-gray-50 flex-1 p-6 rounded-3xl border border-gray-100">
              <LucideCalendar size={18} color="#fa8929" />
              <Text className="text-[9px] font-black text-gray-500 uppercase mt-3 mb-1">Joined</Text>
              <Text className="font-bold text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2024'}
              </Text>
            </View>
            <View className="bg-gray-50 flex-1 p-6 rounded-3xl border border-gray-100">
              <LucideShield size={18} color="#fa8929" />
              <Text className="text-[9px] font-black text-gray-500 uppercase mt-3 mb-1">Status</Text>
              <Text className="font-bold text-primary">Active</Text>
            </View>
          </View>
        </View>

        {/* Seller Entry Point */}
        {profile?.role === 'seller' ? (
          <TouchableOpacity className="mx-6 mt-8 bg-primary p-8 rounded-[40px] shadow-2xl shadow-primary/20">
            <Text className="text-background/70 font-black text-[10px] uppercase tracking-widest mb-2">Boutique Owner</Text>
            <Text className="text-white font-black text-2xl mb-4">Go to Seller Dashboard</Text>
            <View className="flex-row items-center">
              <Text className="text-background font-bold">Manage your products and orders</Text>
              <LucideChevronRight size={18} color="#ffffff" className="ml-2" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => router.push('/store-setup')}
            className="mx-6 mt-8 bg-primary p-8 rounded-[40px] shadow-2xl shadow-primary/20"
          >
            <Text className="text-background/70 font-black text-[10px] uppercase tracking-widest mb-2">Sell on CartlyHub</Text>
            <Text className="text-white font-black text-2xl mb-4">Start Selling Today</Text>
            <View className="flex-row items-center">
              <Text className="text-background font-bold">Create your boutique and list items</Text>
              <LucideChevronRight size={18} color="#ffffff" className="ml-2" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
