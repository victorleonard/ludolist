import { Dices, Star, Timer, Users } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { getGameAverageRating } from '@/lib/games-helpers';
import type { TransformedGame } from '@/types/family';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';

type GameListItemProps = {
  game: TransformedGame;
  onPress: () => void;
};

export function GameListItem({ game, onPress }: GameListItemProps) {
  const { t } = useTranslation();
  const averageRating = getGameAverageRating(game);

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-outline-100 bg-background-0 shadow-sm"
    >
      <HStack className="items-stretch">
        <Box className="h-28 w-28 bg-background-100">
          {game.image ? (
            <Image
              source={{ uri: game.image }}
              alt={game.titre}
              size="full"
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Center className="h-full w-full">
              <Dices
                size={40}
                color={theme.colors.icon.muted}
                strokeWidth={1.5}
              />
            </Center>
          )}
        </Box>

        <VStack className="min-w-0 flex-1 justify-between p-3" space="xs">
          <Text
            size="md"
            className="font-bold text-typography-900"
            numberOfLines={2}
          >
            {game.titre}
          </Text>

          {averageRating > 0 ? (
            <HStack className="items-center gap-1">
              <Star
                size={14}
                color={theme.colors.icon.warning}
                fill={theme.colors.icon.warning}
              />
              <Text size="sm" className="text-typography-600">
                {t('common.ratingOutOf10', {
                  value: averageRating.toFixed(1),
                })}
              </Text>
            </HStack>
          ) : null}

          <HStack className="flex-wrap items-center gap-3">
            <HStack className="items-center gap-1">
              <Users size={14} color={theme.colors.icon.muted} />
              <Text size="xs" className="text-typography-500">
                {game.player_min}-{game.player_max}
              </Text>
            </HStack>
            <HStack className="items-center gap-1">
              <Timer size={14} color={theme.colors.icon.muted} />
              <Text size="xs" className="text-typography-500">
                {t('games.durationMinutes', { count: game.duree })}
              </Text>
            </HStack>
            <Box className="rounded-full bg-primary-50 px-2 py-0.5">
              <Text size="xs" className="font-medium text-primary-700">
                {t('games.ageBadge', { age: game.age_min })}
              </Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}
