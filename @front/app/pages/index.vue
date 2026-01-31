<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div>
      <div class="mt-4 sm:mt-6">
        <!-- Derniers jeux joués -->
        <div
          v-if="latestSessions && latestSessions.length > 0"
          class="mb-6 sm:mb-8"
        >
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Dernières parties
          </h2>
          <div class="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <UCard
              v-for="session in latestSessions"
              :key="session.id"
              class="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
              @click="navigateTo(`/game/${session.game.id}`)"
            >
              <template #header>
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-xl font-bold wrap-break-word min-w-0 flex-1">
                    {{ session.game.name }}
                  </h2>
                </div>
              </template>

              <div class="flex flex-col gap-4">
                <div class="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="getSessionGameImage(session)"
                    :src="getSessionGameImage(session) ?? ''"
                    :alt="session.game.name"
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
                <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-4 h-4 text-gray-500"
                  />
                  <span class="text-xs text-gray-600 dark:text-gray-400">
                    {{ formatDate(session.played_at) }}
                  </span>
                </div>
                <div
                  v-if="getSessionWinner(session)"
                  class="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <UIcon
                    name="i-lucide-crown"
                    class="w-4 h-4 text-yellow-500"
                  />
                  <span class="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                    {{ getSessionWinner(session)?.member.username }}
                    <span
                      v-if="getSessionWinner(session)?.score !== undefined"
                      class="text-gray-600 dark:text-gray-400 font-normal"
                    >
                      ({{ getSessionWinner(session)?.score }} pts)
                    </span>
                  </span>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Vue mobile : liste avec UPageList -->
          <UPageList class="md:hidden space-y-4">
            <UPageCard
              v-for="session in latestSessions"
              :key="session.id"
              variant="ghost"
              class="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
              @click="navigateTo(`/game/${session.game.id}`)"
            >
              <template #body>
                <div class="flex items-start gap-4 w-full">
                  <div class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="getSessionGameImage(session)"
                      :src="getSessionGameImage(session) ?? ''"
                      :alt="session.game.name"
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
                        <h3 class="text-lg font-semibold wrap-break-word">
                          {{ session.game.name }}
                        </h3>
                      </div>
                    </div>
                    <div class="flex items-center gap-1 mb-2">
                      <UIcon
                        name="i-lucide-calendar"
                        class="w-3 h-3 text-gray-500"
                      />
                      <span class="text-xs text-gray-600 dark:text-gray-400">
                        {{ formatDate(session.played_at) }}
                      </span>
                    </div>
                    <div
                      v-if="getSessionWinner(session)"
                      class="flex items-center gap-1 mb-2"
                    >
                      <UIcon
                        name="i-lucide-crown"
                        class="w-3 h-3 text-yellow-500"
                      />
                      <span class="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        {{ getSessionWinner(session)?.member.username }}
                        <span
                          v-if="getSessionWinner(session)?.score !== undefined"
                          class="text-gray-600 dark:text-gray-400 font-normal"
                        >
                          ({{ getSessionWinner(session)?.score }} pts)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageList>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12"
        >
          <UIcon
            name="i-lucide-dice-6"
            class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-center">
            Aucun jeu joué récemment
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFamilyStore, type GameSession } from '~/stores/family'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Charger la famille au montage de la page
const familyStore = useFamilyStore()

const latestSessions = ref<GameSession[]>([])

const loadLatestSessions = async () => {
  const result = await familyStore.getLatest10Sessions()
  if (result.success && result.data) {
    latestSessions.value = result.data
  }
}

onMounted(async () => {
  // Recharger la famille depuis l'API pour avoir les données à jour
  await familyStore.fetchFamily()
  await loadLatestSessions()
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getSessionGameImage = (session: GameSession): string | undefined => {
  if (!session?.game?.image) return undefined

  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'
  const imageData = session.game.image

  if (imageData && typeof imageData === 'object') {
    if (imageData.formats?.medium?.url) {
      return `${apiUrl}${imageData.formats.medium.url}`
    } else if (imageData.formats?.small?.url) {
      return `${apiUrl}${imageData.formats.small.url}`
    } else if (imageData.formats?.thumbnail?.url) {
      return `${apiUrl}${imageData.formats.thumbnail.url}`
    } else if (imageData.url) {
      return `${apiUrl}${imageData.url}`
    }
  }

  return undefined
}

const getSessionWinner = (session: GameSession) => {
  if (!session?.player_scores || session.player_scores.length === 0) {
    return null
  }

  const winner = session.player_scores.find(ps => ps.is_winner)
  if (winner) {
    return {
      member: winner.member,
      score: winner.score
    }
  }

  // Si aucun vainqueur marqué, prendre le meilleur score
  const sortedScores = [...session.player_scores].sort((a, b) => b.score - a.score)
  if (sortedScores.length > 0 && sortedScores[0]) {
    return {
      member: sortedScores[0].member,
      score: sortedScores[0].score
    }
  }

  return null
}
</script>
