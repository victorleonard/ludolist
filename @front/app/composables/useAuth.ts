interface User {
  id: number
  username: string
  email: string
  blocked: boolean
}

interface LoginResponse {
  jwt: string
  user: User
}

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  
  // État global de l'authentification
  const authState = useState<AuthState>('auth', () => ({
    user: null,
    token: null
  }))

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = computed(() => !!authState.value.token)

  // Charger le token depuis le localStorage au démarrage
  const loadToken = () => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('auth_user')
      
      if (token && userStr) {
        authState.value.token = token
        authState.value.user = JSON.parse(userStr)
      }
    }
  }

  // Sauvegarder le token dans le localStorage
  const saveToken = (token: string, user: User) => {
    if (import.meta.client) {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))
    }
    authState.value.token = token
    authState.value.user = user
  }

  // Supprimer le token
  const clearToken = () => {
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
    authState.value.token = null
    authState.value.user = null
  }

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch<LoginResponse>(`${config.public.apiUrl}/api/auth/local`, {
        method: 'POST',
        body: {
          identifier: email,
          password
        }
      })

      saveToken(response.jwt, response.user)
      return { success: true, data: response }
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      return { 
        success: false, 
        error: error.data?.error?.message || 'Erreur de connexion'
      }
    }
  }

  // Déconnexion
  const logout = async () => {
    clearToken()
    await router.push('/login')
  }

  // Récupérer l'utilisateur courant
  const fetchUser = async () => {
    if (!authState.value.token) {
      return null
    }

    try {
      const response = await $fetch<User>(`${config.public.apiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${authState.value.token}`
        }
      })

      authState.value.user = response
      return response
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      clearToken()
      return null
    }
  }

  return {
    user: computed(() => authState.value.user),
    token: computed(() => authState.value.token),
    isAuthenticated,
    login,
    logout,
    loadToken,
    fetchUser
  }
}
