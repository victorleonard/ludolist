<template>
  <div>
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="mt-4 sm:mt-6">
        <div
          v-if="loading"
          class="flex justify-center items-center py-12"
        >
          <UIcon
            name="i-ion-refresh-circle"
            class="w-8 h-8 animate-spin text-primary-500"
          />
        </div>

        <div
          v-else-if="error || !list"
          class="flex flex-col items-center justify-center py-12"
        >
          <p class="text-red-500 mb-4">
            {{ error || 'Liste non trouvée' }}
          </p>
          <UButton
            color="primary"
            @click="loadList"
          >
            Réessayer
          </UButton>
        </div>

        <template v-else>
          <div :key="`list-${documentId}-member-${currentMemberId}`">
            <div class="mb-6 sm:mb-8">
            <div class="flex items-center gap-3 w-full">
              <div class="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                <h1 class="text-xl sm:text-2xl font-bold truncate">
                  {{ list.name }}
                </h1>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors shrink-0"
                  title="Modifier les accès"
                  @click="openAccessDrawer"
                >
                  {{ listAccessLabel(list) }}
                  <UIcon name="i-ion-create" class="w-3 h-3" />
                </button>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-ion-folder-outline"
                  aria-label="Gérer les catégories"
                  class="w-9 h-9 min-w-9 min-h-9"
                  @click="isCategoriesDrawerOpen = true"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-ion-create-outline"
                  aria-label="Renommer la liste"
                  class="w-9 h-9 min-w-9 min-h-9"
                  @click="openRenameDrawer"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-ion-trash-outline"
                  aria-label="Supprimer la liste"
                  class="w-9 h-9 min-w-9 min-h-9"
                  @click="deleteError = null; isDeleteModalOpen = true"
                />
              </div>
            </div>
            </div>

          <div
            v-if="allItems.length === 0"
            class="flex flex-col items-center justify-center py-12"
          >
            <UIcon
              name="i-ion-list"
              class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Cette liste est vide. Ajoutez un élément.
            </p>
          </div>

          <template v-else>
            <div
              v-if="hasCategories ? uncheckedGroups.length > 0 : uncheckedCount > 0"
              class="mb-6"
            >
              <div class="flex items-center gap-2 mb-4">
                <UIcon
                  name="i-ion-list"
                  class="w-5 h-5 text-primary-500"
                />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  À faire ({{ uncheckedCount }})
                </h2>
              </div>
              <div
                v-for="group in uncheckedGroups"
                :key="`unchecked-${group.key}`"
                class="mb-4 last:mb-0"
              >
                <h3
                  v-if="hasCategories && group.label"
                  class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1"
                >
                  {{ group.label }}
                  <span
                    v-if="group.items.length === 0"
                    class="font-normal text-gray-400 dark:text-gray-500"
                  >
                    (vide)
                  </span>
                </h3>
                <draggable
                  v-model="group.items"
                  item-key="documentId"
                  handle=".drag-handle"
                  :group="hasCategories ? 'list-unchecked' : undefined"
                  :animation="120"
                  ghost-class="list-drag-ghost"
                  chosen-class="list-drag-chosen"
                  drag-class="list-drag-dragging"
                  class="space-y-2 list-draggable min-h-[12px]"
                  :class="{
                    'list-draggable--empty': hasCategories && group.items.length === 0,
                  }"
                  @end="handleReorderEnd"
                >
                  <template #item="{ element }">
                    <ListItemCard
                      :item="element"
                      @updated="handleItemUpdated"
                      @deleted="handleItemDeleted"
                      @edit="openEditDrawer"
                    />
                  </template>
                </draggable>
              </div>
            </div>

            <div
              v-if="hasCategories ? checkedGroups.length > 0 : checkedCount > 0"
              class="mb-6"
            >
              <div class="flex items-center gap-2 mb-4">
                <UIcon
                  name="i-ion-checkmark-circle"
                  class="w-5 h-5 text-green-500"
                />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Fait ({{ checkedCount }})
                </h2>
              </div>
              <div
                v-for="group in checkedGroups"
                :key="`checked-${group.key}`"
                class="mb-4 last:mb-0"
              >
                <h3
                  v-if="hasCategories && group.label"
                  class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 px-1"
                >
                  {{ group.label }}
                  <span
                    v-if="group.items.length === 0"
                    class="font-normal text-gray-400 dark:text-gray-500"
                  >
                    (vide)
                  </span>
                </h3>
                <draggable
                  v-model="group.items"
                  item-key="documentId"
                  handle=".drag-handle"
                  :group="hasCategories ? 'list-checked' : undefined"
                  :animation="120"
                  ghost-class="list-drag-ghost"
                  chosen-class="list-drag-chosen"
                  drag-class="list-drag-dragging"
                  class="space-y-2 list-draggable min-h-[12px]"
                  :class="{
                    'list-draggable--empty': hasCategories && group.items.length === 0,
                  }"
                  @end="handleReorderEnd"
                >
                  <template #item="{ element }">
                    <ListItemCard
                      :item="element"
                      @updated="handleItemUpdated"
                      @deleted="handleItemDeleted"
                      @edit="openEditDrawer"
                    />
                  </template>
                </draggable>
              </div>
            </div>
          </template>
          </div>
        </template>
      </div>
    </UContainer>

    <button
      v-if="list"
      type="button"
      class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
      style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
      aria-label="Ajouter un élément"
      @click="isAddModalOpen = true"
    >
      <UIcon
        name="i-ion-add"
        class="w-6 h-6 text-white"
      />
    </button>

    <AddListItemModal
      :model-value="isAddModalOpen"
      :list-document-id="String(route.params.documentId || '')"
      :existing-items="allItems"
      :categories="listCategories"
      @update:model-value="(v) => { if (!v) isAddModalOpen = false }"
      @success="handleAddSuccess"
      @categories-changed="handleCategoriesChanged"
    />

    <EditListItemDrawer
      :model-value="isEditDrawerOpen"
      :list-document-id="String(route.params.documentId || '')"
      :item="editingItem"
      :categories="listCategories"
      @update:model-value="(v) => { isEditDrawerOpen = v; if (!v) editingItem = null }"
      @success="handleItemUpdated"
      @categories-changed="handleCategoriesChanged"
    />

    <ManageListCategoriesDrawer
      :model-value="isCategoriesDrawerOpen"
      :list-document-id="String(route.params.documentId || '')"
      :categories="listCategories"
      @update:model-value="(v) => { isCategoriesDrawerOpen = v }"
      @changed="handleCategoriesChanged"
    />

    <!-- Drawer Modifier les accès -->
    <UDrawer
      :open="isAccessDrawerOpen"
      direction="bottom"
      @update:open="(v) => { isAccessDrawerOpen = v }"
    >
      <template #content>
        <div
          class="relative flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Qui peut voir et modifier cette liste ?
            </h2>
          </div>

          <form
            id="edit-access-form"
            class="flex flex-col flex-1 min-h-0"
            @submit.prevent="handleSaveAccess"
          >
            <div
              class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 overscroll-contain px-4 py-4 sm:p-4"
              style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
            >
              <div class="space-y-3">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Sélectionnez les membres qui peuvent voir et modifier cette liste
                </p>
                <div class="space-y-2">
                  <label
                      v-for="member in familyMembers"
                      :key="member.id"
                      class="flex items-center gap-3 p-4 rounded-xl border-2 min-h-[52px] transition-all"
                      :class="[
                        selectedMemberIds.includes(member.id)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600',
                        member.id === currentMember?.id ? 'cursor-default' : 'cursor-pointer'
                      ]"
                    >
                      <input
                        v-model="selectedMemberIds"
                        type="checkbox"
                        :value="member.id"
                        :disabled="member.id === currentMember?.id"
                        class="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                      <span class="text-base font-medium text-gray-900 dark:text-gray-100">
                        {{ member.username || `Membre ${member.id}` }}
                        <span v-if="member.id === currentMember?.id" class="text-xs text-gray-500 dark:text-gray-400">(vous)</span>
                      </span>
                    </label>
                </div>
                <p
                  v-if="selectedMemberIds.length === 0"
                  class="text-sm text-amber-600 dark:text-amber-400"
                >
                  Sélectionnez au moins un membre
                </p>
              </div>
              <p
                v-if="accessError"
                class="text-sm text-red-600 dark:text-red-400"
              >
                {{ accessError }}
              </p>
            </div>

            <div
              class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
              style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
            >
              <UButton
                type="submit"
                form="edit-access-form"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :loading="savingAccess"
                :disabled="selectedMemberIds.length === 0 || savingAccess"
              >
                Enregistrer
              </UButton>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                block
                class="min-h-[48px]"
                :disabled="savingAccess"
                @click="isAccessDrawerOpen = false"
              >
                Annuler
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UDrawer>

    <!-- Drawer Renommer la liste -->
    <UDrawer
      :open="isRenameDrawerOpen"
      direction="bottom"
      @update:open="(v) => { isRenameDrawerOpen = v }"
    >
      <template #content>
        <div
          class="relative flex flex-col max-h-[50dvh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Renommer la liste
            </h2>
          </div>
          <form
            class="flex flex-col flex-1 min-h-0 p-4"
            @submit.prevent="handleRename"
          >
            <label
              for="rename-list-name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nom de la liste
            </label>
            <input
              id="rename-list-name"
              v-model="renameName"
              type="text"
              autocomplete="off"
              placeholder="Ex. Courses, Vacances…"
              :disabled="savingRename"
              class="flex-1 min-h-[44px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p
              v-if="renameError"
              class="mt-2 text-sm text-red-500"
            >
              {{ renameError }}
            </p>
            <div class="flex gap-3 mt-4">
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                class="flex-1"
                :disabled="savingRename"
                @click="isRenameDrawerOpen = false"
              >
                Annuler
              </UButton>
              <UButton
                type="submit"
                color="primary"
                class="flex-1"
                :loading="savingRename"
                :disabled="!renameName.trim()"
              >
                Enregistrer
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UDrawer>

    <!-- Modal confirmation suppression -->
    <UModal
      :open="isDeleteModalOpen"
      :ui="{ width: 'max-w-sm' }"
      @update:open="(v) => { isDeleteModalOpen = v; if (!v) deleteError = null }"
    >
      <template #content>
        <div class="p-4 sm:p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Supprimer cette liste ?
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Tous les éléments seront supprimés. Cette action est irréversible.
          </p>
          <p
            v-if="deleteError"
            class="text-sm text-red-500 mb-4"
          >
            {{ deleteError }}
          </p>
          <div class="flex gap-3 justify-end">
            <UButton
              color="neutral"
              variant="ghost"
              :disabled="deleting"
              @click="isDeleteModalOpen = false"
            >
              Annuler
            </UButton>
            <UButton
              color="error"
              :loading="deleting"
              @click="handleDeleteList"
            >
              Supprimer
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ListItem, ListCategory } from '~/composables/useLists'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useFamilyStore } from '~/stores/family'
import { useLists, type List } from '~/composables/useLists'
import ListItemCard from '~/components/listes/ListItemCard.vue'
import AddListItemModal from '~/components/listes/AddListItemModal.vue'
import EditListItemDrawer from '~/components/listes/EditListItemDrawer.vue'
import ManageListCategoriesDrawer from '~/components/listes/ManageListCategoriesDrawer.vue'

interface ItemGroup {
  key: string
  label: string
  categoryDocumentId: string | null
  items: ListItem[]
}

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const { fetchList, updateList, deleteList, reorderListItems, updateListItem } = useLists()
const memberStore = useMemberStore()
const familyStore = useFamilyStore()
const { currentMember } = storeToRefs(memberStore)

const familyMembers = computed(() => familyStore.familyMembers || [])

const loading = ref(false)
const error = ref<string | null>(null)
const list = ref<List | null>(null)
const isAddModalOpen = ref(false)
const isEditDrawerOpen = ref(false)
const editingItem = ref<ListItem | null>(null)
const isCategoriesDrawerOpen = ref(false)
const isAccessDrawerOpen = ref(false)
const selectedMemberIds = ref<number[]>([])
const savingAccess = ref(false)
const accessError = ref<string | null>(null)

const isRenameDrawerOpen = ref(false)
const renameName = ref('')
const renameError = ref<string | null>(null)
const savingRename = ref(false)

const isDeleteModalOpen = ref(false)
const deleting = ref(false)
const deleteError = ref<string | null>(null)

const documentId = computed(() => route.params.documentId as string)

const currentMemberId = computed(() => currentMember.value?.id ?? null)

const allItems = computed(() => list.value?.items ?? [])

const listCategories = computed(() => {
  const categories = list.value?.categories ?? []
  return [...categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
})

const hasCategories = computed(() => listCategories.value.length > 0)

const uncheckedGroups = ref<ItemGroup[]>([])
const checkedGroups = ref<ItemGroup[]>([])

const uncheckedCount = computed(() =>
  uncheckedGroups.value.reduce((sum, group) => sum + group.items.length, 0)
)
const checkedCount = computed(() =>
  checkedGroups.value.reduce((sum, group) => sum + group.items.length, 0)
)

function getCategoryDocumentId(item: ListItem): string | null {
  return item.category?.documentId ?? null
}

function buildItemGroups(items: ListItem[], categories: ListCategory[]): ItemGroup[] {
  if (categories.length === 0) {
    return items.length > 0
      ? [{ key: '__flat__', label: '', categoryDocumentId: null, items: [...items] }]
      : []
  }

  const groups: ItemGroup[] = categories.map((category) => ({
    key: category.documentId,
    label: category.name,
    categoryDocumentId: category.documentId,
    items: items.filter((item) => getCategoryDocumentId(item) === category.documentId),
  }))

  groups.push({
    key: '__none__',
    label: 'Sans catégorie',
    categoryDocumentId: null,
    items: items.filter((item) => !getCategoryDocumentId(item)),
  })

  return groups
}

function syncListsFromList() {
  const categories = listCategories.value
  const items = list.value?.items ?? []
  const unchecked = items.filter((item) => !item.is_checked)
  const checked = items.filter((item) => item.is_checked)
  uncheckedGroups.value = buildItemGroups(unchecked, categories)
  checkedGroups.value = buildItemGroups(checked, categories)
}

watch(
  () => [list.value?.items, list.value?.categories],
  () => {
    syncListsFromList()
  },
  { immediate: true, deep: true }
)

const reordering = ref(false)

async function persistCategoryChanges() {
  const updates: Promise<void>[] = []

  for (const group of [...uncheckedGroups.value, ...checkedGroups.value]) {
    for (const item of group.items) {
      const currentCatId = getCategoryDocumentId(item)
      const targetCatId = group.categoryDocumentId
      if (currentCatId === targetCatId) continue

      updates.push(
        (async () => {
          const result = await updateListItem(item.documentId, undefined, targetCatId)
          if (result.success && result.data) {
            item.category = result.data.category ?? null
          } else {
            throw new Error(result.error ?? 'Erreur lors du changement de catégorie')
          }
        })()
      )
    }
  }

  await Promise.all(updates)
}

async function handleReorderEnd() {
  if (!list.value || reordering.value) return

  reordering.value = true
  try {
    if (hasCategories.value) {
      await persistCategoryChanges()
    }

    const ordered = [
      ...uncheckedGroups.value.flatMap((group) => group.items),
      ...checkedGroups.value.flatMap((group) => group.items),
    ]
    const orderedDocumentIds = ordered.map((item) => item.documentId)
    const result = await reorderListItems(
      list.value.documentId,
      orderedDocumentIds,
      currentMember.value?.id ?? null
    )
    if (result.success) {
      list.value.items = ordered.map((item) => ({ ...item }))
    } else {
      syncListsFromList()
    }
  } catch (err) {
    console.error('Erreur handleReorderEnd:', err)
    syncListsFromList()
  } finally {
    reordering.value = false
  }
}

function listAccessLabel(list: List) {
  const allowed = list.allowed_members ?? []
  const count = Array.isArray(allowed) ? allowed.length : 0
  if (count === 0) return 'Toute la famille'
  return count === 1 ? '1 membre' : `${count} membres`
}

async function loadList() {
  const id = documentId.value
  if (!id) return
  loading.value = true
  error.value = null
  try {
    const memberId = currentMember.value?.id ?? null
    const result = await fetchList(id, memberId)
    if (result.success && result.data) {
      list.value = result.data
      syncListsFromList()
    } else {
      error.value = result.error ?? 'Liste non trouvée'
      list.value = null
      // Rediriger vers la liste des listes si pas d'accès (ex. changement de membre)
      await router.push('/listes')
    }
  } catch (err) {
    console.error('Erreur loadList:', err)
    error.value = 'Une erreur est survenue'
    list.value = null
    await router.push('/listes')
  } finally {
    loading.value = false
  }
}

function handleItemUpdated(updatedItem: ListItem) {
  if (!list.value?.items) return
  const index = list.value.items.findIndex((item) => item.documentId === updatedItem.documentId)
  if (index !== -1) {
    list.value.items[index] = updatedItem
  }
  syncListsFromList()
}

function openEditDrawer(item: ListItem) {
  editingItem.value = item
  isEditDrawerOpen.value = true
}

function handleItemDeleted(itemId: string) {
  if (!list.value?.items) return
  list.value.items = list.value.items.filter((item) => item.documentId !== itemId)
  syncListsFromList()
}

function handleAddSuccess() {
  loadList()
}

function handleCategoriesChanged() {
  loadList()
}

function openAccessDrawer() {
  if (!list.value) return
  const allowed = list.value.allowed_members ?? []
  const ids = Array.isArray(allowed)
    ? allowed.map((m) => (typeof m === 'object' && m && 'id' in m ? (m as { id: number }).id : Number(m)))
    : []
  if (ids.length === 0) {
    selectedMemberIds.value = familyMembers.value.map((m) => m.id)
  } else {
    selectedMemberIds.value = [...ids]
  }
  accessError.value = null
  isAccessDrawerOpen.value = true
}

function openRenameDrawer() {
  if (!list.value) return
  renameName.value = list.value.name
  renameError.value = null
  isRenameDrawerOpen.value = true
}

async function handleRename() {
  if (!list.value || savingRename.value || !renameName.value.trim()) return
  savingRename.value = true
  renameError.value = null
  try {
    const result = await updateList(list.value.documentId, renameName.value.trim())
    if (result.success && result.data) {
      list.value = result.data
      isRenameDrawerOpen.value = false
    } else {
      renameError.value = result.error ?? 'Erreur lors de l\'enregistrement'
    }
  } finally {
    savingRename.value = false
  }
}

async function handleDeleteList() {
  if (!list.value || deleting.value) return
  deleting.value = true
  try {
    const result = await deleteList(list.value.documentId, currentMember.value?.id ?? null)
    if (result.success) {
      isDeleteModalOpen.value = false
      await router.push('/listes')
    } else {
      deleteError.value = result.error ?? 'Erreur lors de la suppression'
    }
  } finally {
    deleting.value = false
  }
}

function getAllowedMemberIdsForUpdate(): number[] {
  const ids = [...new Set(selectedMemberIds.value)]
  const allIds = familyMembers.value.map((m) => m.id).sort().join(',')
  const selectedSorted = [...ids].sort().join(',')
  if (allIds === selectedSorted) return [] // tous = toute la famille (backend)
  return ids
}

async function handleSaveAccess() {
  if (!list.value || savingAccess.value) return
  if (selectedMemberIds.value.length === 0) {
    accessError.value = 'Sélectionnez au moins un membre'
    return
  }
  savingAccess.value = true
  accessError.value = null
  try {
    const allowedMemberIds = getAllowedMemberIdsForUpdate()
    const result = await updateList(list.value.documentId, list.value.name, allowedMemberIds)
    if (result.success && result.data) {
      list.value = result.data
      isAccessDrawerOpen.value = false
    } else {
      accessError.value = result.error ?? 'Erreur lors de l\'enregistrement'
    }
  } finally {
    savingAccess.value = false
  }
}

watch(documentId, () => loadList(), { immediate: true })

// Recharger quand le membre connecté change (ne plus afficher une liste sans droit)
watch(currentMemberId, (newId, oldId) => {
  if (oldId !== undefined && newId !== oldId) {
    loadList()
  }
})
</script>

<style scoped>
/* Animation pendant le drag : style très sobre et fluide */
.list-draggable :deep(.list-drag-ghost) {
  opacity: 0.5;
  background: rgb(148 163 184 / 0.12); /* slate-400 */
  border-radius: 0.75rem;
  transition: opacity 0.12s ease-out, background 0.12s ease-out;
}

.list-draggable :deep(.list-drag-chosen) {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18); /* slate-900 */
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
}

.list-draggable :deep(.list-drag-dragging) {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
  cursor: grabbing;
  transition: box-shadow 0.1s ease-out;
}

.list-draggable--empty {
  min-height: 44px;
  border: 2px dashed rgb(229 231 235);
  border-radius: 0.75rem;
  padding: 0.25rem;
}

.dark .list-draggable--empty {
  border-color: rgb(55 65 81);
}
</style>

<style>
/* Styles globaux pour le clone de drag (parfois attaché au body par Sortable) */
.list-drag-ghost {
  opacity: 0.5;
  border-radius: 0.75rem;
  transition: opacity 0.12s ease-out;
}
.list-drag-chosen {
  transition: transform 0.12s ease-out, box-shadow 0.12s ease-out;
}
.list-drag-dragging {
  opacity: 1;
  transform: translateY(0);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.22);
  cursor: grabbing;
  transition: box-shadow 0.1s ease-out;
}
</style>
