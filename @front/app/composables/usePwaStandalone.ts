import { ref, onMounted } from 'vue'

/**
 * Détecte si l'app tourne en PWA installée (standalone).
 * Utile pour adapter l'UX (ex. formulaire plein écran au lieu d'un drawer sur iOS pour le clavier).
 */
export function usePwaStandalone() {
  const isStandalone = ref(false)
  onMounted(() => {
    isStandalone.value =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
  })
  return { isStandalone }
}
