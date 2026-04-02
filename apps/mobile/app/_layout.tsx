import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <>
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
    </>
  );
}
