<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: env(safe-area-inset-bottom, 0px);"
      >
        <!-- En-tête -->
        <div class="flex items-center justify-between gap-3 px-4 py-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">
            {{ reading ? 'Modifier ma lecture' : 'Ajouter ma lecture' }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            class="shrink-0 min-w-[44px] min-h-[44px] rounded-full -mr-1"
            :disabled="submitting"
            aria-label="Fermer"
            @click="closeModal"
          />
        </div>

        <form
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <!-- Champ membre - masqué si un membre est connecté -->
          <div
            v-if="!memberStore.isMemberConnected || !memberStore.currentMember"
            class="form-field"
          >
            <label
              for="member"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-person"
                class="w-4 h-4 shrink-0"
              />
              Membre <span class="text-red-500">*</span>
            </label>
            <SelectWithModal
              id="member"
              v-model="state.memberId"
              :items="memberOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Choisir un membre"
              modal-title="Choisir un membre"
              :disabled="submitting || !!reading"
              :error="!!errors.memberId"
              class="w-full input-touch"
            />
            <p
              v-if="errors.memberId"
              class="mt-1.5 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.memberId }}
            </p>
          </div>

          <!-- Message informatif si membre connecté -->
          <div
            v-if="memberStore.isMemberConnected && memberStore.currentMember"
            class="p-3.5 sm:p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
          >
            <div class="flex items-center gap-2">
              <UIcon
                name="i-ion-person-circle"
                class="w-5 h-5 sm:w-4 sm:h-4 shrink-0 text-primary-600 dark:text-primary-400"
              />
              <span class="text-sm text-primary-700 dark:text-primary-300">
                Vous ajoutez cette lecture en tant que <strong>{{ memberStore.currentMember.username }}</strong>
              </span>
            </div>
          </div>

          <div class="form-field">
            <label
              for="date_debut"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-calendar-outline"
                class="w-4 h-4 shrink-0"
              />
              Date de début
            </label>
            <UInput
              id="date_debut"
              v-model="state.date_debut"
              type="date"
              :disabled="submitting"
              class="w-full input-touch"
            />
          </div>

          <div class="form-field">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 mb-1 sm:mb-1">
              <label
                for="date_fin"
                class="label-mobile"
              >
                <UIcon
                  name="i-ion-calendar"
                  class="w-4 h-4 shrink-0"
                />
                Date de fin
              </label>
              <UButton
                v-if="reading && state.date_fin"
                type="button"
                color="neutral"
                variant="soft"
                size="sm"
                class="w-full sm:w-auto min-h-[44px] sm:min-h-0 self-start"
                :disabled="submitting"
                @click="state.date_fin = ''"
              >
                Supprimer la date de fin
              </UButton>
            </div>
            <UInput
              id="date_fin"
              v-model="state.date_fin"
              type="date"
              :disabled="submitting"
              :min="state.date_debut"
              class="w-full input-touch"
            />
          </div>

          <div class="form-field">
            <label
              for="note"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-star"
                class="w-4 h-4 shrink-0"
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
              class="w-full input-touch"
            />
            <p class="mt-1.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">
              Notez ce livre de 0 à 10
            </p>
          </div>

          <div class="form-field">
            <label
              for="pages_lues"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-document-text-outline"
                class="w-4 h-4 shrink-0"
              />
              Pages lues
            </label>
            <UInput
              id="pages_lues"
              v-model.number="state.pages_lues"
              type="number"
              min="0"
              placeholder="Ex: 150"
              :disabled="submitting"
              class="w-full input-touch"
            />
            <p class="mt-1.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nombre de pages que vous avez lues
            </p>
          </div>

          <div
            v-if="submitError"
            class="p-3.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>

          <div class="pt-2 sm:pt-4">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              class="min-h-[52px] sm:min-h-0 text-base font-semibold rounded-xl"
              :loading="submitting"
            >
              {{ reading ? 'Enregistrer' : 'Ajouter' }}
            </UButton>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useFamilyStore, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

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
  note: null as number | null,
  pages_lues: null as number | null
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
    state.pages_lues = props.reading.pages_lues || null
  }
}

const resetForm = () => {
  state.memberId = null
  state.date_debut = ''
  state.date_fin = ''
  state.note = null
  state.pages_lues = null
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
        note: state.note || null,
        pages_lues: state.pages_lues || null
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

<style scoped>
/* Champs et labels optimisés mobile : zone tactile, pas de zoom iOS */
.form-field :deep(.label-mobile) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
  margin-bottom: 0.375rem;
}

.form-field :deep(.input-touch) {
  width: 100%;
}

@media (max-width: 639px) {
  .form-field :deep(input[type="text"]),
  .form-field :deep(input[type="number"]),
  .form-field :deep(input[type="date"]) {
    min-height: 48px;
    font-size: 16px; /* Évite le zoom automatique sur iOS */
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
