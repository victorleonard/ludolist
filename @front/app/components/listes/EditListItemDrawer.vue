<template>
  <UDrawer
    :open="isOpen"
    direction="top"
    @update:open="onDrawerOpenChange"
  >
    <template #content>
      <div
        class="relative flex flex-col max-h-[85dvh] sm:max-h-[80vh] bg-white dark:bg-gray-900 rounded-b-2xl overflow-hidden"
        style="padding-top: max(0.5rem, env(safe-area-inset-top, 0.5rem));"
      >
        <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Modifier l'élément
            </h2>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ion-close"
              size="sm"
              :disabled="submitting"
              aria-label="Fermer"
              class="min-w-[40px] min-h-[40px] flex items-center justify-center -mr-2"
              @click="closeDrawer"
            />
          </div>
        </div>

        <form
          id="edit-list-item-form"
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSave"
        >
          <div class="overflow-y-auto flex-1 min-h-0 overscroll-contain px-4 py-4 space-y-4">
            <div>
              <div
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500"
                :class="{ 'border-red-500 dark:border-red-500': !!errors.name }"
              >
                <input
                  ref="nameInputRef"
                  id="edit-list-item-name"
                  v-model="itemName"
                  type="text"
                  autocomplete="off"
                  inputmode="text"
                  placeholder="Nom de l'élément"
                  :disabled="submitting"
                  class="list-item-native-input flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none disabled:opacity-50"
                  @input="errors.name = undefined"
                />
              </div>
              <p
                v-if="errors.name"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label
                for="edit-list-item-category"
                class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5"
              >
                Catégorie (optionnel)
              </label>
              <select
                id="edit-list-item-category"
                v-model="selectedCategoryId"
                :disabled="submitting || !!newCategoryName.trim()"
                class="w-full min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-base text-gray-900 dark:text-gray-100 disabled:opacity-50"
                @change="onCategorySelect"
              >
                <option value="">
                  Sans catégorie
                </option>
                <option
                  v-for="category in localCategories"
                  :key="category.documentId"
                  :value="category.documentId"
                >
                  {{ category.name }}
                </option>
              </select>

              <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3 mb-1.5">
                Ou nouvelle catégorie
              </p>
              <input
                id="edit-list-item-new-category"
                v-model="newCategoryName"
                type="text"
                autocomplete="off"
                placeholder="Ex. Fruits, Épicerie…"
                :disabled="submitting"
                class="w-full min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none disabled:opacity-50"
                @input="onNewCategoryInput"
              />
              <p
                v-if="newCategoryName.trim()"
                class="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
              >
                Sera créée lors de l'enregistrement
              </p>
              <p
                v-if="errors.category"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.category }}
              </p>
            </div>
          </div>

          <div
            class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          >
            <UButton
              type="submit"
              form="edit-list-item-form"
              color="primary"
              size="lg"
              block
              class="min-h-[48px] sm:min-h-0"
              :loading="submitting"
              :disabled="!itemName.trim() || submitting || !item"
            >
              Enregistrer
            </UButton>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              block
              class="min-h-[48px]"
              :disabled="submitting"
              @click="closeDrawer"
            >
              Annuler
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useLists, type ListItem, type ListCategory } from '~/composables/useLists'

interface Props {
  modelValue: boolean
  listDocumentId: string
  item: ListItem | null
  categories?: ListCategory[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', item: ListItem): void
  (e: 'categories-changed'): void
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
})

const emit = defineEmits<Emits>()

const { updateListItem, createCategory } = useLists()
const { currentMember } = storeToRefs(useMemberStore())

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const localCategories = ref<ListCategory[]>([])

watch(
  () => props.categories,
  (categories) => {
    localCategories.value = [...(categories ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
  },
  { immediate: true, deep: true }
)

const itemName = ref('')
const selectedCategoryId = ref('')
const newCategoryName = ref('')
const submitting = ref(false)
const errors = ref<{ name?: string; category?: string }>({})
const nameInputRef = ref<HTMLInputElement | null>(null)

function resetFormFromItem(item: ListItem | null) {
  if (!item) {
    itemName.value = ''
    selectedCategoryId.value = ''
    newCategoryName.value = ''
    return
  }
  itemName.value = item.name
  selectedCategoryId.value = item.category?.documentId ?? ''
  newCategoryName.value = ''
}

const focusInput = () => {
  ;[100, 350, 600].forEach((delay) => {
    setTimeout(() => {
      const el = nameInputRef.value
      if (el && !el.disabled) el.focus({ preventScroll: false })
    }, delay)
  })
}

watch(
  () => [props.modelValue, props.item] as const,
  async ([open, item]) => {
    if (open && item) {
      resetFormFromItem(item)
      errors.value = {}
      await nextTick()
      focusInput()
    }
    if (!open) {
      errors.value = {}
    }
  }
)

function onDrawerOpenChange(open: boolean) {
  isOpen.value = open
  if (!open) {
    errors.value = {}
  }
}

function onCategorySelect() {
  if (selectedCategoryId.value) {
    newCategoryName.value = ''
  }
  errors.value.category = undefined
}

function onNewCategoryInput() {
  if (newCategoryName.value.trim()) {
    selectedCategoryId.value = ''
  }
  errors.value.category = undefined
}

async function resolveCategoryDocumentId(): Promise<string | null> {
  const newName = newCategoryName.value.trim()
  if (newName) {
    const existing = localCategories.value.find(
      (category) => category.name.toLowerCase() === newName.toLowerCase()
    )
    if (existing) return existing.documentId

    const result = await createCategory(
      props.listDocumentId,
      newName,
      currentMember.value?.id ?? null
    )

    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Erreur lors de la création de la catégorie')
    }

    localCategories.value.push(result.data)
    localCategories.value.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    emit('categories-changed')
    return result.data.documentId
  }

  return selectedCategoryId.value || null
}

function closeDrawer() {
  isOpen.value = false
}

async function handleSave() {
  if (!props.item?.documentId || !itemName.value.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }

  submitting.value = true
  errors.value = {}

  try {
    let categoryDocumentId: string | null = null

    try {
      categoryDocumentId = await resolveCategoryDocumentId()
    } catch (error) {
      errors.value.category = error instanceof Error ? error.message : 'Erreur catégorie'
      return
    }

    const result = await updateListItem(
      props.item.documentId,
      itemName.value.trim(),
      categoryDocumentId
    )

    if (result.success && result.data) {
      emit('success', result.data)
      closeDrawer()
    } else {
      errors.value.name = result.error ?? 'Erreur lors de l\'enregistrement'
    }
  } catch (error) {
    console.error('Erreur updateListItem:', error)
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
