import { create } from 'zustand';

import { apiFetch } from '@/lib/api';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/storage';
import type { AuthUser, LoginResponse } from '@/types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  loadToken: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  isLoading: false,

  isAuthenticated: () => Boolean(get().token),

  loadToken: async () => {
    try {
      const { token, userJson } = await getStoredAuth();
      if (token && userJson) {
        const user = JSON.parse(userJson) as AuthUser;
        set({ token, user });
      } else {
        set({ token: null, user: null });
      }
    } catch {
      await clearStoredAuth();
      set({ token: null, user: null });
    } finally {
      set({ isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiFetch<LoginResponse>('/api/auth/local', {
        method: 'POST',
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      await setStoredAuth(response.jwt, JSON.stringify(response.user));
      set({ token: response.jwt, user: response.user });

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erreur de connexion';
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await clearStoredAuth();
    set({ token: null, user: null });
  },
}));
