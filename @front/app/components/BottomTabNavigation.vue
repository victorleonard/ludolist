<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-lg safe-area-inset-bottom safe-area-x">
    <div class="flex items-center justify-around min-h-[64px] md:min-h-[56px] px-2 w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
      <!-- 5 onglets principaux -->
      <NuxtLink
        v-for="item in mainTabs"
        :key="item.to"
        :to="item.to"
        class="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-1 h-full min-h-[44px] py-1.5 md:py-2 px-2 transition-all duration-200 relative"
        :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        active-class="text-primary-600 dark:text-primary-400"
        @click="handleClick"
      >
        <UIcon
          :name="item.icon"
          class="w-5 h-5 sm:w-[22px] sm:h-[22px] md:w-5 md:h-5 lg:w-6 lg:h-6 transition-transform shrink-0"
          :class="isActive(item.to) ? 'scale-110' : ''"
        />
        <span class="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium leading-tight text-center whitespace-nowrap">{{ item.label }}</span>
      </NuxtLink>

      <!-- Menu ... pour les onglets supplémentaires -->
      <template v-if="moreTabs.length > 0">
        <button
          type="button"
          class="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 flex-1 h-full min-h-[44px] py-1.5 md:py-2 px-2 min-w-0 touch-manipulation"
          :class="isMoreActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
          @click="isMoreDrawerOpen = true"
        >
          <UIcon
            name="i-ion-ellipsis-horizontal"
            class="w-5 h-5 sm:w-[22px] sm:h-[22px] md:w-5 md:h-5 lg:w-6 lg:h-6 shrink-0"
          />
          <span class="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-medium leading-tight text-center whitespace-nowrap">…</span>
        </button>

        <UDrawer
          :open="isMoreDrawerOpen"
          direction="bottom"
          @update:open="(v) => { isMoreDrawerOpen = v }"
        >
          <template #content>
            <div
              class="flex flex-col max-h-[90dvh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
              style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
            >
              <div class="px-4 py-4 sm:px-6 sm:py-5">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Navigation
                  </h2>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    icon="i-ion-close"
                    size="sm"
                    aria-label="Fermer"
                    class="min-w-[40px] min-h-[40px]"
                    @click="isMoreDrawerOpen = false"
                  />
                </div>
                <nav class="flex flex-col gap-2">
                  <NuxtLink
                    v-for="item in moreTabs"
                    :key="item.to"
                    :to="item.to"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors text-left group"
                    :class="isActive(item.to) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'"
                    @click="closeMoreDrawer"
                  >
                    <UIcon
                      :name="item.icon"
                      class="w-6 h-6 shrink-0"
                      :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'"
                    />
                    <span class="font-medium">{{ item.label }}</span>
                    <UIcon
                      name="i-ion-chevron-forward"
                      class="w-5 h-5 ml-auto text-gray-400 dark:text-gray-500"
                    />
                  </NuxtLink>

                  <div class="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                  <NuxtLink
                    to="/parametres/menu"
                    class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors text-left group"
                    :class="route.path === '/parametres/menu' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'"
                    @click="closeMoreDrawer"
                  >
                    <UIcon
                      name="i-ion-reorder-three"
                      class="w-6 h-6 shrink-0 text-gray-500 dark:text-gray-400"
                    />
                    <span class="font-medium">Réorganiser le menu</span>
                    <UIcon
                      name="i-ion-chevron-forward"
                      class="w-5 h-5 ml-auto text-gray-400 dark:text-gray-500"
                    />
                  </NuxtLink>
                </nav>
              </div>
            </div>
          </template>
        </UDrawer>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const route = useRoute()
const bottomNavStore = useBottomNavStore()

onMounted(() => {
  bottomNavStore.loadFromStorage()
})

const { mainItems, moreItems } = storeToRefs(bottomNavStore)

const mainTabs = mainItems
const moreTabs = moreItems

const isMoreDrawerOpen = ref(false)

const isMoreActive = computed(() =>
  moreTabs.value.some(item =>
    item.to === '/' ? route.path === '/' : route.path.startsWith(item.to)
  )
)

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleClick = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeMoreDrawer() {
  isMoreDrawerOpen.value = false
  handleClick()
}
</script>

<style scoped>
/* Support pour safe area sur iOS / encoches */
.safe-area-inset-bottom {
  padding-bottom: max(0.25rem, env(safe-area-inset-bottom, 0px));
}
</style>
