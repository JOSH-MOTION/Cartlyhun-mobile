import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from 'nativewind';
import { useNotifications } from '@/hooks/useNotifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const segments = useSegments();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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

      if (hasSeen !== 'true' && !inOnboardingGroup) {
        // We delay hiding the splash screen slightly to ensure smooth transition
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
  const colorScheme = 'light';
  useNotifications();

  return (
    <View className="flex-1 bg-white">
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </View>
  );
}

