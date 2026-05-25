import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { AppDrawerContent } from '@/components/layout/AppDrawerContent';
import { theme } from '@/constants/theme';
import { useLocaleStore } from '@/stores/locale';

export default function DrawerLayout() {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <Drawer
      key={locale}
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
          title: t('nav.home'),
          drawerLabel: t('nav.home'),
        }}
      />
    </Drawer>
  );
}
