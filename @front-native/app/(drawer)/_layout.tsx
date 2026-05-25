import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/components/layout/AppDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        swipeEdgeWidth: 50,
        drawerActiveTintColor: '#0284c7',
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
