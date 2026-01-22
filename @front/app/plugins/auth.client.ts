export default defineNuxtPlugin(() => {
  // S'assurer qu'on est côté client
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  
  // Charger le token depuis le localStorage au démarrage de l'application
  // Ce plugin s'exécute avant les middlewares, garantissant que le token est disponible
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')

    if (token && userStr) {
      // Mettre à jour le store directement
      authStore.token = token
      try {
        authStore.user = JSON.parse(userStr)
        
        // Charger aussi les informations de famille
        const familyStore = useFamilyStore()
        familyStore.loadFamily()
      } catch (e) {
        console.error('Erreur lors du parsing de l\'utilisateur:', e)
        authStore.clearToken()
      }
    }
  }
})
