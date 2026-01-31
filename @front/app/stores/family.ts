import { defineStore } from "pinia";

export interface Member {
  id: number;
  username: string;
  birthdate?: string;
  avatar?: string;
}

export interface Rating {
  id: number;
  rating: number;
  member: {
    id: number;
  };
  game: {
    id: number;
  };
}

export interface PlayerScore {
  id: number;
  score: number;
  is_winner: boolean;
  position: number | null;
  member: {
    id: number;
    username: string;
  };
  game_session: {
    id: number;
  };
}

export interface GameSession {
  id: number;
  played_at: string;
  notes: string | null;
  game: {
    id: number;
    name: string;
    image?: StrapiImage | null;
  };
  family: {
    id: number;
  };
  player_scores?: PlayerScore[];
}

interface StrapiImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

// Interface pour les jeux tels qu'ils arrivent de Strapi
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

// Interface pour les jeux transformés pour l'interface
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

interface StrapiImage {
  id: number;
  url: string;
  formats?: {
    thumbnail?: { url: string };
    small?: { url: string };
    medium?: { url: string };
  };
}

interface StrapiBook {
  id: number;
  documentId?: string;
  titre: string;
  auteur?: string | null;
  description?: string | null;
  isbn?: string | null;
  annee?: number | null;
  editeur?: string | null;
  image?: StrapiImage | null;
  image_url?: string | null;
  nombre_pages?: number | null;
  sujets?: any;
  open_library_key?: string | null;
  book_readings?: BookReading[];
  added_by?: { id: number; username?: string } | null;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookReading {
  id: number;
  date_debut?: string | null;
  date_fin?: string | null;
  note?: number | null;
  member: {
    id: number;
    username: string;
  };
  book: {
    id: number;
    titre: string;
  };
}

export interface TransformedBook {
  id: number;
  documentId?: string;
  titre: string;
  auteur?: string | null;
  description?: string | null;
  isbn?: string | null;
  annee?: number | null;
  editeur?: string | null;
  image: string | null;
  nombre_pages?: number | null;
  sujets?: any;
  open_library_key?: string | null;
  book_readings?: BookReading[];
  createdAt: string;
}

interface Family {
  id: number;
  name: string;
  members?: Member[];
  games?: StrapiGame[];
  books?: StrapiBook[];
}

export const useFamilyStore = defineStore("family", {
  state: () => ({
    family: null as Family | null,
    isLoading: false,
  }),

  getters: {
    currentFamily: (state) => state.family,
    familyMembers: (state) => state.family?.members || [],
    familyGames: (state) => state.family?.games || [],
    familyGamesCount: (state) => state.family?.games?.length || 0,
    familyBooks: (state) => state.family?.books || [],
    familyBooksCount: (state) => state.family?.books?.length || 0,
    hasFamily: (state) => !!state.family,
    hasFamilyGames: (state) => (state.family?.games?.length || 0) > 0,
    hasFamilyBooks: (state) => (state.family?.books?.length || 0) > 0,

    // Getter pour les jeux transformés
    transformedGames(state): TransformedGame[] {
      if (!state.family?.games || !Array.isArray(state.family.games)) {
        return [];
      }

      const config = useRuntimeConfig();
      const apiUrl =
        (config.public.apiUrl as string) || "http://localhost:1337";

      const result: TransformedGame[] = [];

      for (const strapiGame of state.family.games) {
        try {
          if (!strapiGame) {
            continue;
          }

          // Extraire l'URL de l'image - prioriser image_url (thumbnail BGG) s'il existe
          let imageUrl: string | null = null;

          // Si un image_url (thumbnail BGG) est disponible, l'utiliser en priorité
          if (strapiGame.image_url) {
            imageUrl = strapiGame.image_url;
          } else {
            // Sinon, utiliser l'image uploadée dans Strapi
            const imageData = strapiGame.image;
            if (
              imageData &&
              imageData !== null &&
              typeof imageData === "object"
            ) {
              if (imageData.formats?.medium?.url) {
                imageUrl = `${apiUrl}${imageData.formats.medium.url}`;
              } else if (imageData.formats?.small?.url) {
                imageUrl = `${apiUrl}${imageData.formats.small.url}`;
              } else if (imageData.formats?.thumbnail?.url) {
                imageUrl = `${apiUrl}${imageData.formats.thumbnail.url}`;
              } else if (imageData.url) {
                imageUrl = `${apiUrl}${imageData.url}`;
              }
            }
          }

          // Parser la durée
          const playingTime = strapiGame.playing_time || "";
          const dureeMatch = playingTime.match(/(\d+)/);
          const duree =
            dureeMatch && dureeMatch[1] ? parseInt(dureeMatch[1], 10) : 30;

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
            description:
              strapiGame.description || "Aucune description disponible",
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
          console.error(
            "Erreur lors de la transformation du jeu:",
            err,
            strapiGame,
          );
        }
      }

      // Trier par date de création décroissante (derniers ajoutés en premier)
      return result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Ordre décroissant
      });
    },

    // Getter pour les livres transformés
    transformedBooks(state): TransformedBook[] {
      if (!state.family?.books || !Array.isArray(state.family.books)) {
        return [];
      }

      const config = useRuntimeConfig();
      const apiUrl =
        (config.public.apiUrl as string) || "http://localhost:1337";

      const result: TransformedBook[] = [];

      for (const strapiBook of state.family.books) {
        try {
          if (!strapiBook) {
            continue;
          }

          // Extraire l'URL de l'image - prioriser image_url (Open Library) s'il existe
          let imageUrl: string | null = null;

          if (strapiBook.image_url) {
            imageUrl = strapiBook.image_url;
          } else {
            // Sinon, utiliser l'image uploadée dans Strapi
            const imageData = strapiBook.image;
            if (
              imageData &&
              imageData !== null &&
              typeof imageData === "object"
            ) {
              if (imageData.formats?.medium?.url) {
                imageUrl = `${apiUrl}${imageData.formats.medium.url}`;
              } else if (imageData.formats?.small?.url) {
                imageUrl = `${apiUrl}${imageData.formats.small.url}`;
              } else if (imageData.formats?.thumbnail?.url) {
                imageUrl = `${apiUrl}${imageData.formats.thumbnail.url}`;
              } else if (imageData.url) {
                imageUrl = `${apiUrl}${imageData.url}`;
              }
            }
          }

          result.push({
            id: strapiBook.id,
            documentId: strapiBook.documentId,
            titre: strapiBook.titre,
            auteur: strapiBook.auteur || null,
            description: strapiBook.description || null,
            isbn: strapiBook.isbn || null,
            annee: strapiBook.annee || null,
            editeur: strapiBook.editeur || null,
            image: imageUrl,
            nombre_pages: strapiBook.nombre_pages || null,
            sujets: strapiBook.sujets || null,
            open_library_key: strapiBook.open_library_key || null,
            book_readings: strapiBook.book_readings || [],
            added_by: strapiBook.added_by || null,
            createdAt: strapiBook.createdAt || new Date().toISOString(),
          });
        } catch (err) {
          console.error(
            "Erreur lors de la transformation du livre:",
            err,
            strapiBook,
          );
        }
      }

      // Trier par date de création décroissante (derniers ajoutés en premier)
      return result.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Ordre décroissant
      });
    },
  },

  actions: {
    // Charger la famille depuis le localStorage au démarrage
    loadFamily() {
      if (import.meta.client) {
        const familyStr = localStorage.getItem("auth_family");

        if (familyStr) {
          this.family = JSON.parse(familyStr);
        }
      }
    },

    // Sauvegarder la famille dans le localStorage
    saveFamily(family: Family) {
      if (import.meta.client) {
        localStorage.setItem("auth_family", JSON.stringify(family));
      }
      this.family = family;
    },

    // Supprimer la famille
    clearFamily() {
      if (import.meta.client) {
        localStorage.removeItem("auth_family");
      }
      this.family = null;
    },

    // Récupérer la famille de l'utilisateur connecté
    async fetchFamily() {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return null;
      }

      this.isLoading = true;
      const config = useRuntimeConfig();

      try {
        // Utilise le nouvel endpoint spécial /families/me
        const response = await $fetch<{ data: Family }>(
          `${config.public.apiUrl}/api/families/me`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        if (response.data) {
          this.saveFamily(response.data);
          return response.data;
        }

        return null;
      } catch (error) {
        console.error("Erreur lors de la récupération de la famille:", error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    // Mettre à jour le nom de la famille
    async updateFamilyName(name: string) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
            body: {
              data: { name },
            },
          },
        );

        this.saveFamily(response);
        return { success: true, data: response };
      } catch (error: unknown) {
        console.error("Erreur lors de la mise à jour de la famille:", error);
        return {
          success: false,
          error:
            (error as { data?: { error?: { message?: string } } }).data?.error
              ?.message || "Erreur lors de la mise à jour",
        };
      }
    },

    // Ajouter un jeu à la famille
    async addGameToFamily(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        // Récupérer les IDs des jeux actuels
        const currentGameIds = this.family.games?.map((g) => g.id) || [];

        // Ajouter le nouveau jeu
        const updatedGameIds = [...currentGameIds, gameId];

        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
            body: {
              data: {
                games: updatedGameIds,
              },
            },
          },
        );

        // Recharger la famille avec les jeux mis à jour
        await this.fetchFamily();

        return { success: true, data: response };
      } catch (error: unknown) {
        console.error("Erreur lors de l'ajout du jeu à la famille:", error);
        return {
          success: false,
          error:
            (error as { data?: { error?: { message?: string } } }).data?.error
              ?.message || "Erreur lors de l'ajout",
        };
      }
    },

    // Retirer un jeu de la famille
    async removeGameFromFamily(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        // Récupérer les IDs des jeux actuels et retirer celui spécifié
        const currentGameIds = this.family.games?.map((g) => g.id) || [];
        const updatedGameIds = currentGameIds.filter((id) => id !== gameId);

        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
            body: {
              data: {
                games: updatedGameIds,
              },
            },
          },
        );

        // Recharger la famille avec les jeux mis à jour
        await this.fetchFamily();

        return { success: true, data: response };
      } catch (error: unknown) {
        console.error("Erreur lors du retrait du jeu de la famille:", error);
        return {
          success: false,
          error:
            (error as { data?: { error?: { message?: string } } }).data?.error
              ?.message || "Erreur lors du retrait",
        };
      }
    },

    // Récupérer les notes d'un jeu
    async fetchGameRatings(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: Rating[] }>(
          `${config.public.apiUrl}/api/ratings/game/${gameId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des notes:", error);
        return {
          success: false,
          error:
            (error as { data?: { error?: { message?: string } } }).data?.error
              ?.message || "Erreur lors de la récupération",
        };
      }
    },

    // Ajouter ou mettre à jour une note de manière sécurisée
    async setRating(gameId: number, memberId: number, rating: number) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        // Utiliser l'endpoint sécurisé qui gère à la fois la création et la mise à jour
        const response = await $fetch<{ data: Rating | null }>(
          `${config.public.apiUrl}/api/ratings/set`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
            body: {
              gameId,
              memberId,
              rating,
            },
          },
        );

        // Recharger la famille pour avoir les notes à jour
        await this.fetchFamily();

        return { success: true, data: response.data || null };
      } catch (error: unknown) {
        console.error("Erreur lors de l'enregistrement de la note:", error);

        // Gestion des erreurs spécifiques
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de l'enregistrement";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async fetchGameSessions(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: GameSession[] }>(
          `${config.public.apiUrl}/api/game-sessions/game/${gameId}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des parties:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async createGameSession(
      gameId: number,
      playedAt: string,
      playerScores: Array<{ memberId: number; score: number }>,
      notes?: string,
    ) {
      const authStore = useAuthStore();

      if (!authStore.token || !this.family) {
        return { success: false, error: "Aucune famille trouvée" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: GameSession }>(
          `${config.public.apiUrl}/api/game-sessions/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
            body: {
              gameId,
              played_at: playedAt,
              notes: notes || null,
              player_scores: playerScores.map((ps) => ({
                memberId: ps.memberId,
                score: ps.score,
              })),
            },
          },
        );

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error("Erreur lors de la création de la partie:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la création";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async deleteGameSession(sessionId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        await $fetch<{ data: { id: number } }>(
          `${config.public.apiUrl}/api/game-sessions/${sessionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        return { success: true };
      } catch (error: unknown) {
        console.error("Erreur lors de la suppression de la partie:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la suppression";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async getTopWinner(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{
          data: {
            member: { id: number; username: string };
            wins: number;
          } | null;
        }>(`${config.public.apiUrl}/api/game-sessions/top-winner/${gameId}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error(
          "Erreur lors de la récupération du meilleur gagnant:",
          error,
        );
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async getTop3Winners(gameId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      try {
        // Récupérer toutes les sessions du jeu
        const sessionsResult = await this.fetchGameSessions(gameId);

        if (!sessionsResult.success || !sessionsResult.data) {
          return {
            success: false,
            error: "Erreur lors de la récupération des sessions",
          };
        }

        const sessions = sessionsResult.data;
        const winnerCounts: Record<
          number,
          { member: { id: number; username: string }; wins: number }
        > = {};

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
                // TypeScript sait que winnerCounts[memberId] existe maintenant
                winnerCounts[memberId]!.wins++;
              }
            });
          }
        });

        // Trier par nombre de victoires et prendre les top 3
        const winners = Object.values(winnerCounts)
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 3);

        return { success: true, data: winners };
      } catch (error: unknown) {
        console.error(
          "Erreur lors de la récupération des top 3 gagnants:",
          error,
        );
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async getLatestSession() {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: GameSession | null }>(
          `${config.public.apiUrl}/api/game-sessions/latest`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error(
          "Erreur lors de la récupération de la dernière partie:",
          error,
        );
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    async getLatest10Sessions() {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: GameSession[] }>(
          `${config.public.apiUrl}/api/game-sessions/latest`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );

        // S'assurer que la réponse est toujours un tableau
        const data = Array.isArray(response.data)
          ? response.data
          : response.data
            ? [response.data]
            : [];

        return { success: true, data };
      } catch (error: unknown) {
        console.error(
          "Erreur lors de la récupération des dernières parties:",
          error,
        );
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    // Ajouter un livre à la famille
    async addBookToFamily(
      bookData: {
        titre: string;
        auteur?: string;
        description?: string;
        isbn?: string;
        annee?: number;
        editeur?: string;
        image_url?: string;
        nombre_pages?: number;
        sujets?: any;
        open_library_key?: string;
      },
      /** Si fourni (membre connecté), le livre sera marqué comme ajouté par ce membre. */
      memberId?: number
    ) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const body =
          memberId != null ? { ...bookData, memberId } : bookData;
        const response = await $fetch<{ data: StrapiBook; message: string }>(
          `${config.public.apiUrl}/api/books/add-to-family`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              "Content-Type": "application/json",
            },
            body,
          },
        );

        // Recharger la famille pour avoir les livres à jour
        await this.fetchFamily();

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error("Erreur lors de l'ajout du livre:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de l'ajout du livre";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    // Mettre à jour un livre (ex. image). Utiliser documentId (Strapi 5) si dispo, sinon id.
    async updateBook(
      bookIdOrDocumentId: number | string,
      data: { image_url?: string | null }
    ) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();
      const identifier = String(bookIdOrDocumentId);

      try {
        await $fetch(`${config.public.apiUrl}/api/books/${identifier}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            "Content-Type": "application/json",
          },
          body: {
            data: { image_url: data.image_url ?? null },
          },
        });

        await this.fetchFamily();
        return { success: true };
      } catch (error: unknown) {
        console.error("Erreur lors de la mise à jour du livre:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la mise à jour du livre";
        return { success: false, error: errorMessage };
      }
    },

    // Ajouter ou mettre à jour une lecture de livre pour un membre
    async upsertBookReading(
      memberId: number,
      bookId: number | string,
      readingData: {
        date_debut?: string | null;
        date_fin?: string | null;
        note?: number | null;
      },
    ) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data: BookReading; message: string }>(
          `${config.public.apiUrl}/api/book-readings/upsert`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              "Content-Type": "application/json",
            },
            body: {
              memberId,
              bookId,
              ...readingData,
            },
          },
        );

        // Recharger la famille pour avoir les lectures à jour
        await this.fetchFamily();

        return { success: true, data: response.data };
      } catch (error: unknown) {
        console.error("Erreur lors de la sauvegarde de la lecture:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la sauvegarde";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    // Récupérer les lectures d'un membre
    async fetchMemberBookReadings(memberId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data?: BookReading[] } | BookReading[]>(
          `${config.public.apiUrl}/api/book-readings/member/${memberId}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );
        const raw = Array.isArray(response) ? response : response?.data;
        const list = Array.isArray(raw)
          ? raw
          : (Array.isArray((raw as { data?: unknown })?.data) ? (raw as { data: BookReading[] }).data : []);
        return { success: true, data: list };
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des lectures:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },

    // Récupérer les lectures d'un livre
    async fetchBookReadings(bookId: number) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        return { success: false, error: "Non authentifié" };
      }

      const config = useRuntimeConfig();

      try {
        const response = await $fetch<{ data?: BookReading[] } | BookReading[]>(
          `${config.public.apiUrl}/api/book-readings/book/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          },
        );
        // Accepter { data: [...] } ou tableau direct
        const list = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        return { success: true, data: list };
      } catch (error: unknown) {
        console.error("Erreur lors de la récupération des lectures:", error);
        const err = error as {
          data?: { error?: { message?: string } };
          message?: string;
        };
        const errorMessage =
          err?.data?.error?.message ||
          err?.message ||
          "Erreur lors de la récupération";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  },
});
