import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCart from '@/store/useCart';
import { LucideTrash2, LucideChevronRight } from 'lucide-react-native';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const total = getTotal();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
      <Text className="text-3xl font-black text-black mb-8">My Cart</Text>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg">Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.product.id}-${index}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl">
                <Image 
                  source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-20 h-20 rounded-2xl bg-gray-200"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-lg font-bold text-black" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-gray-500 mb-2">₵{item.variant.price || item.product.basePrice}</Text>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1, item.selections)}
                      className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-100"
                    >
                      <Text className="text-lg">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-4 font-bold">{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1, item.selections)}
                      className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-100"
                    >
                      <Text className="text-lg">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeItem(item.product.id, item.variant.id, item.selections)}
                  className="p-2"
                >
                  <LucideTrash2 size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Checkout Footer */}
          <View className="py-8 border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-500 text-lg">Total</Text>
              <Text className="text-3xl font-black text-black">₵{total}</Text>
            </View>
            <TouchableOpacity 
              className="bg-black flex-row items-center justify-center p-5 rounded-3xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-xl mr-2">Checkout</Text>
              <LucideChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
      </View>
    </SafeAreaView>
  );
}
