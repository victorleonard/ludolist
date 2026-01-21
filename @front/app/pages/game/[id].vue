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
        class="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <!-- Image -->
        <div class="order-1 lg:order-1">
          <div class="w-full aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
            <img
              v-if="jeu.image"
              :src="jeu.image"
              :alt="jeu.titre"
              class="w-full h-full object-contain"
            >
            <div
              v-else
              class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500"
            >
              <UIcon
                name="i-lucide-dice-6"
                class="w-32 h-32 mb-4"
              />
              <span class="text-lg">Aucune image disponible</span>
            </div>
          </div>
        </div>

        <!-- Informations -->
        <div class="order-2 lg:order-2">
          <div class="flex items-start justify-between gap-4 mb-4">
            <h1 class="text-3xl lg:text-4xl font-bold">
              {{ jeu.titre }}
            </h1>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-edit"
              size="sm"
              @click="openEditModal"
            >
              Modifier
            </UButton>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              {{ jeu.description }}
            </p>
          </div>

          <!-- Caractéristiques -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Âge -->
              <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="shrink-0 p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <UIcon
                    name="i-lucide-cake"
                    class="w-5 h-5 text-primary-600 dark:text-primary-400"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Âge recommandé
                  </p>
                  <p class="font-semibold text-lg">
                    {{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans
                  </p>
                </div>
              </div>

              <!-- Joueurs -->
              <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="shrink-0 p-2 bg-info-100 dark:bg-info-900 rounded-lg">
                  <UIcon
                    name="i-lucide-users"
                    class="w-5 h-5 text-info-600 dark:text-info-400"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Nombre de joueurs
                  </p>
                  <p class="font-semibold text-lg">
                    {{ jeu.player_min }}{{ jeu.player_max !== jeu.player_min ? `-${jeu.player_max}` : '' }} joueurs
                  </p>
                </div>
              </div>

              <!-- Durée -->
              <div class="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div class="shrink-0 p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                  <UIcon
                    name="i-lucide-clock"
                    class="w-5 h-5 text-success-600 dark:text-success-400"
                  />
                </div>
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Durée de partie
                  </p>
                  <p class="font-semibold text-lg">
                    {{ formatDuree(jeu.duree) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes des membres de la famille -->
          <div
            v-if="familyMembers.length > 0"
            class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
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

          <!-- Parties jouées -->
          <GameSessions
            v-if="gameId"
            :game-id="gameId"
          />
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
import { ref, computed, onMounted } from 'vue'
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

// Charger la famille au montage
onMounted(async () => {
  try {
    loading.value = true
    await familyStore.fetchFamily()
    
    if (!jeu.value) {
      error.value = 'Jeu non trouvé'
    }
  } catch (err) {
    console.error('Erreur lors du chargement du jeu:', err)
    error.value = 'Erreur lors du chargement du jeu'
  } finally {
    loading.value = false
  }
})

// Formater la durée
const formatDuree = (duree: number) => {
  if (duree < 60) {
    return `${duree} min`
  } else {
    const heures = Math.floor(duree / 60)
    const minutes = duree % 60
    if (minutes === 0) {
      return `${heures}h`
    }
    return `${heures}h${minutes}`
  }
}

// Ouvrir le modal de modification
const openEditModal = () => {
  isModalOpen.value = true
}

// Gérer la mise à jour du jeu
const handleGameUpdated = async () => {
  await familyStore.fetchFamily()
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
