import { storeToRefs } from 'pinia'
import { useFamilyStore } from '~/stores/family'

interface StrapiImage {
  url: string
  formats?: {
    thumbnail?: { url: string }
    small?: { url: string }
    medium?: { url: string }
  }
}

interface StrapiGame {
  id: number
  documentId?: string
  name: string
  description?: string | null
  age_min: number
  age_max?: number | null
  playing_time?: string | null
  player_min: number
  player_max?: number | null
  image?: StrapiImage | null
  createdAt?: string
}

export interface Game {
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

/**
 * Composable pour gérer les jeux de la famille
 * Transforme les jeux Strapi en format Game utilisé par l'interface
 */
export const useFamilyGames = () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'

  const familyStore = useFamilyStore()
  const { familyGames: rawFamilyGames, isLoading } = storeToRefs(familyStore)

  // Fonction pour transformer un jeu Strapi en format Game
  const transformGame = (strapiGame: StrapiGame): Game => {
    if (!strapiGame) {
      throw new Error('Données de jeu invalides')
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

    return {
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
    }
  }

  // Computed pour les jeux transformés
  const games = computed<Game[]>(() => {
    if (!rawFamilyGames.value || !Array.isArray(rawFamilyGames.value)) {
      return []
    }

    return rawFamilyGames.value
      .map((game) => {
        try {
          return transformGame(game)
        } catch (err) {
          console.error('Erreur lors de la transformation du jeu:', err, game)
          return null
        }
      })
      .filter((game): game is Game => game !== null)
  })

  // Fonction pour rafraîchir les jeux de la famille
  const refresh = async () => {
    await familyStore.fetchFamily()
  }

  // Fonction pour ajouter un jeu à la famille
  const addGameToFamily = async (gameId: number) => {
    return await familyStore.addGameToFamily(gameId)
  }

  // Fonction pour retirer un jeu de la famille
  const removeGameFromFamily = async (gameId: number) => {
    return await familyStore.removeGameFromFamily(gameId)
  }

  return {
    games,
    loading: isLoading,
    error: computed(() => null), // Pour compatibilité avec useGames
    refresh,
    addGameToFamily,
    removeGameFromFamily
  }
}
