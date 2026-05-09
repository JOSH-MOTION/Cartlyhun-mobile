import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { LucideStore, LucideCheckCircle2, LucideChevronLeft, LucideMapPin, LucidePhone, LucideUser } from 'lucide-react-native';

export default function StoreSetupScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    ownerName: profile?.name || user?.displayName || '',
    storeName: profile?.storeName || '',
    contactPhone: profile?.contactPhone || '',
    whatsappNumber: profile?.whatsappNumber || '',
    location: profile?.location || '',
    region: profile?.region || 'Greater Accra',
    description: profile?.description || '',
  });

  const GHANA_REGIONS = [
    "Greater Accra", "Ashanti", "Central", "Eastern", "Western", 
    "Northern", "Volta", "Upper East", "Upper West", "Bono", 
    "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"
  ];

  const handleSetup = async () => {
    if (!form.storeName || !form.contactPhone || !form.ownerName || !form.whatsappNumber || !form.location) {
      Alert.alert('Missing Info', 'Please fill in all required fields (Name, Store, Phone, WhatsApp, Location).');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...form,
        role: 'seller',
        isVerified: false, // Match web (pending verification)
        updatedAt: new Date().toISOString(),
      });
      
      // Also create/update the sellers collection entry to match web structure
      await updateDoc(doc(db, 'sellers', user.uid), {
        uid: user.uid,
        ...form,
        isVerified: false,
        updatedAt: new Date().toISOString(),
      }).catch(async (err) => {
        // If doc doesn't exist, set it
        await setDoc(doc(db, 'sellers', user.uid), {
          uid: user.uid,
          ...form,
          isVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          storeViews: 0
        });
      });
      
      Alert.alert('Registration Received!', `Your store "${form.storeName}" is now pending verification. Our team will review your profile shortly.`, [
        { text: 'Go to Dashboard', onPress: () => router.replace('/(tabs)/sell') }
      ]);
    } catch (error) {
      console.error('Error setting up store:', error);
      Alert.alert('Error', 'Failed to set up your boutique. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-8 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full mr-4 border border-gray-100"
          >
            <LucideChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-[2px] mb-1">Business</Text>
            <Text className="text-3xl font-black text-gray-900">Create Boutique</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-8 mt-6">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
              <LucideStore size={36} color="#fa8929" />
            </View>
            <Text className="text-gray-500 text-center font-medium text-xs leading-5">
              Join Ghana's premium marketplace. Reach thousands of customers and manage your business with our professional tools.
            </Text>
          </View>

          <View className="gap-y-6">
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Owner's Full Name *</Text>
              <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                <LucideUser size={18} color="#fa8929" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-gray-900"
                  placeholder="E.g. John Doe"
                  placeholderTextColor="#999"
                  value={form.ownerName}
                  onChangeText={(text) => setForm({ ...form, ownerName: text })}
                />
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Boutique Name *</Text>
              <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                <LucideStore size={18} color="#fa8929" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-gray-900"
                  placeholder="E.g. Jojo's Fashion Hub"
                  placeholderTextColor="#999"
                  value={form.storeName}
                  onChangeText={(text) => setForm({ ...form, storeName: text })}
                />
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Phone *</Text>
                <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                  <LucidePhone size={18} color="#fa8929" />
                  <TextInput 
                    className="flex-1 ml-3 font-bold text-gray-900"
                    placeholder="024..."
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={form.contactPhone}
                    onChangeText={(text) => setForm({ ...form, contactPhone: text })}
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">WhatsApp *</Text>
                <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                  <LucidePhone size={18} color="#fa8929" />
                  <TextInput 
                    className="flex-1 ml-3 font-bold text-gray-900"
                    placeholder="024..."
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={form.whatsappNumber}
                    onChangeText={(text) => setForm({ ...form, whatsappNumber: text })}
                  />
                </View>
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Location *</Text>
              <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                <LucideMapPin size={18} color="#fa8929" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-gray-900"
                  placeholder="E.g. East Legon, Accra"
                  placeholderTextColor="#999"
                  value={form.location}
                  onChangeText={(text) => setForm({ ...form, location: text })}
                />
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Region *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1">
                {GHANA_REGIONS.map(region => (
                  <TouchableOpacity 
                    key={region}
                    onPress={() => setForm({ ...form, region })}
                    className={`mr-2 px-4 py-2 rounded-full border ${form.region === region ? 'bg-primary border-primary' : 'bg-white border-gray-100'}`}
                  >
                    <Text className={`text-[10px] font-bold ${form.region === region ? 'text-white' : 'text-gray-500'}`}>{region}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Store Description</Text>
              <View className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-100">
                <TextInput 
                  className="font-bold text-gray-900 h-24"
                  placeholder="Tell customers about your products..."
                  placeholderTextColor="#999"
                  multiline
                  value={form.description}
                  onChangeText={(text) => setForm({ ...form, description: text })}
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSetup}
              disabled={loading}
              className="bg-primary h-16 rounded-2xl items-center justify-center flex-row shadow-2xl shadow-primary/20 mt-4"
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white font-black uppercase tracking-widest mr-2">Create Boutique</Text>
                  <LucideCheckCircle2 size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            <Text className="text-center text-[10px] text-gray-400 font-bold uppercase mt-4">
              By creating a boutique, you agree to our Seller Terms & Conditions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
