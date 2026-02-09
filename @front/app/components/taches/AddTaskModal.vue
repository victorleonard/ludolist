<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      >
        <div class="px-4 py-4 sm:px-5 lg:px-6 sm:py-5 lg:py-6 overflow-y-auto">
          <!-- En-tête avec titre et bouton fermer -->
          <div class="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
            <h3 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche' }}
            </h3>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ion-close"
              size="sm"
              :disabled="submitting || deleting"
              aria-label="Fermer"
              class="min-w-[40px] min-h-[40px] flex items-center justify-center -mr-2"
              @click="closeModal"
            />
          </div>

          <!-- Formulaire -->
          <form
            @submit.prevent="handleSubmit"
            class="space-y-3 sm:space-y-4 lg:space-y-5"
          >
            <!-- Titre -->
            <div>
              <label
                for="task-title"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Titre <span class="text-red-500">*</span>
              </label>
              <UInput
                id="task-title"
                v-model="formData.title"
                :disabled="submitting"
                :error="!!errors.title"
                placeholder="Titre de la tâche"
                autocomplete="off"
                size="lg"
                class="w-full"
              />
              <p
                v-if="errors.title"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.title }}
              </p>
            </div>

            <!-- Description -->
            <div>
              <label
                for="task-description"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Description
              </label>
              <UTextarea
                id="task-description"
                v-model="formData.description"
                :disabled="submitting"
                placeholder="Description détaillée (optionnel)"
                :rows="3"
                class="w-full"
              />
            </div>

            <!-- Priorité -->
            <div>
              <label
                for="task-priority"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Priorité
              </label>
              <USelect
                id="task-priority"
                v-model="formData.priority"
                :disabled="submitting"
                :items="priorityOptions"
                option-attribute="label"
                value-attribute="value"
                size="lg"
                class="w-full"
              >
                <template #option="{ option }">
                  <div class="flex items-center gap-2">
                    <UBadge
                      :color="getPriorityColor(option.value)"
                      :variant="option.value === 'urgent' ? 'solid' : 'subtle'"
                      size="xs"
                      :class="getPriorityBadgeClass(option.value)"
                    >
                      {{ option.label }}
                    </UBadge>
                  </div>
                </template>
              </USelect>
            </div>

            <!-- Date limite -->
            <div>
              <label
                for="task-due-date"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Date limite
              </label>
              <UInput
                id="task-due-date"
                v-model="formData.due_date"
                :disabled="submitting"
                type="date"
                size="lg"
                class="w-full"
              />
            </div>

            <!-- Assignation -->
            <div>
              <label
                for="task-assigned-to"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Assigner à
              </label>
              <USelect
                id="task-assigned-to"
                v-model="formData.assigned_to"
                :disabled="submitting"
                :items="assignationOptions"
                option-attribute="label"
                value-attribute="value"
                size="lg"
                class="w-full"
              >
                <template #option="{ option }">
                  <div
                    v-if="option.value === null"
                    class="flex items-center gap-2"
                  >
                    <UIcon
                      name="i-ion-people"
                      class="w-4 h-4"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-2"
                  >
                    <MemberAvatar
                      :member="option.member"
                      size="xs"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                </template>
              </USelect>
            </div>

            <!-- Messages d'erreur généraux -->
            <UAlert
              v-if="generalError"
              color="red"
              variant="subtle"
              icon="i-ion-alert-circle"
              class="text-xs sm:text-sm"
            >
              {{ generalError }}
            </UAlert>

            <!-- Boutons d'action -->
            <div class="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <UButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="lg"
                  :disabled="submitting || deleting"
                  class="w-full sm:w-auto sm:flex-1"
                  @click="closeModal"
                >
                  Annuler
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  size="lg"
                  :loading="submitting"
                  :disabled="!formData.title.trim() || submitting || deleting"
                  class="w-full sm:w-auto sm:flex-1"
                >
                  {{ isEditMode ? 'Enregistrer' : 'Créer' }}
                </UButton>
              </div>
              <UButton
                v-if="isEditMode && props.task"
                type="button"
                variant="ghost"
                color="red"
                size="lg"
                icon="i-ion-trash-outline"
                :loading="deleting"
                :disabled="submitting"
                class="w-full justify-center"
                @click="handleDelete"
              >
                Supprimer la tâche
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useFamilyStore } from '~/stores/family'
import { useTasks, type Task, type CreateTaskData, type UpdateTaskData } from '~/composables/useTasks'
import MemberAvatar from '~/components/MemberAvatar.vue'

interface Props {
  modelValue: boolean
  task?: Task | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', task: Task): void
  (e: 'deleted', taskId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
})

const emit = defineEmits<Emits>()

const { createTask, updateTask, deleteTask } = useTasks()
const memberStore = useMemberStore()
const familyStore = useFamilyStore()
const { currentMember } = storeToRefs(memberStore)
const { familyMembers } = storeToRefs(familyStore)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.task)

const formData = ref<{
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  assigned_to: number | null
}>({
  title: '',
  description: null,
  priority: 'medium',
  due_date: null,
  assigned_to: null,
})

const submitting = ref(false)
const deleting = ref(false)
const errors = ref<{ title?: string }>({})
const generalError = ref('')

const priorityOptions = [
  { label: 'Basse', value: 'low' },
  { label: 'Moyenne', value: 'medium' },
  { label: 'Haute', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const assignationOptions = computed(() => {
  const options: Array<{ label: string; value: number | null; member?: { id: number; username: string } }> = [
    { label: 'Non assigné', value: null },
  ]

  familyMembers.value.forEach((member) => {
    options.push({
      label: member.username,
      value: member.id,
      member: { id: member.id, username: member.username },
    })
  })

  return options
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

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return '!bg-red-600 !text-white dark:!bg-red-600 dark:!text-white'
    case 'high':
      return '!bg-orange-100 !text-orange-800 dark:!bg-orange-900/50 dark:!text-orange-200'
    case 'medium':
      return '!bg-amber-100 !text-amber-800 dark:!bg-amber-900/50 dark:!text-amber-200'
    case 'low':
      return '!bg-green-100 !text-green-800 dark:!bg-green-900/50 dark:!text-green-200'
    default:
      return ''
  }
}

// Initialiser le formulaire quand le modal s'ouvre ou que la tâche change
watch([isOpen, () => props.task], ([newIsOpen, newTask]) => {
  if (newIsOpen) {
    if (newTask && isEditMode.value) {
      // Mode édition : remplir avec les données de la tâche
      formData.value = {
        title: newTask.title || '',
        description: newTask.description || null,
        priority: newTask.priority || 'medium',
        due_date: newTask.due_date ? newTask.due_date.split('T')[0] : null,
        assigned_to: newTask.assigned_to?.id || null,
      }
    } else {
      // Mode création : formulaire vide avec valeurs par défaut
      formData.value = {
        title: '',
        description: null,
        priority: 'medium',
        due_date: null,
        assigned_to: null,
      }
    }
    errors.value = {}
    generalError.value = ''
  }
}, { immediate: true })

const closeModal = () => {
  isOpen.value = false
}

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    errors.value.title = 'Le titre est requis'
    return
  }

  submitting.value = true
  errors.value = {}
  generalError.value = ''

  try {
    const memberId = currentMember.value?.id || null

    if (isEditMode.value && props.task) {
      // Mode édition
      const updateData: UpdateTaskData = {
        title: formData.value.title.trim(),
        description: formData.value.description?.trim() || null,
        priority: formData.value.priority,
        due_date: formData.value.due_date || null,
        assigned_to: formData.value.assigned_to,
      }

      const result = await updateTask(props.task.documentId, updateData)

      if (result.success && result.data) {
        emit('success', result.data)
        closeModal()
      } else {
        generalError.value = result.error || 'Erreur lors de la modification'
      }
    } else {
      // Mode création
      const createData: CreateTaskData = {
        title: formData.value.title.trim(),
        description: formData.value.description?.trim() || null,
        priority: formData.value.priority,
        due_date: formData.value.due_date || null,
        memberId,
        assigned_to: formData.value.assigned_to,
      }

      const result = await createTask(createData)

      if (result.success && result.data) {
        emit('success', result.data)
        closeModal()
      } else {
        generalError.value = result.error || 'Erreur lors de la création'
      }
    }
  } catch (error) {
    console.error('Erreur lors de la soumission:', error)
    generalError.value = 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!props.task?.documentId) return
  if (!confirm('Supprimer cette tâche ?')) return

  deleting.value = true
  generalError.value = ''

  try {
    const result = await deleteTask(props.task.documentId)
    if (result.success) {
      emit('deleted', props.task.documentId)
      closeModal()
    } else {
      generalError.value = result.error || 'Erreur lors de la suppression'
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    generalError.value = 'Une erreur est survenue'
  } finally {
    deleting.value = false
  }
}
</script>
