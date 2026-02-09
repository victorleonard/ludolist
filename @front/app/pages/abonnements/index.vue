<template>
  <div>
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div>
        <div class="mt-4 sm:mt-6">
          <div class="mb-6 sm:mb-8">
            <div class="mb-4 sm:mb-6">
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">
                Abonnements
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
            v-else-if="subscriptions.length === 0"
            class="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20"
          >
            <UIcon
              name="i-ion-card-outline"
              class="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400 mb-4 text-center">
              Aucun abonnement pour l'instant
            </p>
            <UButton
              color="primary"
              @click="openModal"
            >
              Créer votre premier abonnement
            </UButton>
          </div>

          <template v-else>
            <div class="mb-6 sm:mb-8 lg:mb-10">
              <div class="flex items-center justify-end mb-4 sm:mb-5">
                <span class="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-400">
                  Total : {{ totalFormatted }}
                </span>
              </div>

              <!-- Mobile : liste verticale -->
              <div class="md:hidden space-y-3">
                <SubscriptionCard
                  v-for="sub in subscriptions"
                  :key="sub.documentId"
                  :subscription="sub"
                  @click="handleCardClick"
                />
              </div>

              <!-- Tablette : grille 2 colonnes -->
              <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <SubscriptionCard
                  v-for="sub in subscriptions"
                  :key="sub.documentId"
                  :subscription="sub"
                  @click="handleCardClick"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </UContainer>

    <button
      type="button"
      class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
      style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
      aria-label="Ajouter un abonnement"
      @click="openModal"
    >
      <UIcon
        name="i-ion-add"
        class="w-6 h-6 text-white"
      />
    </button>

    <AddSubscriptionModal
      :model-value="isModalOpen"
      :subscription="selectedSubscription"
      @update:model-value="(v) => { if (!v) closeModal() }"
      @success="handleModalSuccess"
      @deleted="handleDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSubscriptions, type Subscription } from '~/composables/useSubscriptions'
import SubscriptionCard from '~/components/abonnements/SubscriptionCard.vue'
import AddSubscriptionModal from '~/components/abonnements/AddSubscriptionModal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { fetchSubscriptions } = useSubscriptions()

const totalFormatted = computed(() => {
  const sum = subscriptions.value.reduce((acc, sub) => {
    const a = sub.amount
    if (a == null || a === '') return acc
    const n = typeof a === 'string' ? parseFloat(a) : Number(a)
    return acc + (Number.isNaN(n) ? 0 : n)
  }, 0)
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(sum)
})

const loading = ref(false)
const error = ref<string | null>(null)
const subscriptions = ref<Subscription[]>([])
const isModalOpen = ref(false)
const selectedSubscription = ref<Subscription | null>(null)

async function loadSubscriptions() {
  loading.value = true
  error.value = null

  try {
    const result = await fetchSubscriptions()

    if (result.success && result.data) {
      subscriptions.value = result.data
    } else {
      error.value = result.error || 'Erreur lors du chargement des abonnements'
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

function refresh() {
  loadSubscriptions()
}

function openModal() {
  selectedSubscription.value = null
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedSubscription.value = null
}

function handleModalSuccess() {
  loadSubscriptions()
}

function handleDeleted(documentId: string) {
  subscriptions.value = subscriptions.value.filter(
    (s) => s.documentId !== documentId
  )
}

function handleCardClick(sub: Subscription) {
  selectedSubscription.value = sub
  isModalOpen.value = true
}

onMounted(() => {
  loadSubscriptions()
})
</script>
