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
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center shrink-0 gap-0.5',
      sizeClasses[size],
      props.class
    ]"
    style="font-family: 'Audiowide', cursive;"
    class="text-violet-500 dark:text-violet-300"
  >
    <span class="shrink-0">TribuList</span>
  </NuxtLink>
</template>
