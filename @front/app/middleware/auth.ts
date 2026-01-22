import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  // S'assurer qu'on est côté client
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  
  // Charger le token depuis le localStorage de manière synchrone
  // Cette méthode doit être appelée avant toute vérification
  if (import.meta.client) {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')

    if (token && userStr) {
      // Mettre à jour le store directement pour éviter les problèmes de timing
      authStore.token = token
      try {
        authStore.user = JSON.parse(userStr)
      } catch (e) {
        console.error('Erreur lors du parsing de l\'utilisateur:', e)
        authStore.clearToken()
      }
    } else {
      // Si pas de token, s'assurer que le store est vide
      if (authStore.token) {
        authStore.clearToken()
      }
    }
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder à la page de login
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
