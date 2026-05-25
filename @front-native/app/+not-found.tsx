import { Link as RouterLink, Stack } from 'expo-router';

import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Center className="flex-1 bg-background-50 px-5">
        <VStack space="lg" className="items-center">
          <Heading size="xl" className="text-center text-typography-900">
            Cette page n&apos;existe pas.
          </Heading>
          <RouterLink href="/" asChild>
            <Pressable className="py-4">
              <Text size="sm" className="font-medium text-primary-600">
                Retour à l&apos;accueil
              </Text>
            </Pressable>
          </RouterLink>
        </VStack>
      </Center>
    </>
  );
}
