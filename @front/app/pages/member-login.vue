<template>
  <div />
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// La connexion membre se fait désormais dans le drawer (avatar en haut à droite).
// Redirection pour les anciens liens.
await navigateTo('/', { replace: true })
</script>
