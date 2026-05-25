import { Link as RouterLink, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('common.oops') }} />
      <Center className="flex-1 bg-background-50 px-5">
        <VStack space="lg" className="items-center">
          <Heading size="xl" className="text-center text-typography-900">
            {t('notFound.title')}
          </Heading>
          <RouterLink href="/" asChild>
            <Pressable className="py-4">
              <Text size="sm" className="font-medium text-primary-600">
                {t('notFound.backHome')}
              </Text>
            </Pressable>
          </RouterLink>
        </VStack>
      </Center>
    </>
  );
}
