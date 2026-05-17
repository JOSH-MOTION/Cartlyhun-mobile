import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { LucideMail, LucideLock, LucideUser, LucideArrowRight, LucideChevronLeft, LucideEye, LucideEyeOff } from 'lucide-react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { promptAsync, disabled: googleDisabled } = useGoogleAuth();

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: trimmedName });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        role: 'customer',
        isActive: true,
        createdAt: new Date().toISOString(),
        photoURL: null,
      });

      // Replace so user can't go back to sign-up
      router.replace('/(tabs)');
    } catch (error: any) {
      let message = 'Sign up failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try signing in instead.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be at least 6 characters.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      }
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            className="mt-4 w-10 h-10 items-center justify-center bg-gray-50 rounded-full border border-gray-100"
          >
            <LucideChevronLeft size={24} color="#000" />
          </TouchableOpacity>

          <View className="mt-8 mb-10 items-center">
            <Image 
              source={require('@/assets/images/logo.png')} 
              style={{ width: 130, height: 40 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-black text-gray-900 mt-6 uppercase tracking-tighter">Join the Hub</Text>
            <Text className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Create your free account</Text>
          </View>

          <View className="gap-y-5">
            {/* Full Name */}
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</Text>
              <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                <LucideUser size={18} color="#fa8929" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-gray-900 text-sm"
                  placeholder="John Doe"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
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
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</Text>
              <View className="bg-gray-50 flex-row items-center px-4 py-4 rounded-2xl border border-gray-100">
                <LucideLock size={18} color="#fa8929" />
                <TextInput 
                  className="flex-1 ml-3 font-bold text-gray-900 text-sm"
                  placeholder="At least 6 characters"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword 
                    ? <LucideEyeOff size={18} color="#94a3b8" />
                    : <LucideEye size={18} color="#94a3b8" />
                  }
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleSignUp}
              disabled={loading}
              className={`h-16 rounded-2xl items-center justify-center flex-row shadow-lg mt-2 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white font-black uppercase tracking-widest mr-2 text-sm">Create Account</Text>
                  <LucideArrowRight size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-gray-100" />
              <Text className="mx-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Or continue with</Text>
              <View className="flex-1 h-[1px] bg-gray-100" />
            </View>

            {/* Google */}
            <TouchableOpacity 
              onPress={() => promptAsync()}
              disabled={googleDisabled || loading}
              className="w-full h-14 bg-white border border-gray-200 rounded-2xl flex-row items-center justify-center shadow-sm"
            >
              <Image 
                source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
                style={{ width: 22, height: 22 }}
              />
              <Text className="ml-3 font-black text-gray-800 uppercase tracking-tight text-sm">Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-10 pb-12 items-center">
            <Text className="text-gray-400 font-bold mb-3 uppercase text-[10px]">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signin')}>
              <Text className="text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary pb-1">Sign In Instead</Text>
            </TouchableOpacity>
            <Text className="text-center text-[9px] text-gray-300 font-bold mt-8 px-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}