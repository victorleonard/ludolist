import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/components/layout/AppDrawerContent';
import { theme } from '@/constants/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        swipeEdgeWidth: 50,
        drawerActiveTintColor: theme.colors.icon.primary,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Accueil',
          drawerLabel: 'Accueil',
        }}
      />
    </Drawer>
  );
}
