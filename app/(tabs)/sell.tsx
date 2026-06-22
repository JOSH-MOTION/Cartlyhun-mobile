import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
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
  LucideStore,
  LucideX,
  LucideChevronRight
} from 'lucide-react-native';

export default function SellScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [upload] = useUpload();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryTemp, setSelectedCategoryTemp] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    subcategoryId: "",
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
      <View className="flex-1 bg-background">
        <SafeAreaView className="flex-1 bg-background justify-center items-center px-10">
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={{ width: 150, height: 50, marginBottom: 40 }}
            resizeMode="contain"
            className="opacity-90"
          />
          <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6 border border-gray-100">
            <LucideStore size={40} color="#442efb" />
          </View>
          <Text className="text-2xl font-black text-gray-900 mb-2 text-center">Store Required</Text>
          <Text className="text-center text-gray-500 font-medium mb-8 leading-6">
            To sell on CartlyHub, you need to be signed in with a verified seller account. 
            The same account works across web and mobile.
          </Text>
          <TouchableOpacity 
            className="w-full bg-primary h-16 rounded-2xl items-center justify-center shadow-2xl shadow-primary/20"
            onPress={() => router.push('/store-setup')}
          >
            <Text className="text-white font-black uppercase tracking-widest">Sell on CartlyHub</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
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
        costPrice: Number(form.basePrice), // Using basePrice as costPrice since we removed it
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
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-6 pt-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-sm font-bold text-gray-500 uppercase tracking-[2px] mb-1">Inventory</Text>
            <Text className="text-3xl font-black text-gray-900">Add Product</Text>
          </View>
          
          {/* Post Product Button Moved to Top */}
          <TouchableOpacity 
            onPress={handleCreate}
            disabled={loading}
            className="bg-primary px-6 py-4 rounded-[20px] shadow-2xl shadow-primary/20 flex-row items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-white font-black uppercase tracking-widest text-xs">Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Images */}
        <View className="px-6 mt-6">
          <Text className="text-[10px] font-black text-muted uppercase tracking-[2px] mb-4 ml-2">Product Images</Text>
          <View className="flex-row flex-wrap gap-4">
            {form.images.map((img, i) => (
              <View key={i} className="w-[47%] aspect-square rounded-3xl overflow-hidden bg-gray-50">
                <Image source={{ uri: img }} className="w-full h-full" />
                <TouchableOpacity 
                  onPress={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                  className="absolute top-2 right-2 bg-black/70 p-2 rounded-full"
                >
                  <LucideTrash2 size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            {form.images.length < 4 && (
              <TouchableOpacity 
                onPress={pickImages}
                className="w-[47%] aspect-square rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center bg-gray-50"
              >
                {isUploading ? (
                  <ActivityIndicator color="#2563eb" />
                ) : (
                  <>
                    <LucidePlus size={32} color="#94a3b8" />
                    <Text className="text-[10px] font-black text-gray-500 uppercase mt-2">Add Image</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-4 ml-2">Basic Info</Text>
          <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 gap-y-6 shadow-sm">
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Product Name *</Text>
              <TextInput 
                className="bg-white p-4 rounded-2xl font-bold text-gray-900 border border-gray-100"
                placeholder="E.g. Vintage Leather Jacket"
                placeholderTextColor="#94a3b8"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Category & Subcategory *</Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryModal(true)}
                className="bg-white p-4 rounded-2xl flex-row justify-between items-center border border-gray-100"
              >
                <Text className="font-bold text-gray-900">
                  {form.categoryId && form.subcategoryId 
                    ? `${categories.find(c => c.id === form.categoryId)?.name} > ${categories.find(c => c.id === form.categoryId)?.subcategories?.find((s:any) => s.id === form.subcategoryId)?.name}`
                    : "Select Category"}
                </Text>
                <LucideChevronDown size={18} color="#2563eb" />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Description</Text>
              <TextInput 
                className="bg-white p-4 rounded-2xl font-bold text-gray-900 h-24 border border-gray-100"
                placeholder="Tell buyers about your item..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={form.description}
                textAlignVertical="top"
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View className="px-6 mt-8">
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-[2px] mb-4 ml-2">Pricing (GHS)</Text>
          <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase mb-2 ml-1">Selling Price *</Text>
              <TextInput 
                className="bg-white p-4 rounded-2xl font-black text-primary text-lg border border-primary/20"
                placeholder="0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={form.basePrice}
                onChangeText={(text) => setForm({ ...form, basePrice: text })}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
            <Text className="text-xl font-black text-gray-900">
              {selectedCategoryTemp ? selectedCategoryTemp.name : 'Select Category'}
            </Text>
            <TouchableOpacity onPress={() => {
              if (selectedCategoryTemp) {
                setSelectedCategoryTemp(null);
              } else {
                setShowCategoryModal(false);
              }
            }} className="bg-gray-100 p-2 rounded-full">
              <LucideX size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={selectedCategoryTemp ? selectedCategoryTemp.subcategories : categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity 
                className="px-6 py-5 border-b border-gray-50 flex-row justify-between items-center"
                onPress={() => {
                  if (!selectedCategoryTemp) {
                    setSelectedCategoryTemp(item);
                  } else {
                    setForm({ ...form, categoryId: selectedCategoryTemp.id, subcategoryId: item.id });
                    setSelectedCategoryTemp(null);
                    setShowCategoryModal(false);
                  }
                }}
              >
                <Text className="font-bold text-gray-900 text-base">{item.name}</Text>
                <LucideChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

    </View>
  );
}
