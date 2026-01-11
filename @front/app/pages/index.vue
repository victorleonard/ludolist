<template>
  <UContainer>
    <div>
      <div class="mt-12">
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold">
              Ma collection de jeux
            </h1>
            <UButton
              color="primary"
              icon="i-lucide-plus"
              @click="openModal"
            >
              Ajouter un jeu
            </UButton>
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

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <UCard
            v-for="jeu in jeuxFiltres"
            :key="jeu.id"
          >
            <template #header>
              <div class="flex items-center justify-between flex-nowrap gap-2">
                <h2 class="text-xl font-bold truncate min-w-0">
                  {{ jeu.titre }}
                </h2>
                <div class="flex items-center gap-2 shrink-0">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-edit"
                    size="sm"
                    @click="openEditModal(jeu)"
                  />
                  <UBadge
                    color="primary"
                    variant="solid"
                    class="whitespace-nowrap"
                  >
                    {{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans
                  </UBadge>
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
              <div class="flex flex-wrap gap-2">
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
      </div>
    </div>

    <AddGameModal
      v-model="isModalOpen"
      :game="selectedGame"
      @success="handleGameAdded"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecherche } from '../composables/useRecherche'
import { useGames, type Game } from '../composables/useGames'

const { recherche } = useRecherche()
const { games, loading, error, refresh } = useGames()

const isModalOpen = ref(false)
const selectedGame = ref<Game | null>(null)

const openModal = () => {
  selectedGame.value = null
  isModalOpen.value = true
}

const openEditModal = (jeu: Game) => {
  selectedGame.value = jeu
  isModalOpen.value = true
}

const handleGameAdded = () => {
  // Le refresh est déjà géré dans createGame/updateGame, mais on peut ajouter une notification ici si besoin
  selectedGame.value = null
  refresh()
}

const durees = [
  { label: '< 30 min', value: 'court' },
  { label: '30-60 min', value: 'moyen' },
  { label: '> 60 min', value: 'long' }
]

const ages = [
  { label: '8+ ans', value: 8 },
  { label: '10+ ans', value: 10 },
  { label: '13+ ans', value: 13 }
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
    result = result.filter((jeu) => {
      if (filtreDuree.value === 'court') {
        return jeu.duree < 30
      }
      if (filtreDuree.value === 'moyen') {
        return jeu.duree >= 30 && jeu.duree <= 60
      }
      if (filtreDuree.value === 'long') {
        return jeu.duree > 60
      }
      return true
    })
  }

  if (filtreAge.value) {
    result = result.filter(jeu => jeu.age_min <= filtreAge.value!)
  }

  return result
})
</script>
