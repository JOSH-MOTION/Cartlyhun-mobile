import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LucideArrowRight, LucideCheck } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Elite Marketplace',
    description: 'Discover the most premium products curated for the Ghanaian lifestyle.',
    image: require('@/assets/images/onboarding-1.png'),
    color: '#fa8929',
  },
  {
    id: '2',
    title: 'Swift Delivery',
    description: 'Experience lightning-fast logistics with our dedicated CartlyHub courier network.',
    image: require('@/assets/images/onboarding-2.png'),
    color: '#fa8929',
  },
  {
    id: '3',
    title: 'Secure Trading',
    description: 'Trade with absolute confidence using our verified seller system and safety protocols.',
    image: require('@/assets/images/onboarding-3.png'),
    color: '#fa8929',
  },
];


export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    router.replace('/(tabs)');
  };

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          data={ONBOARDING_DATA}
          renderItem={({ item }) => (
            <View style={{ width }} className="flex-1 items-center px-12">
              <View className="h-[55%] justify-center items-center">
                <View className="w-72 h-72 bg-gray-50 rounded-[60px] items-center justify-center overflow-hidden">
                  <Image 
                    source={item.image} 
                    style={{ width: '80%', height: '80%' }} 
                    resizeMode="contain" 
                  />
                </View>
              </View>
              
              <View className="h-[45%] items-center pt-8">
                <Text className="text-3xl font-black text-center text-gray-900 leading-[38px] uppercase tracking-tighter mb-5">
                  {item.title}
                </Text>
                <Text className="text-gray-400 font-bold text-center text-base leading-7 px-2">
                  {item.description}
                </Text>
              </View>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View className="px-10 pb-16 pt-4">
        {/* Pagination Indicator */}
        <View className="flex-row justify-center h-1.5 mb-14">
          {ONBOARDING_DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [12, 32, 12],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.2, 1, 0.2],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                className="h-full bg-primary rounded-full mx-1.5"
                style={{ width: dotWidth, opacity }}
              />
            );
          })}
        </View>

        {/* Buttons Bar */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-gray-300 font-black text-[11px] uppercase tracking-[3px]">Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleNext}
            className="bg-primary px-12 py-5 rounded-[24px] shadow-xl shadow-primary/30"
          >
            <Text className="text-white font-black text-xs uppercase tracking-[2px]">
              {currentIndex === ONBOARDING_DATA.length - 1 ? 'Start Session' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
