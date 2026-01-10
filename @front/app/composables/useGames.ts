interface StrapiImage {
  id: number
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
  description: string | null
  age: number
  playing_time: string | null
  player_min: number
  player_max: number | null
  image?: StrapiImage | null
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface StrapiResponse {
  data: StrapiGame[]
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface Game {
  id: number
  titre: string
  description: string
  image: string
  tags: string[]
  categorie: string
  duree: number
  age: number
  player_min: number
  player_max: number
}

export const useGames = () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'

  // Fonction pour transformer les données Strapi en format Game
  const transformGame = (strapiGame: StrapiGame, baseUrl: string): Game => {
    // Vérifier que strapiGame existe
    if (!strapiGame) {
      throw new Error('Données de jeu invalides')
    }

    // Extraire l'URL de l'image
    let imageUrl = 'https://images.unsplash.com/photo-1667118398887-63cb59112b57?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // Image par défaut

    // Gérer l'image (structure Strapi v5 : image est directement dans l'objet)
    const imageData = strapiGame.image
    if (imageData && imageData !== null && typeof imageData === 'object') {
      // Utiliser l'image medium si disponible, sinon small, sinon thumbnail, sinon l'image originale
      if (imageData.formats?.medium?.url) {
        imageUrl = `${baseUrl}${imageData.formats.medium.url}`
      } else if (imageData.formats?.small?.url) {
        imageUrl = `${baseUrl}${imageData.formats.small.url}`
      } else if (imageData.formats?.thumbnail?.url) {
        imageUrl = `${baseUrl}${imageData.formats.thumbnail.url}`
      } else if (imageData.url) {
        imageUrl = `${baseUrl}${imageData.url}`
      }
    }

    // Parser la durée (playing_time peut être "30-60 min" ou "60 min" ou null)
    const playingTime = strapiGame.playing_time || ''
    const dureeMatch = playingTime.match(/(\d+)/)
    const duree = dureeMatch && dureeMatch[1] ? parseInt(dureeMatch[1], 10) : 30

    // Gérer player_max qui peut être null
    const playerMax = strapiGame.player_max || strapiGame.player_min

    // Créer les tags
    const tags = [
      `${strapiGame.player_min}-${playerMax} joueurs`,
      playingTime || `${duree} min`
    ]

    // Déterminer la catégorie (pour l'instant, on utilise une valeur par défaut)
    // Vous pouvez ajouter un champ "categorie" dans Strapi si nécessaire
    const categorie = 'Stratégie' // Valeur par défaut, à adapter selon vos besoins

    return {
      id: strapiGame.id,
      titre: strapiGame.name,
      description: strapiGame.description || 'Aucune description disponible',
      image: imageUrl,
      tags,
      categorie,
      duree,
      age: strapiGame.age,
      player_min: strapiGame.player_min,
      player_max: playerMax
    }
  }

  // Utiliser useAsyncData pour récupérer et transformer les données
  const { data: games, pending: loading, error, refresh } = useAsyncData<Game[]>(
    'games',
    async () => {
      try {
        const response = await $fetch<StrapiResponse>(`${apiUrl}/api/games?populate=image`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        // Vérifier que response et response.data existent
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.warn('Réponse API invalide:', response)
          return []
        }

        // Transformer les données Strapi vers le format attendu avec gestion d'erreur
        return response.data
          .map((strapiGame) => {
            try {
              return transformGame(strapiGame, apiUrl)
            } catch (err) {
              console.error('Erreur lors de la transformation du jeu:', err, strapiGame)
              return null
            }
          })
          .filter((game): game is Game => game !== null)
      } catch (err) {
        console.error('Erreur lors de la récupération des jeux:', err)
        throw err
      }
    },
    {
      default: () => [],
      server: false // Charger uniquement côté client pour éviter les problèmes d'hydratation
    }
  )

  return {
    games: computed(() => games.value || []),
    loading,
    error: computed(() => error.value ? (error.value as Error).message : null),
    refresh
  }
}
