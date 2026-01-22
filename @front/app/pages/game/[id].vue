<template>
  <UContainer>
    <div class="py-6">
      <!-- Bouton retour -->
      <div class="mb-6">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          size="sm"
          @click="navigateTo('/')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12"
      >
        <p class="text-red-500 mb-4">
          {{ error }}
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Jeu non trouvé -->
      <div
        v-else-if="!jeu"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Jeu non trouvé
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Le jeu que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Détails du jeu -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Card avec image et infos synthétiques -->
        <UCard>
          <template #header>
            <div class="flex items-start justify-between gap-2">
              <h1 class="text-xl font-bold wrap-break-word min-w-0 flex-1">
                {{ jeu.titre }}
              </h1>
              <div class="flex items-center gap-2 shrink-0">
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-edit"
                  size="sm"
                  @click="openEditModal"
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
              v-if="averageRating > 0"
              class="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
            >
              <StarRating
                :model-value="averageRating"
                size="sm"
                readonly
              />
            </div>
            <div
              v-if="topWinner && topWinner.member"
              class="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
            >
              <UIcon
                name="i-lucide-crown"
                class="w-4 h-4 text-yellow-500"
              />
              <span class="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                {{ topWinner.member.username }} ({{ topWinner.wins }} {{ (topWinner.wins || 0) > 1 ? 'victoires' : 'victoire' }})
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

        <!-- Onglets -->
        <UTabs
          :items="tabs"
          class="w-full"
        >
          <template #notes>
            <div class="space-y-6 py-6">
              <div
                v-if="familyMembers.length > 0"
              >
                <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                  <UIcon
                    name="i-lucide-star"
                    class="w-5 h-5"
                  />
                  Notes de la famille
                </h2>
                <div class="space-y-4">
                  <div
                    v-for="member in familyMembers"
                    :key="member.id"
                    class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {{ member.username?.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <span class="font-medium">{{ member.username }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <StarRating
                        :model-value="getMemberRating(member.id)"
                        @update:model-value="(rating) => setMemberRating(member.id, rating)"
                      />
                      <UButton
                        v-if="getMemberRating(member.id) > 0"
                        color="red"
                        variant="ghost"
                        icon="i-lucide-trash-2"
                        size="xs"
                        @click="setMemberRating(member.id, 0)"
                      />
                    </div>
                  </div>
                </div>

                <!-- Note moyenne -->
                <div
                  v-if="averageRating > 0"
                  class="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-primary-900 dark:text-primary-100">
                      Note moyenne
                    </span>
                    <div class="flex items-center gap-2">
                      <StarRating
                        :model-value="averageRating"
                        readonly
                      />
                      <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {{ averageRating.toFixed(1) }} / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="text-center py-12 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-users"
                  class="w-16 h-16 mx-auto mb-4 opacity-50"
                />
                <p>Aucun membre dans la famille</p>
              </div>
            </div>
          </template>

          <template #parties>
            <div class="py-6">
              <GameSessions
                v-if="gameId"
                :game-id="gameId"
              />
            </div>
          </template>
        </UTabs>
      </div>
    </div>

    <!-- Modal de modification -->
    <AddGameModal
      v-model="isModalOpen"
      :game="jeu"
      @success="handleGameUpdated"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFamilyStore, type Rating } from '~/stores/family'
import StarRating from '~/components/StarRating.vue'
import GameSessions from '~/components/GameSessions.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const familyStore = useFamilyStore()

const isModalOpen = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const topWinner = ref<{ member: { id: number, username: string }, wins: number } | null>(null)

// Définir les onglets avec des slots personnalisés
const tabs = [
  {
    label: 'Notes',
    icon: 'i-lucide-star',
    slot: 'notes'
  },
  {
    label: 'Parties',
    icon: 'i-lucide-gamepad-2',
    slot: 'parties'
  }
]

// Récupérer l'ID depuis la route
const gameId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : null
})

// Trouver le jeu dans le store
const jeu = computed(() => {
  if (!gameId.value) return null
  return familyStore.transformedGames.find(g => g.id === gameId.value)
})

// Récupérer les membres de la famille
const familyMembers = computed(() => familyStore.familyMembers)

// Charger le top winner
const loadTopWinner = async () => {
  if (!gameId.value) return

  const result = await familyStore.getTopWinner(gameId.value)
  if (result.success && result.data) {
    topWinner.value = result.data
  } else {
    topWinner.value = null
  }
}

// Charger la famille au montage
onMounted(async () => {
  try {
    loading.value = true
    await familyStore.fetchFamily()

    if (!jeu.value) {
      error.value = 'Jeu non trouvé'
    } else {
      await loadTopWinner()
    }
  } catch (err) {
    console.error('Erreur lors du chargement du jeu:', err)
    error.value = 'Erreur lors du chargement du jeu'
  } finally {
    loading.value = false
  }
})

// Recharger le top winner quand le jeu change
watch(gameId, () => {
  if (gameId.value) {
    loadTopWinner()
  }
})

// Ouvrir le modal de modification
const openEditModal = () => {
  isModalOpen.value = true
}

// Gérer la mise à jour du jeu
const handleGameUpdated = async () => {
  await familyStore.fetchFamily()
  await loadTopWinner()
  isModalOpen.value = false
}

// Récupérer la note d'un membre
const getMemberRating = (memberId: number): number => {
  if (!jeu.value?.ratings) return 0
  const memberRating = jeu.value.ratings.find((r: Rating) => r.member.id === memberId)
  return memberRating ? memberRating.rating : 0
}

// Définir la note d'un membre
const setMemberRating = async (memberId: number, rating: number) => {
  if (!gameId.value) return

  try {
    const result = await familyStore.setRating(gameId.value, memberId, rating)

    if (!result.success) {
      console.error('Erreur lors de l\'enregistrement de la note:', result.error)
      error.value = result.error || 'Erreur lors de l\'enregistrement de la note'
    }
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la note:', err)
    error.value = 'Erreur lors de l\'enregistrement de la note'
  }
}

// Calculer la note moyenne
const averageRating = computed(() => {
  if (!jeu.value?.ratings || jeu.value.ratings.length === 0) return 0

  const ratings = jeu.value.ratings.filter((r: Rating) => r.rating > 0)
  if (ratings.length === 0) return 0

  const sum = ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0)
  return sum / ratings.length
})
</script>
