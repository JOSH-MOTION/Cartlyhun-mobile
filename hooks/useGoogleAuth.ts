import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// @react-native-google-signin requires a native build — not available in Expo Go.
// We lazy-load it so the app doesn't crash when running in Expo Go.
let GoogleSignin: any = null;
let statusCodes: any = {};
let googleSigninAvailable = false;

try {
  const mod = require('@react-native-google-signin/google-signin');
  GoogleSignin = mod.GoogleSignin;
  statusCodes = mod.statusCodes;

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  googleSigninAvailable = true;
} catch (_e) {
  console.warn(
    '[useGoogleAuth] RNGoogleSignin native module not found. ' +
    'Google Sign-In requires a development or production build — it does not work in Expo Go.'
  );
}

export function useGoogleAuth() {
  const router = useRouter();

  const promptAsync = async () => {
    // Guard: native module not available (Expo Go)
    if (!googleSigninAvailable || !GoogleSignin) {
      Alert.alert(
        'Not Available',
        'Google Sign-In is not available in Expo Go. Please use a development build or the production APK.'
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();

      // Google reuses the cached account and skips the picker entirely when a
      // session is still active, so anyone with several accounts on the phone
      // gets silently signed into whichever they used last. Clearing the local
      // session first forces the chooser to appear every time.
      //
      // This only signs out of the Google *client* — the Firebase session is
      // untouched, and nothing is revoked, so the account stays connected.
      try {
        await GoogleSignin.signOut();
      } catch {
        // No previous session to clear; the picker will show anyway.
      }

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