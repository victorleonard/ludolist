<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no' },
    { name: 'theme-color', content: '#16a34a' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'LudoList' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'application-name', content: 'LudoList' },
    { name: 'msapplication-TileColor', content: '#16a34a' },
    { name: 'msapplication-config', content: '/browserconfig.xml' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192x192.png' },
    { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icon-512x512.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
    { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon-152x152.png' },
    { rel: 'apple-touch-icon', sizes: '167x167', href: '/apple-touch-icon-167x167.png' },
    { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'LudoList - Gestion de Jeux de Société'
const description = 'Application complète pour gérer votre collection de jeux de société, organiser des sessions de jeu et suivre vos parties en famille'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/icon-512x512.png',
  ogType: 'website',
  ogLocale: 'fr_FR',
  twitterImage: '/icon-512x512.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
