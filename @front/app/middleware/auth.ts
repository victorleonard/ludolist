import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Charger le token depuis le localStorage
  authStore.loadToken()

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder à la page de login
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
