import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { colors } from '@/constants/theme';
import { parseDeepLink } from '@/services/deeplink';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function RootLayout() {
  const router = useRouter();

  // Handle incoming deep links
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const route = parseDeepLink(event.url);
      if (!route) return;

      switch (route.screen) {
        case 'ProductDetail':
          router.push(`/product/${route.params.slug}` as any);
          break;
        case 'IngredientDetail':
          router.push(`/ingredient/${route.params.slug}` as any);
          break;
        case 'NeedDetail':
          router.push(`/need/${route.params.slug}` as any);
          break;
        case 'Search':
          router.push(`/(tabs)/search?q=${encodeURIComponent(route.params.query || '')}` as any);
          break;
      }
    };

    // Handle cold start deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    // Handle warm deep links
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [router]);

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.white },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '600', color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[slug]"
          options={{ title: 'Ürün Detay' }}
        />
        <Stack.Screen
          name="ingredient/[slug]"
          options={{ title: 'İçerik Detay' }}
        />
        <Stack.Screen
          name="need/[slug]"
          options={{ title: 'İhtiyaç Detay' }}
        />
        <Stack.Screen
          name="compare"
          options={{ title: 'Karşılaştır' }}
        />
        <Stack.Screen
          name="routine"
          options={{ title: 'Rutin Oluştur' }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
