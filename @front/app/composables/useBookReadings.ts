import type { BookReading } from '~/stores/family'

export interface FetchBookReadingsResult {
  success: boolean
  data?: BookReading[]
  error?: string
}

/**
 * Composable dédié : récupère les lectures d'un livre via l'API
 * GET /api/book-readings/book/:bookId
 */
export function useBookReadings() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  async function fetchReadingsForBook(
    bookId: number | string
  ): Promise<FetchBookReadingsResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const response = await $fetch<{ data?: BookReading[] } | BookReading[]>(
        `${config.public.apiUrl}/api/book-readings/book/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )
      const list = Array.isArray(response)
        ? response
        : (Array.isArray(response?.data) ? response.data : [])
      return { success: true, data: list }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des lectures du livre:', err)
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

  return { fetchReadingsForBook }
}
