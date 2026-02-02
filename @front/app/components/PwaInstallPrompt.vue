<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref<any>(null)

onMounted(() => {
  // Écouter l'événement beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher la mini-infobar de s'afficher sur mobile
    e.preventDefault()
    // Stocker l'événement pour pouvoir le déclencher plus tard
    deferredPrompt.value = e
    // Afficher le bouton d'installation
    showInstallPrompt.value = true
  })

  // Vérifier si l'app est déjà installée
  if (window.matchMedia('(display-mode: standalone)').matches) {
    showInstallPrompt.value = false
  }
})

async function installPWA() {
  if (!deferredPrompt.value) {
    return
  }

  // Afficher la boîte de dialogue d'installation
  deferredPrompt.value.prompt()

  // Attendre que l'utilisateur réponde
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    console.log('PWA installée avec succès')
  } else {
    console.log('Installation PWA refusée')
  }

  // Réinitialiser le prompt
  deferredPrompt.value = null
  showInstallPrompt.value = false
}

function dismissPrompt() {
  showInstallPrompt.value = false
}
</script>

<template>
  <div
    v-if="showInstallPrompt"
    class="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-green-200 bg-white p-4 shadow-lg dark:border-green-800 dark:bg-gray-900 md:left-auto md:right-4 md:w-96"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
          <svg
            class="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white">
          Installer TribuList
        </h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Installez l'application pour un accès rapide et une meilleure expérience
        </p>
        
        <div class="mt-4 flex gap-2">
          <button
            @click="installPWA"
            class="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Installer
          </button>
          <button
            @click="dismissPrompt"
            class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
