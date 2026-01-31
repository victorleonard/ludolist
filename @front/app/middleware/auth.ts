import { useAuthStore } from '~/stores/auth'
import { useMemberStore } from '~/stores/member'

export default defineNuxtRouteMiddleware((to) => {
  // S'assurer qu'on est côté client
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  const memberStore = useMemberStore()
  
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

    // Charger le membre depuis le localStorage
    const memberStr = localStorage.getItem('auth_member')
    if (memberStr) {
      try {
        memberStore.currentMember = JSON.parse(memberStr)
      } catch (e) {
        console.error('Erreur lors du parsing du membre:', e)
        memberStore.clearMember()
      }
    }
  }

  // Si l'utilisateur n'est pas authentifié et aucun membre n'est connecté
  // et qu'il essaie d'accéder à une page protégée (sauf login et member-login)
  if (!authStore.isAuthenticated && !memberStore.isMemberConnected && to.path !== '/login' && to.path !== '/member-login') {
    return navigateTo('/login')
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder à la page de login
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
