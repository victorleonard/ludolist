<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showUpdatePrompt = ref(false)

onMounted(() => {
  if ('serviceWorker' in navigator) {
    // Écouter les mises à jour du service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      showUpdatePrompt.value = true
    })

    // Vérifier périodiquement les mises à jour
    setInterval(() => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update()
      })
    }, 60000) // Toutes les minutes
  }
})

function updateApp() {
  window.location.reload()
}

function dismissUpdate() {
  showUpdatePrompt.value = false
}
</script>

<template>
  <div
    v-if="showUpdatePrompt"
    class="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-blue-200 bg-white p-4 shadow-lg dark:border-blue-800 dark:bg-gray-900 md:left-auto md:right-4 md:w-96"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
          <svg
            class="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
      </div>
      
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          Mise à jour disponible
        </h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Une nouvelle version de TribuList est disponible
        </p>
        
        <div class="mt-4 flex gap-2">
          <button
            @click="updateApp"
            class="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Mettre à jour
          </button>
          <button
            @click="dismissUpdate"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
