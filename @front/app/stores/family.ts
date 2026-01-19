import { defineStore } from 'pinia'

interface Member {
  id: number
  name: string
  birthdate: string
  avatar?: string
}

interface StrapiImage {
  id: number
  url: string
  formats?: {
    thumbnail?: { url: string }
    small?: { url: string }
    medium?: { url: string }
  }
}

// Interface pour les jeux tels qu'ils arrivent de Strapi
interface StrapiGame {
  id: number
  documentId?: string
  name: string
  description?: string | null
  age_min: number
  age_max: number | null
  playing_time: string | null
  player_min: number
  player_max: number | null
  image?: StrapiImage | null
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

// Interface pour les jeux transformés pour l'interface
export interface TransformedGame {
  id: number
  documentId?: string
  titre: string
  description: string
  image: string | null
  tags: string[]
  categorie: string
  duree: number
  age_min: number
  age_max: number | null
  player_min: number
  player_max: number
  createdAt: string
}

interface Family {
  id: number
  name: string
  members?: Member[]
  games?: StrapiGame[]
}

export const useFamilyStore = defineStore('family', {
  state: () => ({
    family: null as Family | null,
    isLoading: false
  }),

  getters: {
    currentFamily: state => state.family,
    familyMembers: state => state.family?.members || [],
    familyGames: state => state.family?.games || [],
    familyGamesCount: state => state.family?.games?.length || 0,
    hasFamily: state => !!state.family,
    hasFamilyGames: state => (state.family?.games?.length || 0) > 0,

    // Getter pour les jeux transformés
    transformedGames(state): TransformedGame[] {
      if (!state.family?.games || !Array.isArray(state.family.games)) {
        return []
      }

      const config = useRuntimeConfig()
      const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'

      const result: TransformedGame[] = []

      for (const strapiGame of state.family.games) {
        try {
          if (!strapiGame) {
            continue
          }

          // Extraire l'URL de l'image
          let imageUrl: string | null = null
          const imageData = strapiGame.image

          if (imageData && imageData !== null && typeof imageData === 'object') {
            if (imageData.formats?.medium?.url) {
              imageUrl = `${apiUrl}${imageData.formats.medium.url}`
            } else if (imageData.formats?.small?.url) {
              imageUrl = `${apiUrl}${imageData.formats.small.url}`
            } else if (imageData.formats?.thumbnail?.url) {
              imageUrl = `${apiUrl}${imageData.formats.thumbnail.url}`
            } else if (imageData.url) {
              imageUrl = `${apiUrl}${imageData.url}`
            }
          }

          // Parser la durée
          const playingTime = strapiGame.playing_time || ''
          const dureeMatch = playingTime.match(/(\d+)/)
          const duree = dureeMatch && dureeMatch[1] ? parseInt(dureeMatch[1], 10) : 30

          // Formater la durée
          let dureeFormatee = `${duree} min`
          if (playingTime) {
            const chiffres = playingTime.match(/\d+/g)
            if (chiffres && chiffres.length > 0) {
              if (chiffres.length === 1) {
                dureeFormatee = `${chiffres[0]} min`
              } else {
                dureeFormatee = `${chiffres[0]}-${chiffres[chiffres.length - 1]} min`
              }
            }
          }

          // Gérer player_max
          const playerMax = strapiGame.player_max || strapiGame.player_min

          // Créer les tags
          const tags = [
            `${strapiGame.player_min}-${playerMax} joueurs`,
            dureeFormatee
          ]

          result.push({
            id: strapiGame.id,
            documentId: strapiGame.documentId,
            titre: strapiGame.name,
            description: strapiGame.description || 'Aucune description disponible',
            image: imageUrl,
            tags,
            categorie: 'Stratégie',
            duree,
            age_min: strapiGame.age_min,
            age_max: strapiGame.age_max,
            player_min: strapiGame.player_min,
            player_max: playerMax,
            createdAt: strapiGame.createdAt || new Date().toISOString()
          })
        } catch (err) {
          console.error('Erreur lors de la transformation du jeu:', err, strapiGame)
        }
      }

      return result
    }
  },

  actions: {
    // Charger la famille depuis le localStorage au démarrage
    loadFamily() {
      if (import.meta.client) {
        const familyStr = localStorage.getItem('auth_family')

        if (familyStr) {
          this.family = JSON.parse(familyStr)
        }
      }
    },

    // Sauvegarder la famille dans le localStorage
    saveFamily(family: Family) {
      if (import.meta.client) {
        localStorage.setItem('auth_family', JSON.stringify(family))
      }
      this.family = family
    },

    // Supprimer la famille
    clearFamily() {
      if (import.meta.client) {
        localStorage.removeItem('auth_family')
      }
      this.family = null
    },

    // Récupérer la famille de l'utilisateur connecté
    async fetchFamily() {
      const authStore = useAuthStore()

      if (!authStore.token) {
        return null
      }

      this.isLoading = true
      const config = useRuntimeConfig()

      try {
        // Utilise le nouvel endpoint spécial /families/me
        const response = await $fetch<{ data: Family }>(
          `${config.public.apiUrl}/api/families/me`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )

        if (response.data) {
          this.saveFamily(response.data)
          return response.data
        }

        return null
      } catch (error) {
        console.error('Erreur lors de la récupération de la famille:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // Mettre à jour le nom de la famille
    async updateFamilyName(name: string) {
      const authStore = useAuthStore()

      if (!authStore.token || !this.family) {
        return { success: false, error: 'Aucune famille trouvée' }
      }

      const config = useRuntimeConfig()

      try {
        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authStore.token}`
            },
            body: {
              data: { name }
            }
          }
        )

        this.saveFamily(response)
        return { success: true, data: response }
      } catch (error: unknown) {
        console.error('Erreur lors de la mise à jour de la famille:', error)
        return {
          success: false,
          error: (error as { data?: { error?: { message?: string } } }).data?.error?.message || 'Erreur lors de la mise à jour'
        }
      }
    },

    // Ajouter un jeu à la famille
    async addGameToFamily(gameId: number) {
      const authStore = useAuthStore()

      if (!authStore.token || !this.family) {
        return { success: false, error: 'Aucune famille trouvée' }
      }

      const config = useRuntimeConfig()

      try {
        // Récupérer les IDs des jeux actuels
        const currentGameIds = this.family.games?.map(g => g.id) || []

        // Ajouter le nouveau jeu
        const updatedGameIds = [...currentGameIds, gameId]

        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authStore.token}`
            },
            body: {
              data: {
                games: updatedGameIds
              }
            }
          }
        )

        // Recharger la famille avec les jeux mis à jour
        await this.fetchFamily()

        return { success: true, data: response }
      } catch (error: unknown) {
        console.error('Erreur lors de l\'ajout du jeu à la famille:', error)
        return {
          success: false,
          error: (error as { data?: { error?: { message?: string } } }).data?.error?.message || 'Erreur lors de l\'ajout'
        }
      }
    },

    // Retirer un jeu de la famille
    async removeGameFromFamily(gameId: number) {
      const authStore = useAuthStore()

      if (!authStore.token || !this.family) {
        return { success: false, error: 'Aucune famille trouvée' }
      }

      const config = useRuntimeConfig()

      try {
        // Récupérer les IDs des jeux actuels et retirer celui spécifié
        const currentGameIds = this.family.games?.map(g => g.id) || []
        const updatedGameIds = currentGameIds.filter(id => id !== gameId)

        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authStore.token}`
            },
            body: {
              data: {
                games: updatedGameIds
              }
            }
          }
        )

        // Recharger la famille avec les jeux mis à jour
        await this.fetchFamily()

        return { success: true, data: response }
      } catch (error: unknown) {
        console.error('Erreur lors du retrait du jeu de la famille:', error)
        return {
          success: false,
          error: (error as { data?: { error?: { message?: string } } }).data?.error?.message || 'Erreur lors du retrait'
        }
      }
    }
  }
})
