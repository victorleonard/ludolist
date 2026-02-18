/**
 * Middleware pour la page Droits d'accès.
 * Réservé aux membres admin connectés. Sans membre connecté, redirection vers home.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path !== '/parametres/droits-acces') {
    return
  }

  if (import.meta.server) {
    return
  }

  const authStore = useAuthStore()
  const memberStore = useMemberStore()
  const familyStore = useFamilyStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  if (!memberStore.isMemberConnected) {
    return navigateTo('/')
  }

  await familyStore.fetchFamily()
  const member = familyStore.familyMembers.find(
    (m) => m.id === memberStore.currentMember?.id
  )
  if (!member?.is_admin) {
    return navigateTo('/')
  }
})
