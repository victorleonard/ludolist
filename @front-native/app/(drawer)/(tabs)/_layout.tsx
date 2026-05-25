import { Tabs } from 'expo-router';
import { Dices, Home } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { theme } from '@/constants/theme';
import { useLocaleStore } from '@/stores/locale';

export default function TabLayout() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <Tabs
      key={locale}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[700],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: t('nav.games'),
          tabBarIcon: ({ color, size }) => (
            <Dices color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
