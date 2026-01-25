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
      'font-bold flex items-center gap-0.5',
      sizeClasses[size],
      props.class
    ]"
    style="font-family: 'Audiowide', cursive;"
    class="text-primary-600 dark:text-primary-400"
  >
    <span>Lud</span><UIcon
      name="i-lucide-dice-6"
      :class="['-mx-0.5 rotate-12', iconSizes[size]]"
    /><span>List</span>
  </NuxtLink>
</template>
