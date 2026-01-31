<template>
  <UModal
    :open="isOpen"
    :fullscreen="isMobile"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <UCard class="w-full md:max-w-lg flex flex-col bg-white dark:bg-gray-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ reading ? 'Modifier ma lecture' : 'Ajouter ma lecture' }}
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              size="sm"
              class="-my-1"
              :disabled="submitting"
              @click="closeModal"
            />
          </div>
        </template>

        <form
          class="space-y-4 overflow-y-auto flex-1"
          @submit.prevent="handleSubmit"
        >
          <!-- Champ membre - masqué si un membre est connecté -->
          <div v-if="!memberStore.isMemberConnected || !memberStore.currentMember">
            <label
              for="member"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-user"
                class="w-4 h-4"
              />
              Membre <span class="text-red-500">*</span>
            </label>
            <USelect
              id="member"
              v-model="state.memberId"
              :items="memberOptions"
              option-attribute="label"
              value-attribute="value"
              :disabled="submitting || !!reading"
              :error="!!errors.memberId"
              class="w-full"
            />
            <p
              v-if="errors.memberId"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.memberId }}
            </p>
          </div>

          <!-- Message informatif si membre connecté -->
          <div
            v-if="memberStore.isMemberConnected && memberStore.currentMember"
            class="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-user-circle"
                class="w-4 h-4 text-primary-600 dark:text-primary-400"
              />
              <span class="text-sm text-primary-700 dark:text-primary-300">
                Vous ajoutez cette lecture en tant que <strong>{{ memberStore.currentMember.username }}</strong>
              </span>
            </div>
          </div>

          <div>
            <label
              for="date_debut"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              Date de début de lecture
            </label>
            <UInput
              id="date_debut"
              v-model="state.date_debut"
              type="date"
              :disabled="submitting"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="date_fin"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-calendar-check"
                class="w-4 h-4"
              />
              Date de fin de lecture
            </label>
            <UInput
              id="date_fin"
              v-model="state.date_fin"
              type="date"
              :disabled="submitting"
              :min="state.date_debut"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="note"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-star"
                class="w-4 h-4"
              />
              Note (sur 10)
            </label>
            <UInput
              id="note"
              v-model.number="state.note"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="Ex: 8.5"
              :disabled="submitting"
              class="w-full"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Notez ce livre de 0 à 10
            </p>
          </div>

          <div
            v-if="submitError"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>

          <div class="flex gap-3 pt-4">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              :loading="submitting"
            >
              {{ reading ? 'Enregistrer' : 'Ajouter' }}
            </UButton>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useFamilyStore, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

const isMobile = useMediaQuery('(max-width: 767px)')

interface Props {
  modelValue: boolean
  bookId: number | string
  reading?: BookReading | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  reading: null
})

const emit = defineEmits<Emits>()

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const members = computed(() => familyStore.familyMembers)

const memberOptions = computed(() => {
  return members.value.map(member => ({
    label: member.username,
    value: member.id
  }))
})

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  } else {
    // Si un membre est connecté, l'utiliser par défaut
    if (memberStore.isMemberConnected && memberStore.currentMember) {
      state.memberId = memberStore.currentMember.id
    }
    if (newValue && props.reading) {
      loadReadingData()
    }
  }
})

watch(() => props.reading, (newReading) => {
  if (newReading && isOpen.value) {
    loadReadingData()
  }
})

const submitting = ref(false)
const submitError = ref<string | null>(null)

const state = reactive({
  memberId: null as number | null,
  date_debut: '',
  date_fin: '',
  note: null as number | null
})

const errors = reactive({
  memberId: ''
})

const loadReadingData = () => {
  if (props.reading) {
    state.memberId = props.reading.member.id
    state.date_debut = props.reading.date_debut || ''
    state.date_fin = props.reading.date_fin || ''
    state.note = props.reading.note || null
  }
}

const resetForm = () => {
  state.memberId = null
  state.date_debut = ''
  state.date_fin = ''
  state.note = null
  submitError.value = null
  errors.memberId = ''
}

// Réinitialiser les erreurs quand les champs sont modifiés
watch(() => state.memberId, () => {
  if (errors.memberId) errors.memberId = ''
})

const validateForm = (): boolean => {
  errors.memberId = ''

  // Si un membre est connecté, utiliser son ID automatiquement
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    state.memberId = memberStore.currentMember.id
  }

  if (!state.memberId) {
    errors.memberId = 'Le membre est requis'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    const result = await familyStore.upsertBookReading(
      state.memberId!,
      props.bookId,
      {
        date_debut: state.date_debut || null,
        date_fin: state.date_fin || null,
        note: state.note || null
      }
    )

    if (!result.success) {
      submitError.value = result.error || 'Erreur lors de la sauvegarde'
      return
    }

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la sauvegarde de la lecture:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde'
    submitError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    resetForm()
    isOpen.value = false
  }
}
</script>
