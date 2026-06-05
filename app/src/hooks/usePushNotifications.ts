import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';
import {registerDeviceToken} from '../api/notifications';

export function usePushNotifications(isAuthenticated: boolean) {
  useEffect(() => {
    if (!isAuthenticated) return;

    let cleanupFns: Array<() => void> = [];

    async function setup() {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        } else if (Platform.OS === 'ios') {
          await messaging().requestPermission();
        }

        const token = await messaging().getToken();
        if (token) {
          registerDeviceToken(token, Platform.OS as 'android' | 'ios').catch(() => {});
        }

        const unsubRefresh = messaging().onTokenRefresh(newToken => {
          registerDeviceToken(newToken, Platform.OS as 'android' | 'ios').catch(() => {});
        });

        // Foreground: Socket.IO already handles in-app badge — no-op to avoid duplicates
        const unsubFg = messaging().onMessage(async () => {});

        cleanupFns = [unsubRefresh, unsubFg];
      } catch {
        // Non-fatal: app still works without push
      }
    }

    setup();

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [isAuthenticated]);
}
