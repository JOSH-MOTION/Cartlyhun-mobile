import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { LucideMail, LucideLock, LucideArrowRight, LucideChevronLeft, LucideEye, LucideEyeOff, LucideFingerprint } from 'lucide-react-native';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasBiometricPreference, setHasBiometricPreference] = useState(false);
  const router = useRouter();
  const { promptAsync, disabled: googleDisabled } = useGoogleAuth();

  React.useEffect(() => {
    const checkBiometricPreference = async () => {
      const enabled = await AsyncStorage.getItem("biometrics-enabled") === "true";

      // Older builds cached the account password here. Nothing reads it now,
      // so clear it from any device that upgraded.
      await SecureStore.deleteItemAsync("user-password").catch(() => {});

      // Biometrics unlock the persisted Firebase session; there is no session
      // to unlock if the user has never signed in on this device.
      const cachedEmail = await SecureStore.getItemAsync("user-email");

      if (enabled && cachedEmail) {
        setHasBiometricPreference(true);
        handleBiometricSignIn();
      }
    };
    checkBiometricPreference();
  }, []);

  /**
   * Biometrics unlock the Firebase session that is already persisted on this
   * device — they are a local gate, not a second set of credentials.
   *
   * The previous version cached the account password in SecureStore and
   * replayed it here. SecureStore is encrypted, but a stored password is a
   * reusable secret: anyone who extracts it owns the account everywhere the
   * user reused that password. A persisted session can simply be revoked.
   */
  const handleBiometricSignIn = async () => {
    try {
      // Prompting on a device with no sensor, or with nothing enrolled, just
      // fails confusingly — check first and say something useful.
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert("Not available", "This device has no fingerprint or face sensor.");
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          "No biometrics enrolled",
          "Add a fingerprint or face unlock in your device settings, then try again.",
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock CartlyHub",
        fallbackLabel: "Use password",
      });

      if (!result.success) {
        // Silent failure previously left the user staring at the form with no
        // idea whether anything happened. Cancelling is deliberate, so stay quiet.
        if (result.error && result.error !== "user_cancel" && result.error !== "system_cancel") {
          Alert.alert("Unlock failed", "Sign in with your email and password instead.");
        }
        return;
      }

      if (!auth.currentUser) {
        Alert.alert(
          "Session expired",
          "Please sign in with your email and password once, then biometrics will work again.",
        );
        return;
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert("Unlock failed", "Sign in with your email and password instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      // Cache credentials if biometrics enabled
      // Only the email is kept, to know which account biometrics unlock. The
      // password is deliberately never stored — Firebase persists the session.
      const enabled = await AsyncStorage.getItem("biometrics-enabled") === "true";
      if (enabled) {
        await SecureStore.setItemAsync("user-email", trimmedEmail);
      }
      // Replace so the user can't go back to sign-in screen
      router.replace('/(tabs)');
    } catch (error: any) {
      let message = 'Sign in failed. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      Alert.alert('Sign In Failed', message);
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
              style={{ width: 140, height: 45 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-black text-gray-900 mt-6 uppercase tracking-tighter">Welcome Back</Text>
            <Text className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Sign in to your account</Text>
          </View>

          <View className="gap-y-5">
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
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
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
              onPress={handleSignIn}
              disabled={loading}
              className={`h-16 rounded-2xl items-center justify-center flex-row shadow-lg mt-2 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white font-black uppercase tracking-widest mr-2 text-sm">Sign In</Text>
                  <LucideArrowRight size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

            {hasBiometricPreference && (
              <TouchableOpacity 
                onPress={() => handleBiometricSignIn()}
                disabled={loading}
                className="h-16 rounded-2xl items-center justify-center flex-row border border-primary bg-primary/5 mt-2"
              >
                <LucideFingerprint size={20} color="#fa8929" />
                <Text className="text-primary font-black uppercase tracking-widest ml-3 text-xs">Biometric Sign In</Text>
              </TouchableOpacity>
            )}

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

          <View className="mt-10 pb-8 items-center">
            <Text className="text-gray-400 font-bold mb-3 uppercase text-[10px]">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text className="text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary pb-1">Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}