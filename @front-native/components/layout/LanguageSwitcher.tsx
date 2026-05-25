import { useTranslation } from 'react-i18next';

import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { AppLocale } from '@/lib/i18n';
import { useLocaleStore } from '@/stores/locale';

const LOCALES: AppLocale[] = ['fr', 'en'];

type LanguageSwitcherProps = {
  variant?: 'drawer' | 'inline';
};

export function LanguageSwitcher({ variant = 'drawer' }: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const content = (
    <HStack className="gap-2">
      {LOCALES.map((code) => {
        const selected = locale === code;
        return (
          <Pressable
            key={code}
            onPress={() => void setLocale(code)}
            className={`rounded-full px-3 py-1.5 ${
              selected ? 'bg-primary-500' : 'bg-background-100'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t(`language.${code}`)}
          >
            <Text
              size="xs"
              className={
                selected
                  ? 'font-semibold text-typography-0'
                  : 'text-typography-600'
              }
            >
              {t(`language.${code}`)}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <VStack className="gap-2 px-4 py-3" space="xs">
      <Text size="xs" className="font-medium uppercase text-typography-500">
        {t('language.label')}
      </Text>
      {content}
    </VStack>
  );
}
