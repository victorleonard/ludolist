<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="star in max"
      :key="star"
      type="button"
      class="transition-transform hover:scale-110 focus:outline-none"
      :class="{ 'cursor-pointer': !readonly }"
      :disabled="readonly"
      @click="setRating(star)"
      @mouseenter="!readonly && (hoverRating = star)"
      @mouseleave="!readonly && (hoverRating = 0)"
    >
      <UIcon
        :name="getStarIcon(star)"
        :class="[getStarClass(star), getSizeClass()]"
        class="transition-colors"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Nombre d'étoiles (5 par défaut pour les jeux, 10 pour les livres). */
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: 'md',
  max: 5
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const hoverRating = ref(0)

const currentRating = computed(() => hoverRating.value || props.modelValue)

const getStarIcon = (star: number) => {
  // Utiliser l'icône star pour toutes les étoiles
  return 'i-ion-star'
}

const getStarClass = (star: number) => {
  if (currentRating.value >= star) {
    // Étoile pleine (sélectionnée) - jaune avec remplissage complet
    return 'text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400'
  }
  // Étoile vide (non sélectionnée) - gris sans remplissage
  return 'text-gray-300 dark:text-gray-600 fill-transparent'
}

const getSizeClass = () => {
  switch (props.size) {
    case 'sm':
      return 'w-4 h-4'
    case 'lg':
      return 'w-8 h-8'
    default:
      return 'w-6 h-6'
  }
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
