import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCart from '@/store/useCart';
import { LucideTrash2, LucideChevronRight, LucideShoppingBag } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const total = getTotal();

  return (
    <View className="flex-1 bg-[#F8F9FA]">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="px-8 pt-4 pb-6 border-b border-gray-50">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-[2px] mb-1">Your Order</Text>
          <Text className="text-3xl font-black text-black">Checkout</Text>
        </View>
      </SafeAreaView>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
            <LucideShoppingBag size={40} color="#cbd5e1" />
          </View>
          <Text className="text-xl font-bold text-slate-800 mb-2">Empty Bag</Text>
          <Text className="text-center text-slate-400 font-medium">Looks like you haven't added any premium items yet.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.product.id}-${index}`}
            contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center mb-6 bg-white p-5 rounded-[32px] shadow-sm border border-white">
                <Image 
                  source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-24 h-24 rounded-3xl bg-slate-100"
                />
                <View className="flex-1 ml-5">
                  <Text className="text-lg font-black text-slate-900 mb-1" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-blue-500 font-bold mb-3">₵{item.variant.price || item.product.basePrice}</Text>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1, item.selections)}
                      className="w-10 h-10 bg-slate-50 rounded-2xl items-center justify-center"
                    >
                      <Text className="text-xl font-bold">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-5 font-black text-lg">{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1, item.selections)}
                      className="w-10 h-10 bg-slate-50 rounded-2xl items-center justify-center"
                    >
                      <Text className="text-xl font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeItem(item.product.id, item.variant.id, item.selections)}
                  className="p-3 bg-red-50 rounded-2xl"
                >
                  <LucideTrash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />

          <BlurView intensity={100} tint="light" style={styles.footer}>
            <View className="px-8 py-8 pb-12">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-slate-400 text-xs font-bold uppercase mb-1">Subtotal</Text>
                  <Text className="text-3xl font-black text-black">₵{total}</Text>
                </View>
                <View className="bg-green-50 px-4 py-2 rounded-full">
                  <Text className="text-green-600 font-bold text-xs">FREE SHIPPING</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-black flex-row items-center justify-center h-16 rounded-[24px] shadow-xl shadow-black/20"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg mr-2">Complete Purchase</Text>
                <LucideChevronRight size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </>
      )}
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
