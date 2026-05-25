import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchFamilyMe } from '@/lib/family-api';
import { transformFamilyGames } from '@/lib/games-transform';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';

export function useGamesData() {
  const token = useAuthStore((s) => s.token);
  const locale = useLocaleStore((s) => s.locale);

  const familyQuery = useQuery({
    queryKey: ['family', 'me'],
    queryFn: () => fetchFamilyMe(token!),
    enabled: Boolean(token),
  });

  const games = useMemo(
    () => (familyQuery.data ? transformFamilyGames(familyQuery.data) : []),
    [familyQuery.data, locale],
  );

  const isLoading = Boolean(token) && familyQuery.isPending;
  const isRefetching = familyQuery.isRefetching;

  const refetch = async () => {
    await familyQuery.refetch();
  };

  const error =
    familyQuery.error instanceof Error ? familyQuery.error.message : null;

  return {
    games,
    isLoading,
    isRefetching,
    refetch,
    error,
  };
}
