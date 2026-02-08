<template>
  <div>
    <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div>
        <div class="mt-4 sm:mt-6">
          <div class="mb-6 sm:mb-8">
            <div class="mb-4 sm:mb-6">
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">
                Liste de tâches
              </h1>
            </div>
          </div>

          <div
            v-if="loading"
            class="flex justify-center items-center py-12"
          >
            <UIcon
              name="i-ion-refresh-circle"
              class="w-8 h-8 animate-spin text-primary-500"
            />
          </div>

          <div
            v-else-if="error"
            class="flex flex-col items-center justify-center py-12"
          >
            <p class="text-red-500 mb-4">
              {{ error }}
            </p>
            <UButton
              color="primary"
              @click="refresh"
            >
              Réessayer
            </UButton>
          </div>

          <div
            v-else-if="tasks.length === 0"
            class="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20"
          >
            <UIcon
              name="i-ion-checkmark-circle"
              class="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-500 mb-4"
            />
            <p class="text-gray-500 dark:text-gray-400 mb-4 text-center">
              Aucune tâche pour l'instant
            </p>
            <UButton
              color="primary"
              @click="openModal"
            >
              Créer votre première tâche
            </UButton>
          </div>

          <template v-else>
            <!-- Section "À faire" -->
            <div
              v-if="pendingTasks.length > 0"
              class="mb-6 sm:mb-8 lg:mb-10"
            >
              <div class="flex items-center gap-2 mb-4 sm:mb-5">
                <UIcon
                  name="i-ion-list"
                  class="w-5 h-5 sm:w-6 sm:h-6 text-primary-500"
                />
                <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  À faire ({{ pendingTasks.length }})
                </h2>
              </div>

              <!-- Mobile : Liste verticale -->
              <div class="md:hidden space-y-3">
                <TaskCard
                  v-for="task in sortedPendingTasks"
                  :key="task.documentId"
                  :task="task"
                  @updated="handleTaskUpdated"
                  @click="handleTaskClick"
                />
              </div>

              <!-- Tablette/Desktop : Grille -->
              <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <TaskCard
                  v-for="task in sortedPendingTasks"
                  :key="task.documentId"
                  :task="task"
                  @updated="handleTaskUpdated"
                  @click="handleTaskClick"
                />
              </div>
            </div>

            <!-- Section "Terminées" -->
            <div
              v-if="completedTasks.length > 0"
              class="mb-6 sm:mb-8 lg:mb-10"
            >
              <div class="flex items-center gap-2 mb-4 sm:mb-5">
                <UIcon
                  name="i-ion-checkmark-circle"
                  class="w-5 h-5 sm:w-6 sm:h-6 text-green-500"
                />
                <h2 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Terminées ({{ completedTasks.length }})
                </h2>
              </div>

              <!-- Mobile : Liste verticale -->
              <div class="md:hidden space-y-3">
                <TaskCard
                  v-for="task in sortedCompletedTasks"
                  :key="task.documentId"
                  :task="task"
                  @updated="handleTaskUpdated"
                  @click="handleTaskClick"
                />
              </div>

              <!-- Tablette/Desktop : Grille -->
              <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                <TaskCard
                  v-for="task in sortedCompletedTasks"
                  :key="task.documentId"
                  :task="task"
                  @updated="handleTaskUpdated"
                  @click="handleTaskClick"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </UContainer>

    <!-- Bouton flottant pour ajouter une tâche -->
    <button
      type="button"
      class="fixed right-4 z-40 rounded-full w-14 h-14 min-w-[56px] min-h-[56px] bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center p-0 border-0 cursor-pointer"
      style="bottom: calc(80px + max(0.5rem, env(safe-area-inset-bottom, 0.5rem)));"
      aria-label="Ajouter une tâche"
      @click="openModal"
    >
      <UIcon
        name="i-ion-add"
        class="w-6 h-6 text-white"
      />
    </button>

    <AddTaskModal
      :model-value="isModalOpen"
      :task="selectedTask"
      @update:model-value="(v) => { if (!v) closeModal() }"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasks, type Task } from '~/composables/useTasks'
import AddTaskModal from '~/components/taches/AddTaskModal.vue'
import TaskCard from '~/components/taches/TaskCard.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const { fetchTasks } = useTasks()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<Task[]>([])
const isModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

const pendingTasks = computed(() => {
  return tasks.value.filter((task) => !task.is_completed)
})

const completedTasks = computed(() => {
  return tasks.value.filter((task) => task.is_completed)
})

// Trier les tâches par priorité et date limite
const sortedPendingTasks = computed(() => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
  return [...pendingTasks.value].sort((a, b) => {
    // D'abord par priorité
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    if (priorityDiff !== 0) return priorityDiff

    // Ensuite par date limite (les plus proches en premier)
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    if (a.due_date) return -1
    if (b.due_date) return 1

    // Enfin par date de création (les plus récentes en premier)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })
})

const sortedCompletedTasks = computed(() => {
  return [...completedTasks.value].sort((a, b) => {
    // Trier par date de complétion (les plus récentes en premier)
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  })
})

const loadTasks = async () => {
  loading.value = true
  error.value = null

  try {
    const result = await fetchTasks()

    if (result.success && result.data) {
      tasks.value = result.data
    } else {
      error.value = result.error || 'Erreur lors du chargement des tâches'
    }
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  loadTasks()
}

const openModal = () => {
  selectedTask.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTask.value = null
}

const handleModalSuccess = () => {
  // Recharger la liste après ajout/modification
  loadTasks()
}

const handleTaskUpdated = (updatedTask: Task) => {
  // Mettre à jour la tâche dans la liste locale
  const index = tasks.value.findIndex(
    (task) => task.documentId === updatedTask.documentId
  )
  if (index !== -1) {
    tasks.value[index] = updatedTask
  }
}

const handleTaskClick = (task: Task) => {
  navigateTo(`/taches/${task.documentId}`)
}

onMounted(() => {
  loadTasks()
})
</script>
