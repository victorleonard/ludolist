import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { theme } from '@/constants/theme';

type IosBackButtonProps = {
  label?: string;
  onPress?: () => void;
};

export function IosBackButton({ label, onPress }: IosBackButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const backLabel = label ?? t('nav.games');

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      className="-ml-1 flex-row items-center py-1 pr-2 active:opacity-60"
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
    >
      <HStack className="items-center">
        <ChevronLeft
          size={28}
          color={theme.colors.icon.primary}
          strokeWidth={2}
        />
        <Text size="lg" className="-ml-0.5 font-normal text-primary-600">
          {backLabel}
        </Text>
      </HStack>
    </Pressable>
  );
}
