import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { fetchFamilyMe } from '@/lib/family-api';
import {
  buildReadingsInProgress,
  transformFamilyBooks,
  transformFamilyDishes,
} from '@/lib/home-helpers';
import { useAuthStore } from '@/stores/auth';
import type { GameSession } from '@/types/family';

async function fetchLatestSessions(token: string) {
  const res = await apiFetch<{ data: GameSession[] }>(
    '/api/game-sessions/latest',
    { token },
  );
  const data = res.data;
  return Array.isArray(data) ? data : data ? [data] : [];
}

export function useHomeData() {
  const token = useAuthStore((s) => s.token);

  const familyQuery = useQuery({
    queryKey: ['family', 'me'],
    queryFn: () => fetchFamilyMe(token!),
    enabled: Boolean(token),
  });

  const sessionsQuery = useQuery({
    queryKey: ['game-sessions', 'latest'],
    queryFn: () => fetchLatestSessions(token!),
    enabled: Boolean(token),
  });

  const family = familyQuery.data;
  const latestDishes = family ? transformFamilyDishes(family) : [];
  const readingsInProgress = family
    ? buildReadingsInProgress(transformFamilyBooks(family))
    : [];

  const isLoading =
    Boolean(token) &&
    (familyQuery.isPending || sessionsQuery.isPending);

  const isRefetching = familyQuery.isRefetching || sessionsQuery.isRefetching;

  const refetch = async () => {
    await Promise.all([familyQuery.refetch(), sessionsQuery.refetch()]);
  };

  const error =
    familyQuery.error instanceof Error
      ? familyQuery.error.message
      : sessionsQuery.error instanceof Error
        ? sessionsQuery.error.message
        : null;

  return {
    latestSessions: sessionsQuery.data ?? [],
    latestDishes,
    readingsInProgress,
    isLoading,
    isRefetching,
    refetch,
    error,
  };
}
