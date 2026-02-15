<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">
            {{ modalTitle }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            class="shrink-0 min-w-[44px] min-h-[44px] rounded-full -mr-1"
            :disabled="submitting"
            aria-label="Fermer"
            @click="closeModal"
          />
        </div>

        <!-- Étape 1 : Choisir l'action (nouvelle lecture uniquement) -->
        <div
          v-if="!reading && !readingIntent"
          class="space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Où en êtes-vous avec ce livre ?
          </p>
          <div class="grid gap-3">
            <button
              type="button"
              class="flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all"
              :class="'border-primary-500 bg-primary-50 dark:bg-primary-900/20 hover:border-primary-600'"
              @click="selectIntent('start')"
            >
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white shrink-0">
                <UIcon name="i-ion-book" class="w-5 h-5" />
              </span>
              <div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">Je commence ce livre</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Je viens de commencer à le lire
                </p>
              </div>
            </button>

            <button
              type="button"
              class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left transition-all hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              @click="selectIntent('progress')"
            >
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white shrink-0">
                <UIcon name="i-ion-trending-up" class="w-5 h-5" />
              </span>
              <div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">Mettre à jour ma progression</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  J'avance dans ma lecture
                </p>
              </div>
            </button>

            <button
              type="button"
              class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left transition-all hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              @click="selectIntent('finish')"
            >
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white shrink-0">
                <UIcon name="i-ion-checkmark-circle" class="w-5 h-5" />
              </span>
              <div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">Je l'ai terminé</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  J'ai fini de lire ce livre
                </p>
              </div>
            </button>

            <button
              type="button"
              class="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-left transition-all hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10"
              @click="selectIntent('abandon')"
            >
              <span class="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white shrink-0">
                <UIcon name="i-ion-close-circle" class="w-5 h-5" />
              </span>
              <div>
                <span class="font-semibold text-gray-900 dark:text-gray-100">J'ai abandonné</span>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Ce livre ne m'a pas plu
                </p>
              </div>
            </button>
          </div>
        </div>

        <!-- Étape 2 : Formulaire -->
        <form
          v-else
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <!-- Bouton retour (étape 1) -->
          <div
            v-if="!reading && readingIntent"
            class="mb-2"
          >
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-ion-arrow-back"
              size="sm"
              @click="readingIntent = null"
            >
              Changer d'action
            </UButton>
          </div>

          <!-- Champ membre - masqué si compact, finish, ou membre connecté -->
          <div
            v-if="!(props.compactProgressUpdate || (props.reading && readingIntent === 'finish')) && (!memberStore.isMemberConnected || !memberStore.currentMember)"
            class="form-field"
          >
            <label
              for="member"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-person"
                class="w-4 h-4 shrink-0"
              />
              Pour quel membre ? <span class="text-red-500">*</span>
            </label>
            <SelectWithModal
              id="member"
              v-model="state.memberId"
              :items="memberOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Choisir un membre"
              modal-title="Choisir un membre"
              :disabled="submitting || !!reading"
              :error="!!errors.memberId"
              class="w-full input-touch"
            />
            <p
              v-if="errors.memberId"
              class="mt-1.5 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.memberId }}
            </p>
          </div>

          <!-- Message informatif si membre connecté (masqué en mode compact ou finish) -->
          <div
            v-if="!(props.compactProgressUpdate || (props.reading && readingIntent === 'finish')) && memberStore.isMemberConnected && memberStore.currentMember"
            class="p-3.5 sm:p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-ion-person-circle"
                class="w-5 h-5 sm:w-4 sm:h-4 shrink-0 text-primary-600 dark:text-primary-400"
              />
              <span class="text-sm text-primary-700 dark:text-primary-300">
                Enregistrement pour <strong>{{ memberStore.currentMember.username }}</strong>
              </span>
            </div>
          </div>

          <!-- Date de début (start, progress, finish, abandon) -->
          <div
            v-if="showDateDebut"
            class="form-field"
          >
            <label
              for="date_debut"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-calendar-outline"
                class="w-4 h-4 shrink-0"
              />
              {{ dateDebutLabel }}
            </label>
            <UInput
              id="date_debut"
              v-model="state.date_debut"
              type="date"
              :disabled="submitting"
              class="w-full input-touch"
            />
          </div>

          <!-- Date de fin (finish, abandon) -->
          <div
            v-if="showDateFin"
            class="form-field"
          >
            <label
              for="date_fin"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-calendar"
                class="w-4 h-4 shrink-0"
              />
              {{ dateFinLabel }}
            </label>
            <UInput
              id="date_fin"
              v-model="state.date_fin"
              type="date"
              :disabled="submitting"
              :min="state.date_debut"
              class="w-full input-touch"
            />
            <UButton
              v-if="reading && state.date_fin"
              type="button"
              color="neutral"
              variant="soft"
              size="sm"
              class="mt-2"
              :disabled="submitting"
              @click="state.date_fin = ''"
            >
              Pas encore terminé
            </UButton>
          </div>

          <!-- Pages lues -->
          <div
            v-if="showPagesLues"
            class="form-field"
          >
            <label
              for="pages_lues"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-document-text-outline"
                class="w-4 h-4 shrink-0"
              />
              {{ pagesLuesLabel }}
            </label>
            <UInput
              id="pages_lues"
              v-model.number="state.pages_lues"
              type="number"
              min="0"
              :placeholder="pagesLuesPlaceholder"
              :max="bookNombrePages || undefined"
              :disabled="submitting"
              class="w-full input-touch"
            />
            <p
              v-if="bookNombrePages"
              class="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
            >
              Sur {{ bookNombrePages }} pages au total
            </p>
          </div>

          <!-- Abandonné (abandon uniquement, ou toujours en mode édition) -->
          <div
            v-if="showAbandonne"
            class="form-field"
          >
            <div
              class="flex items-start gap-3 p-3 rounded-lg border-2 transition-colors"
              :class="state.abandonne
                ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'"
            >
              <UCheckbox
                id="abandonne"
                v-model="state.abandonne"
                :disabled="submitting"
                color="error"
                size="sm"
                class="shrink-0 mt-0.5"
              />
              <div class="flex-1 min-w-0">
                <label
                  for="abandonne"
                  class="block text-sm font-medium cursor-pointer"
                  :class="state.abandonne
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-700 dark:text-gray-300'"
                >
                  J'ai abandonné cette lecture
                </label>
                <p
                  class="mt-1 text-xs"
                  :class="state.abandonne
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'"
                >
                  Ce livre ne m'a pas plu, je ne souhaite pas continuer
                </p>
              </div>
            </div>
          </div>

          <!-- Note (finish uniquement) -->
          <div
            v-if="showNoteInput"
            class="form-field"
          >
            <label
              for="note"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-star"
                class="w-4 h-4 shrink-0 text-yellow-500"
              />
              Ma note
            </label>
            <UInput
              id="note"
              v-model.number="state.note"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="Ex: 8"
              :disabled="submitting"
              class="w-full input-touch"
            />
            <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              Sur 10 (optionnel)
            </p>
          </div>

          <div
            v-if="submitError"
            class="p-3.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>

          <div class="pt-2 sm:pt-4">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              class="min-h-[52px] sm:min-h-0 text-base font-semibold rounded-xl"
              :loading="submitting"
            >
              {{ submitButtonLabel }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useFamilyStore, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

type ReadingIntent = 'start' | 'progress' | 'finish' | 'abandon' | null

interface Props {
  modelValue: boolean
  bookId: number | string
  book?: { nombre_pages?: number | null } | null
  reading?: BookReading | null
  compactProgressUpdate?: boolean
  initialIntent?: 'finish' | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  book: null,
  reading: null,
  compactProgressUpdate: false
})

const emit = defineEmits<Emits>()

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const members = computed(() => familyStore.familyMembers)

const bookNombrePages = computed(() => props.book?.nombre_pages ?? null)

const memberOptions = computed(() => {
  return members.value.map(member => ({
    label: member.username,
    value: member.id
  }))
})

const today = () => new Date().toISOString().slice(0, 10)

const isOpen = ref(props.modelValue)
const readingIntent = ref<ReadingIntent>(null)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  } else {
    if (memberStore.isMemberConnected && memberStore.currentMember) {
      state.memberId = memberStore.currentMember.id
    }
    if (newValue && props.reading) {
      loadReadingData()
      readingIntent.value = props.initialIntent === 'finish' ? 'finish' : null
      if (readingIntent.value === 'finish') {
        state.date_fin = today()
        if (bookNombrePages.value) state.pages_lues = bookNombrePages.value
        state.abandonne = false
      }
    } else {
      readingIntent.value = null
    }
  }
})

watch(() => props.reading, (newReading) => {
  if (newReading && isOpen.value) {
    loadReadingData()
  }
})

const submitting = ref(false)
const submitError = ref<string | null>(null)

const state = reactive({
  memberId: null as number | null,
  date_debut: '',
  date_fin: '',
  pages_lues: null as number | null,
  abandonne: false,
  note: null as number | null
})

const errors = reactive({
  memberId: ''
})

const modalTitle = computed(() => {
  if (props.reading) return 'Mettre à jour ma progression'
  if (readingIntent.value === 'start') return 'Je commence ce livre'
  if (readingIntent.value === 'progress') return 'Ma progression'
  if (readingIntent.value === 'finish') return "J'ai terminé !"
  if (readingIntent.value === 'abandon') return "J'ai abandonné"
  return 'Où en êtes-vous ?'
})

const submitButtonLabel = computed(() => {
  if (props.reading && readingIntent.value === 'finish') return 'Terminer'
  if (props.reading) return 'Enregistrer'
  if (readingIntent.value === 'start') return 'Commencer'
  if (readingIntent.value === 'progress') return 'Mettre à jour'
  if (readingIntent.value === 'finish') return 'Terminer'
  if (readingIntent.value === 'abandon') return "Marquer comme abandonné"
  return 'Enregistrer'
})

const showDateDebut = computed(() => {
  if (props.compactProgressUpdate) return false
  if (props.reading && readingIntent.value === 'finish') return false
  if (props.reading) return true
  return readingIntent.value === 'start' || readingIntent.value === 'progress' || readingIntent.value === 'finish' || readingIntent.value === 'abandon'
})

const showDateFin = computed(() => {
  if (props.compactProgressUpdate) return false
  if (props.reading) return true
  return readingIntent.value === 'finish' || readingIntent.value === 'abandon'
})

const showPagesLues = computed(() => true)

const showAbandonne = computed(() => {
  if (props.compactProgressUpdate) return false
  if (props.reading) return true
  return readingIntent.value === 'abandon'
})

const showNoteInput = computed(() => {
  if (props.reading && readingIntent.value === 'finish') return true
  if (props.reading) return false
  return readingIntent.value === 'finish'
})

const dateDebutLabel = computed(() => {
  if (readingIntent.value === 'start') return 'Quand avez-vous commencé ?'
  if (readingIntent.value === 'progress' || readingIntent.value === 'finish' || readingIntent.value === 'abandon') return 'Date de début'
  return 'Quand avez-vous commencé ?'
})

const dateFinLabel = computed(() => {
  if (readingIntent.value === 'finish') return 'Quand avez-vous terminé ?'
  if (readingIntent.value === 'abandon') return "Quand avez-vous arrêté ?"
  return 'Date de fin'
})

const pagesLuesLabel = computed(() => {
  if (props.compactProgressUpdate) return "Où en êtes-vous ? (nombre de pages lues)"
  if ((readingIntent.value === 'finish') && bookNombrePages.value) return 'Combien de pages au total ?'
  if (readingIntent.value === 'progress') return "Où en êtes-vous ? (nombre de pages)"
  return 'Pages lues'
})

const pagesLuesPlaceholder = computed(() => {
  if (readingIntent.value === 'finish' && bookNombrePages.value) return String(bookNombrePages.value)
  return 'Ex: 150'
})

function selectIntent(intent: ReadingIntent) {
  readingIntent.value = intent
  if (intent === 'start') {
    state.date_debut = today()
  } else if (intent === 'finish' || intent === 'abandon') {
    state.date_fin = today()
    if (intent === 'finish' && bookNombrePages.value) {
      state.pages_lues = bookNombrePages.value
    }
    if (intent === 'abandon') {
      state.abandonne = true
    }
  }
}

const loadReadingData = () => {
  if (props.reading) {
    const m = props.reading.member
    state.memberId = (m && typeof m === 'object' && 'id' in m) ? (m as { id: number }).id : (m as number) ?? null
    state.date_debut = props.reading.date_debut || ''
    state.date_fin = props.reading.date_fin || ''
    state.pages_lues = props.reading.pages_lues ?? null
    state.abandonne = props.reading.abandonne || false
    state.note = props.reading.note ?? null
  }
}

const resetForm = () => {
  readingIntent.value = null
  state.memberId = null
  state.date_debut = ''
  state.date_fin = ''
  state.pages_lues = null
  state.abandonne = false
  state.note = null
  submitError.value = null
  errors.memberId = ''
}

watch(() => state.memberId, () => {
  if (errors.memberId) errors.memberId = ''
})

const validateForm = (): boolean => {
  errors.memberId = ''
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    state.memberId = memberStore.currentMember.id
  }
  if (!state.memberId) {
    errors.memberId = 'Le membre est requis'
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validateForm()) return

  submitting.value = true
  submitError.value = null

  try {
    const result = await familyStore.upsertBookReading(
      state.memberId!,
      props.bookId,
      {
        date_debut: state.date_debut || null,
        date_fin: state.date_fin || null,
        pages_lues: state.pages_lues ?? null,
        abandonne: state.abandonne,
        note: state.note ?? undefined
      }
    )

    if (!result.success) {
      submitError.value = result.error || 'Erreur lors de la sauvegarde'
      return
    }

    if (state.note != null && state.note > 0) {
      await familyStore.setBookRating(props.bookId, state.memberId!, state.note)
    }

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la sauvegarde de la lecture:', err)
    submitError.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde'
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    resetForm()
    isOpen.value = false
  }
}
</script>

<style scoped>
.form-field :deep(.label-mobile) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
  margin-bottom: 0.375rem;
}
.form-field :deep(.input-touch) {
  width: 100%;
}
@media (max-width: 639px) {
  .form-field :deep(input[type="text"]),
  .form-field :deep(input[type="number"]),
  .form-field :deep(input[type="date"]) {
    min-height: 48px;
    font-size: 16px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
