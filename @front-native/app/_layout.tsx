import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Center } from '@/components/ui/center';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth';

export { ErrorBoundary } from 'expo-router';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isHydrated, loadToken, isAuthenticated, token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadToken().finally(() => setIsReady(true));
  }, [loadToken]);

  useEffect(() => {
    if (!isReady || !isHydrated) return;

    const inApp = segments[0] === '(drawer)';
    const onLogin = (segments as string[]).includes('login');

    if (!isAuthenticated() && inApp) {
      router.replace('/login' as Href);
    } else if (isAuthenticated() && onLogin) {
      router.replace('/' as Href);
    }
  }, [isReady, isHydrated, segments, token, isAuthenticated, router]);

  if (!isReady || !isHydrated) {
    return (
      <Center className="flex-1 bg-background-50">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </Center>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(drawer)" />
    </Stack>
  );
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="system">
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
