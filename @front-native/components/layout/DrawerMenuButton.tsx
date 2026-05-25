import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { Menu } from 'lucide-react-native';

import { Pressable } from '@/components/ui/pressable';
import { theme } from '@/constants/theme';

export function DrawerMenuButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      className="h-11 w-11 items-center justify-center rounded-xl border border-outline-200 bg-background-0 active:bg-background-100"
      accessibilityLabel="Ouvrir le menu"
      accessibilityRole="button"
    >
      <Menu size={24} color={theme.colors.icon.primary} strokeWidth={2} />
    </Pressable>
  );
}
