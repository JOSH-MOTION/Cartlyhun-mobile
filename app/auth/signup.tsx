import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { LucideMail, LucideLock, LucideUser, LucideArrowRight, LucideChevronLeft } from 'lucide-react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { promptAsync, disabled: googleDisabled } = useGoogleAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Profile
      await updateProfile(user, { displayName: name });

      // Create Firestore Doc
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: 'customer',
        isActive: true,
        createdAt: new Date().toISOString(),
        photoURL: null,
      });

      router.replace('/(tabs)/profile');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-8">
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-4 w-10 h-10 items-center justify-center bg-slate-50 rounded-full"
        >
          <LucideChevronLeft size={24} color="#000" />
        </TouchableOpacity>

        <View className="mt-8 mb-10 items-center">
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={{ width: 150, height: 50 }}
            resizeMode="contain"
          />
          <Text className="text-2xl font-black text-slate-900 mt-6">Join the Hub</Text>
          <Text className="text-slate-400 font-medium mt-2">Create your premium account</Text>
        </View>

        <View className="gap-y-6">
          <View>
            <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">Full Name</Text>
            <View className="bg-slate-50 flex-row items-center px-4 py-4 rounded-2xl border border-slate-100">
              <LucideUser size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-slate-800"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
            <View className="bg-slate-50 flex-row items-center px-4 py-4 rounded-2xl border border-slate-100">
              <LucideMail size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-slate-800"
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 ml-1">Password</Text>
            <View className="bg-slate-50 flex-row items-center px-4 py-4 rounded-2xl border border-slate-100">
              <LucideLock size={18} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 font-bold text-slate-800"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSignUp}
            disabled={loading}
            className="bg-black h-16 rounded-2xl items-center justify-center flex-row shadow-xl shadow-black/20 mt-4"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-black uppercase tracking-widest mr-2">Create Account</Text>
                <LucideArrowRight size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View className="relative my-8">
            <View className="absolute inset-0 flex items-center justify-center">
              <View className="w-full border-t border-slate-100" />
            </View>
            <View className="relative flex-row justify-center">
              <Text className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Or continue with
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => promptAsync()}
            disabled={googleDisabled || loading}
            className="w-full h-16 bg-white border border-slate-200 rounded-2xl flex-row items-center justify-center shadow-sm"
          >
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
              style={{ width: 24, height: 24 }}
            />
            <Text className="ml-3 font-black text-slate-800 uppercase tracking-tight">Google</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-12 pb-12 items-center">
          <Text className="text-slate-400 font-medium mb-4">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/signin')}>
            <Text className="text-black font-black uppercase tracking-widest text-xs border-b-2 border-black pb-1">Sign In Instead</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
