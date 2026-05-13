import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { 
  LucideUser, 
  LucideMail, 
  LucideLogOut, 
  LucideShield, 
  LucideChevronRight,
  LucideHeart,
  LucideSettings,
  LucideStore,
  LucideVerified,
  LucideAward,
  LucidePackage,
  LucideShoppingBag,
  LucideMoon,
  LucideSun,
  LucideBell,
  LucideWallet,
  LucideChevronLeft
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-950 justify-center items-center px-8">
        <View className="w-24 h-24 bg-gray-50 dark:bg-slate-900 rounded-[40px] items-center justify-center mb-8 border border-gray-100 dark:border-slate-800 shadow-sm">
          <LucideUser size={48} color="#fa8929" />
        </View>
        <Text className="text-3xl font-black text-gray-900 dark:text-white mb-2 text-center uppercase tracking-tighter">My CartlyHub</Text>
        <Text className="text-center text-gray-400 dark:text-gray-500 font-medium mb-10 leading-6 px-4">
          Join Ghana's most premium marketplace to start trading, saving favorites, and building your boutique.
        </Text>
        <TouchableOpacity 
          className="w-full bg-primary h-16 rounded-[24px] items-center justify-center mb-4 shadow-xl shadow-primary/20"
          onPress={() => router.push('/auth/signin')}
        >
          <Text className="text-white font-black uppercase tracking-widest text-sm">Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-full bg-white border border-gray-100 h-16 rounded-[24px] items-center justify-center mb-10"
          onPress={() => router.push('/auth/signup')}
        >
          <Text className="text-gray-900 font-black uppercase tracking-widest text-sm">Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/account/settings')}
          className="flex-row items-center p-4"
        >
          <LucideSettings size={20} color="#94a3b8" />
          <Text className="ml-2 text-gray-400 font-black uppercase tracking-[2px] text-[10px]">App Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      {/* Premium Header */}
      <SafeAreaView edges={['top']} className="bg-white dark:bg-slate-900 shadow-sm">
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-[10px] font-black text-primary uppercase tracking-[4px] mb-1">CartlyHub Elite</Text>
            <Text className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Profile</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/account/settings')}
              className="p-3 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <LucideSettings size={20} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Profile Card Section */}
        <View className="mx-6 mt-6">
          <View className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-gray-100 dark:border-slate-800 items-center shadow-xl shadow-black/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <View className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full" />
            
            <View className="relative">
              <View className="w-32 h-32 bg-gray-50 dark:bg-slate-800 rounded-[44px] overflow-hidden mb-5 border-4 border-primary/10 shadow-lg">
                {profile?.photoURL || user.photoURL ? (
                  <Image source={{ uri: profile?.photoURL || user.photoURL }} className="w-full h-full" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <LucideUser size={56} color="#fa8929" />
                  </View>
                )}
              </View>
              <View className="absolute bottom-1 right-1 bg-green-500 p-2.5 rounded-2xl border-4 border-white dark:border-slate-900">
                <LucideVerified size={18} color="#fff" />
              </View>
            </View>

            <Text className="text-2xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight text-center">
              {profile?.name || user.displayName || "Elite Member"}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-8 text-center">{user.email}</Text>
            
            <View className="flex-row gap-3">
              <View className="bg-primary px-6 py-2.5 rounded-2xl flex-row items-center">
                <LucideAward size={14} color="#fff" />
                <Text className="text-white font-black text-[9px] uppercase tracking-widest ml-2">{profile?.role || "CUSTOMER"}</Text>
              </View>
              <View className="bg-gray-100 dark:bg-slate-800 px-6 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 flex-row items-center">
                <LucideWallet size={14} color={isDark ? "#94a3b8" : "#64748b"} />
                <Text className="text-gray-600 dark:text-gray-400 font-black text-[9px] uppercase tracking-widest ml-2">GH₵0.00</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dynamic Stats Row */}
        <View className="px-6 mt-8 flex-row gap-4">
          {[
            { label: 'Saved', value: '14', icon: LucideHeart, color: '#ef4444' },
            { label: 'Orders', value: '02', icon: LucidePackage, color: '#3b82f6' },
            { label: 'Messages', value: '05', icon: LucideBell, color: '#f59e0b' }
          ].map((stat, idx) => (
            <View key={idx} className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-gray-50 dark:border-slate-800 shadow-sm items-center">
              <stat.icon size={16} color={stat.color} className="mb-2" />
              <Text className="text-xl font-black text-gray-900 dark:text-white mb-0.5">{stat.value}</Text>
              <Text className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings Groups */}
        <View className="px-6 mt-10">
          <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px] mb-4 ml-4">Account Dashboard</Text>
          <View className="bg-white dark:bg-slate-900 rounded-[44px] overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
            {[
              { label: 'My Conversations', sub: 'Chat history with sellers', icon: LucideMail, color: '#3b82f6', route: '/(tabs)/messages' },
              { label: 'Favorite Items', sub: 'Manage your saved products', icon: LucideHeart, color: '#ef4444', route: '/(tabs)/wishlist' },
              { label: 'Order History', sub: 'Track your current purchases', icon: LucideShoppingBag, color: '#fa8929', route: '/account/orders' },
              { label: 'Security & Auth', sub: 'Passwords and biometric login', icon: LucideShield, color: '#10b981', route: '/account/settings' }
            ].map((item, idx) => (
              <TouchableOpacity 
                key={idx}
                onPress={() => router.push(item.route as any)}
                className={`flex-row items-center p-6 ${idx !== 3 ? 'border-b border-gray-50 dark:border-slate-800' : ''}`}
              >
                <View style={{ backgroundColor: `${item.color}10` }} className="p-3.5 rounded-2xl mr-5">
                  <item.icon size={20} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xs">{item.label}</Text>
                  <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-1">{item.sub}</Text>
                </View>
                <LucideChevronRight size={18} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Business Section */}
        <View className="px-6 mt-8">
          <TouchableOpacity 
            onPress={() => router.push(profile?.role === 'seller' ? '/(tabs)/sell' : '/store-setup' as any)}
            className="bg-primary p-8 rounded-[48px] shadow-2xl shadow-primary/20 relative overflow-hidden"
          >
            {/* Abstract Decorative Shapes */}
            <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-bl-full" />

            <View className="flex-row justify-between items-start mb-5">
              <View className="p-4 bg-white/20 rounded-[20px]">
                <LucideStore size={28} color="#fff" />
              </View>
              <View className="bg-black/20 px-4 py-1.5 rounded-full border border-white/20">
                <Text className="text-[8px] font-black text-white uppercase tracking-widest">
                  {profile?.role === 'seller' ? 'Active Vendor' : 'New Opportunity'}
                </Text>
              </View>
            </View>
            <Text className="text-white font-black text-2xl mb-2 uppercase tracking-tighter">
              {profile?.role === 'seller' ? 'Boutique Manager' : 'Start Selling'}
            </Text>
            <Text className="text-white/80 font-bold text-xs leading-5">
              {profile?.role === 'seller' 
                ? 'Manage your elite product catalog and track sales performance in real-time.' 
                : 'Turn your passion into profit. Join our network of premium vendors in Ghana.'}
            </Text>
            <View className="flex-row items-center mt-8">
              <View className="bg-white px-6 py-3 rounded-2xl flex-row items-center">
                <Text className="text-primary font-black uppercase text-[10px] tracking-widest">
                  {profile?.role === 'seller' ? 'View Dashboard' : 'Open Store Now'}
                </Text>
                <LucideChevronRight size={14} color="#fa8929" className="ml-2" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Session Control */}
        <TouchableOpacity 
          onPress={() => auth.signOut()}
          className="mx-6 mt-10 mb-20 flex-row items-center justify-center p-7 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[40px]"
        >
          <LucideLogOut size={20} color={isDark ? "#475569" : "#94a3b8"} />
          <Text className="ml-3 font-black text-gray-400 dark:text-gray-600 uppercase tracking-[4px] text-[10px]">Secure Sign Out</Text>
        </TouchableOpacity>

        <View className="items-center opacity-20 dark:opacity-10 mb-12">
            <Text className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-[8px]">CARTLYHUB</Text>
            <Text className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[12px] mt-2">EST. 2024</Text>
        </View>
      </ScrollView>
    </View>
  );
}
