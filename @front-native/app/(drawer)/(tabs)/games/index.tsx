import { useRouter, type Href } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  GameListItem,
  GamesFilters,
  GamesScreenHeader,
} from '@/components/games';
import { Alert, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { theme } from '@/constants/theme';
import { useGamesData } from '@/hooks/use-games-data';
import { filterGames, type DurationFilterId } from '@/lib/games-filters';
import { getGameRouteId } from '@/lib/games-helpers';
import type { TransformedGame } from '@/types/family';

export default function GamesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { games, isLoading, isRefetching, refetch, error } = useGamesData();
  const [search, setSearch] = useState('');
  const [durationFilter, setDurationFilter] = useState<DurationFilterId>(null);
  const [ageFilter, setAgeFilter] = useState<number | null>(null);

  const filteredGames = useMemo(
    () =>
      filterGames(games, {
        search,
        durationFilter,
        ageFilter,
      }),
    [games, search, durationFilter, ageFilter],
  );

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const openGame = useCallback(
    (game: TransformedGame) => {
      router.push(`/games/${getGameRouteId(game)}` as Href);
    },
    [router],
  );

  const listHeader = (
    <VStack space="md" className="pb-4">
      <GamesScreenHeader />
      <Box className="px-4">
        <Input variant="outline" size="lg">
          <InputSlot className="pl-3">
            <InputIcon as={Search} className="text-typography-400" />
          </InputSlot>
          <InputField
            value={search}
            onChangeText={setSearch}
            placeholder={t('games.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1"
          />
          {search.length > 0 ? (
            <InputSlot className="pr-3" onPress={() => setSearch('')}>
              <InputIcon as={X} className="text-typography-400" />
            </InputSlot>
          ) : null}
        </Input>
      </Box>
      <GamesFilters
        durationFilter={durationFilter}
        ageFilter={ageFilter}
        onDurationChange={setDurationFilter}
        onAgeChange={setAgeFilter}
      />
      {filteredGames.length > 0 ? (
        <Text size="sm" className="px-4 text-typography-500">
          {t('games.count', { count: filteredGames.length })}
        </Text>
      ) : null}
    </VStack>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
        <Center className="flex-1">
          <VStack space="md" className="items-center">
            <Spinner size="large" color={theme.colors.icon.accent} />
            <Text size="sm" className="text-typography-500">
              {t('common.loadingGames')}
            </Text>
          </VStack>
        </Center>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-50" edges={['top']}>
      {error ? (
        <Box className="mx-4 mt-4">
          <Alert action="error" variant="solid">
            <AlertText>{error}</AlertText>
          </Alert>
          <Button className="mt-3" onPress={() => void refetch()}>
            <ButtonText>{t('common.retry')}</ButtonText>
          </Button>
        </Box>
      ) : null}

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => String(item.documentId ?? item.id)}
        ListHeaderComponent={listHeader}
        contentContainerClassName="px-4 pb-24"
        ItemSeparatorComponent={() => <Box className="h-3" />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.icon.accent}
          />
        }
        renderItem={({ item }) => (
          <GameListItem game={item} onPress={() => openGame(item)} />
        )}
        ListEmptyComponent={
          !error ? (
            <Center className="rounded-2xl bg-background-0 px-6 py-12">
              <VStack space="sm" className="items-center">
                <Heading size="md" className="text-typography-900">
                  {search || durationFilter || ageFilter != null
                    ? t('games.emptyFilteredTitle')
                    : t('games.emptyTitle')}
                </Heading>
                <Text size="sm" className="text-center text-typography-500">
                  {search
                    ? t('games.emptySearch', { query: search })
                    : t('games.emptyDescription')}
                </Text>
                {search ? (
                  <Button variant="outline" onPress={() => setSearch('')}>
                    <ButtonText>{t('games.clearSearch')}</ButtonText>
                  </Button>
                ) : null}
              </VStack>
            </Center>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
