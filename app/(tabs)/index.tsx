import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl, ScrollView, Animated, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '@/hooks/useProducts';
import { useRouter } from 'expo-router';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LucideSearch,
  LucideBell,
  LucideSlidersHorizontal,
  LucideLayoutGrid,
  LucideShirt,
  LucideSmartphone,
  LucideSofa,
  LucideSparkles,
  LucideCar,
  LucideWatch,
  LucideBriefcase,
  LucideListVideo,
  LucideDollarSign,
  LucideHeartHandshake,
  LucidePlusCircle,
  LucidePackage,
  LucideMusic,
  LucideZap,
  LucideWrench,
  LucideGem,
  LucideCamera,
  LucideHome,
  LucideHeart,
  LucidePlus,
  LucideMessageSquare,
  LucideUser,
  LucideSettings,
  LucideChevronRight,
  LucideCreditCard,
  LucideTruck,
  LucideStar,
  LucideCalendar,
  LucideMapPin,
  LucideTag,
  LucideChevronDown,
  LucideCheckCircle,
  LucideX,
  LucideHelpCircle,
  LucideShieldCheck,
  LucideActivity,
  LucideTrendingUp,
  LucideCalendarClock,
  LucideClock,
  LucideUtensils,
  LucideHammer,
  LucidePawPrint,
  LucideBookOpen,
  LucideHardDrive,
  LucideBuilding2,
  LucideMonitor,
  LucideGamepad2,
  LucideTrophy,
  LucideBaby,
  LucideSprout,
  LucideShoppingBag,
  LucideBook,
  LucidePrinter,
  LucideDog,
  LucideBuilding
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import useWishlist from '@/store/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { categories as APP_CATEGORIES } from '@/utils/categories';
import { resolveListPricing } from '@/utils/pricing';
import Price from '@/components/Price';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Mapping icons to category IDs from categories.js
const ICON_MAP: Record<string, any> = {
  all: LucideLayoutGrid,
  // IDs (Fallback)
  fashion: LucideShirt,
  electronics: LucideSmartphone,
  home: LucideHome,
  beauty: LucideHeart,
  food: LucideShoppingBag,
  health: LucideActivity,
  property: LucideBuilding,
  vehicles: LucideCar,
  jobs: LucideBriefcase,
  services: LucideWrench,
  agriculture: LucideSprout,
  photography: LucideCamera,
  laundry: LucideSparkles,
  wholesale: LucidePackage,
  instruments: LucideMusic,
  fragrances_main: LucideGem,
  electrical_lighting: LucideZap,
  car_parts_oils: LucideWrench,
  // Lucide Names (New standard)
  Shirt: LucideShirt,
  Smartphone: LucideSmartphone,
  Home: LucideHome,
  Heart: LucideHeart,
  ShoppingBag: LucideShoppingBag,
  Activity: LucideActivity,
  Building: LucideBuilding,
  Car: LucideCar,
  Briefcase: LucideBriefcase,
  Wrench: LucideWrench,
  Sprout: LucideSprout,
  Camera: LucideCamera,
  Sparkles: LucideSparkles,
  Package: LucidePackage,
  Music: LucideMusic,
  Gem: LucideGem,
  Zap: LucideZap,
  Book: LucideBook,
  Printer: LucidePrinter,
  Dog: LucideDog,
  Monitor: LucideMonitor,
  Trophy: LucideTrophy,
};

export default function HomeScreen() {
  const { data: products, isLoading, refetch } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const router = useRouter();
  const { user, profile } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [filterVisible, setFilterVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [promotion, setPromotion] = useState<any>(null);

  const fetchPromotion = async () => {
    try {
      const docRef = doc(db, "settings", "promotions");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPromotion(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching promotion:", error);
    }
  };

  useEffect(() => {
    fetchPromotion();
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), fetchPromotion()]);
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Build categories list from real app data
  const categories = useMemo(() => {
    const topCats = APP_CATEGORIES.map(cat => ({
      id: cat.id,
      name: cat.name.replace(' & ', '\n'), // Use newline for better wrapping
      icon: ICON_MAP[cat.icon] || ICON_MAP[cat.id] || LucidePackage
    }));
    return [{ id: 'all', name: 'All', icon: LucideLayoutGrid }, ...topCats];
  }, []);
  
  const filteredProducts = useMemo(() => {
    let filtered = products || [];
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === activeCategory || p.category === activeCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, activeCategory, searchQuery]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#fa8929" />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-primary rounded-b-[40px] relative overflow-hidden pb-4">
        {/* Background Decorative Circles */}
        <View className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
        <View className="absolute top-10 -left-10 w-32 h-32 bg-black/5 rounded-full" />
        
        {/* Real Data Header */}
        <View className="px-6 pt-4">
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center">
              <View className="relative">
                {profile?.photoURL || user?.photoURL ? (
                  <Image
                    source={{ uri: profile?.photoURL || user?.photoURL }}
                    className="w-12 h-12 rounded-full border-2 border-white/20 bg-surface"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 items-center justify-center">
                    <LucideUser size={24} color="#ffffff" />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-primary" />
              </View>
              <View className="ml-3">
                <Text className="text-white/80 text-sm font-medium">{getGreeting()}, 👋</Text>
                <Text className="text-white text-xl font-black">{profile?.name || user?.displayName || 'Welcome!'}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setNotificationsVisible(true)} className="relative p-2 mr-2 bg-white/10 rounded-full">
                <LucideBell size={22} color="#ffffff" />
                <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wishlist')} className="p-2 bg-white/10 rounded-full">
                <LucideHeart size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search and Filter */}
          <View className="flex-row items-center mb-2">
            <View
              className="flex-1 flex-row items-center bg-white h-14 px-4 rounded-3xl shadow-sm"
            >
              <LucideSearch size={20} color="#64748b" />
              <TextInput 
                className="flex-1 ml-3 text-gray-900 font-bold h-full"
                placeholder="Search marketplace..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              <View className="flex-row items-center gap-3">
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                    <LucideX size={18} color="#94a3b8" />
                  </TouchableOpacity>
                )}
                <View className="w-[1px] h-6 bg-gray-200 mx-1" />
                <TouchableOpacity onPress={() => setFilterVisible(true)} className="p-1">
                  <LucideSlidersHorizontal size={20} color="#fa8929" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

      </SafeAreaView>

      {/* Main Content */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fa8929" />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ paddingHorizontal: 16, justifyContent: 'space-between' }}
        ListHeaderComponent={() => (
          <View>
            {/* Special Offers Section */}
            {promotion && promotion.isActive && (
              <View className="px-6 mb-8">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-2xl font-black text-gray-900">Special Offers</Text>
                  <TouchableOpacity>
                    <Text className="text-primary font-bold">See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={width - 48}
                  decelerationRate="fast"
                >
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    className="bg-gray-100 rounded-[40px] overflow-hidden flex-row items-center p-6 mr-4"
                    style={{ width: width - 48, height: 180 }}
                  >
                    <View className="flex-1 pr-4">
                      <Text className="text-4xl font-black text-gray-900 mb-2">{promotion.discount}</Text>
                      <Text className="text-lg font-black text-gray-900 leading-tight mb-2">{promotion.title}</Text>
                      <Text className="text-gray-500 text-[10px] font-bold uppercase leading-relaxed">{promotion.description}</Text>
                    </View>
                    <Image 
                      source={{ uri: promotion.imageUrl }}
                      className="w-32 h-full rounded-2xl"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </ScrollView>
              </View>
            )}

            {/* Categories Section */}
            <View className="mb-10">
              <View className="px-6 mb-6">
                <View className="flex-row justify-between items-end">
                  <Text className="text-2xl font-black text-gray-900 tracking-tight">Categories</Text>
                  <TouchableOpacity onPress={() => setFilterVisible(true)}>
                    <Text className="text-primary font-bold">See All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setActiveCategory(cat.id)}
                    className="items-center mr-8"
                    style={{ width: 76 }}
                  >
                    <View
                      style={{ backgroundColor: activeCategory === cat.id ? '#fa8929' : '#f8fafc' }}
                      className="w-16 h-16 rounded-full items-center justify-center border border-gray-100"
                    >
                      <cat.icon size={24} color={activeCategory === cat.id ? '#ffffff' : '#000'} />
                    </View>
                    <Text
                      numberOfLines={2}
                      className={`mt-2 font-bold text-[11px] leading-tight text-center w-full ${activeCategory === cat.id ? 'text-primary' : 'text-gray-500'}`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recommended Title */}
            <View className="flex-row items-center justify-between px-6 mb-6">
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl font-black text-gray-900 tracking-tight">Recommended</Text>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary font-black text-xs">{filteredProducts.length}</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text className="text-primary font-bold">Sort By</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-[24px] mb-5 w-[48%] overflow-hidden border border-gray-100 shadow-sm"
            activeOpacity={0.9}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <View className="relative">
              <Image
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }}
                className="w-full h-44"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => toggleWishlist(item.id)}
                className="absolute top-2.5 right-2.5 p-2 bg-white/90 rounded-full"
              >
                <LucideHeart 
                  size={14} 
                  color={isInWishlist(item.id) ? '#fa8929' : '#000'} 
                  fill={isInWishlist(item.id) ? '#fa8929' : 'transparent'} 
                />
              </TouchableOpacity>
            </View>

            <View className="p-3">
              <Text className="text-[13px] font-bold text-gray-900 mb-0.5" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="mb-1.5">
                <Price pricing={resolveListPricing(item)} size="sm" showBadge={false} />
              </View>
              
              <View className="flex-row items-center">
                <LucideMapPin size={10} color="#94a3b8" />
                <Text className="text-[9px] text-gray-400 font-bold ml-1 uppercase" numberOfLines={1}>
                  {item.location || 'Accra'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-16 px-8">
            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
              <LucidePackage size={36} color="#fa8929" />
            </View>
            <Text className="text-gray-900 text-lg font-black mb-2 text-center">No Products Found</Text>
            <Text className="text-gray-400 text-center font-medium text-sm">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'No products in this category yet. Check back soon!'}
            </Text>
            {(activeCategory !== 'all' || searchQuery) && (
              <TouchableOpacity
                onPress={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="mt-6 bg-primary px-6 py-3 rounded-2xl"
              >
                <Text className="text-white font-black text-sm">Show All Products</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {/* Notifications Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationsVisible}
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white w-full rounded-[40px] border border-gray-100 p-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Alerts</Text>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)}>
                <LucideX size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View className="items-center py-10">
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                <LucideBell size={40} color="#fa8929" />
              </View>
              <Text className="text-gray-900 text-lg font-bold mb-2 uppercase tracking-tight">No New Alerts</Text>
              <Text className="text-gray-400 text-center font-medium">We'll notify you when your items sell or prices drop.</Text>
            </View>

            <TouchableOpacity 
              onPress={() => setNotificationsVisible(false)}
              className="bg-primary h-14 rounded-2xl items-center justify-center"
            >
              <Text className="text-white font-black uppercase tracking-widest text-xs">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter and Categories Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          className="flex-1 bg-black/80 justify-end"
          onPress={() => setFilterVisible(false)}
        >
          <View 
            className="bg-white rounded-t-[40px] h-[85%] border-t border-gray-100 p-6"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-6" />
            
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Marketplace</Text>
                <Text className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Refine your search</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setFilterVisible(false)}
                className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center border border-gray-200"
              >
                <LucideX size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Select Category</Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                <TouchableOpacity
                  onPress={() => { setActiveCategory('all'); setFilterVisible(false); }}
                  className={`w-[48%] mb-4 p-4 rounded-3xl flex-row items-center border ${activeCategory === 'all' ? 'bg-[#fa8929] border-[#fa8929]' : 'bg-gray-50 border-gray-100'}`}
                >
                  <View className={`w-10 h-10 rounded-2xl items-center justify-center ${activeCategory === 'all' ? 'bg-black/10' : 'bg-black/5'}`}>
                    <LucideLayoutGrid size={20} color={activeCategory === 'all' ? '#ffffff' : '#000'} />
                  </View>
                  <Text className={`ml-3 font-bold ${activeCategory === 'all' ? 'text-white' : 'text-gray-900'}`}>All Items</Text>
                </TouchableOpacity>

                {APP_CATEGORIES.map((cat) => {
                  const Icon = ICON_MAP[cat.id] || LucidePackage;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => { setActiveCategory(cat.id); setFilterVisible(false); }}
                      className={`w-[48%] mb-4 p-4 rounded-3xl flex-row items-center border ${activeCategory === cat.id ? 'bg-[#fa8929] border-[#fa8929]' : 'bg-gray-50 border-gray-100'}`}
                    >
                      <View className={`w-10 h-10 rounded-2xl items-center justify-center ${activeCategory === cat.id ? 'bg-black/10' : 'bg-black/5'}`}>
                        <Icon size={20} color={activeCategory === cat.id ? '#ffffff' : '#000'} />
                      </View>
                      <Text 
                        numberOfLines={1}
                        className={`ml-3 font-bold flex-1 ${activeCategory === cat.id ? 'text-white' : 'text-gray-900'}`}
                      >
                        {cat.name.split(' & ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <View className="h-32" />
            </ScrollView>

            <View className="absolute bottom-10 left-6 right-6">
              <TouchableOpacity 
                onPress={() => { setActiveCategory('all'); setFilterVisible(false); }}
                className="bg-blue-600 h-16 rounded-3xl items-center justify-center shadow-lg shadow-blue-600/20"
              >
                <Text className="text-white font-black uppercase tracking-widest">Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({});
