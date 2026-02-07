import { useAuthStore } from '~/stores/auth'

export interface GroceryItem {
  id: number
  documentId: string
  name: string
  is_checked: boolean
  family?: number
  created_by?: {
    id: number
    username: string
  } | null
  shopping_list?: number
  createdAt?: string
  updatedAt?: string
}

export interface ShoppingList {
  id: number
  documentId?: string
  family?: number
  items?: GroceryItem[]
  createdAt?: string
  updatedAt?: string
}

export interface AddGroceryItemResult {
  success: boolean
  data?: GroceryItem
  error?: string
  alreadyExists?: boolean
}

export interface ToggleGroceryItemResult {
  success: boolean
  data?: GroceryItem
  error?: string
}

export interface UpdateGroceryItemResult {
  success: boolean
  data?: GroceryItem
  error?: string
}

export interface DeleteGroceryItemResult {
  success: boolean
  error?: string
}

export interface FetchShoppingListResult {
  success: boolean
  data?: ShoppingList
  error?: string
}

/**
 * Composable pour gérer la liste de courses
 */
export function useShoppingList() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  /**
   * Récupérer la liste de courses de la famille
   */
  async function fetchShoppingList(): Promise<FetchShoppingListResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const response = await $fetch<{ data?: ShoppingList } | ShoppingList>(
        `${config.public.apiUrl}/api/shopping-lists/family`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      const data = (response as { data?: ShoppingList })?.data || (response as ShoppingList)
      return { success: true, data }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération de la liste de courses:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la récupération'
      return { success: false, error: message }
    }
  }

  /**
   * Ajouter un produit à la liste de courses
   */
  async function addGroceryItem(
    name: string,
    memberId?: number | null
  ): Promise<AddGroceryItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!name || !name.trim()) {
      return { success: false, error: 'Le nom du produit est requis' }
    }

    try {
      const response = await $fetch<{
        data?: GroceryItem
        message?: string
        alreadyExists?: boolean
      }>(`${config.public.apiUrl}/api/grocery-items/add-to-family`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: {
          name: name.trim(),
          ...(memberId != null && { memberId }),
        },
      })

      const data = response.data
      const alreadyExists = response.alreadyExists || false

      if (data) {
        return { success: true, data, alreadyExists }
      }

      return { success: false, error: 'Erreur lors de l\'ajout du produit' }
    } catch (err: unknown) {
      console.error('Erreur lors de l\'ajout du produit:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de l\'ajout du produit'
      return { success: false, error: message }
    }
  }

  /**
   * Cocher ou décocher un produit
   */
  async function toggleGroceryItem(
    itemId: string
  ): Promise<ToggleGroceryItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const response = await $fetch<{
        data?: GroceryItem
        message?: string
      }>(`${config.public.apiUrl}/api/grocery-items/${itemId}/toggle-checked`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = response.data

      if (data) {
        return { success: true, data }
      }

      return { success: false, error: 'Erreur lors du changement d\'état' }
    } catch (err: unknown) {
      console.error('Erreur lors du changement d\'état:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors du changement d\'état'
      return { success: false, error: message }
    }
  }

  /**
   * Modifier un produit
   */
  async function updateGroceryItem(
    itemId: string,
    name: string
  ): Promise<UpdateGroceryItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!name || !name.trim()) {
      return { success: false, error: 'Le nom du produit est requis' }
    }

    try {
      const response = await $fetch<{
        data?: GroceryItem
        message?: string
      }>(`${config.public.apiUrl}/api/grocery-items/${itemId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: {
          name: name.trim(),
        },
      })

      const data = response.data

      if (data) {
        return { success: true, data }
      }

      return { success: false, error: 'Erreur lors de la modification' }
    } catch (err: unknown) {
      console.error('Erreur lors de la modification:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la modification'
      return { success: false, error: message }
    }
  }

  /**
   * Supprimer un produit
   */
  async function deleteGroceryItem(
    itemId: string
  ): Promise<DeleteGroceryItemResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      await $fetch(`${config.public.apiUrl}/api/grocery-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      return { success: true }
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la suppression'
      return { success: false, error: message }
    }
  }

  return {
    fetchShoppingList,
    addGroceryItem,
    toggleGroceryItem,
    updateGroceryItem,
    deleteGroceryItem,
  }
}
