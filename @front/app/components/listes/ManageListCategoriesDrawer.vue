<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(v) => { isOpen = v }"
  >
    <template #content>
      <div
        class="relative flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      >
        <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Catégories
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organisez les éléments de la liste par catégorie.
          </p>
        </div>

        <div
          class="overflow-y-auto flex-1 min-h-0 overscroll-contain px-4 py-4 space-y-4"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div
            v-if="localCategories.length === 0"
            class="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
          >
            Aucune catégorie pour l'instant.
          </div>

          <div
            v-for="category in localCategories"
            :key="category.documentId"
            class="flex items-center gap-2"
          >
            <input
              v-if="editingId === category.documentId"
              v-model="editingName"
              type="text"
              class="flex-1 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-base"
              @keyup.enter="saveEdit(category.documentId)"
              @keyup.esc="cancelEdit"
            />
            <span
              v-else
              class="flex-1 text-base font-medium text-gray-900 dark:text-gray-100 py-2"
            >
              {{ category.name }}
            </span>
            <UButton
              v-if="editingId === category.documentId"
              variant="ghost"
              color="primary"
              icon="i-ion-checkmark"
              size="sm"
              :loading="savingId === category.documentId"
              aria-label="Enregistrer"
              @click="saveEdit(category.documentId)"
            />
            <UButton
              v-else
              variant="ghost"
              color="neutral"
              icon="i-ion-create"
              size="sm"
              aria-label="Renommer"
              @click="startEdit(category)"
            />
            <UButton
              variant="ghost"
              color="error"
              icon="i-ion-trash-outline"
              size="sm"
              :loading="deletingId === category.documentId"
              aria-label="Supprimer"
              @click="handleDelete(category.documentId)"
            />
          </div>

          <form
            class="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700"
            @submit.prevent="handleAdd"
          >
            <input
              v-model="newCategoryName"
              type="text"
              placeholder="Nouvelle catégorie"
              class="flex-1 min-h-[44px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-base"
            />
            <UButton
              type="submit"
              color="primary"
              icon="i-ion-add"
              :loading="adding"
              :disabled="!newCategoryName.trim() || adding"
              aria-label="Ajouter"
            />
          </form>

          <p
            v-if="error"
            class="text-sm text-red-600 dark:text-red-400"
          >
            {{ error }}
          </p>
        </div>

        <div
          class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 shrink-0 bg-white dark:bg-gray-900"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            block
            class="min-h-[48px]"
            @click="isOpen = false"
          >
            Fermer
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useLists, type ListCategory } from '~/composables/useLists'

interface Props {
  modelValue: boolean
  listDocumentId: string
  categories?: ListCategory[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'changed'): void
}

const props = withDefaults(defineProps<Props>(), {
  categories: () => [],
})

const emit = defineEmits<Emits>()

const { createCategory, updateCategory, deleteCategory } = useLists()
const { currentMember } = storeToRefs(useMemberStore())

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const localCategories = ref<ListCategory[]>([])
const newCategoryName = ref('')
const adding = ref(false)
const error = ref<string | null>(null)
const editingId = ref<string | null>(null)
const editingName = ref('')
const savingId = ref<string | null>(null)
const deletingId = ref<string | null>(null)

watch(
  () => props.categories,
  (categories) => {
    localCategories.value = [...(categories ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )
  },
  { immediate: true, deep: true }
)

watch(isOpen, (open) => {
  if (open) {
    error.value = null
    newCategoryName.value = ''
    cancelEdit()
  }
})

function startEdit(category: ListCategory) {
  editingId.value = category.documentId
  editingName.value = category.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit(documentId: string) {
  if (!editingName.value.trim() || savingId.value) return
  savingId.value = documentId
  error.value = null
  try {
    const result = await updateCategory(documentId, editingName.value.trim())
    if (result.success && result.data) {
      const index = localCategories.value.findIndex((c) => c.documentId === documentId)
      if (index !== -1) localCategories.value[index] = result.data
      cancelEdit()
      emit('changed')
    } else {
      error.value = result.error ?? 'Erreur lors de l\'enregistrement'
    }
  } finally {
    savingId.value = null
  }
}

async function handleDelete(documentId: string) {
  if (!confirm('Supprimer cette catégorie ? Les éléments associés resteront sans catégorie.')) return
  deletingId.value = documentId
  error.value = null
  try {
    const result = await deleteCategory(documentId)
    if (result.success) {
      localCategories.value = localCategories.value.filter((c) => c.documentId !== documentId)
      emit('changed')
    } else {
      error.value = result.error ?? 'Erreur lors de la suppression'
    }
  } finally {
    deletingId.value = null
  }
}

async function handleAdd() {
  if (!newCategoryName.value.trim() || adding.value || !props.listDocumentId) return
  adding.value = true
  error.value = null
  try {
    const result = await createCategory(
      props.listDocumentId,
      newCategoryName.value.trim(),
      currentMember.value?.id ?? null
    )
    if (result.success && result.data) {
      localCategories.value.push(result.data)
      localCategories.value.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      newCategoryName.value = ''
      emit('changed')
    } else {
      error.value = result.error ?? 'Erreur lors de l\'ajout'
    }
  } finally {
    adding.value = false
  }
}
</script>
