import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isAndroidExpoGo = isExpoGo && Platform.OS === 'android';

// Conditionally require expo-notifications to avoid side-effects in Expo Go on Android.
//
// Both the require and the handler registration run at import time, i.e. during
// app startup before anything renders. An exception here takes the whole app
// down on the splash screen with no error surface, so neither is allowed to
// throw — push notifications degrade to "off" rather than bricking the app.
let Notifications: any = null;

if (!isAndroidExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch (error) {
    console.error('expo-notifications unavailable; push disabled.', error);
    Notifications = null;
  }
}

if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // shouldShowBanner/shouldShowList replaced shouldShowAlert, which is
        // deprecated. The newer two are required, so omitting them left the
        // handler malformed.
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.error('Could not register the notification handler.', error);
  }
}

export function useNotifications() {
  const { user, profile } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<any>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (!user || isAndroidExpoGo || !Notifications) {
      if (isAndroidExpoGo) {
        console.log('Push notifications are not supported in Expo Go on Android (SDK 53+). Skipping.');
      }
      return;
    }

    registerForPushNotificationsAsync().then(token => {
      // Only update if we have a token and it's different from the one in the profile
      if (token && token !== profile?.expoPushToken) {
        setExpoPushToken(token);
        updateDoc(doc(db, 'users', user.uid), {
          expoPushToken: token,
          updatedAt: new Date().toISOString()
        }).catch(err => console.error("Error saving push token:", err));
      } else if (token) {
        setExpoPushToken(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
  if (isAndroidExpoGo || !Notifications) return;

  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#fa8929',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        console.warn("No Project ID found for push notifications. Make sure you have a project ID in app.json.");
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.error("Error getting expo push token:", e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}


