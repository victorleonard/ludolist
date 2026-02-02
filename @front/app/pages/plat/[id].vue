<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="py-4 sm:py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12"
      >
        <p class="text-red-500 mb-4">
          {{ error }}
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/plats')"
        >
          Retour à la liste
        </UButton>
      </div>

      <!-- Plat non trouvé -->
      <div
        v-else-if="!dish"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Plat non trouvé
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Ce plat n'existe pas ou n'est plus disponible.
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/plats')"
        >
          Retour à la liste
        </UButton>
      </div>

      <!-- Détails du plat -->
      <div
        v-else
        class="space-y-6"
      >
        <h1 class="text-xl sm:text-2xl font-bold break-words min-w-0 mb-3 sm:mb-4">
          {{ dish.name }}
        </h1>

        <UTabs
          v-model="activeTab"
          :items="tabs"
          variant="link"
          class="w-full"
        >
          <template #detail>
            <div class="space-y-6 py-6">
              <UCard class="bg-white dark:bg-gray-800">
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">Détails</span>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-edit"
                      size="sm"
                      @click="openEditModal"
                    />
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
                        name="i-lucide-utensils-cross"
                        class="w-16 h-16 mb-2"
                      />
                      <span class="text-xs text-center">Aucune image</span>
                    </div>
                  </div>
                  <div
                    v-if="averageRating > 0"
                    class="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                  >
                    <StarRating
                      :model-value="averageRating"
                      :max="10"
                      size="sm"
                      readonly
                    />
                    <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {{ averageRating.toFixed(1) }} / 10
                    </span>
                  </div>
                  <div
                    v-if="dish.description"
                    class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap"
                  >
                    {{ dish.description }}
                  </div>
                </div>
              </UCard>
            </div>
          </template>

          <template #notes>
            <MemberRatingsTab
              :members="familyMembers"
              :get-member-rating="getMemberRating"
              :set-member-rating="setMemberRating"
              :average-rating="averageRating"
              :max-stars="10"
            />
          </template>
        </UTabs>
      </div>
    </div>

    <AddPlatModal
      :model-value="isModalOpen"
      :dish="selectedDish ?? dish"
      @update:model-value="(v) => { if (!v) closeModal() }"
      @success="handleDishUpdated"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFamilyStore, type DishRating, type TransformedDish } from '~/stores/family'
import { useAddPlatModal } from '~/composables/useAddPlatModal'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const familyStore = useFamilyStore()

const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref('0')

const { isOpen: isModalOpen, selectedDish, openModal, closeModal } = useAddPlatModal()

const tabs = [
  {
    label: 'Détail',
    icon: 'i-lucide-info',
    slot: 'detail',
  },
  {
    label: 'Notes',
    icon: 'i-lucide-star',
    slot: 'notes',
  },
]

const routeId = computed(() => route.params.id as string)

const dish = computed(() => {
  const id = routeId.value
  if (!id) return null
  const dishes = familyStore.transformedDishes
  const byId = dishes.find((d) => d.id === Number(id) || String(d.id) === id)
  if (byId) return byId
  return dishes.find((d) => d.documentId === id) || null
})

const dishIdentifier = computed(
  () => dish.value?.documentId ?? dish.value?.id ?? null,
)

const familyMembers = computed(() => familyStore.familyMembers)

onMounted(async () => {
  try {
    loading.value = true
    await familyStore.fetchFamily()
    if (!dish.value) {
      error.value = 'Plat non trouvé'
    }
  } catch (err) {
    console.error('Erreur lors du chargement du plat:', err)
    error.value = 'Erreur lors du chargement du plat'
  } finally {
    loading.value = false
  }
})

const openEditModal = () => {
  if (dish.value) {
    openModal(dish.value)
  }
}

const handleDishUpdated = async () => {
  await familyStore.fetchFamily()
  closeModal()
}

const getMemberRating = (memberId: number): number => {
  if (!dish.value?.ratings) return 0
  const memberRating = dish.value.ratings.find((r: DishRating) => r.member.id === memberId)
  return memberRating ? memberRating.rating : 0
}

const setMemberRating = async (memberId: number, rating: number) => {
  if (!dishIdentifier.value) return
  try {
    const result = await familyStore.setDishRating(
      dishIdentifier.value,
      memberId,
      rating,
    )
    if (!result.success) {
      console.error('Erreur lors de l\'enregistrement de la note:', result.error)
      error.value = result.error || 'Erreur lors de l\'enregistrement de la note'
    }
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la note:', err)
    error.value = 'Erreur lors de l\'enregistrement de la note'
  }
}

const averageRating = computed(() => {
  if (!dish.value?.ratings || dish.value.ratings.length === 0) return 0
  const ratings = dish.value.ratings.filter((r: DishRating) => r.rating > 0)
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc: number, r: DishRating) => acc + r.rating, 0)
  return sum / ratings.length
})
</script>
