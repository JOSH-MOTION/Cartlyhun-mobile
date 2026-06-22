import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

import { useNotifications } from '@/hooks/useNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      checkOnboarding();
    }
  }, [loaded]);

  const checkOnboarding = async () => {
    try {
      const hasSeen = await AsyncStorage.getItem('has_seen_onboarding');
      const inOnboardingGroup = segments[0] === 'onboarding';
      const inAuthGroup = segments[0] === 'auth';

      if (hasSeen !== 'true' && !inOnboardingGroup && !inAuthGroup) {
        router.replace('/onboarding');
        setTimeout(() => SplashScreen.hideAsync(), 500);
      } else {
        SplashScreen.hideAsync();
      }
    } catch (e) {
      SplashScreen.hideAsync();
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  useNotifications();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="store-setup" options={{ headerShown: false }} />
          <Stack.Screen name="account/profile" options={{ headerShown: false }} />
          <Stack.Screen name="account/settings" options={{ headerShown: false }} />
          <Stack.Screen name="account/orders" options={{ headerShown: false }} />
          <Stack.Screen name="account/payment-methods" options={{ headerShown: false }} />
          <Stack.Screen name="account/language" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}