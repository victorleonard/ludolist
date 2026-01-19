export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, loadToken } = useAuth()
  
  // Charger le token depuis le localStorage
  loadToken()

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Si l'utilisateur est déjà authentifié et essaie d'accéder à la page de login
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/')
  }
})
