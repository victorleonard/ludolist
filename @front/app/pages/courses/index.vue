<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

onMounted(() => {
  navigateTo('/listes', { replace: true })
})
</script>

<template>
  <div class="flex justify-center items-center min-h-[40vh]">
    <UIcon
      name="i-ion-refresh-circle"
      class="w-8 h-8 animate-spin text-primary-500"
    />
  </div>
</template>
