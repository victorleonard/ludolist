import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  AGE_FILTER_VALUES,
  DURATION_FILTER_KEYS,
  type DurationFilterId,
} from '@/lib/games-filters';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function FilterChip({ label, selected, onPress }: FilterChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3 py-1.5 ${
        selected ? 'bg-primary-500' : 'bg-background-100'
      }`}
    >
      <Text
        size="xs"
        className={
          selected ? 'font-semibold text-typography-0' : 'text-typography-600'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

type GamesFiltersProps = {
  durationFilter: DurationFilterId;
  ageFilter: number | null;
  onDurationChange: (value: DurationFilterId) => void;
  onAgeChange: (value: number | null) => void;
};

export function GamesFilters({
  durationFilter,
  ageFilter,
  onDurationChange,
  onAgeChange,
}: GamesFiltersProps) {
  const { t } = useTranslation();

  return (
    <VStack space="sm" className="px-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {DURATION_FILTER_KEYS.map((opt) => (
          <FilterChip
            key={opt.labelKey}
            label={t(opt.labelKey)}
            selected={durationFilter === opt.value}
            onPress={() => onDurationChange(opt.value)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {AGE_FILTER_VALUES.map((value) => {
          const label =
            value === null
              ? t('games.filters.ageAll')
              : `${value}+`;
          return (
            <FilterChip
              key={value ?? 'all'}
              label={label}
              selected={ageFilter === value}
              onPress={() => onAgeChange(value)}
            />
          );
        })}
      </ScrollView>
    </VStack>
  );
}
