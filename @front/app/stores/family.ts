import { defineStore } from 'pinia'

interface Member {
  id: number
  name: string
  birthdate: string
  avatar?: string
}

interface Game {
  id: number
  name: string
  [key: string]: unknown
}

interface Family {
  id: number
  name: string
  members?: Member[]
  games?: Game[]
}

interface UserWithFamily {
  id: number
  username: string
  email: string
  family?: Family
}

export const useFamilyStore = defineStore('family', {
  state: () => ({
    family: null as Family | null,
    isLoading: false
  }),

  getters: {
    currentFamily: (state) => state.family,
    familyMembers: (state) => state.family?.members || [],
    familyGames: (state) => state.family?.games || [],
    hasFamily: (state) => !!state.family
  },

  actions: {
    // Charger la famille depuis le localStorage au démarrage
    loadFamily() {
      if (import.meta.client) {
        const familyStr = localStorage.getItem('auth_family')

        if (familyStr) {
          this.family = JSON.parse(familyStr)
        }
      }
    },

    // Sauvegarder la famille dans le localStorage
    saveFamily(family: Family) {
      if (import.meta.client) {
        localStorage.setItem('auth_family', JSON.stringify(family))
      }
      this.family = family
    },

    // Supprimer la famille
    clearFamily() {
      if (import.meta.client) {
        localStorage.removeItem('auth_family')
      }
      this.family = null
    },

    // Récupérer la famille de l'utilisateur connecté
    async fetchFamily() {
      const authStore = useAuthStore()

      if (!authStore.token) {
        return null
      }

      this.isLoading = true
      const config = useRuntimeConfig()

      try {
        // Récupérer l'utilisateur avec sa famille
        const response = await $fetch<UserWithFamily>(`${config.public.apiUrl}/api/users/me?populate=family.members`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })

        if (response.family) {
          this.saveFamily(response.family)
          return response.family
        }

        return null
      } catch (error) {
        console.error('Erreur lors de la récupération de la famille:', error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    // Mettre à jour le nom de la famille
    async updateFamilyName(name: string) {
      const authStore = useAuthStore()

      if (!authStore.token || !this.family) {
        return { success: false, error: 'Aucune famille trouvée' }
      }

      const config = useRuntimeConfig()

      try {
        const response = await $fetch<Family>(
          `${config.public.apiUrl}/api/families/${this.family.id}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authStore.token}`
            },
            body: {
              data: { name }
            }
          }
        )

        this.saveFamily(response)
        return { success: true, data: response }
      } catch (error: unknown) {
        console.error('Erreur lors de la mise à jour de la famille:', error)
        return {
          success: false,
          error: (error as { data?: { error?: { message?: string } } }).data?.error?.message || 'Erreur lors de la mise à jour'
        }
      }
    }
  }
})
