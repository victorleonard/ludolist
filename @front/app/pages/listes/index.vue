<template>
  <div>
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div class="mt-4 sm:mt-6">
        <div class="mb-6 sm:mb-8">
          <h1 class="text-xl sm:text-2xl font-bold">
            Listes
          </h1>
        </div>

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
          v-else-if="error"
          class="flex flex-col items-center justify-center py-12"
        >
          <p class="text-red-500 mb-4">
            {{ error }}
          </p>
          <UButton
            color="primary"
            @click="refresh"
          >
            Réessayer
          </UButton>
        </div>

        <div
          v-else-if="lists.length === 0"
          class="flex flex-col items-center justify-center py-12"
        >
          <UIcon
            name="i-ion-list"
            class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 mb-4">
            Aucune liste. Créez-en une pour commencer.
          </p>
          <UButton
            color="primary"
            @click="openCreateModal"
          >
            Créer une liste
          </UButton>
        </div>

        <div
          v-else
          :key="currentMemberId"
          class="space-y-3"
        >
          <button
            v-for="list in lists"
            :key="list.documentId"
            type="button"
            class="w-full text-left flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all"
            @click="goToList(list)"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-gray-100">
                {{ list.name }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ itemCount(list) }} élément(s)
                <span class="ml-2 text-xs text-primary-600 dark:text-primary-400">
                  · {{ listAccessLabel(list) }}
                </span>
              </p>
            </div>
            <UIcon
              name="i-ion-chevron-forward"
              class="w-5 h-5 text-gray-400 shrink-0"
            />
          </button>
        </div>
      </div>
    </UContainer>

    <button
      type="button"
      class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
      style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
      aria-label="Créer une liste"
      @click="openCreateModal"
    >
      <UIcon
        name="i-ion-add"
        class="w-6 h-6 text-white"
      />
    </button>

    <UDrawer
      :open="isCreateModalOpen"
      direction="bottom"
      @update:open="(v) => { isCreateModalOpen = v }"
    >
      <template #content>
        <div
          class="relative flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <!-- En-tête (même style que AddBookModal) -->
          <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Nouvelle liste
            </h2>
          </div>

          <form
            id="create-list-form"
            class="flex flex-col flex-1 min-h-0"
            @submit.prevent="handleCreateList"
          >
            <!-- Contenu formulaire -->
            <div
              class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 overscroll-contain px-4 py-4 sm:p-4"
              style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
            >
              <label
                for="create-list-name"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom de la liste
              </label>
              <div
                class="relative flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500"
                :class="{ 'border-red-500 dark:border-red-500': !!createListError }"
              >
                <input
                  id="create-list-name"
                  v-model="newListName"
                  type="text"
                  autocomplete="off"
                  placeholder="Ex. Courses, Vacances…"
                  :disabled="creating"
                  class="create-list-input flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none disabled:opacity-50"
                />
              </div>
              <p
                v-if="createListError"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ createListError }}
              </p>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qui peut voir et modifier cette liste ?
              </p>
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
            </div>

            <!-- Footer : Créer / Annuler (même style que AddBookModal) -->
            <div
              class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
              style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
            >
              <UButton
                type="submit"
                form="create-list-form"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :loading="creating"
                :disabled="!newListName.trim() || creating"
              >
                Créer
              </UButton>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                block
                class="min-h-[48px]"
                :disabled="creating"
                @click="isCreateModalOpen = false"
              >
                Annuler
              </UButton>
            </div>
          </form>
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useFamilyStore } from '~/stores/family'
import { useLists, type List } from '~/composables/useLists'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { fetchLists, createList } = useLists()
const memberStore = useMemberStore()
const familyStore = useFamilyStore()
const { currentMember } = storeToRefs(memberStore)

const familyMembers = computed(() => familyStore.familyMembers || [])

const currentMemberId = computed(() => currentMember.value?.id ?? null)

const loading = ref(false)
const error = ref<string | null>(null)
const lists = ref<List[]>([])
const isCreateModalOpen = ref(false)
const newListName = ref('')
const selectedMemberIds = ref<number[]>([])
const creating = ref(false)
const createListError = ref<string | null>(null)

const loadLists = async () => {
  loading.value = true
  error.value = null
  try {
    const memberId = currentMember.value?.id ?? null
    const result = await fetchLists(memberId)
    if (result.success && result.data) {
      lists.value = result.data
    } else {
      error.value = result.error ?? 'Erreur lors du chargement'
    }
  } catch (err) {
    console.error('Erreur loadLists:', err)
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadLists()
}

function itemCount(list: List) {
  return list.items?.length ?? 0
}

function listAccessLabel(list: List) {
  const allowed = list.allowed_members ?? []
  const count = Array.isArray(allowed) ? allowed.length : 0
  if (count === 0) return 'Toute la famille'
  return count === 1 ? '1 membre' : `${count} membres`
}

function goToList(list: List) {
  navigateTo(`/listes/${list.documentId}`)
}

const openCreateModal = () => {
  newListName.value = ''
  const myId = currentMember.value?.id
  selectedMemberIds.value = myId != null ? [myId] : []
  createListError.value = null
  isCreateModalOpen.value = true
}

function getAllowedMemberIdsForCreate(): number[] | undefined {
  const ids = [...new Set(selectedMemberIds.value)]
  if (ids.length === 0) return undefined
  const allIds = familyMembers.value.map((m) => m.id).sort().join(',')
  const selectedSorted = [...ids].sort().join(',')
  if (allIds === selectedSorted) return [] // tous = toute la famille (backend)
  return ids
}

const handleCreateList = async () => {
  if (!newListName.value.trim() || creating.value) return
  if (selectedMemberIds.value.length === 0) {
    createListError.value = 'Sélectionnez au moins un membre'
    return
  }
  creating.value = true
  createListError.value = null
  try {
    const allowedMemberIds = getAllowedMemberIdsForCreate()
    const result = await createList(newListName.value.trim(), allowedMemberIds)
    if (result.success && result.data) {
      isCreateModalOpen.value = false
      await loadLists()
      navigateTo(`/listes/${result.data.documentId}`)
    } else {
      createListError.value = result.error ?? 'Erreur lors de la création'
    }
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadLists()
})

watch(currentMemberId, () => {
  loadLists()
})

</script>

<style scoped>
.create-list-input {
  -webkit-appearance: none;
  appearance: none;
}
</style>
