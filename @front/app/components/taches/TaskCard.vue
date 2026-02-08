<template>
  <div
    class="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden"
    :class="{
      'opacity-70': task.is_completed,
    }"
    @click="handleCardClick"
  >
    <!-- Zone principale cliquable -->
    <div class="flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 lg:p-5">
      <!-- Ligne 1 : Titre en haut à gauche -->
      <h3
        class="min-w-0 text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug"
        :class="{
          'line-through text-gray-500 dark:text-gray-400': task.is_completed,
        }"
      >
        {{ task.title }}
      </h3>

      <!-- Description (tronquée) -->
      <p
        v-if="task.description"
        class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed"
      >
        {{ task.description }}
      </p>

      <!-- Date limite et badge priorité sur la même ligne -->
      <div class="flex items-center justify-between gap-3 min-h-6 flex-wrap">
        <div class="flex items-center gap-2">
          <UIcon
            :name="task.due_date ? getDueDateIcon(task.due_date) : 'i-ion-calendar-outline'"
            class="w-4 h-4 shrink-0"
            :class="task.due_date ? getDueDateClass(task.due_date) : 'text-gray-400 dark:text-gray-500'"
          />
          <span
            v-if="task.due_date"
            class="text-xs sm:text-sm font-medium"
            :class="getDueDateClass(task.due_date)"
          >
            {{ formatDueDate(task.due_date) }}
          </span>
          <span
            v-else
            class="text-xs sm:text-sm text-gray-400 dark:text-gray-500"
          >
            Aucune date limite
          </span>
        </div>
        <UBadge
          :color="getPriorityColor(task.priority)"
          :variant="task.priority === 'urgent' ? 'solid' : 'subtle'"
          size="sm"
          :class="[
            'shrink-0',
            task.priority === 'urgent' ? '!bg-red-600 !text-white dark:!bg-red-600 dark:!text-white' : ''
          ]"
        >
          {{ getPriorityLabel(task.priority) }}
        </UBadge>
      </div>
    </div>

    <!-- Pied de carte : créateur / assigné à gauche, bouton Fait à droite -->
    <div class="flex items-center justify-between gap-3 px-4 sm:px-5 lg:px-5 py-3 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div
          v-if="task.created_by"
          class="flex items-center gap-2 min-w-0"
        >
          <MemberAvatar
            :member="task.created_by"
            size="xs"
            class="shrink-0"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ task.created_by.username }}
          </span>
        </div>
        <UIcon
          v-if="task.created_by && task.assigned_to"
          name="i-ion-arrow-forward"
          class="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0"
        />
        <div
          v-if="task.assigned_to"
          class="flex items-center gap-2 min-w-0"
        >
          <MemberAvatar
            :member="task.assigned_to"
            size="xs"
            class="shrink-0"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ task.assigned_to.username }}
          </span>
        </div>
        <span
          v-if="!task.created_by && !task.assigned_to"
          class="text-xs text-gray-400 dark:text-gray-500"
        >
          —
        </span>
      </div>
      <div
        class="shrink-0 p-1 cursor-pointer"
        @click.stop="handleToggle"
      >
        <UCheckbox
          :model-value="task.is_completed"
          :disabled="loading"
          class="scale-150 origin-center pointer-events-none"
          @update:model-value="handleToggle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTasks, type Task } from '~/composables/useTasks'
import MemberAvatar from '~/components/MemberAvatar.vue'

interface Props {
  task: Task
}

interface Emits {
  (e: 'updated', task: Task): void
  (e: 'click', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { toggleTaskCompleted } = useTasks()

const loading = ref(false)

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

const handleToggle = async () => {
  if (loading.value || !props.task.documentId) return

  loading.value = true
  try {
    const result = await toggleTaskCompleted(props.task.documentId)

    if (result.success && result.data) {
      emit('updated', result.data)
    }
  } catch (error) {
    console.error('Erreur lors du changement d\'état:', error)
  } finally {
    loading.value = false
  }
}

const handleCardClick = () => {
  emit('click', props.task)
}
</script>
