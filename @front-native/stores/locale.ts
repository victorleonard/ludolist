import { create } from 'zustand';

import { changeAppLocale, initI18n, type AppLocale } from '@/lib/i18n';
import { setStoredLocale } from '@/lib/locale-storage';

interface LocaleState {
  locale: AppLocale;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'fr',
  isHydrated: false,

  hydrate: async () => {
    const instance = await initI18n();
    set({
      locale: instance.language as AppLocale,
      isHydrated: true,
    });
  },

  setLocale: async (locale) => {
    await changeAppLocale(locale);
    await setStoredLocale(locale);
    set({ locale });
  },
}));
