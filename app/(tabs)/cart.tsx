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
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-background">
        <View className="px-8 pt-4 pb-6 border-b border-white/5">
          <Text className="text-sm font-bold text-muted uppercase tracking-[2px] mb-1">Your Order</Text>
          <Text className="text-3xl font-black text-white">Checkout</Text>
        </View>
      </SafeAreaView>

      {items.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-white/5">
            <LucideShoppingBag size={40} color="#333" />
          </View>
          <Text className="text-xl font-bold text-white mb-2">Empty Bag</Text>
          <Text className="text-center text-muted font-medium">Looks like you haven't added any premium items yet.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.product.id}-${index}`}
            contentContainerStyle={{ padding: 24, paddingBottom: 220 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View className="flex-row items-center mb-6 bg-surface p-5 rounded-[32px] border border-white/5 shadow-2xl">
                <Image 
                  source={{ uri: item.product.images?.[0] || 'https://via.placeholder.com/100' }} 
                  className="w-24 h-24 rounded-3xl bg-background"
                />
                <View className="flex-1 ml-5">
                  <Text className="text-lg font-black text-white mb-1" numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text className="text-primary font-bold mb-3">₵{item.variant.price || item.product.basePrice}</Text>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity - 1, item.selections)}
                      className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                    >
                      <Text className="text-xl font-bold text-white">-</Text>
                    </TouchableOpacity>
                    <Text className="mx-5 font-black text-lg text-white">{item.quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product.id, item.variant.id, item.quantity + 1, item.selections)}
                      className="w-10 h-10 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                    >
                      <Text className="text-xl font-bold text-white">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => removeItem(item.product.id, item.variant.id, item.selections)}
                  className="p-3 bg-red-500/10 rounded-2xl"
                >
                  <LucideTrash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            )}
          />

          <BlurView intensity={20} tint="dark" style={styles.footer}>
            <View className="px-8 py-8 pb-12">
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-muted text-xs font-bold uppercase mb-1">Subtotal</Text>
                  <Text className="text-3xl font-black text-primary">₵{total}</Text>
                </View>
                <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  <Text className="text-primary font-bold text-xs">FREE SHIPPING</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-primary flex-row items-center justify-center h-16 rounded-[24px] shadow-xl shadow-primary/20"
                activeOpacity={0.8}
              >
                <Text className="text-background font-bold text-lg mr-2 uppercase tracking-widest">Complete Purchase</Text>
                <LucideChevronRight size={20} color="#121212" />
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
    bottom: 85,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  }
});
