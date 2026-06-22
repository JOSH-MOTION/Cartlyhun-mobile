import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  LucideChevronLeft,
  LucideCreditCard,
  LucidePlus,
  LucideTrash2,
  LucideCheck,
  LucideSmartphone,
  LucideX,
  LucideShield,
} from 'lucide-react-native';

const CARD_COLORS = ['#fa8929', '#3b82f6', '#10b981', '#8b5cf6'];

type PaymentMethod = {
  id: string;
  type: 'card' | 'momo';
  label: string;
  last4: string;
  expiry?: string;
  network?: string;
  isDefault: boolean;
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'momo', label: 'MTN Mobile Money', last4: '3450', network: 'MTN', isDefault: true },
    { id: '2', type: 'card', label: 'Visa Debit', last4: '4242', expiry: '12/26', isDefault: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [addType, setAddType] = useState<'card' | 'momo'>('momo');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('MTN');

  const setDefault = (id: string) => {
    setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  const removeMethod = (id: string) => {
    const method = methods.find(m => m.id === id);
    if (method?.isDefault) {
      Alert.alert('Cannot Remove', 'Set another method as default before removing this one.');
      return;
    }
    Alert.alert('Remove Payment Method', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setMethods(prev => prev.filter(m => m.id !== id)) },
    ]);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const handleAdd = () => {
    if (addType === 'card') {
      const raw = cardNumber.replace(/\s/g, '');
      if (raw.length < 13) { Alert.alert('Invalid', 'Enter a valid card number.'); return; }
      if (expiry.length < 5) { Alert.alert('Invalid', 'Enter a valid expiry date.'); return; }
      if (cvv.length < 3) { Alert.alert('Invalid', 'Enter a valid CVV.'); return; }
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        label: raw.startsWith('4') ? 'Visa Card' : raw.startsWith('5') ? 'Mastercard' : 'Debit Card',
        last4: raw.slice(-4),
        expiry,
        isDefault: methods.length === 0,
      };
      setMethods(prev => [...prev, newMethod]);
    } else {
      const cleaned = momoNumber.replace(/\D/g, '');
      if (cleaned.length < 9) { Alert.alert('Invalid', 'Enter a valid mobile money number.'); return; }
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'momo',
        label: `${momoNetwork} Mobile Money`,
        last4: cleaned.slice(-4),
        network: momoNetwork,
        isDefault: methods.length === 0,
      };
      setMethods(prev => [...prev, newMethod]);
    }
    setCardNumber(''); setExpiry(''); setCvv(''); setMomoNumber('');
    setShowModal(false);
    Alert.alert('Added!', 'Payment method added successfully.');
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-white border-b border-gray-50">
        <View className="px-6 py-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <LucideChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter ml-2">Payment Methods</Text>
          </View>
          <TouchableOpacity onPress={() => setShowModal(true)} className="p-2 bg-primary/10 rounded-2xl">
            <LucidePlus size={20} color="#fa8929" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-2">Saved Methods</Text>

        {methods.map((method, idx) => (
          <View
            key={method.id}
            style={{ backgroundColor: CARD_COLORS[idx % CARD_COLORS.length] }}
            className="rounded-[32px] p-6 mb-4 shadow-xl relative overflow-hidden"
          >
            <View className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute -top-6 -left-6 w-24 h-24 bg-black/5 rounded-full" />

            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center">
                {method.type === 'momo' ? (
                  <LucideSmartphone size={22} color="#fff" />
                ) : (
                  <LucideCreditCard size={22} color="#fff" />
                )}
                <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">{method.label}</Text>
              </View>
              {method.isDefault && (
                <View className="bg-white/20 px-3 py-1 rounded-full border border-white/30">
                  <Text className="text-white font-black text-[8px] uppercase tracking-widest">Default</Text>
                </View>
              )}
            </View>

            <Text className="text-white font-black text-xl tracking-[8px] mb-1">
              •••• •••• •••• {method.last4}
            </Text>
            {method.expiry && (
              <Text className="text-white/70 font-bold text-[10px] uppercase tracking-widest">Expires {method.expiry}</Text>
            )}
            {method.network && (
              <Text className="text-white/70 font-bold text-[10px] uppercase tracking-widest">{method.network} Network</Text>
            )}

            <View className="flex-row gap-3 mt-6">
              {!method.isDefault && (
                <TouchableOpacity
                  onPress={() => setDefault(method.id)}
                  className="flex-row items-center bg-white/20 px-4 py-2.5 rounded-2xl border border-white/30"
                >
                  <LucideCheck size={14} color="#fff" />
                  <Text className="text-white font-black text-[9px] uppercase tracking-widest ml-1.5">Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => removeMethod(method.id)}
                className="flex-row items-center bg-black/20 px-4 py-2.5 rounded-2xl border border-white/10"
              >
                <LucideTrash2 size={14} color="#fff" />
                <Text className="text-white font-black text-[9px] uppercase tracking-widest ml-1.5">Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {methods.length === 0 && (
          <View className="items-center py-16">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4 border border-gray-100">
              <LucideCreditCard size={32} color="#cbd5e1" />
            </View>
            <Text className="text-gray-900 font-black uppercase tracking-tight mb-1">No Payment Methods</Text>
            <Text className="text-gray-400 font-bold text-xs text-center">Add a card or mobile money account to get started.</Text>
          </View>
        )}

        <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-3xl p-4 mt-4">
          <LucideShield size={18} color="#3b82f6" />
          <Text className="text-blue-500 font-bold text-[10px] ml-3 flex-1 uppercase leading-4">
            Your payment info is encrypted and secured by Paystack PCI-DSS Level 1 standards.
          </Text>
        </View>
      </ScrollView>

      {/* Add Method Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-8 pb-12">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter">Add Method</Text>
                <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-gray-50 rounded-2xl">
                  <LucideX size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Type Toggle */}
              <View className="flex-row bg-gray-50 rounded-2xl p-1 mb-8">
                {(['momo', 'card'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setAddType(t)}
                    className={`flex-1 py-3 rounded-xl items-center ${addType === t ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`font-black text-[10px] uppercase tracking-widest ${addType === t ? 'text-primary' : 'text-gray-400'}`}>
                      {t === 'momo' ? 'Mobile Money' : 'Debit / Credit Card'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {addType === 'momo' ? (
                <View className="gap-y-4">
                  <View className="flex-row bg-gray-50 rounded-2xl p-1 mb-2">
                    {['MTN', 'Vodafone', 'AirtelTigo'].map(net => (
                      <TouchableOpacity
                        key={net}
                        onPress={() => setMomoNetwork(net)}
                        className={`flex-1 py-2.5 rounded-xl items-center ${momoNetwork === net ? 'bg-white shadow-sm' : ''}`}
                      >
                        <Text className={`font-black text-[9px] uppercase ${momoNetwork === net ? 'text-primary' : 'text-gray-400'}`}>{net}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View className="bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 flex-row items-center">
                    <LucideSmartphone size={18} color="#94a3b8" />
                    <TextInput
                      className="flex-1 ml-4 text-gray-900 font-black text-xs"
                      placeholder="0244 000 000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      value={momoNumber}
                      onChangeText={setMomoNumber}
                    />
                  </View>
                </View>
              ) : (
                <View className="gap-y-4">
                  <View className="bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4 flex-row items-center">
                    <LucideCreditCard size={18} color="#94a3b8" />
                    <TextInput
                      className="flex-1 ml-4 text-gray-900 font-black text-xs tracking-widest"
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      value={cardNumber}
                      onChangeText={t => setCardNumber(formatCardNumber(t))}
                      maxLength={19}
                    />
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4">
                      <TextInput
                        className="text-gray-900 font-black text-xs"
                        placeholder="MM/YY"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        value={expiry}
                        onChangeText={t => setExpiry(formatExpiry(t))}
                        maxLength={5}
                      />
                    </View>
                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl px-6 py-4">
                      <TextInput
                        className="text-gray-900 font-black text-xs"
                        placeholder="CVV"
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                        secureTextEntry
                        value={cvv}
                        onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                      />
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={handleAdd}
                className="mt-8 bg-primary h-16 rounded-[24px] items-center justify-center shadow-xl shadow-primary/20"
              >
                <Text className="text-white font-black uppercase tracking-[3px] text-xs">Add Payment Method</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
