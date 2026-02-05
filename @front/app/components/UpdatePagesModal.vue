<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: env(safe-area-inset-bottom, 0px);"
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
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <div class="form-field">
            <label
              for="pages_lues"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-document-text-outline"
                class="w-4 h-4 shrink-0"
              />
              Nombre de pages lues
            </label>
            <UInput
              id="pages_lues"
              v-model.number="pagesLues"
              type="number"
              min="0"
              :max="totalPages || undefined"
              placeholder="Ex: 150"
              :disabled="submitting"
              class="w-full input-touch"
              autofocus
            />
            <p
              v-if="totalPages"
              class="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
            >
              Sur {{ totalPages }} pages au total
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
const pagesLues = ref<number | null>(props.currentPages)
const submitting = ref(false)
const submitError = ref<string | null>(null)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
  if (newValue) {
    pagesLues.value = props.currentPages
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
    pagesLues.value = newValue
  }
})

const resetForm = () => {
  pagesLues.value = null
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
  .form-field :deep(input[type="number"]) {
    min-height: 48px;
    font-size: 16px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
