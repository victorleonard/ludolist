import { useAuthStore } from '~/stores/auth'

export interface Task {
  id: number
  documentId: string
  title: string
  description?: string | null
  is_completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  family?: number
  created_by?: {
    id: number
    username: string
  } | null
  assigned_to?: {
    id: number
    username: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface CreateTaskData {
  title: string
  description?: string | null
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  memberId?: number | null
  assigned_to?: number | null
}

export interface UpdateTaskData {
  title?: string
  description?: string | null
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  assigned_to?: number | null
}

export interface FetchTasksResult {
  success: boolean
  data?: Task[]
  error?: string
}

export interface CreateTaskResult {
  success: boolean
  data?: Task
  error?: string
}

export interface UpdateTaskResult {
  success: boolean
  data?: Task
  error?: string
}

export interface ToggleTaskResult {
  success: boolean
  data?: Task
  error?: string
}

export interface DeleteTaskResult {
  success: boolean
  error?: string
}

/**
 * Composable pour gérer les tâches
 */
export function useTasks() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  /**
   * Récupérer toutes les tâches de la famille
   */
  async function fetchTasks(): Promise<FetchTasksResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    try {
      const response = await $fetch<{ data?: Task[] } | Task[]>(
        `${config.public.apiUrl}/api/tasks`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      const data = (response as { data?: Task[] })?.data || (response as Task[])
      return { success: true, data: Array.isArray(data) ? data : [] }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération des tâches:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la récupération des tâches'
      return { success: false, error: message }
    }
  }

  /**
   * Récupérer une tâche par documentId
   */
  async function fetchTask(documentId: string): Promise<{ success: boolean; data?: Task; error?: string }> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      const response = await $fetch<{ data?: Task } | Task>(
        `${config.public.apiUrl}/api/tasks/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        }
      )

      const data = (response as { data?: Task })?.data || (response as Task)
      return { success: true, data }
    } catch (err: unknown) {
      console.error('Erreur lors de la récupération de la tâche:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la récupération de la tâche'
      return { success: false, error: message }
    }
  }

  /**
   * Créer une tâche
   */
  async function createTask(data: CreateTaskData): Promise<CreateTaskResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!data.title || !data.title.trim()) {
      return { success: false, error: 'Le titre est requis' }
    }

    try {
      const response = await $fetch<{
        data?: Task
        message?: string
      }>(`${config.public.apiUrl}/api/tasks/add-to-family`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: {
          title: data.title.trim(),
          description: data.description || null,
          priority: data.priority || 'medium',
          due_date: data.due_date || null,
          ...(data.memberId != null && { memberId: data.memberId }),
          ...(data.assigned_to != null && { assigned_to: data.assigned_to }),
        },
      })

      const taskData = response.data

      if (taskData) {
        return { success: true, data: taskData }
      }

      return { success: false, error: 'Erreur lors de la création de la tâche' }
    } catch (err: unknown) {
      console.error('Erreur lors de la création de la tâche:', err)
      const error = err as {
        data?: { error?: { message?: string } }
        message?: string
      }
      const message =
        error?.data?.error?.message ??
        error?.message ??
        'Erreur lors de la création de la tâche'
      return { success: false, error: message }
    }
  }

  /**
   * Mettre à jour une tâche
   */
  async function updateTask(
    documentId: string,
    data: UpdateTaskData
  ): Promise<UpdateTaskResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      const response = await $fetch<{
        data?: Task
        message?: string
      }>(`${config.public.apiUrl}/api/tasks/${documentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: {
          ...(data.title !== undefined && { title: data.title?.trim() || '' }),
          ...(data.description !== undefined && { description: data.description || null }),
          ...(data.priority !== undefined && { priority: data.priority }),
          ...(data.due_date !== undefined && { due_date: data.due_date || null }),
          ...(data.assigned_to !== undefined && { assigned_to: data.assigned_to }),
        },
      })

      const taskData = response.data

      if (taskData) {
        return { success: true, data: taskData }
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
   * Basculer l'état de complétion d'une tâche
   */
  async function toggleTaskCompleted(
    documentId: string
  ): Promise<ToggleTaskResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      const response = await $fetch<{
        data?: Task
        message?: string
      }>(`${config.public.apiUrl}/api/tasks/${documentId}/toggle-completed`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      const taskData = response.data

      if (taskData) {
        return { success: true, data: taskData }
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
   * Supprimer une tâche
   */
  async function deleteTask(
    documentId: string
  ): Promise<DeleteTaskResult> {
    if (!authStore.token) {
      return { success: false, error: 'Non authentifié' }
    }

    if (!documentId) {
      return { success: false, error: 'documentId requis' }
    }

    try {
      await $fetch(`${config.public.apiUrl}/api/tasks/${documentId}`, {
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
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
  }
}
