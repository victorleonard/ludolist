import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Dices, Star, Timer, Users } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IosBackButton } from '@/components/layout/IosBackButton';
import { Alert, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';
import { useGamesData } from '@/hooks/use-games-data';
import { findGameByRouteId, getGameAverageRating } from '@/lib/games-helpers';

export default function GameDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const { games, isLoading, error } = useGamesData();

  const game = findGameByRouteId(games, routeId);
  const averageRating = game ? getGameAverageRating(game) : 0;

  useEffect(() => {
    const tabNavigator = navigation.getParent();
    if (!tabNavigator) return;

    tabNavigator.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNavigator.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
        <Center className="flex-1">
          <Spinner size="large" color={theme.colors.icon.accent} />
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      <Box className="px-4 pb-1 pt-1">
        <IosBackButton />
      </Box>

      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
        {error ? (
          <Alert action="error" variant="solid">
            <AlertText>{error}</AlertText>
          </Alert>
        ) : null}

        {!game && !error ? (
          <Center className="py-16">
            <Text className="text-typography-500">{t('games.notFound')}</Text>
            <Button className="mt-4" onPress={() => router.back()}>
              <ButtonText>{t('common.back')}</ButtonText>
            </Button>
          </Center>
        ) : null}

        {game ? (
          <VStack space="lg">
            <Box className="aspect-square w-full overflow-hidden rounded-2xl bg-background-100">
              {game.image ? (
                <Image
                  source={{ uri: game.image }}
                  alt={game.titre}
                  size="full"
                  className="h-full w-full"
                  resizeMode="contain"
                />
              ) : (
                <Center className="h-full w-full">
                  <Dices
                    size={72}
                    color={theme.colors.icon.primary}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                </Center>
              )}
            </Box>

            <VStack space="sm">
              <Heading size="2xl">{game.titre}</Heading>

              {averageRating > 0 ? (
                <HStack className="items-center gap-2 rounded-lg bg-primary-50 px-3 py-2">
                  <Star
                    size={18}
                    color={theme.colors.icon.warning}
                    fill={theme.colors.icon.warning}
                  />
                  <Text className="font-medium text-typography-800">
                    {t('games.averageRating', {
                      value: averageRating.toFixed(1),
                    })}
                  </Text>
                </HStack>
              ) : null}

              <HStack className="flex-wrap gap-4">
                <HStack className="items-center gap-1.5">
                  <Users size={16} color={theme.colors.icon.muted} />
                  <Text size="sm" className="text-typography-600">
                    {t('games.playersRange', {
                      min: game.player_min,
                      max: game.player_max,
                    })}
                  </Text>
                </HStack>
                <HStack className="items-center gap-1.5">
                  <Timer size={16} color={theme.colors.icon.muted} />
                  <Text size="sm" className="text-typography-600">
                    {t('games.durationMinutes', { count: game.duree })}
                  </Text>
                </HStack>
                <Text size="sm" className="text-typography-600">
                  {t('games.ageFrom', { age: game.age_min })}
                </Text>
              </HStack>

              {game.tags.length > 0 ? (
                <HStack className="flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <Box
                      key={tag}
                      className="rounded-full bg-background-100 px-3 py-1"
                    >
                      <Text size="xs" className="text-typography-600">
                        {tag}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              ) : null}

              <Text size="sm" className="leading-6 text-typography-700">
                {game.description}
              </Text>

              <Text size="xs" className="text-typography-400">
                {t('games.comingSoon')}
              </Text>
            </VStack>
          </VStack>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
