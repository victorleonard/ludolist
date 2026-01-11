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

export interface Game {
  id: number
  documentId?: string
  titre: string
  description: string
  image: string | null
  tags: string[]
  categorie: string
  duree: number
  age: number
  player_min: number
  player_max: number
  createdAt: string
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
    let imageUrl: string | null = null

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
      documentId: strapiGame.documentId,
      titre: strapiGame.name,
      description: strapiGame.description || 'Aucune description disponible',
      image: imageUrl,
      tags,
      categorie,
      duree,
      age: strapiGame.age,
      player_min: strapiGame.player_min,
      player_max: playerMax,
      createdAt: strapiGame.createdAt
    }
  }

  // Utiliser useAsyncData pour récupérer et transformer les données
  const { data: games, pending: loading, error, refresh } = useAsyncData<Game[]>(
    'games',
    async () => {
      try {
        // Trier par date de création décroissante (les plus récents en premier)
        const response = await $fetch<StrapiResponse>(`${apiUrl}/api/games?populate=image&sort=createdAt:desc`, {
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

  // Interface pour les données de création d'un jeu
  interface CreateGameData {
    name: string
    description: string
    age: number
    playing_time: string
    player_min: number
    player_max: number | null
    image?: File | null
  }

  // Interface pour les données de mise à jour d'un jeu
  interface UpdateGameData extends CreateGameData {
    id: number
    documentId?: string
  }

  // Fonction pour créer un nouveau jeu
  const createGame = async (gameData: CreateGameData): Promise<Game> => {
    try {
      let imageId: number | null = null

      // Si une image est fournie, l'uploader d'abord
      if (gameData.image) {
        const formData = new FormData()
        formData.append('files', gameData.image)

        const uploadResponse = await $fetch<StrapiImage[]>(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData
        })

        if (uploadResponse && uploadResponse.length > 0) {
          imageId = uploadResponse[0].id
        }
      }

      // Créer le jeu avec les données (inclure publishedAt pour publier directement)
      const createPayload: any = {
        data: {
          name: gameData.name,
          description: gameData.description,
          age: gameData.age,
          playing_time: gameData.playing_time,
          player_min: gameData.player_min,
          player_max: gameData.player_max,
          publishedAt: new Date().toISOString() // Publier directement lors de la création
        }
      }

      // Ajouter l'image si elle a été uploadée
      if (imageId) {
        createPayload.data.image = imageId
      }

      const response = await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: createPayload
      })

      // Vérifier que la réponse contient bien un ID
      if (!response || !response.data) {
        throw new Error('Réponse invalide lors de la création du jeu')
      }

      // Utiliser documentId si disponible (Strapi v5), sinon id
      const gameId = response.data.documentId || response.data.id
      if (!gameId) {
        throw new Error('Impossible de récupérer l\'ID du jeu créé')
      }

      // Récupérer le jeu créé avec l'image
      const createdGameResponse = await $fetch<{ data: StrapiGame }>(
        `${apiUrl}/api/games/${gameId}?populate=image`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Transformer et retourner le jeu créé
      const createdGame = transformGame(createdGameResponse.data, apiUrl)

      // Rafraîchir la liste des jeux
      await refresh()

      return createdGame
    } catch (err) {
      console.error('Erreur lors de la création du jeu:', err)
      throw err
    }
  }

  // Fonction pour mettre à jour un jeu existant
  const updateGame = async (gameData: UpdateGameData): Promise<Game> => {
    try {
      let imageId: number | null = null

      // Si une nouvelle image est fournie, l'uploader d'abord
      if (gameData.image) {
        const formData = new FormData()
        formData.append('files', gameData.image)

        const uploadResponse = await $fetch<StrapiImage[]>(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData
        })

        if (uploadResponse && uploadResponse.length > 0) {
          imageId = uploadResponse[0].id
        }
      }

      // Préparer le payload de mise à jour
      const updatePayload: any = {
        data: {
          name: gameData.name,
          description: gameData.description,
          age: gameData.age,
          playing_time: gameData.playing_time,
          player_min: gameData.player_min,
          player_max: gameData.player_max
        }
      }

      // Ajouter l'image si une nouvelle a été uploadée
      if (imageId) {
        updatePayload.data.image = imageId
      }

      // Utiliser documentId si disponible (Strapi v5), sinon récupérer le documentId
      // Dans Strapi v5, on doit utiliser documentId pour les requêtes PUT
      let gameId = gameData.documentId
      if (!gameId) {
        // Si documentId n'est pas disponible, récupérer le jeu pour obtenir le documentId
        const existingGame = await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games/${gameData.id}?populate=image`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!existingGame?.data?.documentId) {
          throw new Error('Impossible de récupérer le documentId du jeu')
        }
        gameId = existingGame.data.documentId
      }
      if (!gameId) {
        throw new Error('ID du jeu manquant')
      }

      // Mettre à jour le jeu
      const response = await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: updatePayload
      })

      // Vérifier que la réponse contient bien des données
      if (!response || !response.data) {
        throw new Error('Réponse invalide lors de la mise à jour du jeu')
      }

      // Récupérer le jeu mis à jour avec l'image
      const updatedGameResponse = await $fetch<{ data: StrapiGame }>(
        `${apiUrl}/api/games/${gameId}?populate=image`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Transformer et retourner le jeu mis à jour
      const updatedGame = transformGame(updatedGameResponse.data, apiUrl)

      // Rafraîchir la liste des jeux
      await refresh()

      return updatedGame
    } catch (err) {
      console.error('Erreur lors de la mise à jour du jeu:', err)
      throw err
    }
  }

  // Fonction pour supprimer un jeu
  const deleteGame = async (gameId: number, documentId?: string): Promise<void> => {
    try {
      // Utiliser documentId si disponible (Strapi v5), sinon convertir id en string
      // Dans Strapi v5, on doit utiliser documentId pour les requêtes DELETE
      const id = documentId || String(gameId)
      if (!id) {
        throw new Error('ID du jeu manquant')
      }

      // Supprimer le jeu
      await $fetch(`${apiUrl}/api/games/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Rafraîchir la liste des jeux
      await refresh()
    } catch (err) {
      console.error('Erreur lors de la suppression du jeu:', err)
      throw err
    }
  }

  return {
    games: computed(() => games.value || []),
    loading,
    error: computed(() => error.value ? (error.value as Error).message : null),
    refresh,
    createGame,
    updateGame,
    deleteGame
  }
}
