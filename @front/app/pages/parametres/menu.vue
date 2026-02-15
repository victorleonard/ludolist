<template>
  <div class="min-h-screen pb-24">
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-2xl">
      <div class="pt-6 pb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <UIcon name="i-ion-chevron-back" class="w-4 h-4" />
          Retour
        </NuxtLink>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Menu du bas
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-8">
          Choisissez les 5 icônes affichées dans la barre de navigation. Les autres seront accessibles via …
        </p>

        <!-- Barre du bas (5 emplacements) -->
        <section class="mb-8">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Dans la barre (5 max)
          </h2>
          <div class="space-y-2">
            <div
              v-for="(item, index) in orderedMainItems"
              :key="item.id"
              class="flex items-center gap-3 p-4 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
            >
              <div class="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  class="p-2 -m-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                  :disabled="index === 0"
                  aria-label="Monter"
                  @click="moveUp(index)"
                >
                  <UIcon name="i-ion-chevron-up" class="w-5 h-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  class="p-2 -m-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                  :disabled="index === orderedMainItems.length - 1"
                  aria-label="Descendre"
                  @click="moveDown(index)"
                >
                  <UIcon name="i-ion-chevron-down" class="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0"
                >
                  <UIcon :name="item.icon" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span class="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ item.label }}
                </span>
              </div>
              <button
                type="button"
                class="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 touch-manipulation"
                aria-label="Retirer de la barre"
                @click="moveToMore(item.id)"
              >
                <UIcon name="i-ion-remove-circle-outline" class="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        <!-- Menu ... -->
        <section class="mb-8">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Dans le menu …
          </h2>
          <div
            v-if="orderedMoreItems.length === 0"
            class="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400 text-sm"
          >
            Tous les onglets sont dans la barre
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <button
              v-for="item in orderedMoreItems"
              :key="item.id"
              type="button"
              class="flex items-center gap-3 w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 active:scale-[0.98] transition-all text-left touch-manipulation"
              :disabled="orderedMainItems.length >= 5"
              @click="moveToMain(item.id)"
            >
              <div
                class="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0"
              >
                <UIcon :name="item.icon" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <span class="font-medium text-gray-700 dark:text-gray-300 flex-1">
                {{ item.label }}
              </span>
              <UIcon
                v-if="orderedMainItems.length < 5"
                name="i-ion-add-circle-outline"
                class="w-6 h-6 text-primary-500 shrink-0"
              />
            </button>
          </div>
        </section>

        <UButton
          variant="ghost"
          color="neutral"
          class="w-full"
          @click="reset"
        >
          Réinitialiser
        </UButton>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

definePageMeta({
  layout: 'default'
})

const bottomNavStore = useBottomNavStore()

onMounted(() => {
  bottomNavStore.loadFromStorage()
})

const { mainItems, moreItems } = storeToRefs(bottomNavStore)

const orderedMainItems = mainItems
const orderedMoreItems = moreItems

function moveUp(index: number) {
  if (index <= 0) return
  bottomNavStore.moveInMain(index, index - 1)
}

function moveDown(index: number) {
  if (index >= orderedMainItems.value.length - 1) return
  bottomNavStore.moveInMain(index, index + 1)
}

function moveToMain(itemId: string) {
  if (orderedMainItems.value.length >= 5) return
  bottomNavStore.moveToMain(itemId)
}

function moveToMore(itemId: string) {
  bottomNavStore.moveToMore(itemId)
}

function reset() {
  bottomNavStore.reset()
}
</script>
