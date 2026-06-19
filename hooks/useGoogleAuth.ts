import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Configure once at module level
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  scopes: ['profile', 'email'],
});

export function useGoogleAuth() {
  const router = useRouter();

  const promptAsync = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert('Login Error', 'Google did not return a valid token.');
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email,
          role: 'customer',
          isActive: true,
          createdAt: new Date().toISOString(),
          photoURL: user.photoURL || null,
        });
      }

      router.replace('/(tabs)');

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled — silent
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Please wait', 'Sign in already in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available.');
      } else {
        console.error('Google sign-in error:', error);
        Alert.alert('Login Error', 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  return { promptAsync, disabled: false };
}