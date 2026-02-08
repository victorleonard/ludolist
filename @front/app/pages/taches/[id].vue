<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="py-4 sm:py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-ion-refresh-circle"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12"
      >
        <p class="text-red-500 mb-4">
          {{ error }}
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/taches')"
        >
          Retour à la liste
        </UButton>
      </div>

      <!-- Tâche non trouvée -->
      <div
        v-else-if="!task"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-ion-alert-circle"
          class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Tâche non trouvée
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Cette tâche n'existe pas ou n'est plus disponible.
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/taches')"
        >
          Retour à la liste
        </UButton>
      </div>

      <!-- Détails de la tâche -->
      <div
        v-else
        class="space-y-4 sm:space-y-6 lg:space-y-8"
      >
        <!-- En-tête : titre + badge priorité -->
        <div class="flex flex-col gap-3">
          <h1
            class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 break-words"
            :class="{ 'line-through text-gray-500 dark:text-gray-400': task.is_completed }"
          >
            {{ task.title }}
          </h1>
          <div class="flex flex-wrap items-center gap-2">
            <UBadge
              :color="getPriorityColor(task.priority)"
              :variant="task.priority === 'urgent' ? 'solid' : 'subtle'"
              size="sm"
              :class="task.priority === 'urgent' ? '!bg-red-600 !text-white dark:!bg-red-600 dark:!text-white' : ''"
            >
              {{ getPriorityLabel(task.priority) }}
            </UBadge>
            <UBadge
              v-if="task.is_completed"
              color="success"
              variant="soft"
              size="sm"
            >
              Terminée
            </UBadge>
          </div>
        </div>

        <!-- Description -->
        <div
          v-if="task.description"
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-5 lg:p-6"
        >
          <h2 class="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            Description
          </h2>
          <p class="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {{ task.description }}
          </p>
        </div>
        <div
          v-else
          class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-5 lg:p-6"
        >
          <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 italic">
            Aucune description
          </p>
        </div>

        <!-- Informations de la tâche -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <!-- Date limite -->
          <UCard
            v-if="task.due_date"
            class="bg-white dark:bg-gray-800"
          >
            <div class="p-4 sm:p-5 space-y-3">
              <div class="flex items-center gap-2">
                <UIcon
                  :name="getDueDateIcon(task.due_date)"
                  class="w-5 h-5 shrink-0"
                  :class="getDueDateIconClass(task.due_date)"
                />
                <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Date limite
                </h3>
              </div>
              <p
                class="text-sm sm:text-base font-medium"
                :class="getDueDateClass(task.due_date)"
              >
                {{ formatDueDate(task.due_date) }}
              </p>
            </div>
          </UCard>

          <!-- Mobile : bloc compact Créée par / Assignée à -->
          <UCard
            class="bg-white dark:bg-gray-800 sm:hidden"
          >
            <div class="p-3 space-y-0">
              <div
                v-if="task.created_by"
                class="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span class="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Créée par</span>
                <MemberAvatar
                  :member="task.created_by"
                  size="xs"
                  class="shrink-0"
                />
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ task.created_by.username }}</span>
              </div>
              <div
                class="flex items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                :class="{ 'border-b-0': !task.assigned_to }"
              >
                <span class="text-xs text-gray-500 dark:text-gray-400 w-20 shrink-0">Assignée à</span>
                <template v-if="task.assigned_to">
                  <MemberAvatar
                    :member="task.assigned_to"
                    size="xs"
                    class="shrink-0"
                  />
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ task.assigned_to.username }}</span>
                </template>
                <span v-else class="text-sm text-gray-500 dark:text-gray-400">—</span>
              </div>
            </div>
          </UCard>

          <!-- Desktop : cartes séparées -->
          <UCard
            v-if="task.created_by"
            class="bg-white dark:bg-gray-800 hidden sm:block"
          >
            <div class="p-4 sm:p-5 space-y-3">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-ion-person-add"
                  class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400"
                />
                <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Créée par
                </h3>
              </div>
              <div class="flex items-center gap-3 min-w-0">
                <MemberAvatar
                  :member="task.created_by"
                  size="sm"
                  class="shrink-0"
                />
                <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ task.created_by.username }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard
            v-if="task.assigned_to"
            class="bg-white dark:bg-gray-800 hidden sm:block"
          >
            <div class="p-4 sm:p-5 space-y-3">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-ion-person"
                  class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400"
                />
                <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Assignée à
                </h3>
              </div>
              <div class="flex items-center gap-3 min-w-0">
                <MemberAvatar
                  :member="task.assigned_to"
                  size="sm"
                  class="shrink-0"
                />
                <p class="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ task.assigned_to.username }}
                </p>
              </div>
            </div>
          </UCard>
          <UCard
            v-else
            class="bg-white dark:bg-gray-800 hidden sm:block"
          >
            <div class="p-4 sm:p-5 space-y-3">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-ion-people"
                  class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400"
                />
                <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Assignée à
                </h3>
              </div>
              <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Non assignée
              </p>
            </div>
          </UCard>
        </div>

        <!-- Dates de création et modification -->
        <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p v-if="task.createdAt">
            Créée le {{ formatDate(task.createdAt) }}
          </p>
          <p v-if="task.updatedAt && task.updatedAt !== task.createdAt">
            Modifiée le {{ formatDate(task.updatedAt) }}
          </p>
        </div>

        <!-- Actions en bas de page -->
        <div class="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Actions
          </h2>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            <UButton
              :color="task.is_completed ? 'neutral' : 'success'"
              variant="solid"
              size="lg"
              :loading="loading"
              :disabled="loading"
              class="flex-1 sm:flex-initial min-w-0 rounded-lg text-white"
              @click="handleToggleCompleted"
            >
              <UIcon
                v-if="task.is_completed"
                name="i-ion-checkmark-done"
                class="w-5 h-5 shrink-0"
              />
              <UIcon
                v-else
                name="i-ion-checkmark-circle-outline"
                class="w-5 h-5 shrink-0"
              />
              <span class="ml-2">
                {{ task.is_completed ? 'Défaire' : 'Fait' }}
              </span>
            </UButton>
            <UButton
              variant="solid"
              color="primary"
              size="lg"
              :disabled="loading"
              class="flex-1 sm:flex-initial min-w-0 rounded-lg text-white"
              @click="handleEdit"
            >
              <UIcon
                name="i-ion-create-outline"
                class="w-5 h-5 shrink-0"
              />
              <span class="ml-2">Modifier la tâche</span>
            </UButton>
            <UButton
              variant="solid"
              color="red"
              size="lg"
              :disabled="loading"
              :loading="deleting"
              class="flex-1 sm:flex-initial min-w-0 rounded-lg bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
              @click="handleDelete"
            >
              <UIcon
                name="i-ion-trash-outline"
                class="w-5 h-5 shrink-0"
              />
              <span class="ml-2">Supprimer la tâche</span>
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <AddTaskModal
      :model-value="isModalOpen"
      :task="task"
      @update:model-value="(v) => { if (!v) closeModal() }"
      @success="handleModalSuccess"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasks, type Task } from '~/composables/useTasks'
import AddTaskModal from '~/components/taches/AddTaskModal.vue'
import MemberAvatar from '~/components/MemberAvatar.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const route = useRoute()
const { fetchTask, toggleTaskCompleted, deleteTask } = useTasks()

const loading = ref(true)
const error = ref<string | null>(null)
const task = ref<Task | null>(null)
const deleting = ref(false)
const isModalOpen = ref(false)

const taskIdentifier = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'red'
    case 'high':
      return 'orange'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
    default:
      return 'neutral'
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'Urgent'
    case 'high':
      return 'Haute'
    case 'medium':
      return 'Moyenne'
    case 'low':
      return 'Basse'
    default:
      return priority
  }
}

const formatDueDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Format jour mois année
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  // Ajouter un indicateur relatif si pertinent
  if (diffDays < 0) {
    return `${formatted} (dépassée)`
  } else if (diffDays === 0) {
    return `${formatted} (aujourd'hui)`
  } else if (diffDays === 1) {
    return `${formatted} (demain)`
  } else if (diffDays <= 3) {
    return `${formatted} (dans ${diffDays} jours)`
  }

  return formatted
}

const getDueDateClass = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'text-red-600 dark:text-red-400'
  } else if (diffDays === 0) {
    return 'text-orange-600 dark:text-orange-400'
  } else if (diffDays <= 3) {
    return 'text-yellow-600 dark:text-yellow-400'
  }

  return 'text-gray-600 dark:text-gray-400'
}

const getDueDateIcon = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'i-ion-alert-circle'
  } else if (diffDays <= 3) {
    return 'i-ion-warning'
  }

  return 'i-ion-calendar'
}

const getDueDateIconClass = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return 'text-red-600 dark:text-red-400'
  } else if (diffDays === 0) {
    return 'text-orange-600 dark:text-orange-400'
  } else if (diffDays <= 3) {
    return 'text-yellow-600 dark:text-yellow-400'
  }

  return 'text-gray-500 dark:text-gray-400'
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const loadTask = async () => {
  if (!taskIdentifier.value) {
    error.value = 'Identifiant de tâche manquant'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await fetchTask(taskIdentifier.value)

    if (result.success && result.data) {
      task.value = result.data
    } else {
      error.value = result.error || 'Tâche non trouvée'
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const handleToggleCompleted = async () => {
  if (!task.value?.documentId || loading.value) return

  loading.value = true
  try {
    const result = await toggleTaskCompleted(task.value.documentId)

    if (result.success && result.data) {
      task.value = result.data
    }
  } catch (error) {
    console.error('Erreur lors du changement d\'état:', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleModalSuccess = async (updatedTask: Task) => {
  task.value = updatedTask
  closeModal()
}

const handleDelete = async () => {
  if (!task.value?.documentId) return

  if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
    return
  }

  deleting.value = true
  try {
    const result = await deleteTask(task.value.documentId)

    if (result.success) {
      navigateTo('/taches')
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadTask()
})
</script>
