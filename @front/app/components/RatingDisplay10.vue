<template>
  <div class="flex flex-col gap-1" @click="handleContainerClick">
    <!-- Étoiles interactives (10 étoiles individuelles) -->
    <div v-if="!readonly" class="flex items-center gap-0.5 flex-nowrap">
      <button
        v-for="star in 10"
        :key="star"
        type="button"
        class="transition-transform hover:scale-110 active:scale-95 focus:outline-none p-0.5 -m-0.5 touch-manipulation shrink-0"
        @click="handleStarClick(star)"
        @mouseenter="!readonly && (hoverRating = star)"
        @mouseleave="!readonly && (hoverRating = 0)"
      >
        <UIcon
          :name="getStarIcon(star)"
          :class="[getStarClass(star), 'w-4 h-4 sm:w-3 sm:h-3']"
          class="transition-colors"
        />
      </button>
    </div>

    <!-- Étoiles en lecture seule (10 étoiles individuelles) -->
    <div v-else class="flex items-center gap-0.5 flex-nowrap">
      <UIcon
        v-for="star in 10"
        :key="star"
        :name="getStarIcon(star)"
        :class="[getStarClass(star), 'w-4 h-4 sm:w-3 sm:h-3 shrink-0']"
      />
    </div>

    <!-- Drawer pour sélection numérique sur mobile -->
    <Teleport to="body">
      <Transition name="drawer">
        <div
          v-if="isDrawerOpen && !readonly"
          class="fixed inset-0 z-50 sm:hidden"
          @click.self="closeDrawer"
        >
          <!-- Overlay -->
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="closeDrawer"
          />
          
          <!-- Drawer content -->
          <div class="drawer-content absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl">
            <!-- Handle bar -->
            <div class="flex justify-center pt-3 pb-2">
              <div class="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
            
            <!-- Title -->
            <div class="px-4 pb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                Sélectionner une note
              </h3>
            </div>
            
            <!-- Current rating display -->
            <div class="px-4 pb-4 flex items-center justify-center gap-2">
              <span class="text-3xl font-bold" :class="getScoreClass()">
                {{ tempRating || modelValue || 0 }}
              </span>
              <span class="text-lg text-gray-500 dark:text-gray-400">
                /10
              </span>
            </div>
            
            <!-- Number pad -->
            <div class="px-4 pb-6">
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="value in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                  :key="value"
                  type="button"
                  class="aspect-square min-h-12 text-lg font-semibold rounded-xl transition-all touch-manipulation"
                  :class="getDrawerButtonClass(value)"
                  @click="selectRating(value)"
                  @touchstart="tempRating = value"
                  @touchend="tempRating = null"
                >
                  {{ value }}
                </button>
              </div>
            </div>
            
            <!-- Action buttons -->
            <div class="px-4 pb-6 pt-2 flex gap-2 border-t border-gray-200 dark:border-gray-700">
              <button
                v-if="modelValue > 0"
                type="button"
                class="flex-1 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors touch-manipulation"
                @click="clearRating"
              >
                Supprimer
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                @click="closeDrawer"
              >
                Annuler
              </button>
            </div>
            
            <!-- Safe area bottom padding -->
            <div class="bg-white dark:bg-gray-800" style="height: env(safe-area-inset-bottom, 0px)" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const hoverRating = ref(0)
const isDrawerOpen = ref(false)
const tempRating = ref<number | null>(null)

const currentRating = computed(() => hoverRating.value || props.modelValue)

// Fonction pour vérifier si on est sur mobile
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 640 // sm breakpoint
}

// Ouvrir le drawer au clic sur une étoile sur mobile
const handleStarClick = (rating: number) => {
  // Toujours ouvrir le drawer sur mobile, sinon comportement normal sur desktop
  if (isMobileDevice()) {
    isDrawerOpen.value = true
  } else {
    // Sur desktop, comportement normal
    setRating(rating)
  }
}

// Gestion du clic sur le conteneur pour ouvrir le drawer sur mobile
const handleContainerClick = (event: MouseEvent) => {
  // Ne pas ouvrir si on clique directement sur un bouton d'étoile
  const target = event.target as HTMLElement
  if (target.closest('button')) {
    return
  }
  
  // Ouvrir le drawer sur mobile si on clique ailleurs dans le composant
  if (!props.readonly && isMobileDevice()) {
    isDrawerOpen.value = true
  }
}

const openDrawer = () => {
  if (!props.readonly) {
    isDrawerOpen.value = true
  }
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  tempRating.value = null
}

// Exposer la méthode pour ouvrir le drawer depuis le parent
defineExpose({
  openDrawer
})

const selectRating = (rating: number) => {
  setRating(rating)
  // Fermer le drawer après un court délai pour feedback visuel
  setTimeout(() => {
    closeDrawer()
  }, 150)
}

const clearRating = () => {
  setRating(0)
  setTimeout(() => {
    closeDrawer()
  }, 150)
}

const getStarClass = (star: number) => {
  if (currentRating.value >= star) {
    return 'text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400'
  }
  return 'text-gray-300 dark:text-gray-600 fill-transparent'
}

const getStarIcon = (star: number) => {
  return 'i-ion-star'
}

const getProgressBarClass = () => {
  const value = props.modelValue
  if (value >= 8) return 'bg-green-500 dark:bg-green-400'
  if (value >= 6) return 'bg-yellow-500 dark:bg-yellow-400'
  if (value >= 4) return 'bg-orange-500 dark:bg-orange-400'
  return 'bg-red-500 dark:bg-red-400'
}

const getScoreClass = () => {
  const value = props.modelValue
  if (value >= 8) return 'text-green-600 dark:text-green-400'
  if (value >= 6) return 'text-yellow-600 dark:text-yellow-400'
  if (value >= 4) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

const formatScore = (value: number): string => {
  // Afficher une décimale si ce n'est pas un entier
  if (value % 1 === 0) {
    return value.toString()
  }
  return value.toFixed(1)
}

const getDrawerButtonClass = (value: number) => {
  const currentValue = tempRating.value ?? props.modelValue
  const isSelected = currentValue === value
  if (isSelected) {
    return 'bg-primary-600 dark:bg-primary-500 text-white shadow-lg scale-105'
  }
  return 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 active:bg-gray-200 dark:active:bg-gray-600 active:scale-95'
}

const setRating = (rating: number) => {
  if (!props.readonly) {
    if (props.modelValue === rating) {
      emit('update:modelValue', 0)
    } else {
      emit('update:modelValue', rating)
    }
  }
}
</script>
