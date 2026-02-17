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
        <div class="px-4 py-4 sm:px-6 sm:py-5">
          <form
            @submit.prevent="handleAdd"
            class="mb-4"
          >
            <div
              class="relative flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500"
              :class="{ 'border-red-500 dark:border-red-500': !!errors.name }"
            >
              <input
                ref="nameInputRef"
                id="list-item-name"
                v-model="itemName"
                type="text"
                autocomplete="off"
                inputmode="text"
                placeholder="Ajouter un élément"
                :disabled="submitting"
                class="list-item-native-input flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none disabled:opacity-50"
                @input="handleInput"
              />
              <UButton
                type="submit"
                color="primary"
                icon="i-ion-add"
                variant="link"
                size="sm"
                :loading="submitting"
                :disabled="!itemName.trim() || submitting"
                class="min-w-[40px] shrink-0"
                aria-label="Ajouter"
              />
            </div>
            <p
              v-if="errors.name"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </form>

          <div
            v-if="suggestions.length > 0 && itemName.trim().length > 0"
            class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto"
          >
            <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2.5">
              Similaires :
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion.documentId"
                type="button"
                class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion.name }}
              </button>
            </div>
          </div>

          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            block
            class="min-h-[48px] mt-4"
            :disabled="submitting"
            @click="closeModal"
          >
            Annuler
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useLists, type ListItem } from '~/composables/useLists'

interface Props {
  modelValue: boolean
  listDocumentId: string
  existingItems?: ListItem[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', item: ListItem): void
}

const props = withDefaults(defineProps<Props>(), {
  existingItems: () => [],
})

const emit = defineEmits<Emits>()

const { addItem } = useLists()
const memberStore = useMemberStore()
const { currentMember } = storeToRefs(memberStore)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const itemName = ref('')
const submitting = ref(false)
const errors = ref<{ name?: string }>({})
const nameInputRef = ref<HTMLInputElement | null>(null)

const focusInput = () => {
  ;[100, 350, 600].forEach((delay) => {
    setTimeout(() => {
      const el = nameInputRef.value
      if (el && !el.disabled) el.focus({ preventScroll: false })
    }, delay)
  })
}

const suggestions = computed(() => {
  if (!itemName.value.trim()) return []
  const searchTerm = itemName.value.trim().toLowerCase()
  return props.existingItems
    .filter((item) => {
      const n = item.name.toLowerCase()
      return n.includes(searchTerm) && n !== searchTerm
    })
    .slice(0, 5)
})

watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    await nextTick()
    focusInput()
  }
})

const handleInput = () => {
  errors.value = {}
}

const selectSuggestion = (suggestion: ListItem) => {
  itemName.value = suggestion.name
  handleAdd()
}

const closeModal = () => {
  isOpen.value = false
}

const handleAdd = async () => {
  if (!itemName.value.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }
  if (!props.listDocumentId) {
    errors.value.name = 'Liste non définie'
    return
  }

  submitting.value = true
  errors.value = {}

  try {
    const memberId = currentMember.value?.id ?? null
    const result = await addItem(props.listDocumentId, itemName.value.trim(), memberId)

    if (result.success && result.data) {
      emit('success', result.data)
      closeModal()
    } else {
      errors.value.name = result.error ?? 'Erreur lors de l\'ajout'
    }
  } catch (error) {
    console.error('Erreur addItem:', error)
    errors.value.name = 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.list-item-native-input {
  -webkit-appearance: none;
  appearance: none;
}
</style>
