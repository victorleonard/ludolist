<template>
  <div>
    <div class="flex items-center justify-end mb-4">
      <UButton
        color="primary"
        size="sm"
        icon="i-lucide-plus"
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
        name="i-lucide-loader-2"
        class="w-6 h-6 animate-spin text-primary-500"
      />
    </div>

    <div
      v-else-if="sessions.length === 0"
      class="text-center py-8 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-lucide-gamepad-2"
        class="w-12 h-12 mx-auto mb-3 opacity-50"
      />
      <p>Aucune partie enregistrée pour ce jeu</p>
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <UCard
        v-for="session in sessions"
        :key="session.id"
        class="bg-white dark:bg-gray-800"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-calendar"
              class="w-4 h-4 text-gray-500"
            />
            <span class="font-semibold">
              {{ formatDate(session.played_at) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              v-if="session.notes"
              color="gray"
              variant="subtle"
              icon="i-lucide-file-text"
            >
              Notes
            </UBadge>
            <UButton
              color="red"
              variant="ghost"
              icon="i-lucide-trash-2"
              size="xs"
              :loading="deletingSessionId === session.id"
              @click="handleDeleteSession(session.id)"
            />
          </div>
        </div>

        <div
          v-if="session.notes"
          class="mb-3 text-sm text-gray-600 dark:text-gray-400 italic"
        >
          {{ session.notes }}
        </div>

        <div class="space-y-2">
          <div
            v-for="score in sortedScores(session.player_scores || [])"
            :key="score.id"
            class="flex items-center justify-between p-2 rounded"
            :class="score.is_winner ? 'bg-primary-50 dark:bg-primary-900/20' : ''"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="score.is_winner"
                class="flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-crown"
                  class="w-4 h-4 text-yellow-500"
                />
              </div>
              <div
                v-else
                class="w-4 h-4 flex items-center justify-center"
              >
                <span class="text-xs text-gray-400">
                  {{ score.position }}
                </span>
              </div>
              <MemberAvatar
                :member="score.member"
                size="sm"
              />
              <span class="font-medium">{{ score.member.username }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold">{{ score.score }}</span>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      :open="isAddModalOpen"
      :fullscreen="isMobile"
      @update:open="(value) => { if (!value) closeAddSessionModal() }"
    >
      <template #content>
        <UCard class="w-full md:max-w-2xl md:max-h-[90vh] flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
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
                  icon="i-lucide-x"
                  size="sm"
                  class="-my-1"
                  :disabled="isSubmitting"
                  @click="closeModal"
                />
              </div>
            </div>
          </template>

          <form
            id="session-form"
            class="space-y-4 overflow-y-auto flex-1"
            @submit.prevent="handleAddSession"
          >
            <div>
              <label
                for="played_at"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                <UIcon
                  name="i-lucide-calendar"
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
              <label
                for="notes"
                class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                <UIcon
                  name="i-lucide-file-text"
                  class="w-4 h-4"
                />
                Notes (optionnel)
              </label>
              <UTextarea
                id="notes"
                v-model="newSession.notes"
                placeholder="Ajouter des notes sur cette partie..."
                rows="3"
                :disabled="isSubmitting"
                class="w-full"
              />
            </div>

            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <UIcon
                  name="i-lucide-users"
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
                  <div :class="['w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getMemberAvatarColor(member.id).bg]">
                    <span :class="['text-xs font-semibold', getMemberAvatarColor(member.id).text]">
                      {{ member.username.charAt(0).toUpperCase() }}
                    </span>
                  </div>
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
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useFamilyStore, type GameSession, type PlayerScore } from '~/stores/family'
import { useAddSessionModal } from '~/composables/useAddSessionModal'

const isMobile = useMediaQuery('(max-width: 767px)')

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
  return [...scores].sort((a, b) => {
    if (a.is_winner && !b.is_winner) return -1
    if (!a.is_winner && b.is_winner) return 1
    return (b.score - a.score)
  })
}

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
