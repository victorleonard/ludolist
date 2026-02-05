<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div class="flex flex-col max-h-[85vh] bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-lg font-semibold">
            {{ editingGame ? 'Modifier le jeu' : 'Ajouter un nouveau jeu' }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              v-if="editingGame"
              color="red"
              variant="outline"
              icon="i-ion-trash"
              size="sm"
              :loading="deleting"
              :disabled="submitting"
              @click="handleDelete"
            >
              Supprimer
            </UButton>
            <UButton
              v-if="editingGame || showManualForm"
              type="submit"
              form="game-form"
              color="primary"
              size="sm"
              :loading="submitting"
              :disabled="deleting"
            >
              {{ editingGame ? 'Enregistrer' : 'Ajouter le jeu' }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ion-close"
              size="sm"
              :disabled="submitting || deleting"
              @click="closeModal"
            />
          </div>
        </div>

        <!-- Mode recherche BGG (par défaut pour l'ajout) -->
        <div
          v-if="!editingGame && !showManualForm"
          class="space-y-4 overflow-y-auto flex-1 p-4"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div class="flex items-center gap-2 mb-4">
            <UIcon
              name="i-ion-search"
              class="w-5 h-5"
            />
            <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Rechercher
            </h4>
          </div>

          <div class="flex gap-2">
            <UInput
              id="bgg-search"
              v-model="bggSearchQuery"
              placeholder="Rechercher un jeu..."
              :disabled="submitting || searchingBGG"
              class="flex-1"
              size="lg"
              @keyup.enter="searchBGG"
            />
            <UButton
              type="button"
              color="primary"
              :loading="searchingBGG || submitting"
              :disabled="submitting || searchingBGG || !bggSearchQuery.trim()"
              size="lg"
              @click="searchBGG"
            >
              Rechercher
            </UButton>
          </div>

          <!-- Résultats de recherche BGG -->
          <div
            v-if="bggSearchError"
            class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ bggSearchError }}
            </p>
          </div>

          <div
            v-if="bggResults.length > 0"
            class="mt-4 space-y-2 max-h-96 overflow-y-auto"
          >
            <div
              v-for="bggGame in bggResults"
              :key="bggGame.id"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              :class="{
                'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer': !submitting,
                'opacity-50 cursor-not-allowed': submitting
              }"
              @click="!submitting && selectBGGGame(bggGame)"
            >
              <div class="flex items-center gap-4">
                <!-- Image du jeu -->
                <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    v-if="bggGame.image"
                    :src="bggGame.image"
                    :alt="bggGame.name"
                    class="w-full h-full object-cover"
                    @error="bggGame.image = null"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <UIcon
                      name="i-ion-image"
                      class="w-8 h-8 text-gray-400"
                    />
                  </div>
                </div>

                <!-- Informations du jeu -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-base truncate">
                    {{ bggGame.name }}
                  </p>
                  <p
                    v-if="bggGame.year"
                    class="text-sm text-gray-500 dark:text-gray-400 mt-1"
                  >
                    {{ bggGame.year }}
                  </p>
                </div>

                <!-- Bouton sélectionner -->
                <UButton
                  type="button"
                  color="primary"
                  variant="outline"
                  size="sm"
                  class="shrink-0"
                  :loading="submitting"
                  :disabled="submitting"
                  @click.stop="selectBGGGame(bggGame)"
                >
                  Sélectionner
                </UButton>
              </div>
            </div>
          </div>

          <!-- Bouton pour ajouter manuellement -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              block
              icon="i-ion-add"
              @click="showManualForm = true"
            >
              Ajouter manuellement
            </UButton>
          </div>
        </div>

        <!-- Formulaire manuel -->
        <form
          v-else
          id="game-form"
          class="space-y-4 overflow-y-auto flex-1 p-4"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <!-- Bouton retour à la recherche (uniquement pour l'ajout) -->
          <div
            v-if="!editingGame"
            class="mb-4"
          >
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-ion-arrow-back"
              size="sm"
              @click="showManualForm = false"
            >
              Retour à la recherche
            </UButton>
          </div>

          <div>
            <label
              for="name"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-game-controller"
                class="w-4 h-4"
              />
              Titre du jeu <span class="text-red-500">*</span>
            </label>
            <UInput
              id="name"
              v-model="state.name"
              :disabled="submitting"
              :error="!!errors.name"
              class="w-full"
            />
            <p
              v-if="errors.name"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <UIcon
                name="i-ion-calendar"
                class="w-4 h-4"
              />
              Âge
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="age_min"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Âge minimum <span class="text-red-500">*</span>
                </label>
                <SelectWithModal
                  id="age_min"
                  v-model="state.age_min"
                  :items="ageOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Âge minimum"
                  modal-title="Âge minimum"
                  :disabled="submitting"
                  :error="!!errors.age_min"
                  class="w-full"
                />
                <p
                  v-if="errors.age_min"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.age_min }}
                </p>
              </div>
              <div>
                <label
                  for="age_max"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Âge maximum
                </label>
                <SelectWithModal
                  id="age_max"
                  v-model="state.age_max"
                  :items="filteredAgeMaxOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Âge maximum"
                  modal-title="Âge maximum"
                  :disabled="submitting"
                  :error="!!errors.age_max"
                  class="w-full"
                />
                <p
                  v-if="errors.age_max"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.age_max }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label
              for="playing_time"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-time"
                class="w-4 h-4"
              />
              Durée de jeu (en minutes) <span class="text-red-500">*</span>
            </label>
            <UInput
              id="playing_time"
              v-model.number="state.playing_time"
              type="number"
              min="1"
              step="1"
              placeholder="Ex: 30, 45, 60..."
              :disabled="submitting"
              :error="!!errors.playing_time"
              class="w-full"
            />
            <p
              v-if="errors.playing_time"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.playing_time }}
            </p>
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <UIcon
                name="i-ion-persons"
                class="w-4 h-4"
              />
              Nombre de joueurs
            </label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="player_min"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Nombre minimum <span class="text-red-500">*</span>
                </label>
                <SelectWithModal
                  id="player_min"
                  v-model="state.player_min"
                  :items="playerMinOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Minimum"
                  modal-title="Nombre minimum de joueurs"
                  :disabled="submitting"
                  :error="!!errors.player_min"
                  class="w-full"
                />
                <p
                  v-if="errors.player_min"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.player_min }}
                </p>
              </div>
              <div>
                <label
                  for="player_max"
                  class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                >
                  Nombre maximum
                </label>
                <SelectWithModal
                  id="player_max"
                  v-model="state.player_max"
                  :items="filteredPlayerMaxOptions"
                  option-attribute="label"
                  value-attribute="value"
                  placeholder="Maximum"
                  modal-title="Nombre maximum de joueurs"
                  :disabled="submitting"
                  :error="!!errors.player_max"
                  class="w-full"
                />
                <p
                  v-if="errors.player_max"
                  class="mt-1 text-xs text-red-600 dark:text-red-400"
                >
                  {{ errors.player_max }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <UFileUpload
              v-model="imageFile"
              color="neutral"
              highlight
              label="Déposez votre image ici"
              description="SVG, PNG, JPG ou GIF (max. 2MB)"
              class="w-full min-h-48"
              :disabled="submitting"
            />
          </div>

          <div
            v-if="submitError"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { TransformedGame as Game } from '~/stores/family'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { storeToRefs } from 'pinia'

interface Props {
  modelValue: boolean
  game?: Game | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  game: null
})

const emit = defineEmits<Emits>()

const config = useRuntimeConfig()
const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'
const authStore = useAuthStore()
const { token } = storeToRefs(authStore)
const familyStore = useFamilyStore()

// Fonction helper pour obtenir les headers avec authentification
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token.value) {
    headers.Authorization = `Bearer ${token.value}`
  }
  return headers
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
  image_url?: string | null
  bggId?: string | null
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

// Fonction pour créer un nouveau jeu
const createGame = async (gameData: {
  name: string
  description: string
  age_min: number
  age_max: number | null
  playing_time: string
  player_min: number
  player_max: number | null
  image?: File | null
  image_url?: string | null
  bggId?: string | null
}): Promise<number> => {
  let imageId: number | null = null

  // Si une image est fournie, l'uploader d'abord
  if (gameData.image) {
    const formData = new FormData()
    formData.append('files', gameData.image)

    const uploadHeaders: Record<string, string> = {}
    if (token.value) {
      uploadHeaders.Authorization = `Bearer ${token.value}`
    }

    const uploadResponse = await $fetch<StrapiImage[]>(`${apiUrl}/api/upload`, {
      method: 'POST',
      headers: uploadHeaders,
      body: formData
    })

    if (uploadResponse && uploadResponse.length > 0) {
      imageId = uploadResponse[0].id
    }
  }

  // Créer le jeu
  const createPayload: any = {
    data: {
      name: gameData.name,
      description: gameData.description,
      age_min: gameData.age_min,
      age_max: gameData.age_max,
      playing_time: gameData.playing_time,
      player_min: gameData.player_min,
      player_max: gameData.player_max,
      image_url: gameData.image_url || null,
      bggId: gameData.bggId || null,
      publishedAt: new Date().toISOString()
    }
  }

  if (imageId) {
    createPayload.data.image = imageId
  }

  const response = await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: createPayload
  })

  if (!response || !response.data) {
    throw new Error('Réponse invalide lors de la création du jeu')
  }

  return response.data.id
}

// Fonction pour mettre à jour un jeu existant
const updateGame = async (gameData: {
  id: number
  documentId?: string
  name: string
  description: string
  age_min: number
  age_max: number | null
  playing_time: string
  player_min: number
  player_max: number | null
  image?: File | null
  image_url?: string | null
  bggId?: string | null
}): Promise<void> => {
  let imageId: number | null = null

  // Si une nouvelle image est fournie, l'uploader d'abord
  if (gameData.image) {
    const formData = new FormData()
    formData.append('files', gameData.image)

    const uploadHeaders: Record<string, string> = {}
    if (token.value) {
      uploadHeaders.Authorization = `Bearer ${token.value}`
    }

    const uploadResponse = await $fetch<StrapiImage[]>(`${apiUrl}/api/upload`, {
      method: 'POST',
      headers: uploadHeaders,
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
      age_min: gameData.age_min,
      age_max: gameData.age_max,
      playing_time: gameData.playing_time,
      player_min: gameData.player_min,
      player_max: gameData.player_max,
      image_url: gameData.image_url || null,
      bggId: gameData.bggId || null
    }
  }

  if (imageId) {
    updatePayload.data.image = imageId
  }

  let gameId = gameData.documentId
  if (!gameId) {
    const existingGame = await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games/${gameData.id}?populate=image`, {
      headers: getAuthHeaders()
    })
    if (!existingGame?.data?.documentId) {
      throw new Error('Impossible de récupérer le documentId du jeu')
    }
    gameId = existingGame.data.documentId
  }
  if (!gameId) {
    throw new Error('ID du jeu manquant')
  }

  await $fetch<{ data: StrapiGame }>(`${apiUrl}/api/games/${gameId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: updatePayload
  })
}

// Fonction pour supprimer un jeu
const deleteGame = async (gameId: number, documentId?: string): Promise<void> => {
  const id = documentId || String(gameId)
  if (!id) {
    throw new Error('ID du jeu manquant')
  }

  await $fetch(`${apiUrl}/api/games/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
}

const editingGame = computed(() => props.game !== null && props.game !== undefined)

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
    showManualForm.value = false
  } else if (newValue && editingGame.value) {
    loadGameData()
    showManualForm.value = true // En mode édition, afficher directement le formulaire
  } else {
    showManualForm.value = false // En mode ajout, commencer par la recherche
  }
})

watch(() => props.game, (newGame) => {
  if (newGame && isOpen.value) {
    loadGameData()
  }
})

const submitting = ref(false)
const deleting = ref(false)
const submitError = ref<string | null>(null)
const imageFile = ref<File | null>(null)

// Mode d'affichage (recherche BGG ou formulaire manuel)
const showManualForm = ref(false)

// Recherche BGG
const bggSearchQuery = ref('')
const searchingBGG = ref(false)
const bggResults = ref<BGGGame[]>([])
const bggSearchError = ref<string | null>(null)
const loadingImages = ref<Set<number>>(new Set())
const selectedBGGData = ref<BGGGame | null>(null)

const ageOptions = Array.from({ length: 19 }, (_, i) => ({
  label: `${i}${i === 0 ? '' : '+'} ans`,
  value: i
}))

// Les options de durée ne sont plus utilisées car on utilise un champ libre

const playerMinOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} joueur${i > 0 ? 's' : ''}`,
  value: i + 1
}))

const playerMaxOptions = [
  { label: 'Aucun maximum', value: null },
  ...Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} joueur${i > 0 ? 's' : ''}`,
    value: i + 1
  }))
]

const state = reactive({
  name: '',
  age_min: null as number | null,
  age_max: null as number | null,
  playing_time: null as number | null,
  player_min: 2,
  player_max: null as number | null
})

// Réinitialiser les erreurs quand les champs sont modifiés
watch(() => state.name, () => {
  if (errors.name) errors.name = ''
})

watch(() => state.age_min, () => {
  if (errors.age_min) errors.age_min = ''
})

watch(() => state.age_max, () => {
  if (errors.age_max) errors.age_max = ''
})

watch(() => state.playing_time, () => {
  if (errors.playing_time) errors.playing_time = ''
})

watch(() => state.player_min, () => {
  if (errors.player_min) errors.player_min = ''
})

watch(() => state.player_max, () => {
  if (errors.player_max) errors.player_max = ''
})

const errors = reactive({
  name: '',
  age_min: '',
  age_max: '',
  playing_time: '',
  player_min: '',
  player_max: ''
})

const loadGameData = () => {
  if (props.game) {
    state.name = props.game.titre
    state.age_min = props.game.age_min
    state.age_max = props.game.age_max

    // Charger la durée directement comme nombre (en minutes)
    if (props.game.duree !== undefined && props.game.duree !== null) {
      state.playing_time = props.game.duree
    } else {
      state.playing_time = null
    }

    state.player_min = props.game.player_min
    state.player_max = props.game.player_max
    imageFile.value = null // On ne charge pas l'image existante, l'utilisateur peut en uploader une nouvelle
  }
}

const resetForm = () => {
  state.name = ''
  state.age_min = null
  state.age_max = null
  state.playing_time = null
  state.player_min = 2
  state.player_max = null
  imageFile.value = null
  submitError.value = null
  bggSearchQuery.value = ''
  bggResults.value = []
  bggSearchError.value = null
  selectedBGGData.value = null
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

// Recherche BGG
interface BGGGame {
  id: number
  name: string
  year: number | null
  bggId: string
  image?: string | null
  image_url?: string | null
  description?: string | null
  minPlayers?: number | null
  maxPlayers?: number | null
  minPlayTime?: number | null
  maxPlayTime?: number | null
  minAge?: number | null
  type?: string | null
  rating_global?: number | null
  categories?: string[] | null
}

const searchBGG = async () => {
  if (!bggSearchQuery.value.trim()) {
    return
  }

  searchingBGG.value = true
  bggSearchError.value = null
  bggResults.value = []
  loadingImages.value.clear()

  try {
    const response = await $fetch<{ data: { query: string, count: number, games: BGGGame[] } }>(
      `${apiUrl}/api/games/search-bgg?query=${encodeURIComponent(bggSearchQuery.value)}`,
      {
        headers: getAuthHeaders()
      }
    )

    if (response?.data?.games) {
      // Initialiser les résultats avec image null
      bggResults.value = response.data.games.map(game => ({
        ...game,
        image: null as string | null
      }))

      if (response.data.games.length === 0) {
        bggSearchError.value = 'Aucun jeu trouvé pour cette recherche.'
      } else {
        // Récupérer les images pour chaque jeu en parallèle
        loadBGGImages(response.data.games)
      }
    } else {
      bggSearchError.value = 'Erreur lors de la recherche.'
    }
  } catch (err: unknown) {
    console.error('Erreur lors de la recherche BGG:', err)
    bggSearchError.value = err instanceof Error ? err.message : 'Erreur lors de la recherche sur BoardGameGeek'
  } finally {
    searchingBGG.value = false
  }
}

// Fonction pour charger les images des jeux BGG
const loadBGGImages = async (games: BGGGame[]) => {
  // Charger les images en parallèle pour les 10 premiers jeux (pour éviter trop de requêtes)
  const gamesToLoad = games.slice(0, 10)

  const imagePromises = gamesToLoad.map(async (game) => {
    if (loadingImages.value.has(game.id)) {
      return
    }

    loadingImages.value.add(game.id)

    try {
      const detailsResponse = await $fetch<{ data: BGGGame }>(
        `${apiUrl}/api/games/bgg-details/${game.bggId}`,
        {
          headers: getAuthHeaders()
        }
      )

      if (detailsResponse?.data) {
        const gameIndex = bggResults.value.findIndex(g => g.id === game.id)
        if (gameIndex !== -1) {
          bggResults.value[gameIndex].image = detailsResponse.data.image || detailsResponse.data.image_url || null
          bggResults.value[gameIndex].image_url = detailsResponse.data.image_url || detailsResponse.data.image || null
        }
      }
    } catch (err) {
      console.error(`Erreur lors du chargement de l'image pour le jeu ${game.id}:`, err)
      // En cas d'erreur, on laisse l'image à null
    } finally {
      loadingImages.value.delete(game.id)
    }
  })

  await Promise.all(imagePromises)
}

const selectBGGGame = async (game: BGGGame) => {
  submitting.value = true
  bggSearchError.value = null

  try {
    // Récupérer les détails complets du jeu BGG
    let gameDetails = game
    if (!game.minPlayers && !game.description) {
      try {
        const detailsResponse = await $fetch<{ data: BGGGame }>(
          `${apiUrl}/api/games/bgg-details/${game.bggId}`,
          {
            headers: getAuthHeaders()
          }
        )

        if (detailsResponse?.data) {
          gameDetails = { ...game, ...detailsResponse.data }
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails:', err)
        // Continuer avec les données de base si l'appel échoue
      }
    }

    // Préparer les données du jeu avec des valeurs par défaut pour les champs obligatoires
    const gameData = {
      bggId: gameDetails.bggId || String(gameDetails.id),
      name: gameDetails.name,
      description: gameDetails.description || '',
      age_min: gameDetails.minAge ?? 0, // Valeur par défaut si non disponible
      age_max: null,
      playing_time: gameDetails.minPlayTime
        ? String(gameDetails.minPlayTime)
        : gameDetails.maxPlayTime
          ? String(gameDetails.maxPlayTime)
          : '30', // Valeur par défaut : 30 minutes
      player_min: gameDetails.minPlayers ?? 2, // Valeur par défaut : 2 joueurs
      player_max: gameDetails.maxPlayers ?? null,
      image_url: gameDetails.image_url || gameDetails.image || null,
      year: gameDetails.year || null,
      type: gameDetails.type || null,
      rating_global: gameDetails.rating_global || null,
      categories: gameDetails.categories || null
    }

    // Appel spécial pour ajouter le jeu et l'associer à la famille en une seule opération
    await $fetch<{ data: StrapiGame, message: string }>(
      `${apiUrl}/api/games/add-from-bgg`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: gameData
      }
    )

    // Rafraîchir la famille pour récupérer les jeux mis à jour
    await familyStore.fetchFamily()

    // Réinitialiser et fermer le modal
    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de l\'ajout du jeu:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'ajout du jeu'
    bggSearchError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

// Filtrer les options de player_max pour qu'elles soient >= player_min
const filteredPlayerMaxOptions = computed(() => {
  if (state.player_min === null) {
    return playerMaxOptions
  }
  return playerMaxOptions.filter(option =>
    option.value === null || option.value >= state.player_min
  )
})

// Filtrer les options de age_max pour qu'elles soient >= age_min
const filteredAgeMaxOptions = computed(() => {
  const ageMaxOptions = [
    { label: 'Aucun maximum', value: null },
    ...ageOptions
  ]
  if (state.age_min === null) {
    return ageMaxOptions
  }
  const ageMin = state.age_min
  return ageMaxOptions.filter(option =>
    option.value === null || option.value >= ageMin
  )
})

const validateForm = (): boolean => {
  let isValid = true
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!state.name.trim()) {
    errors.name = 'Le titre est requis'
    isValid = false
  }

  if (!state.age_min || state.age_min < 0) {
    errors.age_min = 'L\'âge minimum doit être un nombre positif'
    isValid = false
  }

  if (state.age_max !== null && state.age_min !== null && state.age_max < state.age_min) {
    errors.age_max = 'L\'âge maximum doit être supérieur ou égal au minimum'
    isValid = false
  }

  if (state.playing_time === null || state.playing_time === undefined || state.playing_time < 1) {
    errors.playing_time = 'La durée de jeu doit être un nombre positif (en minutes)'
    isValid = false
  }

  if (!state.player_min || state.player_min < 1) {
    errors.player_min = 'Le nombre minimum de joueurs doit être au moins 1'
    isValid = false
  }

  if (state.player_max !== null && state.player_max < state.player_min) {
    errors.player_max = 'Le nombre maximum doit être supérieur ou égal au minimum'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  // La validation garantit que age_min n'est pas null, mais TypeScript ne le sait pas
  if (state.age_min === null) {
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    // La validation garantit que playing_time n'est pas null, mais TypeScript ne le sait pas
    if (state.playing_time === null) {
      return
    }

    const gameData = {
      name: state.name.trim(),
      description: props.game?.description || selectedBGGData.value?.description || '',
      age_min: state.age_min,
      age_max: state.age_max,
      playing_time: String(state.playing_time),
      player_min: state.player_min,
      player_max: state.player_max,
      image: imageFile.value,
      image_url: selectedBGGData.value?.image_url || null,
      bggId: selectedBGGData.value?.bggId || null
    }

    if (editingGame.value && props.game) {
      await updateGame({
        ...gameData,
        id: props.game.id,
        documentId: props.game.documentId
      })
    } else {
      const newGameId = await createGame(gameData)
      // Ajouter le nouveau jeu à la famille
      await familyStore.addGameToFamily(newGameId)
    }

    // Rafraîchir la famille pour récupérer les jeux mis à jour
    await familyStore.fetchFamily()

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error(`Erreur lors de ${editingGame.value ? 'la mise à jour' : 'la création'} du jeu:`, err)
    const errorMessage = err instanceof Error ? err.message : `Une erreur est survenue lors de ${editingGame.value ? 'la mise à jour' : 'la création'} du jeu`
    submitError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!props.game || !confirm(`Êtes-vous sûr de vouloir supprimer "${props.game.titre}" ?`)) {
    return
  }

  deleting.value = true
  submitError.value = null

  try {
    // Retirer le jeu de la famille d'abord
    await familyStore.removeGameFromFamily(props.game.id)

    // Puis supprimer le jeu
    await deleteGame(props.game.id, props.game.documentId)

    // Rafraîchir la famille
    await familyStore.fetchFamily()

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la suppression du jeu:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression du jeu'
    submitError.value = errorMessage
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    resetForm()
    isOpen.value = false
  }
}
</script>
