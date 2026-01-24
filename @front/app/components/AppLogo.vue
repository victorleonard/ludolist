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
  >
    <span class="gradient-text">Lud</span><UIcon
      name="i-lucide-dice-6"
      :class="['-mx-0.5 rotate-12 gradient-icon', iconSizes[size]]"
    /><span class="gradient-text">List</span>
  </NuxtLink>
</template>

<style scoped>
.gradient-text {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-icon {
  color: #667eea;
}

/* Support pour le mode sombre */
@media (prefers-color-scheme: dark) {
  .gradient-text {
    background: linear-gradient(
      135deg,
      #818cf8 0%,
      #a78bfa 25%,
      #f472b6 50%,
      #60a5fa 75%,
      #34d399 100%
    );
  }
  
  .gradient-icon {
    color: #818cf8;
  }
}
</style>
