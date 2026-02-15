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
        <div class="flex items-center justify-between gap-3 px-4 py-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">
            Mettre à jour ma progression
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            class="min-w-[44px] min-h-[44px] rounded-full -mr-1 shrink-0"
            :disabled="submitting"
            aria-label="Fermer"
            @click="closeModal"
          />
        </div>

        <form
          class="flex flex-col overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <!-- Affichage du nombre saisi -->
          <div class="mb-4 sm:mb-6">
            <label class="label-mobile flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              <UIcon name="i-ion-document-text-outline" class="w-4 h-4 shrink-0" />
              Nombre de pages lues
              <span v-if="totalPages" class="font-normal text-gray-500 dark:text-gray-500">
                / {{ totalPages }}
              </span>
            </label>
            <div
              class="w-full min-h-[72px] sm:min-h-[80px] flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-4xl sm:text-5xl font-bold tabular-nums text-gray-900 dark:text-gray-100"
            >
              {{ pagesDisplay || '0' }}
            </div>
          </div>

          <!-- Clavier numérique -->
          <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              v-for="n in 9"
              :key="n"
              type="button"
              class="keypad-btn"
              :disabled="submitting || !canAddDigit(String(n))"
              @click="appendDigit(String(n))"
            >
              {{ n }}
            </button>
            <div class="col-span-1" />
            <button
              type="button"
              class="keypad-btn"
              :disabled="submitting"
              @click="appendDigit('0')"
            >
              0
            </button>
            <button
              type="button"
              class="keypad-btn flex items-center justify-center"
              :disabled="submitting || pagesDisplay.length === 0"
              aria-label="Effacer"
              @click="backspace"
            >
              <UIcon name="i-ion-backspace-outline" class="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          <div
            v-if="submitError"
            class="mb-4 p-3.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>

          <div class="mt-auto pt-2 sm:pt-4">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              class="min-h-[52px] sm:min-h-0 text-base font-semibold rounded-xl"
              :loading="submitting"
            >
              Enregistrer
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useFamilyStore } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

interface Props {
  modelValue: boolean
  bookId: number | string | null
  currentPages: number | null
  totalPages: number | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  bookId: null,
  currentPages: null,
  totalPages: null
})

const emit = defineEmits<Emits>()

const familyStore = useFamilyStore()
const memberStore = useMemberStore()

const isOpen = ref(props.modelValue)
const pagesDisplay = ref('')
const submitting = ref(false)
const submitError = ref<string | null>(null)

const pagesLues = computed(() => {
  if (!pagesDisplay.value) return null
  const n = parseInt(pagesDisplay.value, 10)
  return Number.isNaN(n) ? null : n
})

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    pagesDisplay.value = props.currentPages != null ? String(props.currentPages) : ''
  }
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  }
})

watch(() => props.currentPages, (newValue) => {
  if (isOpen.value) {
    pagesDisplay.value = newValue != null ? String(newValue) : ''
  }
})

function canAddDigit(digit: string): boolean {
  if (digit === '0' && pagesDisplay.value === '') return true
  const next = pagesDisplay.value + digit
  const nextNum = parseInt(next, 10)
  if (Number.isNaN(nextNum)) return false
  if (props.totalPages != null && nextNum > props.totalPages) return false
  if (next.length > 6) return false
  return true
}

function appendDigit(digit: string) {
  if (!canAddDigit(digit)) return
  if (digit === '0' && pagesDisplay.value === '') {
    pagesDisplay.value = '0'
    return
  }
  if (pagesDisplay.value === '0' && digit !== '0') {
    pagesDisplay.value = digit
    return
  }
  pagesDisplay.value += digit
}

function backspace() {
  if (pagesDisplay.value.length <= 1) {
    pagesDisplay.value = ''
    return
  }
  pagesDisplay.value = pagesDisplay.value.slice(0, -1)
}

const resetForm = () => {
  pagesDisplay.value = ''
  submitError.value = null
}

async function handleSubmit() {
  if (!props.bookId) return
  
  // Si un membre est connecté, utiliser son ID
  const memberId = memberStore.isMemberConnected && memberStore.currentMember
    ? memberStore.currentMember.id
    : null

  if (!memberId) {
    submitError.value = 'Vous devez être connecté en tant que membre'
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    const result = await familyStore.upsertBookReading(
      memberId,
      props.bookId,
      {
        pages_lues: pagesLues.value || null
      }
    )

    if (!result.success) {
      submitError.value = result.error || 'Erreur lors de la sauvegarde'
      return
    }

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la mise à jour des pages:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
    submitError.value = errorMessage
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
.label-mobile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
}

.keypad-btn {
  aspect-ratio: 1;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  transition: all 0.15s ease;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.keypad-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: scale(1.02);
}

.keypad-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.keypad-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dark .keypad-btn {
  color: #f9fafb;
  background: #374151;
  border-color: #4b5563;
}

.dark .keypad-btn:hover:not(:disabled) {
  background: #4b5563;
  border-color: #6b7280;
}
</style>
