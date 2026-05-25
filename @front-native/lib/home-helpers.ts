import i18n, { getIntlLocale } from '@/lib/i18n';
import { resolveStrapiImageUrl } from '@/lib/strapi-media';
import type {
  GameSession,
  HomeDish,
  HomeBook,
  ReadingInProgressItem,
  BookReading,
  FamilyMeResponse,
} from '@/types/family';

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function formatDateDebutShort(dateString: string): string {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateString));
}

export function getSessionGameImage(session: GameSession): string | null {
  const game = session?.game;
  if (!game) return null;
  return resolveStrapiImageUrl(game.image, game.image_url);
}

export function getSessionWinner(session: GameSession) {
  if (!session?.player_scores?.length) return null;

  const winner = session.player_scores.find((ps) => ps.is_winner);
  if (winner) {
    return {
      username:
        winner.member?.username ?? winner.guest_name ?? i18n.t('common.winner'),
      score: winner.score,
    };
  }

  const sorted = [...session.player_scores].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  if (!top) return null;
  return {
    username: top.member?.username ?? top.guest_name ?? i18n.t('common.winner'),
    score: top.score,
  };
}

export function getDishAverageRating(dish: HomeDish): number {
  if (!dish.ratings?.length) return 0;
  const ratings = dish.ratings.filter((r) => r.rating > 0);
  if (!ratings.length) return 0;
  return ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length;
}

function readingDateDebut(reading: BookReading): string | null {
  const v = reading.date_debut;
  return typeof v === 'string' && v.trim() ? v : null;
}

function isReadingInProgress(reading: BookReading): boolean {
  if (reading.abandonne) return false;
  const debut = readingDateDebut(reading);
  if (!debut) return false;
  const fin = reading.date_fin;
  if (fin !== undefined && fin !== null && String(fin).trim() !== '') return false;
  return true;
}

export function getReadingDebutLabel(reading: BookReading): string {
  const debut = readingDateDebut(reading);
  return debut ? formatDateDebutShort(debut) : '';
}

export function transformFamilyDishes(family: FamilyMeResponse): HomeDish[] {
  const dishes = family.dishes ?? [];
  return dishes
    .map((d) => ({
      id: d.id,
      documentId: d.documentId,
      name: d.name,
      image: resolveStrapiImageUrl(d.image, d.image_url),
      ratings: d.ratings ?? [],
      createdAt: d.createdAt ?? new Date().toISOString(),
    }))
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);
}

export function transformFamilyBooks(family: FamilyMeResponse): HomeBook[] {
  const books = family.books ?? [];
  return books.map((b) => ({
    id: b.id,
    documentId: b.documentId,
    titre: b.titre,
    image: resolveStrapiImageUrl(b.image, b.image_url),
    book_readings: b.book_readings ?? [],
  }));
}

export function buildReadingsInProgress(books: HomeBook[]): ReadingInProgressItem[] {
  const list: ReadingInProgressItem[] = [];

  for (const book of books) {
    for (const reading of book.book_readings ?? []) {
      if (!isReadingInProgress(reading)) continue;
      list.push({ book, reading });
    }
  }

  list.sort((a, b) => {
    const da = readingDateDebut(a.reading);
    const db = readingDateDebut(b.reading);
    if (!da) return 1;
    if (!db) return -1;
    return new Date(db).getTime() - new Date(da).getTime();
  });

  return list;
}
