import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { parseDeepLink } from './src/services/deeplink';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      const route = parseDeepLink(url);
      if (route) {
        // Navigation will be handled by the linking config in AppNavigator
        console.log('Deep link:', route.screen, route.params);
      }
    });

    // Handle deep link that opened the app
    Linking.getInitialURL().then((url) => {
      if (url) {
        const route = parseDeepLink(url);
        if (route) {
          console.log('Initial deep link:', route.screen, route.params);
        }
      }
    });

    SplashScreen.hideAsync();

    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />
    </>
  );
}
