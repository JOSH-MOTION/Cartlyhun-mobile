import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getSeller, incrementProductViews } from '@/utils/firebaseData';
import { getTimeAgo, getTimeOnPlatform } from '@/utils/helpers';
import useCart from '@/store/useCart';
import { 
  LucideChevronLeft, 
  LucideShoppingBag, 
  LucideHeart, 
  LucideShare2, 
  LucideEye, 
  LucideBookmark, 
  LucideMapPin, 
  LucideZap,
  LucideShieldCheck,
  LucideStar,
  LucidePhone,
  LucidePhoneCall,
  LucideMessageCircle,
  LucidePlusCircle
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import useWishlist from '@/store/useWishlist';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    if (id) {
      incrementProductViews(id as string);
    }
  }, [id]);

  // Fetch Product
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts()
  });

  const product = products?.find((p: any) => p.id === id);

  // Fetch Seller
  const { data: sellerInfo } = useQuery({
    queryKey: ['seller', product?.sellerId],
    queryFn: () => getSeller(product.sellerId),
    enabled: !!product?.sellerId
  });

  // Fetch Related Products
  const moreFromSeller = products?.filter((p: any) => p.sellerId === product?.sellerId && p.id !== id).slice(0, 4) || [];

  if (productsLoading || !product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  const price = product.basePrice || product.price;

  const handleWhatsAppOrder = () => {
    const text = `Hi, I want to order from CartlyHub:\nProduct: ${product.name}\nPrice: GH₵${price}\nID: ${product.id}`;
    const phone = sellerInfo?.whatsappNumber || product.sellerPhone || "233242403450";
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  };

  const handleAddToCart = () => {
    const variant = product.variants?.[0] || { id: 'default', price: price };
    addItem(product, variant, 1);
    router.push('/(tabs)/cart');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Custom Floating Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
        <View className="px-6 py-2 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 bg-white/90 rounded-2xl shadow-sm"
          >
            <LucideChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => toggleWishlist(product.id)}
              className="p-3 bg-white/90 rounded-2xl shadow-sm"
            >
              <LucideHeart size={22} color={isInWishlist(product.id) ? '#ef4444' : '#000'} fill={isInWishlist(product.id) ? '#ef4444' : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity className="p-3 bg-white/90 rounded-2xl shadow-sm">
              <LucideShare2 size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} bounces={true}>
        {/* Image Gallery */}
        <View>
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={{ width, height: 500 }}
                resizeMode="cover"
              />
            )}
          />
          {/* Indicators */}
          <View className="absolute bottom-16 left-0 right-0 flex-row justify-center gap-2">
            {product.images?.map((_: any, i: number) => (
              <View 
                key={i} 
                className={`h-1.5 rounded-full ${activeImage === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} 
              />
            ))}
          </View>
        </View>
        
        <View className="bg-white -mt-10 rounded-t-[40px] px-6 pt-8 pb-40">
          <View className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
          
          {/* Header Info */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-blue-500 font-black uppercase tracking-[2px] text-[10px] mb-2">
                {product.category_name || product.category}
              </Text>
              <Text className="text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </Text>
            </View>
            <View className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <Text className="text-2xl font-black text-black">₵{price}</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View className="flex-row items-center gap-4 mb-8 border-b border-gray-50 pb-6">
            <View className="flex-row items-center">
              <LucideEye size={14} color="#94a3b8" />
              <Text className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{product.views || 0} Views</Text>
            </View>
            <View className="flex-row items-center">
              <LucideMapPin size={14} color="#94a3b8" />
              <Text className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{product.location || "Accra"}</Text>
            </View>
            <View className="flex-row items-center ml-auto">
              <LucideZap size={14} color="#22c55e" />
              <Text className="ml-1 text-[10px] font-bold text-green-500 uppercase">{getTimeAgo(product.createdAt)}</Text>
            </View>
          </View>

          {/* Attributes Grid */}
          <View className="flex-row flex-wrap gap-y-4 mb-10">
            {product.condition && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Condition</Text>
                <Text className="text-xs font-bold text-slate-800">{product.condition}</Text>
              </View>
            )}
            {product.brand && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Brand</Text>
                <Text className="text-xs font-bold text-slate-800">{product.brand}</Text>
              </View>
            )}
            {product.gender && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Gender</Text>
                <Text className="text-xs font-bold text-slate-800">{product.gender}</Text>
              </View>
            )}
            {product.material && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Material</Text>
                <Text className="text-xs font-bold text-slate-800">{product.material}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-10">
            <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4">Product Insight</Text>
            <Text 
              numberOfLines={isExpanded ? undefined : 4}
              className="text-slate-600 text-[15px] leading-7 font-medium"
            >
              {product.description || "No description available for this premium piece."}
            </Text>
            {product.description?.length > 150 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-3">
                <Text className="text-blue-500 font-bold text-xs uppercase">{isExpanded ? "Show Less" : "Read Full Description"}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Seller Profile Card */}
          <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-8">
            <View className="flex-row items-center mb-6">
              <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center mr-4">
                <Text className="text-white font-black text-xl">{product.sellerName?.charAt(0).toUpperCase() || 'C'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 font-black text-lg">{product.sellerName || "CartlyHub Official"}</Text>
                <Text className="text-green-600 text-[10px] font-bold uppercase">{getTimeOnPlatform(sellerInfo?.createdAt)}</Text>
                <View className="flex-row items-center mt-1">
                  {[1, 2, 3, 4, 5].map(s => <LucideStar key={s} size={10} color="#eab308" fill="#eab308" />)}
                  <Text className="ml-1 text-[10px] text-slate-400 font-bold">({sellerInfo?.reviewCount || 0})</Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowPhone(!showPhone)}
                className="flex-1 bg-black h-12 rounded-xl flex-row items-center justify-center"
              >
                <LucidePhone size={14} color="#fff" />
                <Text className="text-white font-bold text-xs ml-2">{showPhone ? (product.sellerPhone || "N/A") : "SHOW CONTACT"}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white border border-slate-200 h-12 rounded-xl flex-row items-center justify-center">
                <LucideMessageCircle size={14} color="#000" />
                <Text className="text-black font-bold text-xs ml-2">MESSAGE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Tips */}
          <View className="bg-red-50/30 p-6 rounded-[32px] border border-red-100/50 mb-12">
            <Text className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-4">Safety Tips</Text>
            <View className="gap-y-3">
              {[
                "Inspect the item before paying",
                "Meet in a safe, public place",
                "Don't pay in advance (delivery included)"
              ].map((tip, i) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-1 h-1 bg-red-300 rounded-full mr-3" />
                  <Text className="text-red-900/60 text-[11px] font-bold uppercase">{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* More from Seller */}
          {moreFromSeller.length > 0 && (
            <View>
              <View className="flex-row justify-between items-end mb-6">
                <View>
                  <Text className="text-slate-300 font-black text-[10px] uppercase tracking-widest mb-1">More from store</Text>
                  <Text className="text-2xl font-black text-slate-900 uppercase">Related Items</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-blue-500 font-bold text-xs uppercase">View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={moreFromSeller}
                keyExtractor={(p) => p.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => router.push(`/product/${item.id}`)}
                    className="mr-4 w-40"
                  >
                    <Image source={{ uri: item.images?.[0] }} className="w-40 h-48 rounded-[24px] mb-2 bg-slate-50" />
                    <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-blue-500 font-black text-xs">₵{item.basePrice || item.price}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Glossy Buy Bar */}
      <BlurView intensity={100} tint="light" style={styles.footer}>
        <View className="flex-row items-center px-6 py-6 pb-10">
          <TouchableOpacity 
            onPress={handleWhatsAppOrder}
            className="w-14 h-14 bg-green-500 rounded-2xl items-center justify-center mr-4"
          >
            <LucideMessageCircle size={24} color="#fff" fill="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleAddToCart}
            className="flex-1 bg-black h-14 rounded-2xl flex-row items-center justify-center shadow-xl shadow-black/20"
          >
            <LucideShoppingBag size={20} color="#fff" />
            <Text className="text-white font-black text-sm ml-3 uppercase tracking-widest">Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.5)',
  }
});
