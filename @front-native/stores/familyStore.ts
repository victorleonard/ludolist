import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Family {
  id: number;
  name: string;
  [key: string]: any;
}

interface FamilyState {
  family: Family | null;
  isLoading: boolean;

  // Actions
  loadFamily: () => Promise<void>;
  fetchFamily: () => Promise<void>;
  clearFamily: () => Promise<void>;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:1337";

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  isLoading: false,

  // Charger la famille depuis AsyncStorage
  loadFamily: async () => {
    try {
      const familyStr = await AsyncStorage.getItem("family");
      if (familyStr) {
        const family = JSON.parse(familyStr);
        set({ family });
      }
    } catch (e) {
      console.error("Erreur lors du chargement de la famille:", e);
    }
  },

  // Récupérer la famille depuis l'API
  fetchFamily: async () => {
    set({ isLoading: true });

    try {
      // Importer le store d'auth pour récupérer le token
      const { useAuthStore } = await import("./authStore");
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(`${API_URL}/api/families/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la famille");
      }

      const family: Family = await response.json();
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem("family", JSON.stringify(family));
      set({ family });
    } catch (error) {
      console.error("Erreur lors de la récupération de la famille:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Effacer les données de la famille
  clearFamily: async () => {
    try {
      await AsyncStorage.removeItem("family");
      set({ family: null });
    } catch (e) {
      console.error("Erreur lors de la suppression de la famille:", e);
    }
  },
}));
