import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LucideHome, LucideMessageCircle, LucideUser, LucidePlusCircle, LucideSearch, LucideHeart } from 'lucide-react-native';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fa8929',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 25 : insets.bottom + 5,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
        },
        tabBarBackground: () => (
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        ),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <LucideSearch size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color }) => (
            <View className="bg-primary p-3 rounded-full -mt-8 shadow-lg shadow-primary/40 border-4 border-white">
              <LucidePlusCircle size={28} color="#ffffff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <LucideMessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <LucideUser size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <LucideHeart size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
