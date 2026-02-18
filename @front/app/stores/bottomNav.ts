import { defineStore } from 'pinia'

const STORAGE_KEY_PREFIX = 'ludolist_bottom_nav_order'

function getStorageKey(): string {
  if (import.meta.server) return `${STORAGE_KEY_PREFIX}_family`
  const memberStore = useMemberStore()
  if (memberStore.currentMember?.id) {
    return `${STORAGE_KEY_PREFIX}_member_${memberStore.currentMember.id}`
  }
  return `${STORAGE_KEY_PREFIX}_family`
}

export interface NavItem {
  id: string
  label: string
  icon: string
  to: string
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Accueil', icon: 'i-ion-home', to: '/' },
  { id: 'jeux', label: 'Jeux', icon: 'i-ion-dice', to: '/jeux' },
  { id: 'livres', label: 'Livres', icon: 'i-ion-book', to: '/livres/' },
  { id: 'plats', label: 'Plats', icon: 'i-ion-restaurant', to: '/plats/' },
  { id: 'taches', label: 'Tâches', icon: 'i-ion-checkmark-circle', to: '/taches/' },
  { id: 'listes', label: 'Listes', icon: 'i-ion-list', to: '/listes' },
  { id: 'abonnements', label: 'Abonnements', icon: 'i-ion-card', to: '/abonnements/' },
  { id: 'tirage', label: 'Tirage au sort', icon: 'i-ion-shuffle', to: '/tirage' }
]

const DEFAULT_MAIN_IDS = ['home', 'jeux', 'plats', 'taches', 'abonnements']

export const useBottomNavStore = defineStore('bottomNav', {
  state: () => ({
    mainIds: [...DEFAULT_MAIN_IDS] as string[],
    isLoading: false
  }),

  getters: {
    mainItems(state): NavItem[] {
      return state.mainIds
        .map(id => ALL_NAV_ITEMS.find(item => item.id === id))
        .filter(Boolean) as NavItem[]
    },

    moreItems(state): NavItem[] {
      return ALL_NAV_ITEMS.filter(item => !state.mainIds.includes(item.id))
    }
  },

  actions: {
    async loadFromStorage() {
      if (import.meta.client) {
        const memberStore = useMemberStore()
        const authStore = useAuthStore()

        if (memberStore.currentMember?.id && authStore.token) {
          this.isLoading = true
          try {
            const config = useRuntimeConfig()
            const response = await $fetch<{ data: { bottomNavOrder?: string[] } }>(
              `${config.public.apiUrl}/api/members/${memberStore.currentMember.id}/settings`,
              {
                headers: { Authorization: `Bearer ${authStore.token}` }
              }
            )
            const ids = response.data?.bottomNavOrder
            if (Array.isArray(ids)) {
              const validIds = ids.filter(id =>
                ALL_NAV_ITEMS.some(item => item.id === id)
              )
              if (validIds.length > 0) {
                this.mainIds = validIds.slice(0, 5)
                return
              }
            }
          } catch {
            // En cas d'erreur, garder les valeurs par défaut ou localStorage en fallback
            this.loadFromLocalStorage()
          } finally {
            this.isLoading = false
          }
        } else {
          this.loadFromLocalStorage()
        }
      }
    },

    loadFromLocalStorage() {
      if (import.meta.client) {
        try {
          const key = getStorageKey()
          let stored = localStorage.getItem(key)
          if (!stored && key.endsWith('_family')) {
            stored = localStorage.getItem(STORAGE_KEY_PREFIX)
          }
          if (stored) {
            const parsed = JSON.parse(stored) as string[]
            const validIds = parsed.filter(id =>
              ALL_NAV_ITEMS.some(item => item.id === id)
            )
            if (validIds.length > 0) {
              this.mainIds = validIds.slice(0, 5)
              return
            }
          }
        } catch {
          // Ignorer
        }
        this.mainIds = [...DEFAULT_MAIN_IDS]
      }
    },

    async saveToStorage() {
      if (import.meta.client) {
        const memberStore = useMemberStore()
        const authStore = useAuthStore()

        if (memberStore.currentMember?.id && authStore.token) {
          try {
            const config = useRuntimeConfig()
            await $fetch(
              `${config.public.apiUrl}/api/members/${memberStore.currentMember.id}/settings`,
              {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${authStore.token}`,
                  'Content-Type': 'application/json'
                },
                body: { bottomNavOrder: this.mainIds }
              }
            )
          } catch {
            // En cas d'erreur réseau, sauvegarder en localStorage en fallback
            this.saveToLocalStorage()
          }
        } else {
          this.saveToLocalStorage()
        }
      }
    },

    saveToLocalStorage() {
      if (import.meta.client) {
        const key = getStorageKey()
        localStorage.setItem(key, JSON.stringify(this.mainIds))
      }
    },

    setMainIds(ids: string[]) {
      this.mainIds = ids.slice(0, 5)
      this.saveToStorage()
    },

    moveToMain(itemId: string, index?: number) {
      if (this.mainIds.includes(itemId)) return
      const newMain = [...this.mainIds]
      newMain.splice(index ?? newMain.length, 0, itemId)
      this.mainIds = newMain.slice(0, 5)
      this.saveToStorage()
    },

    moveToMore(itemId: string) {
      this.mainIds = this.mainIds.filter(id => id !== itemId)
      this.saveToStorage()
    },

    moveInMain(fromIndex: number, toIndex: number) {
      const newMain = [...this.mainIds]
      const [removed] = newMain.splice(fromIndex, 1)
      if (removed) {
        newMain.splice(toIndex, 0, removed)
        this.mainIds = newMain
        this.saveToStorage()
      }
    },

    reset() {
      this.mainIds = [...DEFAULT_MAIN_IDS]
      this.saveToStorage()
    }
  }
})
