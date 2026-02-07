<template>
  <div>
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div>
        <div class="mt-4 sm:mt-6">
          <div class="mb-6 sm:mb-8">
            <div class="mb-4 sm:mb-6">
              <h1 class="text-xl sm:text-2xl font-bold">
                Liste de courses
              </h1>
            </div>
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
            v-else-if="shoppingList !== null && allItems.length === 0"
            class="flex flex-col items-center justify-center py-12"
          >
            <UIcon
              name="i-ion-cart"
              class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Votre liste de courses est vide
            </p>
          </div>

          <template v-else>
            <!-- Section "À acheter" -->
            <div
              v-if="uncheckedItems.length > 0"
              class="mb-6"
            >
              <div class="flex items-center gap-2 mb-4">
                <UIcon
                  name="i-ion-list"
                  class="w-5 h-5 text-primary-500"
                />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  À acheter ({{ uncheckedItems.length }})
                </h2>
              </div>
              <div class="space-y-2">
                <GroceryItemCard
                  v-for="item in uncheckedItems"
                  :key="item.documentId"
                  :item="item"
                  @updated="handleItemUpdated"
                  @deleted="handleItemDeleted"
                />
              </div>
            </div>

            <!-- Section "Achetés" -->
            <div
              v-if="checkedItems.length > 0"
              class="mb-6"
            >
              <div class="flex items-center gap-2 mb-4">
                <UIcon
                  name="i-ion-checkmark-circle"
                  class="w-5 h-5 text-green-500"
                />
                <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Achetés ({{ checkedItems.length }})
                </h2>
              </div>
              <div class="space-y-2">
                <GroceryItemCard
                  v-for="item in checkedItems"
                  :key="item.documentId"
                  :item="item"
                  @updated="handleItemUpdated"
                  @deleted="handleItemDeleted"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </UContainer>

    <!-- Bouton flottant pour ajouter un produit -->
    <button
      type="button"
      class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
      style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
      aria-label="Ajouter un produit"
      @click="openModal"
    >
      <UIcon
        name="i-ion-add"
        class="w-6 h-6 text-white"
      />
    </button>

    <AddGroceryItemModal
      :model-value="isModalOpen"
      :existing-items="allItems"
      @update:model-value="(v) => { if (!v) closeModal() }"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useShoppingList, type GroceryItem } from '~/composables/useShoppingList'
import AddGroceryItemModal from '~/components/courses/AddGroceryItemModal.vue'
import GroceryItemCard from '~/components/courses/GroceryItemCard.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { fetchShoppingList } = useShoppingList()

const loading = ref(false)
const error = ref<string | null>(null)
const shoppingList = ref<{ items?: GroceryItem[] } | null>(null)
const isModalOpen = ref(false)

const allItems = computed(() => {
  return shoppingList.value?.items || []
})

const uncheckedItems = computed(() => {
  return allItems.value.filter((item) => !item.is_checked)
})

const checkedItems = computed(() => {
  return allItems.value.filter((item) => item.is_checked)
})

const loadShoppingList = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await fetchShoppingList()

    if (result.success && result.data) {
      shoppingList.value = result.data
    } else {
      error.value = result.error || 'Erreur lors du chargement de la liste'
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadShoppingList()
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleModalSuccess = () => {
  // Recharger la liste après ajout
  loadShoppingList()
}

const handleItemUpdated = (updatedItem: GroceryItem) => {
  // Mettre à jour l'item dans la liste locale
  if (shoppingList.value?.items) {
    const index = shoppingList.value.items.findIndex(
      (item) => item.documentId === updatedItem.documentId
    )
    if (index !== -1) {
      shoppingList.value.items[index] = updatedItem
    }
  }
}

const handleItemDeleted = (itemId: string) => {
  // Supprimer l'item de la liste locale
  if (shoppingList.value?.items) {
    shoppingList.value.items = shoppingList.value.items.filter(
      (item) => item.documentId !== itemId
    )
  }
}

onMounted(() => {
  loadShoppingList()
})
</script>
