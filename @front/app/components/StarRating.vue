<template>
  <div class="flex items-center gap-1">
    <button
      v-for="star in 5"
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
        :class="getStarClass(star)"
        class="w-6 h-6 transition-colors"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

const currentRating = computed(() => hoverRating.value || props.modelValue)

const getStarIcon = (star: number) => {
  return currentRating.value >= star ? 'i-lucide-star' : 'i-lucide-star'
}

const getStarClass = (star: number) => {
  if (currentRating.value >= star) {
    return 'text-yellow-400 fill-yellow-400'
  }
  return 'text-gray-300 dark:text-gray-600'
}

const setRating = (rating: number) => {
  if (!props.readonly) {
    emit('update:modelValue', rating)
  }
}
</script>
