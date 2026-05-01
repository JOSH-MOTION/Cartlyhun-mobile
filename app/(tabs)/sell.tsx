import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUpload } from '@/utils/useUpload';
import { createProduct } from '@/utils/firebaseData';
import { categories } from '@/utils/categories';
import { 
  LucidePlus, 
  LucideTrash2, 
  LucideImage as LucideImageIcon, 
  LucideCheckCircle2, 
  LucideInfo, 
  LucideChevronDown,
  LucideStore
} from 'lucide-react-native';

export default function SellScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [upload] = useUpload();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
    costPrice: "",
    basePrice: "",
    totalStock: "10",
    images: [] as string[],
    region: profile?.region || "Greater Accra",
    location: profile?.location || "Accra",
    brand: "",
    gender: "",
    condition: "Brand New",
    sellerId: user?.uid,
    sellerName: profile?.storeName || profile?.name,
    sellerPhone: profile?.contactPhone || "",
    sellerEmail: user?.email || "",
  });

  if (!user || profile?.role !== 'seller') {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-10">
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={{ width: 150, height: 50, marginBottom: 40 }}
          resizeMode="contain"
        />
        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6">
          <LucideStore size={40} color="#94a3b8" />
        </View>
        <Text className="text-2xl font-black text-slate-900 mb-2">Boutique Required</Text>
        <Text className="text-center text-slate-400 font-medium mb-8 leading-6">
          To sell on CartlyHub, you need to be signed in with a verified seller account. 
          The same account works across web and mobile.
        </Text>
        <TouchableOpacity 
          className="w-full bg-black h-16 rounded-2xl items-center justify-center"
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text className="text-white font-black uppercase tracking-widest">Go to Profile</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 4,
      quality: 0.7,
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const uploadedUrls = [];
        for (const asset of result.assets) {
          const res = await upload({ base64: asset.base64 || asset.uri });
          if (res.url) uploadedUrls.push(res.url);
        }
        setForm(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } catch (error) {
        Alert.alert("Error", "Failed to upload images");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!form.name || !form.categoryId || !form.basePrice || form.images.length === 0) {
      Alert.alert("Missing Fields", "Please add a name, category, price, and at least one image.");
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        ...form,
        basePrice: Number(form.basePrice),
        costPrice: Number(form.costPrice),
        totalStock: Number(form.totalStock),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      Alert.alert("Success", "Product posted successfully!");
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert("Error", "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-8 pt-4 pb-6">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-[2px] mb-1">Inventory Management</Text>
          <Text className="text-3xl font-black text-black">Add Product</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Images */}
        <View className="px-6 mt-6">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 ml-2">Product Images</Text>
          <View className="flex-row flex-wrap gap-4">
            {form.images.map((img, i) => (
              <View key={i} className="w-[47%] aspect-square rounded-3xl overflow-hidden bg-slate-200">
                <Image source={{ uri: img }} className="w-full h-full" />
                <TouchableOpacity 
                  onPress={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                >
                  <LucideTrash2 size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {form.images.length < 4 && (
              <TouchableOpacity 
                onPress={pickImages}
                className="w-[47%] aspect-square rounded-3xl border-2 border-dashed border-slate-200 items-center justify-center bg-white"
              >
                {isUploading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <LucidePlus size={32} color="#cbd5e1" />
                    <Text className="text-[10px] font-black text-slate-400 uppercase mt-2">Add Image</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 ml-2">Basic Info</Text>
          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-white gap-y-6">
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Product Name *</Text>
              <TextInput 
                className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-800"
                placeholder="E.g. Vintage Leather Jacket"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Category *</Text>
              <TouchableOpacity className="bg-slate-50 p-4 rounded-2xl flex-row justify-between items-center">
                <Text className="font-bold text-slate-800">{form.categoryId || "Select Category"}</Text>
                <LucideChevronDown size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Description</Text>
              <TextInput 
                className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-800 h-24"
                placeholder="Tell buyers about your item..."
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 ml-2">Pricing (GHS)</Text>
          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-white gap-y-6">
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Cost Price</Text>
                <TextInput 
                  className="bg-slate-50 p-4 rounded-2xl font-bold text-slate-800"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={form.costPrice}
                  onChangeText={(text) => setForm({ ...form, costPrice: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Selling Price *</Text>
                <TextInput 
                  className="bg-slate-50 p-4 rounded-2xl font-black text-slate-800 text-lg"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={form.basePrice}
                  onChangeText={(text) => setForm({ ...form, basePrice: text })}
                />
              </View>
            </View>
            {form.basePrice && form.costPrice && (
              <View className="bg-green-50 p-4 rounded-2xl flex-row justify-between items-center">
                <Text className="text-[10px] font-black text-green-600 uppercase">Estimated Profit</Text>
                <Text className="font-black text-green-600">₵{Number(form.basePrice) - Number(form.costPrice)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Button */}
        <View className="px-6 mt-10">
          <TouchableOpacity 
            onPress={handleCreate}
            disabled={loading}
            className="bg-black h-16 rounded-[24px] shadow-xl shadow-black/20 flex-row items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-black uppercase tracking-widest mr-2">Post Product</Text>
                <LucideCheckCircle2 size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
