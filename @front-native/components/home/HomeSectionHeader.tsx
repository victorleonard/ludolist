import { ChevronRight } from 'lucide-react-native';

import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Link, LinkText } from '@/components/ui/link';
import { theme } from '@/constants/theme';

type HomeSectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

export function HomeSectionHeader({ title, onSeeAll }: HomeSectionHeaderProps) {
  return (
    <HStack className="mb-4 items-center justify-between">
      <Heading size="xl" className="text-typography-900">
        {title}
      </Heading>
      {onSeeAll ? (
        <Link
          onPress={onSeeAll}
          className="flex-row items-center gap-0.5"
          accessibilityLabel="Voir tout"
        >
          <LinkText
            size="sm"
            className="font-medium text-primary-600 no-underline"
          >
            Voir tout
          </LinkText>
          <ChevronRight
            size={16}
            color={theme.colors.icon.primary}
            strokeWidth={2.5}
          />
        </Link>
      ) : null}
    </HStack>
  );
}
