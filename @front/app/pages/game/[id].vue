<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="py-4 sm:py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-ion-refresh"
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
          @click="navigateTo('/jeux')"
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
          name="i-ion-alert-circle"
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
          @click="navigateTo('/jeux')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Détails du jeu -->
      <div
        v-else
        class="space-y-4 sm:space-y-6"
      >
        <!-- Titre -->
        <h1 class="text-xl sm:text-2xl font-bold break-words min-w-0 mb-3 sm:mb-4">
          {{ jeu.titre }}
        </h1>

        <!-- Navigation par segments -->
        <div class="mb-2 sm:mb-4">
          <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 sm:p-1.5 w-full gap-1">
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'detail'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'detail'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-information-circle"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Détail</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'notes'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'notes'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-star"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Notes</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'parties'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'parties'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-game-controller"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Parties</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'podium'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'podium'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-trophy"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Podium</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Contenu des sections -->
        <div class="w-full">
          <!-- Section Détail -->
          <div
            v-show="activeTab === 'detail'"
            class="space-y-4 sm:space-y-6 py-2 sm:py-6"
          >
            <!-- Card avec image et infos synthétiques -->
            <UCard class="bg-white dark:bg-gray-800 overflow-hidden">
              <div class="flex flex-col">
                <!-- Image du jeu -->
                <div class="w-full">
                  <img
                    v-if="jeu && jeu.image"
                    :src="jeu.image"
                    :alt="jeu.titre || 'Image du jeu'"
                    class="w-full h-full object-contain p-2 sm:p-4"
                  >
                  <div
                    v-else
                    class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8"
                  >
                    <UIcon
                      name="i-ion-game-controller"
                      class="w-20 h-20 sm:w-24 sm:h-24 mb-3 opacity-50"
                    />
                    <span class="text-sm text-center font-medium">Aucune image</span>
                  </div>
                </div>

                <!-- Informations du jeu -->
                <div class="space-y-3 mt-3">
                  <div class="flex flex-wrap gap-2 sm:gap-3">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                      size="md"
                      class="px-3 py-1.5 text-gray-800 dark:text-gray-200"
                    >
                      <div class="flex items-center gap-1.5">
                        <UIcon
                          name="i-ion-person"
                          class="w-4 h-4"
                        />
                        <span>{{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans</span>
                      </div>
                    </UBadge>
                    <UBadge
                      v-for="tag in jeu.tags"
                      :key="tag"
                      :color="tag.includes('joueurs') ? 'info' : tag.includes('min') ? 'warning' : 'primary'"
                      variant="subtle"
                      size="md"
                      class="px-3 py-1.5"
                      :class="tag.includes('joueurs') ? 'text-blue-800 dark:text-blue-200' : tag.includes('min') ? 'text-orange-800 dark:text-orange-200' : 'text-primary-800 dark:text-primary-200'"
                    >
                      <div class="flex items-center gap-1.5">
                        <UIcon
                          v-if="tag.includes('joueurs')"
                          name="i-ion-people"
                          class="w-4 h-4"
                        />
                        <UIcon
                          v-else-if="tag.includes('min')"
                          name="i-ion-time"
                          class="w-4 h-4"
                        />
                        <UIcon
                          v-else
                          name="i-ion-information-circle"
                          class="w-4 h-4"
                        />
                        <span>{{ tag }}</span>
                      </div>
                    </UBadge>
                  </div>
                </div>

                <!-- Bouton Modifier en bas -->
                <div class="pt-4">
                  <UButton
                    color="primary"
                    variant="outline"
                    icon="i-ion-create-outline"
                    size="md"
                    class="w-full min-h-[44px] sm:min-h-0"
                    @click="openEditModal"
                  >
                    Modifier les détails
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Section Notes -->
          <div
            v-show="activeTab === 'notes'"
            class="py-2 sm:py-6"
          >
            <MemberRatingsTab
              :members="familyMembers"
              :get-member-rating="getMemberRating"
              :set-member-rating="setMemberRating"
              :average-rating="averageRating"
              :max-stars="10"
            />
          </div>

          <!-- Section Parties -->
          <div
            v-show="activeTab === 'parties'"
            class="space-y-3 sm:space-y-4 py-2 sm:py-6"
          >
            <!-- Liste des parties -->
            <GameSessions
              v-if="gameId"
              :game-id="gameId"
            />
          </div>

          <!-- Section Podium -->
          <div
            v-show="activeTab === 'podium'"
            class="space-y-4 sm:space-y-6 py-2 sm:py-6"
          >
            <!-- Podium des top 3 -->
            <UCard
              v-if="top3Winners.length > 0"
              class="bg-white dark:bg-gray-800 mb-6 overflow-hidden"
            >
              <div class="flex items-end justify-center gap-3 px-4 pt-6 pb-4">
                <!-- 2ème place -->
                <div
                  v-if="top3Winners[1]"
                  class="flex flex-col items-center flex-1 max-w-[120px]"
                >
                  <div class="mb-2">
                    <span class="text-2xl">🥈</span>
                  </div>
                  <div class="mb-3">
                    <MemberAvatar
                      :member="top3Winners[1].member"
                      size="xl"
                    />
                  </div>
                  <div
                    class="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg p-3 text-center"
                    style="height: 90px;"
                  >
                    <div class="flex flex-col items-center justify-center h-full">
                      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">2ème</span>
                      <span class="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate w-full">
                        {{ top3Winners[1].member.username }}
                      </span>
                      <span class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {{ top3Winners[1].wins }} {{ top3Winners[1].wins > 1 ? 'victoires' : 'victoire' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 1ère place -->
                <div
                  v-if="top3Winners[0]"
                  class="flex flex-col items-center flex-1 max-w-[140px]"
                >
                  <div class="mb-2">
                    <UIcon
                      name="i-ion-trophy"
                      class="w-6 h-6 text-yellow-500"
                    />
                  </div>
                  <div class="mb-3">
                    <MemberAvatar
                      :member="top3Winners[0].member"
                      size="2xl"
                    />
                  </div>
                  <div
                    class="w-full bg-yellow-100 dark:bg-yellow-900/30 rounded-t-lg p-4 text-center border-2 border-yellow-300 dark:border-yellow-700"
                    style="height: 120px;"
                  >
                    <div class="flex flex-col items-center justify-center h-full">
                      <span class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">1er</span>
                      <span class="text-base font-semibold text-yellow-900 dark:text-yellow-100 truncate w-full">
                        {{ top3Winners[0].member.username }}
                      </span>
                      <span class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        {{ top3Winners[0].wins }} {{ top3Winners[0].wins > 1 ? 'victoires' : 'victoire' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 3ème place -->
                <div
                  v-if="top3Winners[2]"
                  class="flex flex-col items-center flex-1 max-w-[120px]"
                >
                  <div class="mb-2">
                    <span class="text-2xl">🥉</span>
                  </div>
                  <div class="mb-3">
                    <MemberAvatar
                      :member="top3Winners[2].member"
                      size="xl"
                    />
                  </div>
                  <div
                    class="w-full bg-gray-200 dark:bg-gray-700 rounded-t-lg p-3 text-center"
                    style="height: 80px;"
                  >
                    <div class="flex flex-col items-center justify-center h-full">
                      <span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">3ème</span>
                      <span class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate w-full leading-tight">
                        {{ top3Winners[2].member.username }}
                      </span>
                      <span class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {{ top3Winners[2].wins }} {{ top3Winners[2].wins > 1 ? 'victoires' : 'victoire' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Message si aucun gagnant -->
            <div
              v-else
              class="text-center py-12 text-gray-500 dark:text-gray-400"
            >
              <UIcon
                name="i-ion-trophy"
                class="w-16 h-16 mx-auto mb-4 opacity-50"
              />
              <p>
                Aucun gagnant pour le moment
              </p>
              <p class="text-sm mt-2">
                Jouez des parties pour voir le podium !
              </p>
            </div>
          </div>
        </div>
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
const top3Winners = ref<Array<{ member: { id: number, username: string }, wins: number }>>([])
const activeTab = ref<'detail' | 'notes' | 'parties' | 'podium'>('detail')

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

// Charger les top 3 gagnants
const loadTop3Winners = async () => {
  if (!gameId.value) return

  const result = await familyStore.getTop3Winners(gameId.value)
  if (result.success && result.data) {
    top3Winners.value = result.data
  } else {
    top3Winners.value = []
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
      await loadTop3Winners()
    }
  } catch (err) {
    console.error('Erreur lors du chargement du jeu:', err)
    error.value = 'Erreur lors du chargement du jeu'
  } finally {
    loading.value = false
  }
})

// Recharger les top 3 gagnants quand le jeu change
watch(gameId, () => {
  if (gameId.value) {
    loadTop3Winners()
  }
})

// Ouvrir le modal de modification
const openEditModal = () => {
  isModalOpen.value = true
}

// Gérer la mise à jour du jeu
const handleGameUpdated = async () => {
  await familyStore.fetchFamily()
  await loadTop3Winners()
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
