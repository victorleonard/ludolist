import { BookOpen, Dices, UtensilsCrossed } from 'lucide-react-native';
import { useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeCarouselSection } from '@/components/home/HomeCarouselSection';
import { HomeEmptyBlock } from '@/components/home/HomeEmptyBlock';
import { HomeScreenHeader } from '@/components/home/HomeScreenHeader';
import { Alert, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';
import { useHomeData } from '@/hooks/use-home-data';
import {
  formatDateShort,
  getDishAverageRating,
  getReadingDebutLabel,
  getSessionGameImage,
  getSessionWinner,
} from '@/lib/home-helpers';
import type { GameSession, HomeDish, ReadingInProgressItem } from '@/types/family';

type CarouselMetaLine = {
  icon: 'calendar' | 'trophy' | 'star' | 'none';
  text: string;
  accent?: boolean;
};

function sessionToCarouselItem(session: GameSession) {
  const winner = getSessionWinner(session);
  const metaLines: CarouselMetaLine[] = [
    {
      icon: 'calendar',
      text: formatDateShort(session.played_at),
    },
  ];

  if (winner) {
    const scoreLabel =
      winner.score !== undefined ? ` (${winner.score} pts)` : '';
    metaLines.push({
      icon: 'trophy',
      text: `${winner.username}${scoreLabel}`,
      accent: true,
    });
  }

  return {
    key: `session-${session.id}`,
    title: session.game.name,
    imageUri: getSessionGameImage(session),
    placeholderIcon: (
      <Dices size={64} color="#0ea5e9" strokeWidth={1.5} opacity={0.6} />
    ),
    placeholderClassName: 'bg-primary-100',
    metaLines,
    variant: 'game' as const,
  };
}

function readingToCarouselItem(item: ReadingInProgressItem) {
  const debutLabel = getReadingDebutLabel(item.reading);
  const memberName = item.reading.member?.username ?? 'Membre';

  const metaLines: CarouselMetaLine[] = [
    { icon: 'none', text: memberName },
  ];
  if (debutLabel) {
    metaLines.push({ icon: 'calendar', text: `Depuis ${debutLabel}` });
  }

  return {
    key: `reading-${item.reading.id}-${item.book.id}`,
    title: item.book.titre,
    imageUri: item.book.image,
    placeholderIcon: (
      <BookOpen size={64} color="#10b981" strokeWidth={1.5} opacity={0.6} />
    ),
    placeholderClassName: 'bg-success-100',
    metaLines,
  };
}

function dishToCarouselItem(dish: HomeDish) {
  const avg = getDishAverageRating(dish);
  const metaLines: CarouselMetaLine[] = [
    {
      icon: avg > 0 ? 'star' : 'none',
      text: avg > 0 ? `${avg.toFixed(1)} / 10` : 'Pas encore noté',
      accent: avg > 0,
    },
  ];

  return {
    key: `dish-${dish.id}`,
    title: dish.name,
    imageUri: dish.image,
    placeholderIcon: (
      <UtensilsCrossed size={64} color="#f59e0b" strokeWidth={1.5} opacity={0.6} />
    ),
    placeholderClassName: 'bg-warning-100',
    metaLines,
  };
}

export default function HomeScreen() {
  const {
    latestSessions,
    latestDishes,
    readingsInProgress,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useHomeData();

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const hasAnyContent =
    latestSessions.length > 0 ||
    readingsInProgress.length > 0 ||
    latestDishes.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      {isLoading ? (
        <Center className="flex-1">
          <VStack space="md" className="items-center">
            <Spinner size="large" color={theme.colors.icon.accent} />
            <Text size="sm" className="text-typography-500">
              Chargement…
            </Text>
          </VStack>
        </Center>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.colors.icon.accent}
            />
          }
        >
          <VStack space="md">
            <HomeScreenHeader />

            {error ? (
              <Box className="mx-4">
                <Alert action="error" variant="solid">
                  <AlertText>{error}</AlertText>
                </Alert>
              </Box>
            ) : null}

            {latestSessions.length > 0 ? (
              <HomeCarouselSection
                title="Dernières parties"
                items={latestSessions.map(sessionToCarouselItem)}
              />
            ) : hasAnyContent ? (
              <HomeEmptyBlock
                icon={Dices}
                title="Aucune partie récente"
                description="Commencez à jouer pour voir vos parties ici"
              />
            ) : null}

            <HomeCarouselSection
              title="Lectures en cours"
              items={readingsInProgress.map(readingToCarouselItem)}
            />

            <HomeCarouselSection
              title="Derniers plats ajoutés"
              items={latestDishes.map(dishToCarouselItem)}
            />

            {!hasAnyContent && !error ? (
              <HomeEmptyBlock
                icon={UtensilsCrossed}
                title="Bienvenue sur Ludolist"
                description="Ajoutez des jeux, livres ou plats depuis le site web pour les retrouver ici"
              />
            ) : null}

            {latestDishes.length === 0 && hasAnyContent ? (
              <HomeEmptyBlock
                icon={UtensilsCrossed}
                title="Aucun plat pour l'instant"
                description="Ajoutez vos premiers plats pour commencer à les noter"
              />
            ) : null}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
