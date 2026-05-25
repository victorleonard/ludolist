import type { TransformedGame } from '@/types/family';

export type DurationFilterId =
  | null
  | 'tres-court'
  | 'court'
  | 'moyen-court'
  | 'moyen'
  | 'long'
  | 'tres-long'
  | 'extra-long';

export const DURATION_FILTER_KEYS: Array<{
  value: DurationFilterId;
  labelKey: string;
}> = [
  { value: null, labelKey: 'games.filters.durationAll' },
  { value: 'tres-court', labelKey: 'games.filters.durationUnder15' },
  { value: 'court', labelKey: 'games.filters.duration15to30' },
  { value: 'moyen-court', labelKey: 'games.filters.duration30to45' },
  { value: 'moyen', labelKey: 'games.filters.duration45to60' },
  { value: 'long', labelKey: 'games.filters.duration60to90' },
  { value: 'tres-long', labelKey: 'games.filters.duration90to120' },
  { value: 'extra-long', labelKey: 'games.filters.durationOver120' },
];

export const AGE_FILTER_VALUES: Array<number | null> = [
  null,
  3,
  5,
  6,
  8,
  10,
  12,
  16,
  18,
];

const DUREE_RANGES: Record<
  Exclude<DurationFilterId, null>,
  { min: number; max: number }
> = {
  'tres-court': { min: 0, max: 14 },
  court: { min: 15, max: 30 },
  'moyen-court': { min: 30, max: 45 },
  moyen: { min: 45, max: 60 },
  long: { min: 60, max: 90 },
  'tres-long': { min: 90, max: 120 },
  'extra-long': { min: 121, max: Infinity },
};

export function filterGames(
  games: TransformedGame[],
  options: {
    search?: string;
    durationFilter?: DurationFilterId;
    ageFilter?: number | null;
  },
): TransformedGame[] {
  let result = games;

  const term = options.search?.trim().toLowerCase();
  if (term) {
    result = result.filter(
      (jeu) =>
        jeu.titre.toLowerCase().includes(term) ||
        jeu.description.toLowerCase().includes(term),
    );
  }

  if (options.durationFilter) {
    const range = DUREE_RANGES[options.durationFilter];
    if (range) {
      result = result.filter(
        (jeu) => jeu.duree >= range.min && jeu.duree <= range.max,
      );
    }
  }

  if (options.ageFilter != null) {
    result = result.filter((jeu) => jeu.age_min <= options.ageFilter!);
  }

  return result;
}
