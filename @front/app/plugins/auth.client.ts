export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  // Charger le token depuis le localStorage au démarrage de l'application
  // Ce plugin s'exécute avant les middlewares, garantissant que le token est disponible
  authStore.loadToken()
})
