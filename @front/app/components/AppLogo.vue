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
      'flex items-center',
      sizeClasses[size],
      props.class
    ]"
    style="font-family: 'Audiowide', cursive;"
    class="text-violet-500 dark:text-violet-300"
  >
    <span>Lud</span>
    <div class="flex items-center justify-center rounded-full bg-violet-500 dark:bg-violet-400 p-1 mx-0.5">
      <UIcon
        name="i-lucide-dice-6"
        :class="['text-white', size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5']"
      />
    </div>
    <span>list</span>
  </NuxtLink>
</template>
