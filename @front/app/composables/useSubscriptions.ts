import { useAuthStore } from '~/stores/auth'

export interface Subscription {
  id: number
  documentId: string
  name: string
  amount?: number | string | null
  renewal_date?: string | null
  paid_by?: {
    id: number
    username: string
    documentId?: string
  } | null
  family?: number | { id: number }
  createdAt?: string
  updatedAt?: string
}

export interface CreateSubscriptionData {
  name: string
  amount?: number | string | null
  renewal_date?: string | null
  paid_by?: number | null
}

export interface UpdateSubscriptionData {
  name?: string
  amount?: number | string | null
  renewal_date?: string | null
  paid_by?: number | null
}

export interface FetchSubscriptionsResult {
  success: boolean
  data?: Subscription[]
  error?: string
}

export interface CreateSubscriptionResult {
  success: boolean
  data?: Subscription
  error?: string
}

export interface UpdateSubscriptionResult {
  success: boolean
  data?: Subscription
  error?: string
}

export interface DeleteSubscriptionResult {
  success: boolean
  error?: string
}

/**
 * Composable pour gérer les abonnements
 */
export function useSubscriptions() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  async function fetchSubscriptions(): Promise<FetchSubscriptionsResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const response = await $fetch<{ data?: Subscription[] } | Subscription[]>(
        `${config.public.apiUrl}/api/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      const data = (response as { data?: Subscription[] })?.data ?? (response as Subscription[])
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des abonnements:', err)
      const error = err as { data?: { error?: { message?: string } }; message?: string }
      const message =
        error?.data?.error?.message ?? error?.message ?? 'Erreur lors de la récupération des abonnements'
      return { success: false, error: message }
    }
  }

  async function fetchSubscription(
    documentId: string
  ): Promise<{ success: boolean; data?: Subscription; error?: string }> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      const response = await $fetch<{ data?: Subscription } | Subscription>(
        `${config.public.apiUrl}/api/subscriptions/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      const data = (response as { data?: Subscription })?.data ?? (response as Subscription)
      return { success: true, data }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération de l\'abonnement:', err)
      const error = err as { data?: { error?: { message?: string } }; message?: string }
      const message =
        error?.data?.error?.message ?? error?.message ?? 'Erreur lors de la récupération de l\'abonnement'
      return { success: false, error: message }
    }
  }

  async function createSubscription(data: CreateSubscriptionData): Promise<CreateSubscriptionResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!data.name || !String(data.name).trim()) {
      return { success: false, error: 'Le nom est requis' }
    }

    try {
      const response = await $fetch<{ data?: Subscription; message?: string }>(
        `${config.public.apiUrl}/api/subscriptions/add-to-family`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
          body: {
            name: String(data.name).trim(),
            amount: data.amount != null && data.amount !== '' ? Number(data.amount) : null,
            renewal_date: data.renewal_date || null,
            ...(data.paid_by != null && data.paid_by !== '' && { paid_by: data.paid_by }),
          },
        }
      )

      if (response.data) {
        return { success: true, data: response.data }
      }
      return { success: false, error: 'Erreur lors de la création de l\'abonnement' }
    } catch (err: unknown) {
      console.error('Erreur lors de la création de l\'abonnement:', err)
      const error = err as { data?: { error?: { message?: string } }; message?: string }
      const message =
        error?.data?.error?.message ?? error?.message ?? 'Erreur lors de la création de l\'abonnement'
      return { success: false, error: message }
    }
  }

  async function updateSubscription(
    documentId: string,
    data: UpdateSubscriptionData
  ): Promise<UpdateSubscriptionResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      const response = await $fetch<{ data?: Subscription; message?: string }>(
        `${config.public.apiUrl}/api/subscriptions/${documentId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'application/json',
          },
          body: {
            ...(data.name !== undefined && { name: String(data.name).trim() || '' }),
            ...(data.amount !== undefined && {
              amount: data.amount != null && data.amount !== '' ? Number(data.amount) : null,
            }),
            ...(data.renewal_date !== undefined && { renewal_date: data.renewal_date || null }),
            ...(data.paid_by !== undefined && { paid_by: data.paid_by }),
          },
        }
      )

      if (response.data) {
        return { success: true, data: response.data }
      }
      return { success: false, error: 'Erreur lors de la modification' }
    } catch (err: unknown) {
      console.error('Erreur lors de la modification:', err)
      const error = err as { data?: { error?: { message?: string } }; message?: string }
      const message =
        error?.data?.error?.message ?? error?.message ?? 'Erreur lors de la modification'
      return { success: false, error: message }
    }
  }

  async function deleteSubscription(documentId: string): Promise<DeleteSubscriptionResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }
    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      await $fetch(`${config.public.apiUrl}/api/subscriptions/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      return { success: true }
    } catch (err: unknown) {
      console.error('Erreur lors de la suppression:', err)
      const error = err as { data?: { error?: { message?: string } }; message?: string }
      const message =
        error?.data?.error?.message ?? error?.message ?? 'Erreur lors de la suppression'
      return { success: false, error: message }
    }
  }

  return {
    fetchSubscriptions,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  }
}
