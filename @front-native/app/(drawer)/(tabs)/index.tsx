import { useRouter, type Href } from 'expo-router';
import { BookOpen, Dices, UtensilsCrossed } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    latestSessions,
    latestDishes,
    readingsInProgress,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useHomeData();

  const sessionToCarouselItem = useCallback(
    (session: GameSession) => {
      const winner = getSessionWinner(session);
      const metaLines: CarouselMetaLine[] = [
        {
          icon: 'calendar',
          text: formatDateShort(session.played_at),
        },
      ];

      if (winner) {
        const scoreLabel =
          winner.score !== undefined
            ? ` (${t('common.pointsShort', { count: winner.score })})`
            : '';
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
    },
    [t],
  );

  const readingToCarouselItem = useCallback(
    (item: ReadingInProgressItem) => {
      const debutLabel = getReadingDebutLabel(item.reading);
      const memberName =
        item.reading.member?.username ?? t('common.member');

      const metaLines: CarouselMetaLine[] = [
        { icon: 'none', text: memberName },
      ];
      if (debutLabel) {
        metaLines.push({
          icon: 'calendar',
          text: t('home.readingSince', { date: debutLabel }),
        });
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
    },
    [t],
  );

  const dishToCarouselItem = useCallback(
    (dish: HomeDish) => {
      const avg = getDishAverageRating(dish);
      const metaLines: CarouselMetaLine[] = [
        {
          icon: avg > 0 ? 'star' : 'none',
          text:
            avg > 0
              ? t('common.ratingOutOf10', { value: avg.toFixed(1) })
              : t('common.notRatedYet'),
          accent: avg > 0,
        },
      ];

      return {
        key: `dish-${dish.id}`,
        title: dish.name,
        imageUri: dish.image,
        placeholderIcon: (
          <UtensilsCrossed
            size={64}
            color="#f59e0b"
            strokeWidth={1.5}
            opacity={0.6}
          />
        ),
        placeholderClassName: 'bg-warning-100',
        metaLines,
      };
    },
    [t],
  );

  const sessionItems = useMemo(
    () => latestSessions.map(sessionToCarouselItem),
    [latestSessions, sessionToCarouselItem],
  );
  const readingItems = useMemo(
    () => readingsInProgress.map(readingToCarouselItem),
    [readingsInProgress, readingToCarouselItem],
  );
  const dishItems = useMemo(
    () => latestDishes.map(dishToCarouselItem),
    [latestDishes, dishToCarouselItem],
  );

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
              {t('common.loading')}
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
                title={t('home.latestSessions')}
                items={sessionItems}
                onSeeAll={() =>
                  router.push('/(drawer)/(tabs)/games' as Href)
                }
              />
            ) : hasAnyContent ? (
              <HomeEmptyBlock
                icon={Dices}
                title={t('home.noRecentSessionsTitle')}
                description={t('home.noRecentSessionsDescription')}
              />
            ) : null}

            <HomeCarouselSection
              title={t('home.readingsInProgress')}
              items={readingItems}
            />

            <HomeCarouselSection
              title={t('home.latestDishes')}
              items={dishItems}
            />

            {!hasAnyContent && !error ? (
              <HomeEmptyBlock
                icon={UtensilsCrossed}
                title={t('home.welcomeTitle')}
                description={t('home.welcomeDescription')}
              />
            ) : null}

            {latestDishes.length === 0 && hasAnyContent ? (
              <HomeEmptyBlock
                icon={UtensilsCrossed}
                title={t('home.noDishesTitle')}
                description={t('home.noDishesDescription')}
              />
            ) : null}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
