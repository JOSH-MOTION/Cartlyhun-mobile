import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { LucideMail, LucideLock, LucideArrowRight, LucideChevronLeft } from 'lucide-react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { promptAsync, disabled: googleDisabled } = useGoogleAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/profile');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-8">
      <TouchableOpacity 
        onPress={() => router.back()}
        className="mt-4 w-10 h-10 items-center justify-center bg-surface rounded-full border border-white/5"
      >
        <LucideChevronLeft size={24} color="#442efb" />
      </TouchableOpacity>

      <View className="mt-12 mb-12 items-center">
        <Image 
          source={require('@/assets/images/logo.png')} 
          style={{ width: 180, height: 60 }}
          resizeMode="contain"
          className="opacity-90"
        />
        <Text className="text-2xl font-black text-gray-900 mt-8">Welcome Back</Text>
        <Text className="text-gray-500 font-medium mt-2">Sign in to your account</Text>
      </View>

      <View className="gap-y-6">
        <View>
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
          <View className="bg-surface flex-row items-center px-4 py-4 rounded-2xl border border-white/5">
            <LucideMail size={18} color="#442efb" />
            <TextInput 
              className="flex-1 ml-3 font-bold text-gray-900"
              placeholder="name@example.com"
              placeholderTextColor="#444"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</Text>
          <View className="bg-surface flex-row items-center px-4 py-4 rounded-2xl border border-white/5">
            <LucideLock size={18} color="#442efb" />
            <TextInput 
              className="flex-1 ml-3 font-bold text-gray-900"
              placeholder="••••••••"
              placeholderTextColor="#444"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSignIn}
          disabled={loading}
          className="bg-primary h-16 rounded-2xl items-center justify-center flex-row shadow-2xl shadow-primary/20 mt-4"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text className="text-background font-black uppercase tracking-widest mr-2">Sign In</Text>
              <LucideArrowRight size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>

        <View className="relative my-8">
          <View className="absolute inset-0 flex items-center justify-center">
            <View className="w-full border-t border-white/5" />
          </View>
          <View className="relative flex-row justify-center">
            <Text className="bg-white px-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Or continue with
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => promptAsync()}
          disabled={googleDisabled || loading}
          className="w-full h-16 bg-surface border border-white/5 rounded-2xl flex-row items-center justify-center shadow-sm"
        >
          <Image 
            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
            style={{ width: 24, height: 24 }}
          />
          <Text className="ml-3 font-black text-gray-900 uppercase tracking-tight">Google</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-auto pb-8 items-center">
        <Text className="text-gray-500 font-medium mb-4">Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
          <Text className="text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary pb-1">Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
