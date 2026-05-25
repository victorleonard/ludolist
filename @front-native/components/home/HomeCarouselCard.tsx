import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Star, Trophy } from 'lucide-react-native';
import { useWindowDimensions } from 'react-native';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type HomeCarouselCardProps = {
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

const META_ICONS = {
  calendar: Calendar,
  trophy: Trophy,
  star: Star,
  none: null,
} as const;

export function HomeCarouselCard({
  title,
  imageUri,
  placeholderIcon,
  placeholderClassName = 'bg-primary-100',
  metaLines = [],
  onPress,
  variant = 'default',
}: HomeCarouselCardProps) {
  const { width } = useWindowDimensions();
  const cardSize = Math.min(200, width * 0.48);
  const isGame = variant === 'game';

  return (
    <Pressable
      onPress={onPress}
      style={{ width: cardSize, height: cardSize }}
      className="overflow-hidden rounded-2xl shadow-md"
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          size="none"
          className="absolute inset-0 h-full w-full"
          alt={title}
        />
      ) : (
        <Box
          className={`absolute inset-0 items-center justify-center ${placeholderClassName}`}
        >
          {placeholderIcon}
        </Box>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.4, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
        pointerEvents="none"
      />

      <VStack
        className={`absolute inset-0 justify-end ${isGame ? 'px-4 pb-4 pt-3' : 'p-4'}`}
        space={isGame ? 'sm' : 'xs'}
      >
        <Heading
          size={isGame ? 'lg' : 'md'}
          className="leading-snug text-white"
          numberOfLines={2}
        >
          {title}
        </Heading>

        {metaLines.length > 0 ? (
          <VStack className={isGame ? 'gap-1.5' : 'gap-1'}>
            {metaLines.map((line, index) => {
              const Icon = line.icon !== 'none' ? META_ICONS[line.icon] : null;
              return (
                <HStack
                  key={`${line.text}-${index}`}
                  className="min-h-[18px] items-center gap-2"
                >
                  {Icon ? (
                    <Box className="w-4 shrink-0 items-center">
                      <Icon
                        size={isGame ? 15 : 14}
                        color={line.accent ? '#fcd34d' : '#f3f4f6'}
                        strokeWidth={2}
                      />
                    </Box>
                  ) : (
                    <Box className="w-4 shrink-0" />
                  )}
                  <Text
                    size="sm"
                    className={`flex-1 leading-tight ${
                      line.accent
                        ? 'font-semibold text-amber-300'
                        : 'font-medium text-white/95'
                    }`}
                    numberOfLines={1}
                  >
                    {line.text}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        ) : null}
      </VStack>
    </Pressable>
  );
}
