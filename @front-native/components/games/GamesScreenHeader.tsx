import { useTranslation } from 'react-i18next';

import { DrawerMenuButton } from '@/components/layout/DrawerMenuButton';
import { UserAvatarButton } from '@/components/layout/UserAvatarButton';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

export function GamesScreenHeader() {
  const { t } = useTranslation();

  return (
    <HStack className="items-center gap-3 px-4 pb-2 pt-4">
      <DrawerMenuButton />
      <VStack className="min-w-0 flex-1 justify-center">
        <Heading size="2xl" className="text-primary-700">
          {t('games.collectionTitle')}
        </Heading>
      </VStack>
      <UserAvatarButton />
    </HStack>
  );
}
