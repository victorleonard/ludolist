import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';

import { theme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[700],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
