import i18n, { getIntlLocale } from '@/lib/i18n';
import { resolveStrapiImageUrl } from '@/lib/strapi-media';
import type { FamilyMeResponse, StrapiGame, TransformedGame } from '@/types/family';

function parsePlayingTimeMinutes(playingTime: string | null | undefined): number {
  if (!playingTime) return 30;
  const match = playingTime.match(/(\d+)/);
  return match?.[1] ? parseInt(match[1], 10) : 30;
}

function formatDurationLabel(playingTime: string | null | undefined, duree: number): string {
  if (!playingTime) {
    return i18n.t('games.durationMinutes', { count: duree });
  }
  const chiffres = playingTime.match(/\d+/g);
  if (!chiffres?.length) {
    return i18n.t('games.durationMinutes', { count: duree });
  }
  if (chiffres.length === 1) {
    return i18n.t('games.durationMinutes', { count: Number(chiffres[0]) });
  }
  return `${chiffres[0]}-${chiffres[chiffres.length - 1]} min`;
}

export function transformStrapiGame(strapiGame: StrapiGame): TransformedGame | null {
  if (!strapiGame) return null;

  const image = resolveStrapiImageUrl(strapiGame.image, strapiGame.image_url);
  const playingTime = strapiGame.playing_time ?? '';
  const duree = parsePlayingTimeMinutes(playingTime);
  const dureeFormatee = formatDurationLabel(playingTime, duree);
  const playerMax = strapiGame.player_max ?? strapiGame.player_min;

  return {
    id: strapiGame.id,
    documentId: strapiGame.documentId,
    titre: strapiGame.name,
    description: strapiGame.description?.trim()
      ? strapiGame.description
      : i18n.t('games.noDescription'),
    image,
    tags: [
      i18n.t('games.tagPlayers', { min: strapiGame.player_min, max: playerMax }),
      dureeFormatee,
    ],
    categorie: 'Stratégie',
    duree,
    age_min: strapiGame.age_min,
    age_max: strapiGame.age_max ?? null,
    player_min: strapiGame.player_min,
    player_max: playerMax,
    ratings: strapiGame.ratings ?? [],
    owner: strapiGame.owner ?? null,
    createdAt: strapiGame.createdAt ?? new Date().toISOString(),
  };
}

export function transformFamilyGames(family: FamilyMeResponse): TransformedGame[] {
  if (!family.games?.length) return [];

  const result: TransformedGame[] = [];
  for (const strapiGame of family.games) {
    const game = transformStrapiGame(strapiGame);
    if (game) result.push(game);
  }
  const collatorLocale = getIntlLocale();
  return result.sort((a, b) =>
    a.titre.localeCompare(b.titre, collatorLocale),
  );
}
