import { FlatList } from 'react-native';

import { HomeCarouselCard } from '@/components/home/HomeCarouselCard';
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';

type CarouselItem = {
  key: string;
  title: string;
  imageUri?: string | null;
  placeholderIcon: React.ReactNode;
  placeholderClassName?: string;
  metaLines?: Array<{
    icon: 'calendar' | 'trophy' | 'star' | 'none';
    text: string;
    accent?: boolean;
  }>;
  onPress?: () => void;
  variant?: 'default' | 'game';
};

type HomeCarouselSectionProps = {
  title: string;
  items: CarouselItem[];
  onSeeAll?: () => void;
};

const CARD_GAP = 16;
const LIST_PADDING = 16;

export function HomeCarouselSection({
  title,
  items,
  onSeeAll,
}: HomeCarouselSectionProps) {
  if (items.length === 0) return null;

  return (
    <VStack className="mb-8" space="sm">
      <Box className="px-4">
        <HomeSectionHeader title={title} onSeeAll={onSeeAll} />
      </Box>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: LIST_PADDING, gap: CARD_GAP }}
        snapToAlignment="start"
        decelerationRate="fast"
        renderItem={({ item }) => (
          <HomeCarouselCard
            title={item.title}
            imageUri={item.imageUri}
            placeholderIcon={item.placeholderIcon}
            placeholderClassName={item.placeholderClassName}
            metaLines={item.metaLines}
            onPress={item.onPress}
            variant={item.variant}
          />
        )}
      />
    </VStack>
  );
}
