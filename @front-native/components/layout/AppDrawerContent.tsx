import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useRouter, type Href } from 'expo-router';
import { LogOut } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuthStore } from '@/stores/auth';

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as Href);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <Box className="border-b border-outline-200 px-4 py-6">
        <Heading size="xl" className="text-primary-700">
          Ludolist
        </Heading>
        {user ? (
          <VStack className="mt-1 gap-0.5">
            <Text size="sm" className="text-typography-600">
              {user.username}
            </Text>
            {user.email ? (
              <Text size="xs" className="text-typography-500">
                {user.email}
              </Text>
            ) : null}
          </VStack>
        ) : null}
      </Box>
      <DrawerItemList {...props} />
      <Box className="mt-auto border-t border-outline-200 px-2 py-4">
        <DrawerItem
          label="Déconnexion"
          onPress={handleLogout}
          icon={({ color, size }) => (
            <LogOut color={color} size={size} strokeWidth={2} />
          )}
          inactiveTintColor="#dc2626"
          activeTintColor="#dc2626"
        />
      </Box>
    </DrawerContentScrollView>
  );
}
