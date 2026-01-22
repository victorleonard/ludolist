import { defineStore } from 'pinia'

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

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    // Charger le token depuis le localStorage au démarrage
    loadToken() {
      if (import.meta.client) {
        try {
          const token = localStorage.getItem('auth_token')
          const userStr = localStorage.getItem('auth_user')

          if (token && userStr) {
            this.token = token
            try {
              this.user = JSON.parse(userStr)

              // Charger aussi les informations de famille
              const familyStore = useFamilyStore()
              familyStore.loadFamily()
            } catch (e) {
              console.error('Erreur lors du parsing de l\'utilisateur:', e)
              // Si le parsing échoue, nettoyer les données corrompues
              this.clearToken()
            }
          } else {
            // Si pas de token dans le localStorage, s'assurer que le store est vide
            if (this.token) {
              this.clearToken()
            }
          }
        } catch (e) {
          console.error('Erreur lors du chargement du token:', e)
          this.clearToken()
        }
      }
    },

    // Sauvegarder le token dans le localStorage
    saveToken(token: string, user: User) {
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
      this.token = token
      this.user = user
    },

    // Supprimer le token
    clearToken() {
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
      this.token = null
      this.user = null
    },

    // Connexion
    async login(email: string, password: string) {
      const config = useRuntimeConfig()

      try {
        const response = await $fetch<LoginResponse>(`${config.public.apiUrl}/api/auth/local`, {
          method: 'POST',
          body: {
            identifier: email,
            password
          }
        })

        this.saveToken(response.jwt, response.user)

        // Charger les informations de famille après la connexion
        const familyStore = useFamilyStore()
        await familyStore.fetchFamily()

        return { success: true, data: response }
      } catch (error: unknown) {
        console.error('Erreur de connexion:', error)
        return {
          success: false,
          error: (error as { data?: { error?: { message?: string } } }).data?.error?.message || 'Erreur de connexion'
        }
      }
    },

    // Déconnexion
    async logout() {
      this.clearToken()

      // Effacer aussi les informations de famille
      const familyStore = useFamilyStore()
      familyStore.clearFamily()

      const router = useRouter()
      await router.push('/login')
    },

    // Récupérer l'utilisateur courant
    async fetchUser() {
      if (!this.token) {
        return null
      }

      const config = useRuntimeConfig()

      try {
        const response = await $fetch<User>(`${config.public.apiUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.user = response
        return response
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
        this.clearToken()
        return null
      }
    }
  }
})
