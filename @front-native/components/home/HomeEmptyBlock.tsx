import type { LucideIcon } from 'lucide-react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';

type HomeEmptyBlockProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function HomeEmptyBlock({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: HomeEmptyBlockProps) {
  return (
    <Center className="py-12">
      <VStack space="lg" className="max-w-sm items-center px-4">
        <Center className="rounded-full bg-background-100 p-6">
          <Icon size={48} color={theme.colors.icon.muted} strokeWidth={1.5} />
        </Center>
        <Heading size="lg" className="text-center text-typography-700">
          {title}
        </Heading>
        <Text size="sm" className="text-center text-typography-500">
          {description}
        </Text>
        {actionLabel && onAction ? (
          <Button size="md" onPress={onAction}>
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        ) : null}
      </VStack>
    </Center>
  );
}
