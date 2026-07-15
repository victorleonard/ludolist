import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  username: string;
  email: string;
  blocked: boolean;
}

interface LoginResponse {
  jwt: string;
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Getters
  isAuthenticated: () => boolean;
  currentUser: () => User | null;

  // Actions
  loadToken: () => Promise<void>;
  saveToken: (token: string, user: User) => Promise<void>;
  clearToken: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; data?: LoginResponse; error?: string }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<User | null>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:1337";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  // Getters
  isAuthenticated: () => !!get().token,
  currentUser: () => get().user,

  // Charger le token depuis AsyncStorage au démarrage
  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userStr = await AsyncStorage.getItem("auth_user");

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user });

          // Charger aussi les informations de famille
          const { useFamilyStore } = await import("./familyStore");
          await useFamilyStore.getState().loadFamily();
        } catch (e) {
          console.error("Erreur lors du parsing de l'utilisateur:", e);
          // Si le parsing échoue, nettoyer les données corrompues
          await get().clearToken();
        }
      } else {
        // Si pas de token dans AsyncStorage, s'assurer que le store est vide
        if (get().token) {
          await get().clearToken();
        }
      }
    } catch (e) {
      console.error("Erreur lors du chargement du token:", e);
      await get().clearToken();
    }
  },

  // Sauvegarder le token dans AsyncStorage
  saveToken: async (token: string, user: User) => {
    try {
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      set({ token, user });
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du token:", e);
    }
  },

  // Supprimer le token
  clearToken: async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      set({ token: null, user: null });
    } catch (e) {
      console.error("Erreur lors de la suppression du token:", e);
    }
  },

  // Connexion
  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_URL}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData?.error?.message || "Erreur de connexion",
        };
      }

      const data: LoginResponse = await response.json();
      await get().saveToken(data.jwt, data.user);

      // Charger les informations de famille après la connexion
      const { useFamilyStore } = await import("./familyStore");
      await useFamilyStore.getState().fetchFamily();

      return { success: true, data };
    } catch (error: unknown) {
      console.error("Erreur de connexion:", error);
      return {
        success: false,
        error: (error as Error).message || "Erreur de connexion",
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Déconnexion
  logout: async () => {
    await get().clearToken();

    // Effacer aussi les informations de famille
    const { useFamilyStore } = await import("./familyStore");
    await useFamilyStore.getState().clearFamily();
  },

  // Récupérer l'utilisateur courant (invalide la session sur 401)
  fetchUser: async () => {
    const token = get().token;
    if (!token) {
      return null;
    }

    try {
      const { apiFetch } = await import("../lib/api");
      const user = await apiFetch<User>("/api/users/me", { token });
      set({ user });
      return user;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      // Un 401 a déjà déclenché logout via apiFetch ;
      // pour les autres erreurs réseau on conserve le token local.
      return null;
    }
  },
}));
