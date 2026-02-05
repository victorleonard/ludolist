<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div class="flex flex-col bg-white dark:bg-gray-900">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-lg font-semibold">
            Mettre à jour ma progression
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            :disabled="submitting"
            @click="closeModal"
          />
        </div>

        <form
          class="space-y-4 p-4"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="pages_lues"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-document-text"
                class="w-4 h-4"
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
              class="w-full"
              autofocus
            />
            <p
              v-if="totalPages"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Sur {{ totalPages }} pages au total
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

          <div class="flex gap-3 pt-2">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
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
