<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  to?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  to: '/',
  class: ''
})

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl'
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[
      'font-bold flex items-center gap-0.5 text-blue-500 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors',
      sizeClasses[size],
      props.class
    ]"
    style="font-family: 'Audiowide', cursive;"
  >
    Lud<UIcon
      name="i-lucide-dice-6"
      :class="['-mx-0.5 rotate-12', iconSizes[size]]"
    />List
  </NuxtLink>
</template>
