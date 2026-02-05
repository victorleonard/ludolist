<template>
  <div>
    <div class="flex items-center justify-end mb-3 sm:mb-4">
      <UButton
        color="primary"
        size="sm"
        icon="i-ion-add"
        class="min-h-[44px] sm:min-h-0"
        @click="openAddSessionModal"
      >
        Ajouter une partie
      </UButton>
    </div>

    <div
      v-if="loading"
      class="flex justify-center items-center py-8"
    >
      <UIcon
        name="i-ion-refresh-circle"
        class="w-6 h-6 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else-if="sessions.length === 0"
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-ion-game-controller"
        class="w-16 h-16 mx-auto mb-4 opacity-50"
      />
      <p class="text-base font-medium mb-2">Aucune partie enregistrée</p>
      <p class="text-sm">Ajoutez votre première partie pour commencer à suivre vos scores !</p>
    </div>

    <div
      v-else
      class="space-y-3 sm:space-y-4"
    >
      <UCard
        v-for="session in sessions"
        :key="session.id"
        class="bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md"
      >
        <!-- Header avec date et actions -->
        <div class="flex items-start justify-between mb-3 sm:mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <UIcon
              name="i-ion-calendar"
              class="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 dark:text-primary-400 flex-shrink-0"
            />
            <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100">
              {{ formatDate(session.played_at) }}
            </span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <UBadge
              v-if="session.notes"
              color="gray"
              variant="subtle"
              icon="i-ion-document-text"
              size="xs"
              class="text-gray-800 dark:text-gray-200"
            >
              <span class="hidden sm:inline">Notes</span>
            </UBadge>
            <UButton
              color="red"
              variant="ghost"
              icon="i-ion-trash"
              size="sm"
              class="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              :loading="deletingSessionId === session.id"
              @click="handleDeleteSession(session.id)"
            >
              <span class="sr-only">Supprimer la partie</span>
            </UButton>
          </div>
        </div>

        <!-- Notes si présentes -->
        <div
          v-if="session.notes"
          class="mb-3 sm:mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-l-4 border-primary-500"
        >
          <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ session.notes }}
          </p>
        </div>

        <!-- Liste des joueurs avec scores -->
        <div class="space-y-2 sm:space-y-2.5">
          <div
            v-for="(score, index) in sortedScores(session.player_scores || [])"
            :key="score.id"
            class="flex items-center justify-between p-3 sm:p-3.5 rounded-lg transition-all duration-200"
            :class="[
              score.is_winner
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm'
                : index % 2 === 0
                  ? 'bg-gray-50 dark:bg-gray-900/30'
                  : 'bg-white dark:bg-gray-800'
            ]"
          >
            <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <!-- Position / Trophée -->
              <div class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                <div
                  v-if="score.is_winner"
                  class="flex items-center justify-center w-full h-full rounded-full bg-yellow-400 dark:bg-yellow-500 shadow-sm"
                >
                  <UIcon
                    name="i-ion-trophy"
                    class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-900 dark:text-yellow-100"
                  />
                </div>
                <div
                  v-else
                  class="flex items-center justify-center w-full h-full rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span class="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">
                    {{ score.position }}
                  </span>
                </div>
              </div>

              <!-- Avatar et nom -->
              <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <MemberAvatar
                  :member="score.member"
                  size="md"
                  class="flex-shrink-0"
                />
                <span class="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                  {{ score.member.username }}
                </span>
              </div>
            </div>

            <!-- Score -->
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
              <span
                class="text-lg sm:text-xl font-bold"
                :class="score.is_winner ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-gray-100'"
              >
                {{ score.score }}
              </span>
              <span
                v-if="score.is_winner"
                class="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide"
              >
                Gagnant
              </span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UDrawer
      :open="isAddModalOpen"
      direction="bottom"
      @update:open="(value) => { if (!value) closeAddSessionModal() }"
    >
      <template #content>
        <div class="flex flex-col max-h-[85vh] bg-white dark:bg-gray-900">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <h3 class="text-lg font-semibold">
              Ajouter une partie
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                type="submit"
                form="session-form"
                color="primary"
                size="sm"
                :loading="isSubmitting"
              >
                Enregistrer
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-ion-close"
                size="sm"
                :disabled="isSubmitting"
                @click="closeModal"
              />
            </div>
          </div>

          <form
            id="session-form"
            class="space-y-4 overflow-y-auto flex-1 p-4"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
            @submit.prevent="handleAddSession"
          >
            <div>
              <label
                for="played_at"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                <UIcon
                  name="i-ion-calendar"
                  class="w-4 h-4"
                />
                Date et heure de la partie <span class="text-red-500">*</span>
              </label>
              <UInput
                id="played_at"
                v-model="newSession.played_at"
                type="datetime-local"
                :disabled="isSubmitting"
                :error="!!errors.played_at"
                class="w-full"
                required
              />
              <p
                v-if="errors.played_at"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.played_at }}
              </p>
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <UIcon
                  name="i-ion-persons"
                  class="w-4 h-4"
                />
                Scores des joueurs <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <div
                  v-for="member in familyMembers"
                  :key="member.id"
                  class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <MemberAvatar
                    :member="member"
                    size="sm"
                  />
                  <span class="flex-1 font-medium">{{ member.username }}</span>
                  <UInput
                    v-model.number="newSession.scores[member.id]"
                    type="number"
                    placeholder="Score"
                    class="w-24"
                    :min="0"
                    step="0.01"
                    :disabled="isSubmitting"
                  />
                </div>
              </div>
              <p
                v-if="errors.scores"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.scores }}
              </p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useFamilyStore, type GameSession, type PlayerScore } from '~/stores/family'
import { useAddSessionModal } from '~/composables/useAddSessionModal'

const props = defineProps<{
  gameId: number
}>()

const familyStore = useFamilyStore()
const { isOpen: isAddSessionModalOpen, openModal: openAddSessionModalFromComposable, closeModal: closeAddSessionModal } = useAddSessionModal()

const sessions = ref<GameSession[]>([])
const loading = ref(false)
const isAddModalOpen = computed({
  get: () => isAddSessionModalOpen.value,
  set: (value) => {
    if (!value) {
      closeAddSessionModal()
    }
  }
})
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const deletingSessionId = ref<number | null>(null)

// Écouter les changements du composable
watch(isAddSessionModalOpen, (newValue) => {
  if (newValue) {
    resetForm()
  }
})

const newSession = ref({
  played_at: new Date().toISOString().slice(0, 16),
  notes: '',
  scores: {} as Record<number, number>
})

const errors = reactive({
  played_at: '',
  scores: ''
})

const familyMembers = computed(() => familyStore.familyMembers)

watch(() => newSession.value.played_at, () => {
  if (errors.played_at) errors.played_at = ''
})

watch(() => newSession.value.scores, () => {
  if (errors.scores) errors.scores = ''
}, { deep: true })

const sortedScores = (scores: PlayerScore[]) => {
  const sorted = [...scores].sort((a, b) => {
    if (a.is_winner && !b.is_winner) return -1
    if (!a.is_winner && b.is_winner) return 1
    return (b.score - a.score)
  })
  // Ajouter la position à chaque score
  return sorted.map((score, index) => ({
    ...score,
    position: index + 1
  }))
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Si c'est aujourd'hui, afficher seulement l'heure
  if (diffDays === 0) {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) + ' (aujourd\'hui)'
  }

  // Si c'est hier
  if (diffDays === 1) {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) + ' (hier)'
  }

  // Sinon, afficher la date complète
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const resetForm = () => {
  newSession.value = {
    played_at: new Date().toISOString().slice(0, 16),
    notes: '',
    scores: {} as Record<number, number>
  }
  submitError.value = null
  errors.played_at = ''
  errors.scores = ''
}

const openAddSessionModal = () => {
  resetForm()
  openAddSessionModalFromComposable()
}

const validateForm = (): boolean => {
  let isValid = true
  errors.played_at = ''
  errors.scores = ''

  if (!newSession.value.played_at) {
    errors.played_at = 'La date et l\'heure sont requises'
    isValid = false
  }

  const scores = Object.entries(newSession.value.scores)
    .filter(([_, score]) => score !== undefined && score !== null && score !== '')

  if (scores.length === 0) {
    errors.scores = 'Au moins un score est requis'
    isValid = false
  }

  return isValid
}

const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm()
    closeAddSessionModal()
  }
}

const handleAddSession = async () => {
  if (!validateForm()) {
    return
  }

  const scores = Object.entries(newSession.value.scores)
    .filter(([_, score]) => score !== undefined && score !== null && score !== '')
    .map(([memberId, score]) => ({
      memberId: parseInt(memberId, 10),
      score: Number(score)
    }))

  isSubmitting.value = true
  submitError.value = null

  try {
    const playedAt = new Date(newSession.value.played_at).toISOString()
    const result = await familyStore.createGameSession(
      props.gameId,
      playedAt,
      scores,
      newSession.value.notes || undefined
    )

    if (result.success) {
      resetForm()
      closeAddSessionModal()
      await loadSessions()
    } else {
      submitError.value = result.error || 'Erreur lors de l\'enregistrement de la partie'
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la partie:', error)
    submitError.value = 'Une erreur est survenue lors de l\'enregistrement de la partie'
  } finally {
    isSubmitting.value = false
  }
}

const loadSessions = async () => {
  loading.value = true
  try {
    const result = await familyStore.fetchGameSessions(props.gameId)
    if (result.success && result.data) {
      sessions.value = result.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des parties:', error)
  } finally {
    loading.value = false
  }
}

const handleDeleteSession = async (sessionId: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette partie ?')) {
    return
  }

  deletingSessionId.value = sessionId

  try {
    const result = await familyStore.deleteGameSession(sessionId)

    if (result.success) {
      await loadSessions()
    } else {
      alert(result.error || 'Erreur lors de la suppression de la partie')
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la partie:', error)
    alert('Une erreur est survenue lors de la suppression de la partie')
  } finally {
    deletingSessionId.value = null
  }
}

onMounted(() => {
  loadSessions()
})
</script>
