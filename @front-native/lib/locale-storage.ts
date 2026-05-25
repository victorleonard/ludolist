import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppLocale } from '@/lib/i18n';

const LOCALE_KEY = 'app_locale';

export async function getStoredLocale(): Promise<AppLocale | null> {
  const value = await AsyncStorage.getItem(LOCALE_KEY);
  if (value === 'fr' || value === 'en') return value;
  return null;
}

export async function setStoredLocale(locale: AppLocale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale);
}
