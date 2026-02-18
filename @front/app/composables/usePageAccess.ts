import { ALL_NAV_ITEMS, type NavItem } from '~/stores/bottomNav'

/**
 * Composable pour les droits d'accès par page.
 * - allowedNavItems : liste des onglets de navigation visibles (filtrée selon page_access si membre connecté)
 * - canManageDroits : true si l'utilisateur peut accéder à la page "Gérer les droits d'accès" (propriétaire ou membre admin)
 */
export function usePageAccess() {
  const familyStore = useFamilyStore()
  const memberStore = useMemberStore()
  const authStore = useAuthStore()

  const canManageDroits = computed(() => {
    if (!authStore.isAuthenticated) return false
    if (!memberStore.isMemberConnected) return true
    const m = familyStore.familyMembers.find((x) => x.id === memberStore.currentMember?.id)
    return m?.is_admin === true
  })

  const allowedNavItems = computed((): NavItem[] => {
    if (!memberStore.isMemberConnected || !memberStore.currentMember) {
      return [...ALL_NAV_ITEMS]
    }
    const pageAccess = familyStore.family?.page_access
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.id === 'home') return true
      if (!pageAccess || !pageAccess[item.id]) return true
      if (pageAccess[item.id].length === 0) return true
      return pageAccess[item.id].includes(memberStore.currentMember!.id)
    })
  })

  const allowedNavIds = computed(() => new Set(allowedNavItems.value.map((i) => i.id)))

  return { allowedNavItems, allowedNavIds, canManageDroits }
}
