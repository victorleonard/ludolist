import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/stores/authStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const token = useAuthStore((s) => s.token);
  const loadToken = useAuthStore((s) => s.loadToken);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Charger le token, puis valider la session auprès de l'API
    (async () => {
      try {
        await loadToken();
        if (useAuthStore.getState().token) {
          await fetchUser();
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, [loadToken, fetchUser]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'games';
    const isLoginPage = segments[0] === 'login';

    if (!token && inAuthGroup) {
      router.replace('/login');
    } else if (token && isLoginPage) {
      router.replace('/(tabs)');
    }
  }, [token, segments, isReady, router]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="games/[id]" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});
