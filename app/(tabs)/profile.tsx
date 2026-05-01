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
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-8">
        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
          <LucideUser size={40} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-black text-slate-900 mb-2">Welcome to CartlyHub</Text>
        <Text className="text-center text-slate-400 font-medium mb-8">
          Sign in to track your orders, save items to your wishlist, and manage your boutique.
        </Text>
        <TouchableOpacity 
          className="w-full bg-black h-16 rounded-2xl items-center justify-center mb-4"
          onPress={() => router.push('/auth/signin')}
        >
          <Text className="text-white font-black uppercase tracking-widest">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-full bg-white border border-slate-200 h-16 rounded-2xl items-center justify-center"
          onPress={() => router.push('/auth/signup')}
        >
          <Text className="text-black font-black uppercase tracking-widest">Create Account</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-8 pt-4 pb-6 flex-row justify-between items-end">
          <View>
            <Text className="text-sm font-bold text-gray-400 uppercase tracking-[2px] mb-1">Account</Text>
            <Text className="text-3xl font-black text-black">Profile</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSignOut}
            className="p-3 bg-red-50 rounded-2xl"
          >
            <LucideLogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header Card */}
        <View className="bg-white mx-6 mt-6 p-8 rounded-[40px] shadow-sm border border-white items-center">
          <View className="w-24 h-24 bg-slate-100 rounded-full overflow-hidden mb-4 border-4 border-slate-50 shadow-sm">
            {profile?.photoURL ? (
              <Image source={{ uri: profile.photoURL }} className="w-full h-full" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <LucideUser size={40} color="#cbd5e1" />
              </View>
            )}
          </View>
          <Text className="text-2xl font-black text-slate-900 mb-1">{profile?.name || "Premium User"}</Text>
          <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest">{user.email}</Text>
          
          <View className="flex-row gap-4 mt-6">
            <View className="bg-blue-50 px-4 py-2 rounded-full">
              <Text className="text-blue-600 font-black text-[10px] uppercase">{profile?.role || "CUSTOMER"}</Text>
            </View>
            <View className="bg-green-50 px-4 py-2 rounded-full">
              <Text className="text-green-600 font-black text-[10px] uppercase">VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 ml-2">Quick Actions</Text>
          <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-white">
            <TouchableOpacity 
              onPress={() => router.push('/account/orders')}
              className="flex-row items-center p-6 border-b border-slate-50"
            >
              <View className="p-3 bg-slate-50 rounded-xl mr-4">
                <LucideShoppingBag size={20} color="#000" />
              </View>
              <Text className="flex-1 font-black text-slate-800 uppercase tracking-tight">My Orders</Text>
              <LucideChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-6 border-b border-slate-50">
              <View className="p-3 bg-slate-50 rounded-xl mr-4">
                <LucideHeart size={20} color="#000" />
              </View>
              <Text className="flex-1 font-black text-slate-800 uppercase tracking-tight">Wishlist</Text>
              <LucideChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-6">
              <View className="p-3 bg-slate-50 rounded-xl mr-4">
                <LucideSettings size={20} color="#000" />
              </View>
              <Text className="flex-1 font-black text-slate-800 uppercase tracking-tight">Settings</Text>
              <LucideChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Info */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 ml-2">Account Info</Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="bg-white flex-1 p-6 rounded-3xl shadow-sm border border-white">
              <LucideCalendar size={18} color="#94a3b8" />
              <Text className="text-[9px] font-black text-slate-300 uppercase mt-3 mb-1">Joined</Text>
              <Text className="font-bold text-slate-800">
                {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '2024'}
              </Text>
            </View>
            <View className="bg-white flex-1 p-6 rounded-3xl shadow-sm border border-white">
              <LucideShield size={18} color="#22c55e" />
              <Text className="text-[9px] font-black text-slate-300 uppercase mt-3 mb-1">Status</Text>
              <Text className="font-bold text-green-600">Active</Text>
            </View>
          </View>
        </View>

        {/* Seller Entry Point (if applicable) */}
        {profile?.role === 'seller' && (
          <TouchableOpacity className="mx-6 mt-8 bg-blue-600 p-8 rounded-[40px] shadow-lg shadow-blue-200">
            <Text className="text-white/70 font-black text-[10px] uppercase tracking-widest mb-2">Boutique Owner</Text>
            <Text className="text-white text-2xl font-black mb-4">Go to Seller Dashboard</Text>
            <View className="flex-row items-center">
              <Text className="text-white font-bold">Manage your products and orders</Text>
              <LucideChevronRight size={18} color="#fff" className="ml-2" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
