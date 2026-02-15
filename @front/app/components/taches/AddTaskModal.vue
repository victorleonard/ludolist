<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="relative flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      >
        <!-- Indicateur d'étapes (stepper) -->
        <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ stepTitle }}
            </h2>
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
          <div class="flex items-center gap-2">
            <div
              v-for="s in 3"
              :key="s"
              class="flex items-center gap-1.5 flex-1 min-w-0"
            >
              <button
                type="button"
                class="flex items-center gap-1.5 cursor-pointer group"
                :aria-label="`Étape ${s} : ${taskStepLabels[s - 1]}`"
                @click="goToStep(s)"
              >
                <span
                  class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors shrink-0"
                  :class="currentStep === s
                    ? 'bg-primary-500 text-white'
                    : currentStep > s
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'"
                >
                  {{ currentStep > s ? '✓' : s }}
                </span>
                <span
                  class="text-sm font-medium hidden sm:inline truncate"
                  :class="currentStep === s
                    ? 'text-gray-900 dark:text-gray-100'
                    : currentStep > s
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ taskStepLabels[s - 1] }}
                </span>
              </button>
              <div
                v-if="s < 3"
                class="flex-1 h-0.5 min-w-4 max-w-12 rounded transition-colors shrink-0"
                :class="currentStep > s ? 'bg-primary-400 dark:bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
              />
            </div>
          </div>
        </div>

        <!-- Formulaire par étapes -->
        <form
          id="task-form"
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSubmit"
        >
          <!-- Slider des pages -->
          <div class="flex-1 min-h-0 overflow-hidden">
            <div
              class="flex h-full transition-transform duration-300 ease-out"
              :style="{ width: '300%', transform: `translateX(-${(currentStep - 1) * (100 / 3)}%)` }"
            >
              <!-- Étape 1 : Titre + Description -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Les informations essentielles de la tâche.
                </p>
                <div>
                  <label
                    for="task-title"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    <UIcon name="i-ion-checkbox-outline" class="w-4 h-4 inline mr-1" />
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
                <div>
                  <label
                    for="task-description"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    <UIcon name="i-ion-document-text-outline" class="w-4 h-4 inline mr-1" />
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
              </div>

              <!-- Étape 2 : Priorité + Date limite -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Planification et priorité.
                </p>
                <div>
                  <label
                    for="task-priority"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    <UIcon name="i-ion-flag-outline" class="w-4 h-4 inline mr-1" />
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
                <div>
                  <label
                    for="task-due-date"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    <UIcon name="i-ion-calendar-outline" class="w-4 h-4 inline mr-1" />
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
              </div>

              <!-- Étape 3 : Assignation -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Assignez la tâche à un membre de la famille.
                </p>
                <div>
                  <label
                    for="task-assigned-to"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    <UIcon name="i-ion-people-outline" class="w-4 h-4 inline mr-1" />
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
                        <UIcon name="i-ion-people" class="w-4 h-4" />
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
              </div>
            </div>
          </div>

          <!-- Messages d'erreur généraux -->
          <div
            v-if="generalError"
            class="px-4 pb-2 shrink-0"
          >
            <UAlert
              color="red"
              variant="subtle"
              icon="i-ion-alert-circle"
              class="text-xs sm:text-sm"
            >
              {{ generalError }}
            </UAlert>
          </div>

          <!-- Footer : Précédent / Suivant / Enregistrer -->
          <div
            class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          >
            <div class="flex gap-3">
              <UButton
                v-if="currentStep > 1"
                type="button"
                color="neutral"
                variant="outline"
                size="lg"
                class="min-h-[48px] sm:min-h-0"
                :disabled="submitting || deleting"
                @click="currentStep--"
              >
                Précédent
              </UButton>
              <UButton
                v-if="currentStep < 3"
                type="button"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :disabled="submitting"
                @click="goToNextStep"
              >
                Suivant
              </UButton>
              <UButton
                v-else
                type="submit"
                form="task-form"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :loading="submitting"
                :disabled="!formData.title.trim() || submitting || deleting"
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
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              block
              class="min-h-[48px]"
              :disabled="submitting || deleting"
              @click="closeModal"
            >
              Annuler
            </UButton>
          </div>
        </form>
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

/** Libellés des 3 étapes du formulaire tâche */
const taskStepLabels = ['Infos principales', 'Priorité et date', 'Assignation']

const stepTitle = computed(() =>
  isEditMode.value ? 'Modifier la tâche' : 'Nouvelle tâche',
)

const currentStep = ref(1)

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

// Initialiser le formulaire et l'étape quand le modal s'ouvre ou que la tâche change
watch([isOpen, () => props.task], ([newIsOpen, newTask]) => {
  if (newIsOpen) {
    currentStep.value = 1
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

/** Valide uniquement les champs de l'étape donnée */
function validateStep(step: number): boolean {
  if (step === 1) {
    if (!formData.value.title.trim()) {
      errors.value.title = 'Le titre est requis'
      return false
    }
    errors.value.title = ''
  }
  return true
}

/** Vérifie si on peut passer à l'étape cible (valide les étapes intermédiaires si on avance) */
function canGoToStep(target: number): boolean {
  if (target <= currentStep.value) return true
  for (let s = currentStep.value; s < target; s++) {
    if (!validateStep(s)) return false
  }
  return true
}

function goToNextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

function goToStep(target: number) {
  if (canGoToStep(target)) {
    currentStep.value = target
  }
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
