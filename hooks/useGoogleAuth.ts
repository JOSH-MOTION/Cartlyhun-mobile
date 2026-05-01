import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential).then(async (userCredential) => {
        const user = userCredential.user;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            role: 'customer',
            isActive: true,
            createdAt: new Date().toISOString(),
            photoURL: user.photoURL,
          });
        }
      }).catch((error) => {
        Alert.alert('Login Error', error.message);
      });
    } else if (response?.type === 'error') {
      Alert.alert('Google Error', 'Failed to connect to Google.');
    }
  }, [response]);

  const handlePrompt = async () => {
    if (!process.env.EXPO_PUBLIC_WEB_CLIENT_ID) {
      Alert.alert(
        'Configuration Required',
        'Google Client IDs are missing in mobile/.env. Please add EXPO_PUBLIC_WEB_CLIENT_ID, IOS_CLIENT_ID, and ANDROID_CLIENT_ID.'
      );
      return;
    }
    await promptAsync();
  };

  return { promptAsync: handlePrompt, disabled: !request };
}
