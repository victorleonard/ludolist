<template>
  <div>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div>
      <div class="mt-4 sm:mt-6">
          <div class="mb-6 sm:mb-8">
            <div class="mb-4 sm:mb-6">
              <h1 class="text-xl sm:text-2xl font-bold">
                Ma liste de plats
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
                  <RatingDisplay10
                    :model-value="getAverageRating(dish)"
                    readonly
                  />
                </div>
                <!-- Informations supplémentaires -->
                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-if="dish.category"
                    color="primary"
                    variant="subtle"
                    class="text-xs text-primary-800 dark:text-primary-200"
                  >
                    {{ dish.category }}
                  </UBadge>
                  <UBadge
                    v-if="dish.preparation_time"
                    color="neutral"
                    variant="subtle"
                    class="text-xs flex items-center gap-1 text-gray-800 dark:text-gray-200"
                  >
                    <UIcon
                      name="i-ion-time"
                      class="w-3 h-3"
                    />
                    {{ dish.preparation_time }} min
                  </UBadge>
                  <UBadge
                    v-if="dish.cooking_time"
                    color="neutral"
                    variant="subtle"
                    class="text-xs flex items-center gap-1 text-gray-800 dark:text-gray-200"
                  >
                    <UIcon
                      name="i-ion-flame"
                      class="w-3 h-3"
                    />
                    {{ dish.cooking_time }} min
                  </UBadge>
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
                    <div class="mb-2">
                      <h3 class="text-lg font-semibold break-words">
                        {{ dish.name }}
                      </h3>
                    </div>
                    <div
                      v-if="getAverageRating(dish) > 0"
                      class="flex items-center gap-2 mb-2"
                    >
                      <RatingDisplay10
                        :model-value="getAverageRating(dish)"
                        readonly
                      />
                    </div>
                    <!-- Informations supplémentaires -->
                    <div class="flex flex-wrap gap-2 mb-2">
                      <UBadge
                        v-if="dish.category"
                        color="primary"
                        variant="subtle"
                        size="xs"
                        class="text-primary-800 dark:text-primary-200"
                      >
                        {{ dish.category }}
                      </UBadge>
                      <UBadge
                        v-if="dish.preparation_time"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                        class="flex items-center gap-1 text-gray-800 dark:text-gray-200"
                      >
                        <UIcon
                          name="i-ion-time"
                          class="w-3 h-3"
                        />
                        {{ dish.preparation_time }} min
                      </UBadge>
                      <UBadge
                        v-if="dish.cooking_time"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                        class="flex items-center gap-1 text-gray-800 dark:text-gray-200"
                      >
                        <UIcon
                          name="i-ion-flame"
                          class="w-3 h-3"
                        />
                        {{ dish.cooking_time }} min
                      </UBadge>
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

  <!-- Bouton flottant pour ajouter un plat -->
  <button
    type="button"
    class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
    style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
    aria-label="Ajouter un plat"
    @click="openModal()"
  >
    <UIcon
      name="i-ion-add"
      class="w-6 h-6 text-white"
    />
  </button>

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
