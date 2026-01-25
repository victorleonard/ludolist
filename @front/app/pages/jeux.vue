<template>
  <UContainer>
    <div>
      <div class="mt-6">
        <div class="mb-8">
          <div class="mb-6">
            <h1 class="text-2xl font-bold">
              Ma collection de jeux
            </h1>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <USelect
              v-model="filtreDuree"
              :items="dureesAvecTous"
              option-attribute="label"
              value-attribute="value"
              placeholder="Toutes les durées"
              size="sm"
              class="min-w-[160px]"
            />
            <USelect
              v-model="filtreAge"
              :items="agesAvecTous"
              option-attribute="label"
              value-attribute="value"
              placeholder="Tous les âges"
              size="sm"
              class="min-w-[160px]"
            />
          </div>
        </div>

        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary-500"
          />
        </div>

        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center py-12"
        >
          <p class="text-red-500 mb-4">
            {{ error }}
          </p>
          <UButton
            color="primary"
            @click="refresh()"
          >
            Réessayer
          </UButton>
        </div>

        <div
          v-else-if="jeuxFiltres.length === 0"
          class="flex justify-center items-center py-12"
        >
          <p class="text-gray-500 dark:text-gray-400">
            Aucun jeu trouvé
          </p>
        </div>

        <template v-else>
          <!-- Vue desktop : grille avec UCard -->
          <div class="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <UCard
              v-for="jeu in jeuxFiltres"
              :key="jeu.id"
              class="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
              @click="navigateTo(`/game/${jeu.id}`)"
            >
              <template #header>
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-xl font-bold break-words min-w-0 flex-1">
                    {{ jeu.titre }}
                  </h2>
                  <div class="flex items-center gap-2 shrink-0">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-edit"
                      size="sm"
                      @click.stop="openEditModal(jeu)"
                    />
                  </div>
                </div>
              </template>

              <div class="flex flex-col gap-4">
                <div class="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="jeu && jeu.image"
                    :src="jeu.image"
                    :alt="jeu.titre || 'Image du jeu'"
                    class="w-full h-full object-contain"
                  >
                  <div
                    v-else
                    class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-16 h-16 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span class="text-xs text-center">Aucune image</span>
                  </div>
                </div>
                <div
                  v-if="getAverageRating(jeu) > 0"
                  class="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                >
                  <StarRating
                    :model-value="getAverageRating(jeu)"
                    size="sm"
                    readonly
                  />
                </div>
                <div
                  v-if="topWinners[jeu.id] && topWinners[jeu.id]?.member"
                  class="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <UIcon
                    name="i-lucide-crown"
                    class="w-4 h-4 text-yellow-500"
                  />
                  <span class="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                    {{ topWinners[jeu.id]?.member?.username }} ({{ topWinners[jeu.id]?.wins }} {{ (topWinners[jeu.id]?.wins || 0) > 1 ? 'victoires' : 'victoire' }})
                  </span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    class="whitespace-nowrap"
                  >
                    {{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans
                  </UBadge>
                  <UBadge
                    v-for="tag in jeu.tags"
                    :key="tag"
                    :color="tag.includes('joueurs') ? 'info' : 'primary'"
                    variant="subtle"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Vue mobile : liste avec UPageList -->
          <UPageList class="md:hidden space-y-4">
            <UPageCard
              v-for="jeu in jeuxFiltres"
              :key="jeu.id"
              variant="ghost"
              class="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
              @click="navigateTo(`/game/${jeu.id}`)"
            >
              <template #body>
                <div class="flex items-start gap-4 w-full">
                  <div class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="jeu && jeu.image"
                      :src="jeu.image"
                      :alt="jeu.titre || 'Image du jeu'"
                      class="w-full h-full object-contain"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2"
                    >
                      <UIcon
                        name="i-lucide-dice-6"
                        class="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold break-words">
                          {{ jeu.titre }}
                        </h3>
                      </div>
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-edit"
                        size="xs"
                        :padded="false"
                        class="shrink-0"
                        @click.stop="openEditModal(jeu)"
                      />
                    </div>
                    <div
                      v-if="getAverageRating(jeu) > 0"
                      class="flex items-center gap-2 mb-2"
                    >
                      <StarRating
                        :model-value="getAverageRating(jeu)"
                        size="sm"
                        readonly
                      />
                    </div>
                    <div
                      v-if="topWinners[jeu.id] && topWinners[jeu.id]?.member"
                      class="flex items-center gap-1 mb-2"
                    >
                      <UIcon
                        name="i-lucide-crown"
                        class="w-3 h-3 text-yellow-500"
                      />
                      <span class="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        {{ topWinners[jeu.id]?.member?.username }} ({{ topWinners[jeu.id]?.wins }})
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <UBadge
                        color="neutral"
                        variant="subtle"
                        class="whitespace-nowrap"
                      >
                        {{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans
                      </UBadge>
                      <UBadge
                        v-for="tag in jeu.tags"
                        :key="tag"
                        :color="tag.includes('joueurs') ? 'info' : 'primary'"
                        variant="subtle"
                      >
                        {{ tag }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageList>
        </template>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRecherche } from '../composables/useRecherche'
import { useFamilyStore, type TransformedGame as Game, type Rating } from '~/stores/family'
import StarRating from '~/components/StarRating.vue'
import { useAddGameModal } from '~/composables/useAddGameModal'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Charger la famille au montage de la page
const familyStore = useFamilyStore()
const { isLoading: loading } = storeToRefs(familyStore)

onMounted(async () => {
  // Recharger la famille depuis l'API pour avoir les données à jour
  await familyStore.fetchFamily()
})

const { recherche } = useRecherche()

// Utiliser directement le getter du store
const games = computed(() => familyStore.transformedGames)
const error = computed(() => null)
const refresh = () => familyStore.fetchFamily()

const { openModal } = useAddGameModal()
const topWinners = ref<Record<number, { member: { id: number, username: string }, wins: number }>>({})

const openEditModal = (jeu: Game) => {
  openModal(jeu)
}

const durees = [
  { label: '< 15 min', value: 'tres-court' },
  { label: '15-30 min', value: 'court' },
  { label: '30-45 min', value: 'moyen-court' },
  { label: '45-60 min', value: 'moyen' },
  { label: '60-90 min', value: 'long' },
  { label: '90-120 min', value: 'tres-long' },
  { label: '> 120 min', value: 'extra-long' }
]

// Mapping des identifiants vers les plages de durée (en minutes)
const dureeRanges: Record<string, { min: number, max: number }> = {
  'tres-court': { min: 0, max: 14 },
  'court': { min: 15, max: 30 },
  'moyen-court': { min: 30, max: 45 },
  'moyen': { min: 45, max: 60 },
  'long': { min: 60, max: 90 },
  'tres-long': { min: 90, max: 120 },
  'extra-long': { min: 121, max: Infinity }
}

const ages = [
  { label: '3+ ans', value: 3 },
  { label: '5+ ans', value: 5 },
  { label: '6+ ans', value: 6 },
  { label: '8+ ans', value: 8 },
  { label: '10+ ans', value: 10 },
  { label: '12+ ans', value: 12 },
  { label: '13+ ans', value: 13 },
  { label: '16+ ans', value: 16 },
  { label: '18+ ans', value: 18 }
]

// Ajouter l'option "Tous" pour permettre de réinitialiser les filtres
const dureesAvecTous = [
  { label: 'Toutes les durées', value: null },
  ...durees
]

const agesAvecTous = [
  { label: 'Tous les âges', value: null },
  ...ages
]

const filtreDuree = ref<string | null>(null)
const filtreAge = ref<number | null>(null)

const jeuxFiltres = computed(() => {
  // S'assurer que games.value est un tableau
  if (!games.value || !Array.isArray(games.value)) {
    return []
  }

  let result = games.value

  if (recherche.value.trim()) {
    const termeRecherche = recherche.value.toLowerCase().trim()
    result = result.filter((jeu) => {
      const titreMatch = jeu.titre.toLowerCase().includes(termeRecherche)
      const descriptionMatch = jeu.description.toLowerCase().includes(termeRecherche)
      return titreMatch || descriptionMatch
    })
  }

  if (filtreDuree.value) {
    const range = dureeRanges[filtreDuree.value]
    if (range) {
      result = result.filter((jeu) => {
        const duree = jeu.duree
        return duree >= range.min && duree <= range.max
      })
    }
  }

  if (filtreAge.value) {
    result = result.filter(jeu => jeu.age_min <= filtreAge.value!)
  }

  return result
})

const getAverageRating = (jeu: Game): number => {
  if (!jeu.ratings || jeu.ratings.length === 0) return 0

  const ratings = jeu.ratings.filter((r: Rating) => r.rating > 0)
  if (ratings.length === 0) return 0

  const sum = ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0)
  return sum / ratings.length
}

const loadTopWinners = async () => {
  if (!games.value || games.value.length === 0) return

  const promises = games.value.map(async (jeu) => {
    const result = await familyStore.getTopWinner(jeu.id)
    if (result.success && result.data) {
      topWinners.value[jeu.id] = result.data
    }
  })

  await Promise.all(promises)
}

watch(games, () => {
  loadTopWinners()
}, { immediate: true })

onMounted(() => {
  loadTopWinners()
})
</script>
