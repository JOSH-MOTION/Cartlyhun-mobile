import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Biometrics gate the persisted Firebase session, not a second credential.
 * Once the session is gone (sign-out), there is nothing left to unlock, so
 * the cached preference and email must go with it — otherwise the next
 * visit to the sign-in screen auto-fires a biometric prompt that can only
 * end in "Session expired".
 */
export async function clearBiometricSession() {
  await AsyncStorage.removeItem('biometrics-enabled');
  await SecureStore.deleteItemAsync('user-email').catch(() => {});
  await SecureStore.deleteItemAsync('user-password').catch(() => {});
}
