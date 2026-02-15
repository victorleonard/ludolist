import { defineStore } from 'pinia'

const STORAGE_KEY = 'ludolist_bottom_nav_order'

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
  { id: 'courses', label: 'Courses', icon: 'i-ion-cart', to: '/courses' },
  { id: 'abonnements', label: 'Abonnements', icon: 'i-ion-card', to: '/abonnements/' }
]

const DEFAULT_MAIN_IDS = ['home', 'jeux', 'plats', 'taches', 'abonnements']

export const useBottomNavStore = defineStore('bottomNav', {
  state: () => ({
    mainIds: [...DEFAULT_MAIN_IDS] as string[]
  }),

  getters: {
    mainItems(state): NavItem[] {
      return state.mainIds
        .map((id) => ALL_NAV_ITEMS.find((item) => item.id === id))
        .filter(Boolean) as NavItem[]
    },

    moreItems(state): NavItem[] {
      return ALL_NAV_ITEMS.filter((item) => !state.mainIds.includes(item.id))
    }
  },

  actions: {
    loadFromStorage() {
      if (import.meta.client) {
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored) as string[]
            const validIds = parsed.filter((id) =>
              ALL_NAV_ITEMS.some((item) => item.id === id)
            )
            if (validIds.length > 0) {
              this.mainIds = validIds.slice(0, 5)
              return
            }
          }
        } catch {
          // Ignorer les erreurs de parsing
        }
        this.mainIds = [...DEFAULT_MAIN_IDS]
      }
    },

    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mainIds))
      }
    },

    setMainIds(ids: string[]) {
      this.mainIds = ids.slice(0, 5)
      this.saveToStorage()
    },

    moveToMain(itemId: string, index?: number) {
      if (this.mainIds.includes(itemId)) return
      const newMain = [...this.mainIds]
      newMain.splice(
        index ?? newMain.length,
        0,
        itemId
      )
      this.mainIds = newMain.slice(0, 5)
      this.saveToStorage()
    },

    moveToMore(itemId: string) {
      this.mainIds = this.mainIds.filter((id) => id !== itemId)
      this.saveToStorage()
    },

    moveInMain(fromIndex: number, toIndex: number) {
      const newMain = [...this.mainIds]
      const [removed] = newMain.splice(fromIndex, 1)
      newMain.splice(toIndex, 0, removed)
      this.mainIds = newMain
      this.saveToStorage()
    },

    reset() {
      this.mainIds = [...DEFAULT_MAIN_IDS]
      this.saveToStorage()
    }
  }
})
