import { useAuthStore } from '~/stores/auth'

export interface ListCategory {
  id: number
  documentId: string
  name: string
  position?: number
}

export interface ListItem {
  id: number
  documentId: string
  name: string
  is_checked: boolean
  position?: number
  family?: number
  list?: number | { id: number }
  category?: ListCategory | null
  created_by?: {
    id: number
    username: string
  } | null
  checked_by?: {
    id: number
    username?: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface List {
  id: number
  documentId: string
  name: string
  family?: number
  allowed_members?: Array<{ id: number; username?: string } | number>
  categories?: ListCategory[]
  items?: ListItem[]
  createdAt?: string
  updatedAt?: string
}

export interface FetchListsResult {
  success: boolean
  data?: List[]
  error?: string
}

export interface FetchListResult {
  success: boolean
  data?: List
  error?: string
}

export interface CreateListResult {
  success: boolean
  data?: List
  error?: string
}

export interface UpdateListResult {
  success: boolean
  data?: List
  error?: string
}

export interface DeleteListResult {
  success: boolean
  error?: string
}

export interface AddListItemResult {
  success: boolean
  data?: ListItem
  error?: string
  alreadyExists?: boolean
}

export interface ToggleListItemResult {
  success: boolean
  data?: ListItem
  error?: string
}

export interface UpdateListItemResult {
  success: boolean
  data?: ListItem
  error?: string
}

export interface DeleteListItemResult {
  success: boolean
  error?: string
}

export interface ReorderListItemsResult {
  success: boolean
  error?: string
}

export interface CategoryResult {
  success: boolean
  data?: ListCategory
  error?: string
}

export interface DeleteCategoryResult {
  success: boolean
  error?: string
}

function getErrorMessage(err: unknown): string {
  const e = err as { data?: { error?: { message?: string } }; message?: string }
  return e?.data?.error?.message ?? e?.message ?? 'Erreur'
}

export function useLists() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  function headers() {
    return {
      Authorization: `Bearer ${authStore.token}`,
      'Content-Type': 'application/json',
    }
  }

  async function fetchLists(memberId?: number | null): Promise<FetchListsResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    try {
      const params = new URLSearchParams()
      if (memberId != null) params.set('memberId', String(memberId))
      const url = `${config.public.apiUrl}/api/lists/family${params.toString() ? `?${params}` : ''}`
      const response = await $fetch<{ data?: List[] }>(url, { headers: { Authorization: `Bearer ${authStore.token}` } })
      const data = response?.data ?? response
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err) {
      console.error('Erreur fetchLists:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function fetchList(documentId: string, memberId?: number | null): Promise<FetchListResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    try {
      const params = new URLSearchParams()
      if (memberId != null) params.set('memberId', String(memberId))
      const url = `${config.public.apiUrl}/api/lists/${encodeURIComponent(documentId)}${params.toString() ? `?${params}` : ''}`
      const response = await $fetch<{ data?: List }>(url, { headers: { Authorization: `Bearer ${authStore.token}` } })
      const data = response?.data ?? response
      return { success: true, data: data as List }
    } catch (err) {
      console.error('Erreur fetchList:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function createList(
    name: string,
    allowedMemberIds?: number[]
  ): Promise<CreateListResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!name?.trim()) {
      return { success: false, error: 'Le nom de la liste est requis' }
    }
    try {
      const body: { name: string; allowedMemberIds?: number[] } = {
        name: name.trim(),
      }
      if (allowedMemberIds && allowedMemberIds.length > 0) {
        body.allowedMemberIds = allowedMemberIds
      }
      const response = await $fetch<{ data?: List }>(`${config.public.apiUrl}/api/lists`, {
        method: 'POST',
        headers: headers(),
        body,
      })
      const data = response?.data ?? response
      return { success: true, data: data as List }
    } catch (err) {
      console.error('Erreur createList:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function updateList(
    documentId: string,
    name: string,
    allowedMemberIds?: number[]
  ): Promise<UpdateListResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId || !name?.trim()) {
      return { success: false, error: 'documentId et nom requis' }
    }
    try {
      const body: { name: string; allowedMemberIds?: number[] } = { name: name.trim() }
      if (allowedMemberIds !== undefined) body.allowedMemberIds = allowedMemberIds
      const response = await $fetch<{ data?: List }>(
        `${config.public.apiUrl}/api/lists/${encodeURIComponent(documentId)}`,
        { method: 'PUT', headers: headers(), body }
      )
      const data = response?.data ?? response
      return { success: true, data: data as List }
    } catch (err) {
      console.error('Erreur updateList:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function deleteList(documentId: string, memberId?: number | null): Promise<DeleteListResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    try {
      const params = new URLSearchParams()
      if (memberId != null) params.set('memberId', String(memberId))
      const url = `${config.public.apiUrl}/api/lists/${encodeURIComponent(documentId)}${params.toString() ? `?${params}` : ''}`
      await $fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${authStore.token}` } })
      return { success: true }
    } catch (err) {
      console.error('Erreur deleteList:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function addItem(
    listDocumentId: string,
    name: string,
    memberId?: number | null,
    categoryDocumentId?: string | null
  ): Promise<AddListItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!listDocumentId || !name?.trim()) {
      return { success: false, error: 'listDocumentId et nom requis' }
    }
    try {
      const body: {
        listDocumentId: string
        name: string
        memberId?: number
        categoryDocumentId?: string
      } = {
        listDocumentId,
        name: name.trim(),
      }
      if (memberId != null) body.memberId = memberId
      if (categoryDocumentId) body.categoryDocumentId = categoryDocumentId
      const response = await $fetch<{ data?: ListItem }>(`${config.public.apiUrl}/api/list-items/add-to-list`, {
        method: 'POST',
        headers: headers(),
        body,
      })
      const data = response?.data ?? response
      return { success: true, data: data as ListItem }
    } catch (err) {
      console.error('Erreur addItem:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function toggleListItem(
    documentId: string,
    memberId?: number | null
  ): Promise<ToggleListItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    try {
      const body = memberId != null ? { memberId } : {}
      const response = await $fetch<{ data?: ListItem }>(
        `${config.public.apiUrl}/api/list-items/${encodeURIComponent(documentId)}/toggle-checked`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${authStore.token}`, 'Content-Type': 'application/json' },
          body,
        }
      )
      const data = response?.data ?? response
      return { success: true, data: data as ListItem }
    } catch (err) {
      console.error('Erreur toggleListItem:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function updateListItem(
    documentId: string,
    name?: string,
    categoryDocumentId?: string | null
  ): Promise<UpdateListItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    if (name !== undefined && !name?.trim()) {
      return { success: false, error: 'Le nom ne peut pas être vide' }
    }
    try {
      const body: { name?: string; categoryDocumentId?: string | null } = {}
      if (name !== undefined) body.name = name.trim()
      if (categoryDocumentId !== undefined) body.categoryDocumentId = categoryDocumentId
      const response = await $fetch<{ data?: ListItem }>(
        `${config.public.apiUrl}/api/list-items/${encodeURIComponent(documentId)}`,
        { method: 'PUT', headers: headers(), body }
      )
      const data = response?.data ?? response
      return { success: true, data: data as ListItem }
    } catch (err) {
      console.error('Erreur updateListItem:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function deleteListItem(documentId: string): Promise<DeleteListItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    try {
      await $fetch(`${config.public.apiUrl}/api/list-items/${encodeURIComponent(documentId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      return { success: true }
    } catch (err) {
      console.error('Erreur deleteListItem:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function reorderListItems(
    listDocumentId: string,
    orderedDocumentIds: string[],
    memberId?: number | null
  ): Promise<ReorderListItemsResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!listDocumentId || !Array.isArray(orderedDocumentIds)) {
      return { success: false, error: 'listDocumentId et orderedDocumentIds requis' }
    }
    try {
      const body: { listDocumentId: string; orderedDocumentIds: string[]; memberId?: number } = {
        listDocumentId,
        orderedDocumentIds,
      }
      if (memberId != null) body.memberId = memberId
      await $fetch(`${config.public.apiUrl}/api/list-items/reorder`, {
        method: 'PUT',
        headers: headers(),
        body,
      })
      return { success: true }
    } catch (err) {
      console.error('Erreur reorderListItems:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function createCategory(
    listDocumentId: string,
    name: string,
    memberId?: number | null
  ): Promise<CategoryResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!listDocumentId || !name?.trim()) {
      return { success: false, error: 'listDocumentId et nom requis' }
    }
    try {
      const body: { listDocumentId: string; name: string; memberId?: number } = {
        listDocumentId,
        name: name.trim(),
      }
      if (memberId != null) body.memberId = memberId
      const response = await $fetch<{ data?: ListCategory }>(
        `${config.public.apiUrl}/api/list-categories`,
        { method: 'POST', headers: headers(), body }
      )
      const data = response?.data ?? response
      return { success: true, data: data as ListCategory }
    } catch (err) {
      console.error('Erreur createCategory:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function updateCategory(documentId: string, name: string): Promise<CategoryResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId || !name?.trim()) {
      return { success: false, error: 'documentId et nom requis' }
    }
    try {
      const response = await $fetch<{ data?: ListCategory }>(
        `${config.public.apiUrl}/api/list-categories/${encodeURIComponent(documentId)}`,
        { method: 'PUT', headers: headers(), body: { name: name.trim() } }
      )
      const data = response?.data ?? response
      return { success: true, data: data as ListCategory }
    } catch (err) {
      console.error('Erreur updateCategory:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  async function deleteCategory(documentId: string): Promise<DeleteCategoryResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }
    try {
      await $fetch(
        `${config.public.apiUrl}/api/list-categories/${encodeURIComponent(documentId)}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${authStore.token}` } }
      )
      return { success: true }
    } catch (err) {
      console.error('Erreur deleteCategory:', err)
      return { success: false, error: getErrorMessage(err) }
    }
  }

  return {
    fetchLists,
    fetchList,
    createList,
    updateList,
    deleteList,
    addItem,
    toggleListItem,
    updateListItem,
    deleteListItem,
    reorderListItems,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
