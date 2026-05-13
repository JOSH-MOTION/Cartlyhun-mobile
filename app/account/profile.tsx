import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { 
  LucideChevronLeft, 
  LucideCamera, 
  LucideUser, 
  LucideMail, 
  LucideCheck,
  LucideVerified
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

export default function EditProfileScreen() {
  const { user, profile, loading } = useAuth();
  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    
    setSaving(true);
    try {
      // 1. Update Auth Profile
      await updateProfile(user, { displayName: name.trim() });
      
      // 2. Update Firestore User Doc
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        updatedAt: new Date()
      });
      
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#fa8929" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <SafeAreaView edges={['top']} className="bg-white dark:bg-slate-900 border-b border-gray-50 dark:border-slate-800">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <LucideChevronLeft size={24} color={isDark ? "#fff" : "#000"} />
            </TouchableOpacity>
            <Text className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter ml-2">Edit Profile</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={saving || !name.trim()}
            className={`${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fa8929" />
            ) : (
              <Text className="text-primary font-black uppercase text-xs tracking-widest">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Avatar Section */}
        <View className="items-center mb-10">
          <View className="relative">
            <View className="w-32 h-32 bg-gray-50 dark:bg-slate-900 rounded-[44px] overflow-hidden border-4 border-primary/10 shadow-lg items-center justify-center">
              {profile?.photoURL || user?.photoURL ? (
                <Image source={{ uri: profile?.photoURL || user?.photoURL }} className="w-full h-full" />
              ) : (
                <LucideUser size={50} color="#fa8929" />
              )}
            </View>
            <TouchableOpacity className="absolute bottom-0 right-0 bg-primary p-3 rounded-2xl border-4 border-white dark:border-slate-950 shadow-md">
              <LucideCamera size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View className="mt-4 flex-row items-center bg-green-50 dark:bg-green-500/10 px-4 py-1.5 rounded-full">
            <LucideVerified size={12} color="#10b981" />
            <Text className="text-green-600 font-black text-[9px] uppercase tracking-widest ml-1.5">Identity Verified</Text>
          </View>
        </View>

        {/* Form */}
        <View className="gap-y-6">
          <View>
            <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px] mb-3 ml-2">Full Name</Text>
            <View className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl px-6 py-4 flex-row items-center">
              <LucideUser size={18} color={isDark ? "#475569" : "#94a3b8"} />
              <TextInput 
                className="flex-1 ml-4 text-gray-900 dark:text-white font-black uppercase text-xs"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[3px] mb-3 ml-2">Email Address</Text>
            <View className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl px-6 py-4 flex-row items-center opacity-60">
              <LucideMail size={18} color={isDark ? "#475569" : "#94a3b8"} />
              <Text className="flex-1 ml-4 text-gray-900 dark:text-white font-black uppercase text-xs">{user?.email}</Text>
              <LucideCheck size={16} color="#10b981" />
            </View>
            <Text className="text-[9px] text-gray-400 dark:text-gray-500 font-bold mt-2 ml-4 uppercase">Email cannot be changed from the mobile app.</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving || !name.trim()}
          className="mt-12 bg-primary h-16 rounded-[24px] items-center justify-center shadow-xl shadow-primary/20"
        >
          <Text className="text-white font-black uppercase tracking-[3px] text-xs">Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
