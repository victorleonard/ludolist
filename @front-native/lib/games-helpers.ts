import type { GameRating, TransformedGame } from '@/types/family';

export function getGameAverageRating(game: TransformedGame): number {
  if (!game.ratings?.length) return 0;
  const ratings = game.ratings.filter((r: GameRating) => r.rating > 0);
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
}

export function getGameRouteId(game: TransformedGame): string {
  return String(game.documentId ?? game.id);
}

export function findGameByRouteId(
  games: TransformedGame[],
  routeId: string,
): TransformedGame | undefined {
  if (!routeId) return undefined;
  const byDocumentId = games.find((g) => g.documentId === routeId);
  if (byDocumentId) return byDocumentId;
  const numericId = Number(routeId);
  if (!Number.isNaN(numericId)) {
    return games.find((g) => g.id === numericId);
  }
  return undefined;
}
