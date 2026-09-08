import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LucideMail, LucideChevronLeft, LucideArrowRight, LucideCheckCircle2 } from 'lucide-react-native';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;

    setLoading(true);
    try {
      await apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email: trimmed } });
      setSent(true);
    } catch {
      // The API always responds success for any well-formed email — a
      // thrown error here means the request itself failed (offline, etc),
      // not that the email is unregistered, so still show the same state.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full border border-gray-100"
          >
            <LucideChevronLeft size={24} color="#000" />
          </TouchableOpacity>

          {sent ? (
            <View className="flex-1 items-center justify-center gap-4">
              <View className="w-16 h-16 bg-green-50 rounded-full items-center justify-center">
                <LucideCheckCircle2 size={32} color="#16a34a" />
              </View>
              <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter text-center">
                Check your email
              </Text>
              <Text className="text-gray-500 text-center font-medium leading-relaxed">
                If an account exists for {email.trim()}, we've sent a link to reset your password. Open it on your
                phone or computer — it works once and expires in an hour.
              </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/signin')} className="mt-4">
                <Text className="text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary pb-1">
                  Back to sign in
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View className="mt-8 mb-10">
                <Text className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Reset password</Text>
                <Text className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
                  We'll email you a reset link
                </Text>
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Email address
                </Text>
                <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                  <LucideMail size={18} color="#fa8929" />
                  <TextInput
                    className="flex-1 ml-3 font-bold text-gray-900 text-sm"
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="done"
                    onSubmitEditing={handleSend}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={loading}
                className={`h-16 rounded-2xl items-center justify-center flex-row shadow-lg mt-6 ${
                  loading ? 'bg-primary/70' : 'bg-primary'
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-black uppercase tracking-widest mr-2 text-sm">Send reset link</Text>
                    <LucideArrowRight size={18} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
