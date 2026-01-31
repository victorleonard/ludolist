<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-lg safe-area-inset-bottom safe-area-x">
    <div class="flex items-center justify-around h-14 sm:h-16 px-2 w-full max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
      <NuxtLink
        v-for="item in tabs"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] py-2 transition-all duration-200 relative"
        :class="isActive(item.to) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        active-class="text-primary-600 dark:text-primary-400"
        @click="handleClick"
      >
        <UIcon
          :name="item.icon"
          class="w-6 h-6 sm:w-6 sm:h-6 mb-0.5 sm:mb-1 transition-transform shrink-0"
          :class="isActive(item.to) ? 'scale-110' : ''"
        />
        <span class="text-[10px] sm:text-xs font-medium truncate max-w-full">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const tabs = [
  {
    label: 'Home',
    icon: 'i-lucide-home',
    to: '/'
  },
  {
    label: 'Jeux',
    icon: 'i-lucide-dice-6',
    to: '/jeux'
  },
  {
    label: 'Livres',
    icon: 'i-lucide-book',
    to: '/livres/'
  }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleClick = () => {
  // Scroll to top when navigating
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
/* Support pour safe area sur iOS / encoches */
.safe-area-inset-bottom {
  padding-bottom: max(0.25rem, env(safe-area-inset-bottom, 0px));
}
</style>
