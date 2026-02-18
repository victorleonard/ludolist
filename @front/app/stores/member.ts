import { defineStore } from 'pinia'

export interface ConnectedMember {
  id: number
  username: string
  familyId: number
}

export const useMemberStore = defineStore('member', {
  state: () => ({
    currentMember: null as ConnectedMember | null
  }),

  getters: {
    isMemberConnected: (state) => !!state.currentMember,
    currentMemberName: (state) => state.currentMember?.username || null
  },

  actions: {
    // Charger le membre depuis le localStorage au démarrage
    loadMember() {
      if (import.meta.client) {
        try {
          const memberStr = localStorage.getItem('auth_member')
          if (memberStr) {
            this.currentMember = JSON.parse(memberStr)
          }
        } catch (e) {
          console.error('Erreur lors du chargement du membre:', e)
          this.clearMember()
        }
      }
    },

    // Sauvegarder le membre dans le localStorage
    saveMember(member: ConnectedMember) {
      if (import.meta.client) {
        localStorage.setItem('auth_member', JSON.stringify(member))
      }
      this.currentMember = member
    },

    // Supprimer le membre
    clearMember() {
      if (import.meta.client) {
        localStorage.removeItem('auth_member')
      }
      this.currentMember = null
    },

    // Connexion en tant que membre
    async loginAsMember(memberId: number, code: string) {
      const authStore = useAuthStore()

      if (!authStore.token) {
        return {
          success: false,
          error: 'Vous devez être connecté en tant qu\'utilisateur'
        }
      }

      const config = useRuntimeConfig()

      try {
        const response = await $fetch<{ data: ConnectedMember, message: string }>(
          `${config.public.apiUrl}/api/members/login`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            },
            body: {
              memberId,
              code
            }
          }
        )

        this.saveMember(response.data)
        const familyStore = useFamilyStore()
        await familyStore.fetchFamily()
        return { success: true, data: response.data }
      } catch (error: unknown) {
        console.error('Erreur de connexion membre:', error)
        const err = error as { data?: { error?: { message?: string } }, message?: string }
        return {
          success: false,
          error: err?.data?.error?.message || err?.message || 'Code incorrect'
        }
      }
    },

    // Déconnexion du membre
    logoutMember() {
      this.clearMember()
    }
  }
})
