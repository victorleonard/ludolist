<template>
  <div>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div>
      <div class="mt-4 sm:mt-6">
        <div class="mb-6 sm:mb-8">
          <div class="mb-4 sm:mb-6 flex items-center justify-between gap-4">
            <h1 class="text-xl sm:text-2xl font-bold">
              Ma liste de plats
            </h1>
            <UButton
              color="primary"
              icon="i-ion-add"
              size="sm"
              aria-label="Ajouter un plat"
              @click="openModal()"
            >
              Ajouter un plat
            </UButton>
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
            @click="refresh()"
          >
            Réessayer
          </UButton>
        </div>

        <div
          v-else-if="dishes.length === 0"
          class="flex justify-center items-center py-12"
        >
          <p class="text-gray-500 dark:text-gray-400">
            Aucun plat trouvé
          </p>
        </div>

        <template v-else>
          <!-- Vue desktop : grille avec UCard -->
          <div class="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <UCard
              v-for="dish in dishes"
              :key="dish.id"
              class="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
              @click="navigateTo(`/plat/${dish.documentId || dish.id}`)"
            >
              <template #header>
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-xl font-bold break-words min-w-0 flex-1">
                    {{ dish.name }}
                  </h2>
                  <div class="flex items-center gap-2 shrink-0">
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-ion-create-outline"
                      size="sm"
                      class="flex-shrink-0"
                      @click.stop="openEditModal(dish)"
                    />
                  </div>
                </div>
              </template>

              <div class="flex flex-col gap-4">
                <div class="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="dish && dish.image"
                    :src="dish.image"
                    :alt="dish.name || 'Image du plat'"
                    class="w-full h-full object-contain"
                  >
                  <div
                    v-else
                    class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4"
                  >
                    <UIcon
                      name="i-ion-restaurant"
                      class="w-16 h-16 mb-2"
                    />
                    <span class="text-xs text-center">Aucune image</span>
                  </div>
                </div>
                <div
                  v-if="getAverageRating(dish) > 0"
                  class="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                >
                  <StarRating
                    :model-value="getAverageRating(dish)"
                    :max="10"
                    size="sm"
                    readonly
                  />
                </div>
              </div>
            </UCard>
          </div>

          <!-- Vue mobile : liste -->
          <UPageList class="md:hidden space-y-4">
            <UPageCard
              v-for="dish in dishes"
              :key="dish.id"
              variant="ghost"
              class="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
              @click="navigateTo(`/plat/${dish.documentId || dish.id}`)"
            >
              <template #body>
                <div class="flex items-start gap-4 w-full">
                  <div class="w-24 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="dish && dish.image"
                      :src="dish.image"
                      :alt="dish.name || 'Image du plat'"
                      class="w-full h-full object-contain"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2"
                    >
                      <UIcon
                        name="i-ion-restaurant"
                        class="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <div class="flex-1 min-w-0">
                        <h3 class="text-lg font-semibold break-words">
                          {{ dish.name }}
                        </h3>
                      </div>
                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-ion-create-outline"
                        size="xs"
                        :padded="false"
                        class="shrink-0"
                        @click.stop="openEditModal(dish)"
                      />
                    </div>
                    <div
                      v-if="getAverageRating(dish) > 0"
                      class="flex items-center gap-2 mb-2"
                    >
                      <StarRating
                        :model-value="getAverageRating(dish)"
                        :max="10"
                        size="sm"
                        readonly
                      />
                    </div>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageList>
        </template>
      </div>
    </div>
  </UContainer>

  <AddPlatModal
    :model-value="isModalOpen"
    :dish="selectedDish"
    @update:model-value="(v) => { if (!v) closeModal() }"
    @success="handleModalSuccess"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore, type TransformedDish, type DishRating } from '~/stores/family'
import { useAddPlatModal } from '~/composables/useAddPlatModal'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const familyStore = useFamilyStore()
const { isLoading: loading } = storeToRefs(familyStore)

onMounted(async () => {
  await familyStore.fetchFamily()
})

const dishes = computed(() => familyStore.transformedDishes)
const error = ref<string | null>(null)
const refresh = () => familyStore.fetchFamily()

const { isOpen: isModalOpen, selectedDish, openModal, closeModal } = useAddPlatModal()

const openEditModal = (dish: TransformedDish) => {
  openModal(dish)
}

const getAverageRating = (dish: TransformedDish): number => {
  if (!dish.ratings || dish.ratings.length === 0) return 0
  const ratings = dish.ratings.filter((r: DishRating) => r.rating > 0)
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc: number, r: DishRating) => acc + r.rating, 0)
  return sum / ratings.length
}

const handleModalSuccess = () => {
  // Data refreshed via store fetchFamily in modal
}
</script>
