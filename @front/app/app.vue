<script setup>
const { recherche } = useRecherche()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'LudoList'
const description = 'Gérez votre collection de jeux de société'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="text-xl font-bold text-secondary-600 dark:text-secondary-400"
          style="font-family: 'Audiowide', cursive;"
        >
          LudoList
        </NuxtLink>
      </template>

      <template #right>
        <UInput
          v-model="recherche"
          placeholder="Rechercher un jeu..."
          icon="i-lucide-search"
          size="sm"
          class="w-64 hidden md:block"
        />
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator class="mt-8" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right />
    </UFooter>
  </UApp>
</template>
