import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';
import { getStoredLocale } from '@/lib/locale-storage';

export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(code: string | null | undefined): AppLocale {
  if (code?.startsWith('en')) return 'en';
  return 'fr';
}

export function getDeviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode;
  return normalizeLocale(code);
}

export function getIntlLocale(locale?: string): string {
  const lang = locale ?? i18n.language;
  return lang === 'en' ? 'en-US' : 'fr-FR';
}

let initPromise: Promise<typeof i18n> | null = null;

export function initI18n(): Promise<typeof i18n> {
  if (i18n.isInitialized) {
    return Promise.resolve(i18n);
  }
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const stored = await getStoredLocale();
    const initialLocale = stored ?? getDeviceLocale();

    await i18n.use(initReactI18next).init({
      resources: {
        fr: { translation: fr },
        en: { translation: en },
      },
      lng: initialLocale,
      fallbackLng: 'fr',
      supportedLngs: [...SUPPORTED_LOCALES],
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });

    return i18n;
  })();

  return initPromise;
}

export async function changeAppLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
}

export default i18n;
