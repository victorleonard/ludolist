import { ALL_NAV_ITEMS, type NavItem } from '~/stores/bottomNav'

/**
 * Composable pour les droits d'accès par page.
 * - allowedNavItems : en mode famille = pages où tout le monde a accès ; en mode membre = pages où le membre a accès
 * - canManageDroits : true uniquement si un membre admin est connecté (pas en mode famille)
 */
export function usePageAccess() {
  const familyStore = useFamilyStore()
  const memberStore = useMemberStore()
  const authStore = useAuthStore()

  const canManageDroits = computed(() => {
    if (!authStore.isAuthenticated) return false
    if (!memberStore.isMemberConnected) return false
    const m = familyStore.familyMembers.find((x) => x.id === memberStore.currentMember?.id)
    return m?.is_admin === true
  })

  const allowedNavItems = computed((): NavItem[] => {
    const pageAccess = familyStore.family?.page_access
    if (memberStore.isMemberConnected && memberStore.currentMember) {
      return ALL_NAV_ITEMS.filter((item) => {
        if (item.id === 'home') return true
        if (!pageAccess || !pageAccess[item.id]) return true
        if (pageAccess[item.id].length === 0) return true
        return pageAccess[item.id].includes(memberStore.currentMember!.id)
      })
    }
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.id === 'home') return true
      if (!pageAccess || !pageAccess[item.id] || pageAccess[item.id].length === 0) return true
      return false
    })
  })

  const allowedNavIds = computed(() => new Set(allowedNavItems.value.map((i) => i.id)))

  return { allowedNavItems, allowedNavIds, canManageDroits }
}
