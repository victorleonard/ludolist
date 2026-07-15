import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, apiFetch } from "@/lib/api";
import { useAuthStore } from "./authStore";

interface StrapiImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface Rating {
  id: number;
  rating: number;
  member: {
    id: number;
  };
  game: {
    id: number;
  };
}

interface StrapiGame {
  id: number;
  documentId?: string;
  name: string;
  description?: string | null;
  age_min: number;
  age_max: number | null;
  playing_time: string | null;
  player_min: number;
  player_max: number | null;
  image?: StrapiImage | null;
  image_url?: string | null;
  ratings?: Rating[];
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransformedGame {
  id: number;
  documentId?: string;
  titre: string;
  description: string;
  image: string | null;
  tags: string[];
  categorie: string;
  duree: number;
  age_min: number;
  age_max: number | null;
  player_min: number;
  player_max: number;
  ratings?: Rating[];
  createdAt: string;
}

interface Member {
  id: number;
  username: string;
  birthdate?: string;
  avatar?: string;
}

interface Family {
  id: number;
  name: string;
  members?: Member[];
  games?: StrapiGame[];
}

interface PlayerScore {
  id: number;
  score: number;
  is_winner?: boolean;
  member: Member;
}

interface GameSession {
  id: number;
  played_at: string;
  notes?: string;
  player_scores?: PlayerScore[];
}

interface WinnerData {
  member: Member;
  wins: number;
}

interface FamilyState {
  family: Family | null;
  isLoading: boolean;

  // Getters
  getTransformedGames: () => TransformedGame[];
  getFamilyMembers: () => Member[];

  // Actions
  loadFamily: () => Promise<void>;
  fetchFamily: () => Promise<void>;
  clearFamily: () => Promise<void>;
  setRating: (gameId: number, memberId: number, rating: number) => Promise<{ success: boolean; error?: string }>;
  fetchGameSessions: (gameId: number) => Promise<{ success: boolean; data?: GameSession[]; error?: string }>;
  getTop3Winners: (gameId: number) => Promise<{ success: boolean; data?: WinnerData[]; error?: string }>;
  fetchLatestPlayedGames: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  family: null,
  isLoading: false,

  // Récupérer les membres de la famille
  getFamilyMembers: (): Member[] => {
    const state = get();
    return state.family?.members || [];
  },

  // Transformer les jeux Strapi en format d'affichage
  getTransformedGames: (): TransformedGame[] => {
    const state = get();
    if (!state.family?.games || !Array.isArray(state.family.games)) {
      return [];
    }

    const result: TransformedGame[] = [];

    for (const strapiGame of state.family.games) {
      try {
        if (!strapiGame) {
          continue;
        }

        // Extraire l'URL de l'image - prioriser image_url (thumbnail BGG) s'il existe
        let imageUrl: string | null = null;

        if (strapiGame.image_url) {
          imageUrl = strapiGame.image_url;
        } else {
          const imageData = strapiGame.image;
          if (imageData && imageData !== null && typeof imageData === "object") {
            if (imageData.formats?.medium?.url) {
              imageUrl = `${API_URL}${imageData.formats.medium.url}`;
            } else if (imageData.formats?.small?.url) {
              imageUrl = `${API_URL}${imageData.formats.small.url}`;
            } else if (imageData.formats?.thumbnail?.url) {
              imageUrl = `${API_URL}${imageData.formats.thumbnail.url}`;
            } else if (imageData.url) {
              imageUrl = `${API_URL}${imageData.url}`;
            }
          }
        }

        // Parser la durée
        const playingTime = strapiGame.playing_time || "";
        const dureeMatch = playingTime.match(/(\d+)/);
        const duree = dureeMatch && dureeMatch[1] ? parseInt(dureeMatch[1], 10) : 30;

        // Formater la durée
        let dureeFormatee = `${duree} min`;
        if (playingTime) {
          const chiffres = playingTime.match(/\d+/g);
          if (chiffres && chiffres.length > 0) {
            if (chiffres.length === 1) {
              dureeFormatee = `${chiffres[0]} min`;
            } else {
              dureeFormatee = `${chiffres[0]}-${chiffres[chiffres.length - 1]} min`;
            }
          }
        }

        // Gérer player_max
        const playerMax = strapiGame.player_max || strapiGame.player_min;

        // Créer les tags
        const tags = [
          `${strapiGame.player_min}-${playerMax} joueurs`,
          dureeFormatee,
        ];

        result.push({
          id: strapiGame.id,
          documentId: strapiGame.documentId,
          titre: strapiGame.name,
          description: strapiGame.description || "Aucune description disponible",
          image: imageUrl,
          tags,
          categorie: "Stratégie",
          duree,
          age_min: strapiGame.age_min,
          age_max: strapiGame.age_max,
          player_min: strapiGame.player_min,
          player_max: playerMax,
          ratings: strapiGame.ratings || [],
          createdAt: strapiGame.createdAt || new Date().toISOString(),
        });
      } catch (err) {
        console.error("Erreur lors de la transformation du jeu:", err, strapiGame);
      }
    }

    // Trier par date de création décroissante (derniers ajoutés en premier)
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Ordre décroissant
    });
  },

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
      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error("Non authentifié");
      }

      const result = await apiFetch<{ data?: Family } & Family>(
        "/api/families/me",
        { token },
      );
      const family: Family = result.data || result;

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

  // Définir une note pour un jeu
  setRating: async (gameId: number, memberId: number, rating: number) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        return { success: false, error: "Non authentifié" };
      }

      await apiFetch("/api/ratings/set", {
        method: "POST",
        token,
        body: JSON.stringify({
          gameId,
          memberId,
          rating,
        }),
      });

      // Recharger la famille pour avoir les notes à jour
      await get().fetchFamily();

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la note:", error);
      return { success: false, error: "Erreur lors de l'enregistrement de la note" };
    }
  },

  // Récupérer les sessions de jeu pour un jeu spécifique
  fetchGameSessions: async (gameId: number) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        return { success: false, error: "Non authentifié" };
      }

      const result = await apiFetch<{ data?: GameSession[] }>(
        `/api/game-sessions/game/${gameId}`,
        { token },
      );
      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("Erreur lors de la récupération des parties:", error);
      return { success: false, error: "Erreur lors de la récupération des parties" };
    }
  },

  // Récupérer le top 3 des gagnants pour un jeu
  getTop3Winners: async (gameId: number) => {
    try {
      // Récupérer toutes les sessions du jeu
      const sessionsResult = await get().fetchGameSessions(gameId);

      if (!sessionsResult.success || !sessionsResult.data) {
        return { success: false, error: "Erreur lors de la récupération des sessions" };
      }

      const sessions = sessionsResult.data;
      const winnerCounts: Record<number, WinnerData> = {};

      // Compter les victoires pour chaque membre
      sessions.forEach((session) => {
        if (session.player_scores && Array.isArray(session.player_scores)) {
          session.player_scores.forEach((score) => {
            if (score.is_winner && score.member) {
              const memberId = score.member.id;
              if (!winnerCounts[memberId]) {
                winnerCounts[memberId] = {
                  member: score.member,
                  wins: 0,
                };
              }
              winnerCounts[memberId].wins++;
            }
          });
        }
      });

      // Trier par nombre de victoires et prendre les top 3
      const winners = Object.values(winnerCounts)
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 3);

      return { success: true, data: winners };
    } catch (error) {
      console.error("Erreur lors de la récupération du podium:", error);
      return { success: false, error: "Erreur lors de la récupération du podium" };
    }
  },

  // Récupérer les derniers jeux joués (jusqu'à 10)
  fetchLatestPlayedGames: async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        return { success: false, error: "Non authentifié" };
      }

      const result = await apiFetch<{ data?: any[] }>(
        "/api/game-sessions/latest",
        { token },
      );
      return { success: true, data: result.data || [] };
    } catch (error) {
      console.error("Erreur lors de la récupération des derniers jeux joués:", error);
      return { success: false, error: "Erreur lors de la récupération des derniers jeux joués" };
    }
  },
}));
