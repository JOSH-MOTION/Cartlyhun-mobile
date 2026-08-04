import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, StyleSheet, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getSeller, incrementProductViews } from '@/utils/firebaseData';
import { getTimeAgo, getTimeOnPlatform } from '@/utils/helpers';
import { resolveListPricing } from '@/utils/pricing';
import Price from '@/components/Price';
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
  LucideMessageSquare,
  LucidePlusCircle
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import useWishlist from '@/store/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { categories } from '@/utils/categories';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  const getCategoryName = () => {
    if (!product) return "Uncategorized";
    const p = product as any;
    if (p.category_name) return p.category_name;
    if (p.category) return p.category;
    const cat = categories.find(c => c.id === p.categoryId);
    const sub = cat?.subcategories?.find((s: any) => s.id === p.subcategoryId);
    if (cat && sub) {
      return `${cat.name} > ${sub.name}`;
    }
    return cat ? cat.name : "Uncategorized";
  };

  useEffect(() => {
    if (id && id !== '[id]') {
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

  const pricing = resolveListPricing(product);
  const price = pricing.price;

  const handleWhatsAppOrder = () => {
    const text = `Hi, I want to order from CartlyHub:\nProduct: ${product.name}\nPrice: GH₵${price}\nID: ${product.id}`;
    const phone = sellerInfo?.whatsappNumber || product.sellerPhone || "233242403450";
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
  };

  const handleMessageSeller = async () => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!product.sellerId) {
      alert('This product does not have a registered seller.');
      return;
    }

    if (user.uid === product.sellerId) {
      alert('You cannot chat with yourself.');
      return;
    }

    try {
      const convId = await chatService.getOrCreateConversation(
        { uid: user.uid, name: profile?.name || user.displayName || 'Me', photoURL: profile?.photoURL || user.photoURL || '' },
        { uid: product.sellerId, name: product.sellerName || 'Seller', photoURL: sellerInfo?.photoURL || '' }
      );
      router.push(`/chat/${convId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to start chat.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Custom Floating Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
        <View className="px-6 py-2 flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-3 bg-white/80 rounded-2xl border border-gray-100"
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
        
        <View className="bg-white -mt-10 rounded-t-[40px] px-6 pt-8 pb-10 border-t border-gray-100">
          <View className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6" />
          
          {/* Header Info */}
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-primary font-black uppercase tracking-[2px] text-[10px] mb-2">
                {getCategoryName()}
              </Text>
              <Text className="text-3xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                {product.name}
              </Text>
            </View>
            <View className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <Price pricing={pricing} size="lg" />
            </View>
          </View>

          {/* Stats Bar */}
          <View className="flex-row items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <View className="flex-row items-center">
              <LucideEye size={14} color="#64748b" />
              <Text className="ml-1 text-[10px] font-bold text-gray-400 uppercase">{product.views || 0} Views</Text>
            </View>
            <View className="flex-row items-center">
              <LucideMapPin size={14} color="#64748b" />
              <Text className="ml-1 text-[10px] font-bold text-gray-400 uppercase">{product.location || "Accra"}</Text>
            </View>
            <View className="flex-row items-center ml-auto">
              <LucideZap size={14} color="#fa8929" />
              <Text className="ml-1 text-[10px] font-bold text-primary uppercase">{getTimeAgo(product.createdAt)}</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-y-4 mb-10">
            {product.condition && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Condition</Text>
                <Text className="text-xs font-bold text-gray-900 uppercase">{product.condition}</Text>
              </View>
            )}
            {product.brand && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand</Text>
                <Text className="text-xs font-bold text-gray-900 uppercase">{product.brand}</Text>
              </View>
            )}
            {product.gender && (
              <View className="w-1/2 pr-2">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Gender</Text>
                <Text className="text-xs font-bold text-gray-900 uppercase">{product.gender}</Text>
              </View>
            )}
            {product.material && (
              <View className="w-1/2 pl-2">
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Material</Text>
                <Text className="text-xs font-bold text-gray-900 uppercase">{product.material}</Text>
              </View>
            )}
          </View>

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
                <Text className="text-white font-black text-xl">{product.sellerName?.charAt(0).toUpperCase() || 'C'}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-black text-lg uppercase tracking-tight">{product.sellerName || "CartlyHub Official"}</Text>
                <Text className="text-primary text-[10px] font-bold uppercase">{getTimeOnPlatform(sellerInfo?.createdAt)}</Text>
                <View className="flex-row items-center mt-1">
                  {[1, 2, 3, 4, 5].map(s => <LucideStar key={s} size={10} color="#fa8929" fill="#fa8929" />)}
                  <Text className="ml-1 text-[10px] text-gray-500 font-bold">({sellerInfo?.reviewCount || 0})</Text>
                </View>
              </View>
            </View>
            
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity 
                onPress={handleWhatsAppOrder}
                className="flex-1 bg-green-500 h-12 rounded-xl flex-row items-center justify-center shadow-sm shadow-green-500/20"
              >
                <FontAwesome name="whatsapp" size={18} color="#ffffff" />
                <Text className="text-white font-black text-[10px] ml-2 uppercase tracking-wider">WhatsApp</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleMessageSeller}
                className="flex-1 bg-primary h-12 rounded-xl flex-row items-center justify-center shadow-sm shadow-primary/20"
              >
                <LucideMessageSquare size={14} color="#ffffff" />
                <Text className="text-white font-black text-[10px] ml-2 uppercase tracking-wider">Internal Chat</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              onPress={() => {
                if (showPhone) {
                  Linking.openURL(`tel:${product.sellerPhone || "233242403450"}`);
                } else {
                  setShowPhone(true);
                }
              }}
              className={`w-full ${showPhone ? 'bg-primary' : 'bg-gray-100'} h-12 rounded-xl flex-row items-center justify-center border ${showPhone ? 'border-primary' : 'border-gray-200'}`}
            >
              {showPhone ? (
                <View className="flex-row items-center">
                  <LucidePhoneCall size={16} color="#fff" />
                  <Text className="text-white font-black text-[10px] ml-2 uppercase tracking-wider">
                    CALL: {product.sellerPhone || "233 24 240 3450"}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <LucidePhone size={14} color="#000" />
                  <Text className="text-gray-900 font-black text-[10px] ml-2 uppercase tracking-wider">Show Contact</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View className="bg-primary/5 p-6 rounded-[32px] border border-primary/20 mb-12">
            <Text className="text-primary font-black text-[10px] uppercase tracking-widest mb-4 text-center">Safety Protocol</Text>
            <View className="gap-y-3">
              {[
                "Inspect the item before paying",
                "Meet in a safe, public place",
                "Don't pay in advance (delivery included)"
              ].map((tip, i) => (
                <View key={i} className="flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-primary/40 rounded-full mr-4" />
                  <Text className="text-gray-600 text-[10px] font-black uppercase tracking-tight">{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* More from Seller */}
          {moreFromSeller.length > 0 && (
            <View>
              <View className="flex-row justify-between items-end mb-6">
                <View>
                  <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">More from store</Text>
                  <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Related Items</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-primary font-black text-xs uppercase">View All</Text>
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
                    <Text className="font-black text-gray-900 text-sm uppercase tracking-tight" numberOfLines={1}>{item.name}</Text>
                    <Price pricing={resolveListPricing(item)} size="sm" showBadge={false} />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

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
