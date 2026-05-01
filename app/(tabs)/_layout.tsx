import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import { LucideHome, LucideShoppingCart, LucideUser, LucidePlusCircle, LucideSearch } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 80,
          paddingBottom: 20,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarBackground: undefined,
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
            <View className="bg-black p-3 rounded-full -mt-8 shadow-lg shadow-black/50 border-4 border-white">
              <LucidePlusCircle size={28} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <LucideShoppingCart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <LucideUser size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
