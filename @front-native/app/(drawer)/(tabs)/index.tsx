import { SafeAreaView } from 'react-native-safe-area-context';

import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  return (
    <SafeAreaView className="flex-1 bg-background-50">
      <Center className="flex-1 px-6">
        <VStack className="items-center gap-2">
          <Heading size="3xl" className="text-primary-700">
            Ludolist
          </Heading>
          {user ? (
            <Text size="md" className="text-center text-typography-600">
              Bienvenue, {user.username}
            </Text>
          ) : null}
          <Text size="sm" className="mt-2 text-center text-typography-500">
            Application connectée au backend Strapi
          </Text>
        </VStack>
      </Center>
    </SafeAreaView>
  );
}
