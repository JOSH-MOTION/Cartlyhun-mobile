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
        <ActivityIndicator size="large" color="#fa8929" />
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
    <View className="flex-1 bg-background">
      {/* Custom Floating Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
        <View className="px-6 py-2 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 bg-background/80 rounded-2xl border border-white/10"
          >
            <LucideChevronLeft size={24} color="#fa8929" />
          </TouchableOpacity>
          
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => toggleWishlist(product.id)}
              className="p-3 bg-white/80 rounded-2xl border border-gray-100"
            >
              <LucideHeart size={22} color={isInWishlist(product.id) ? '#fa8929' : '#000'} fill={isInWishlist(product.id) ? '#fa8929' : 'transparent'} />
            </TouchableOpacity>
            <TouchableOpacity className="p-3 bg-white/80 rounded-2xl border border-gray-100">
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
                className={`h-1.5 rounded-full ${activeImage === i ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'}`} 
              />
            ))}
          </View>
        </View>
        
        <View className="bg-white -mt-10 rounded-t-[40px] px-6 pt-8 pb-40 border-t border-gray-100">
          <View className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
          
          {/* Header Info */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-primary font-black uppercase tracking-[2px] text-[10px] mb-2">
                {product.category_name || product.category}
              </Text>
              <Text className="text-3xl font-black text-white leading-tight">
                {product.name}
              </Text>
            </View>
            <View className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <Text className="text-2xl font-black text-primary">₵{price}</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View className="flex-row items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <View className="flex-row items-center">
              <LucideEye size={14} color="#64748b" />
              <Text className="ml-1 text-[10px] font-bold text-gray-500 uppercase">{product.views || 0} Views</Text>
            </View>
            <View className="flex-row items-center">
              <LucideMapPin size={14} color="#64748b" />
              <Text className="ml-1 text-[10px] font-bold text-gray-500 uppercase">{product.location || "Accra"}</Text>
            </View>
            <View className="flex-row items-center ml-auto">
              <LucideZap size={14} color="#fa8929" />
              <Text className="ml-1 text-[10px] font-bold text-primary uppercase">{getTimeAgo(product.createdAt)}</Text>
            </View>
          </View>

          {/* Attributes Grid */}
          <View className="flex-row flex-wrap gap-y-4 mb-10">
            {product.condition && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Condition</Text>
                <Text className="text-xs font-bold text-gray-900">{product.condition}</Text>
              </View>
            )}
            {product.brand && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Brand</Text>
                <Text className="text-xs font-bold text-gray-900">{product.brand}</Text>
              </View>
            )}
            {product.gender && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Gender</Text>
                <Text className="text-xs font-bold text-gray-900">{product.gender}</Text>
              </View>
            )}
            {product.material && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Material</Text>
                <Text className="text-xs font-bold text-gray-900">{product.material}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View className="mb-10">
            <Text className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-4">Product Insight</Text>
            <Text 
              numberOfLines={isExpanded ? undefined : 4}
              className="text-gray-600 text-[15px] leading-7 font-medium"
            >
              {product.description || "No description available for this premium piece."}
            </Text>
            {product.description?.length > 150 && (
              <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} className="mt-3">
                <Text className="text-primary font-bold text-xs uppercase">{isExpanded ? "Show Less" : "Read Full Description"}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Seller Profile Card */}
          <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
            <View className="flex-row items-center mb-6">
              <View className="w-14 h-14 bg-primary rounded-2xl items-center justify-center mr-4">
                <Text className="text-background font-black text-xl">{product.sellerName?.charAt(0).toUpperCase() || 'C'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-black text-lg">{product.sellerName || "CartlyHub Official"}</Text>
                <Text className="text-primary text-[10px] font-bold uppercase">{getTimeOnPlatform(sellerInfo?.createdAt)}</Text>
                <View className="flex-row items-center mt-1">
                  {[1, 2, 3, 4, 5].map(s => <LucideStar key={s} size={10} color="#fa8929" fill="#fa8929" />)}
                  <Text className="ml-1 text-[10px] text-gray-500 font-bold">({sellerInfo?.reviewCount || 0})</Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => setShowPhone(!showPhone)}
                className="flex-1 bg-gray-100 h-12 rounded-xl flex-row items-center justify-center border border-gray-200"
              >
                <LucidePhone size={14} color="#000" />
                <Text className="text-gray-900 font-bold text-xs ml-2">{showPhone ? (product.sellerPhone || "N/A") : "SHOW CONTACT"}</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary h-12 rounded-xl flex-row items-center justify-center">
                <LucideMessageCircle size={14} color="#ffffff" />
                <Text className="text-background font-bold text-xs ml-2 uppercase">MESSAGE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Safety Tips */}
          <View className="bg-primary/5 p-6 rounded-[32px] border border-primary/20 mb-12">
            <Text className="text-primary font-black text-[10px] uppercase tracking-widest mb-4">Safety Tips</Text>
            <View className="gap-y-3">
              {[
                "Inspect the item before paying",
                "Meet in a safe, public place",
                "Don't pay in advance (delivery included)"
              ].map((tip, i) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-1 h-1 bg-primary/40 rounded-full mr-3" />
                  <Text className="text-gray-600 text-[11px] font-bold uppercase">{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* More from Seller */}
          {moreFromSeller.length > 0 && (
            <View>
              <View className="flex-row justify-between items-end mb-6">
                <View>
                  <Text className="text-muted font-black text-[10px] uppercase tracking-widest mb-1">More from store</Text>
                  <Text className="text-2xl font-black text-white uppercase">Related Items</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-primary font-bold text-xs uppercase">View All</Text>
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
                    <Image source={{ uri: item.images?.[0] }} className="w-40 h-48 rounded-[24px] mb-2 bg-gray-50" />
                    <Text className="font-bold text-gray-900 text-sm" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-primary font-black text-xs">₵{item.basePrice || item.price}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Glossy Buy Bar */}
      <BlurView intensity={20} tint="dark" style={styles.footer}>
        <View className="flex-row items-center px-6 py-6 pb-10">
          <TouchableOpacity 
            onPress={handleWhatsAppOrder}
            className="w-14 h-14 bg-green-500/20 border border-green-500/30 rounded-2xl items-center justify-center mr-4"
          >
            <LucideMessageCircle size={24} color="#fa8929" fill="#fa8929" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleAddToCart}
            className="flex-1 bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/20"
          >
            <LucideShoppingBag size={20} color="#ffffff" />
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
