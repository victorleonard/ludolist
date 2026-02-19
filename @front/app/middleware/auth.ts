import { useAuthStore } from '~/stores/auth'
import { useMemberStore } from '~/stores/member'
import { useFamilyStore } from '~/stores/family'

const PAGE_PATH_PREFIXES: Array<{ prefix: string; pageId: string }> = [
  { prefix: '/jeux', pageId: 'jeux' },
  { prefix: '/game', pageId: 'jeux' },
  { prefix: '/livres', pageId: 'livres' },
  { prefix: '/plats', pageId: 'plats' },
  { prefix: '/plat', pageId: 'plats' },
  { prefix: '/taches', pageId: 'taches' },
  { prefix: '/listes', pageId: 'listes' },
  { prefix: '/abonnements', pageId: 'abonnements' },
  { prefix: '/tirage', pageId: 'tirage' },
  { prefix: '/des', pageId: 'des' }
]

function getPageIdFromPath(path: string): string | null {
  if (path === '/' || path.startsWith('/login') || path.startsWith('/member-login') || path.startsWith('/parametres')) {
    return null
  }
  for (const { prefix, pageId } of PAGE_PATH_PREFIXES) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return pageId
    }
  }
  return null
}

export default defineNuxtRouteMiddleware((to) => {
  // S'assurer qu'on est côté client
  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  const memberStore = useMemberStore()
  const familyStore = useFamilyStore()

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

  // Sans membre connecté, seul l'accueil est autorisé (pour choisir un membre)
  if (authStore.isAuthenticated && !memberStore.isMemberConnected && to.path !== '/' && to.path !== '/login' && to.path !== '/member-login') {
    return navigateTo('/')
  }

  // Droits d'accès par page : si un membre est connecté, vérifier qu'il a accès à la page
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    const pageId = getPageIdFromPath(to.path)
    if (pageId && familyStore.family?.page_access) {
      const allowed = familyStore.family.page_access[pageId]
      if (Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(memberStore.currentMember.id)) {
        return navigateTo('/')
      }
    }
  }
})
