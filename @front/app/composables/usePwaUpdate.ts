import { ref } from 'vue'

/**
 * Vérifie et applique une mise à jour du service worker PWA.
 */
export function usePwaUpdate() {
  const updating = ref(false)
  const toast = useToast()

  async function updatePwa() {
    if (!import.meta.client || updating.value) return

    updating.value = true
    try {
      if (!('serviceWorker' in navigator)) {
        toast.add({
          title: 'Mise à jour',
          description: 'Les mises à jour PWA ne sont pas disponibles sur ce navigateur.',
          color: 'warning',
        })
        window.location.reload()
        return
      }

      const registration = await navigator.serviceWorker.ready
      await registration.update()

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      toast.add({
        title: 'Mise à jour',
        description: 'Rechargement de l’application…',
        color: 'success',
      })

      // Laisse le toast s’afficher brièvement avant le reload
      await new Promise((resolve) => setTimeout(resolve, 400))
      window.location.reload()
    } catch (error) {
      console.error('Erreur mise à jour PWA:', error)
      toast.add({
        title: 'Mise à jour',
        description: 'Impossible de vérifier la mise à jour. Rechargement…',
        color: 'error',
      })
      window.location.reload()
    } finally {
      updating.value = false
    }
  }

  return {
    updating,
    updatePwa,
  }
}
