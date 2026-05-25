import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Center } from '@/components/ui/center';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';
import i18n from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';

export { ErrorBoundary } from 'expo-router';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isHydrated, loadToken, isAuthenticated, token } = useAuthStore();
  const localeHydrated = useLocaleStore((s) => s.isHydrated);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadToken().finally(() => setIsReady(true));
  }, [loadToken]);

  useEffect(() => {
    if (!isReady || !isHydrated || !localeHydrated) return;

    const inApp = segments[0] === '(drawer)';
    const onLogin = (segments as string[]).includes('login');

    if (!isAuthenticated() && inApp) {
      router.replace('/login' as Href);
    } else if (isAuthenticated() && onLogin) {
      router.replace('/' as Href);
    }
  }, [isReady, isHydrated, localeHydrated, segments, token, isAuthenticated, router]);

  if (!isReady || !isHydrated || !localeHydrated) {
    return (
      <Center className="flex-1 bg-background-50">
        <VStack space="md" className="items-center">
          <Spinner size="large" color={theme.colors.icon.accent} />
          <Text size="sm" className="text-typography-500">
            {i18n.t('common.loading')}
          </Text>
        </VStack>
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
  const hydrateLocale = useLocaleStore((s) => s.hydrate);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    hydrateLocale().finally(() => setI18nReady(true));
  }, [hydrateLocale]);

  if (!i18nReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <GluestackUIProvider mode="system">
          <QueryClientProvider client={queryClient}>
            <RootLayoutNav />
          </QueryClientProvider>
        </GluestackUIProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
