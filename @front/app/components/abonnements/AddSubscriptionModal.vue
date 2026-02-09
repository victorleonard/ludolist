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
          <div class="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
            <h3 class="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {{ isEditMode ? 'Modifier l\'abonnement' : 'Nouvel abonnement' }}
            </h3>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ion-close"
              size="sm"
              :disabled="submitting"
              aria-label="Fermer"
              class="min-w-[40px] min-h-[40px] flex items-center justify-center -mr-2"
              @click="closeModal"
            />
          </div>

          <form
            @submit.prevent="handleSubmit"
            class="space-y-3 sm:space-y-4 lg:space-y-5"
          >
            <div>
              <label
                for="sub-name"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Nom <span class="text-red-500">*</span>
              </label>
              <UInput
                id="sub-name"
                v-model="formData.name"
                :disabled="submitting"
                :error="!!errors.name"
                placeholder="ex. Netflix, Internet..."
                autocomplete="off"
                size="lg"
                class="w-full"
              />
              <p
                v-if="errors.name"
                class="mt-1.5 text-xs text-red-600 dark:text-red-400"
              >
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label
                for="sub-amount"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Montant (€)
              </label>
              <UInput
                id="sub-amount"
                v-model="formData.amount"
                :disabled="submitting"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                size="lg"
                class="w-full"
              />
            </div>

            <div>
              <label
                for="sub-renewal-day"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Jour de renouvellement
              </label>
              <UInput
                id="sub-renewal-day"
                v-model.number="formData.renewal_day"
                :disabled="submitting"
                type="number"
                min="1"
                max="31"
                placeholder="ex. 15"
                size="lg"
                class="w-full"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Jour du mois (1-31)
              </p>
            </div>

            <div>
              <label
                for="sub-paid-by"
                class="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2"
              >
                Qui paye
              </label>
              <USelect
                id="sub-paid-by"
                v-model="formData.paid_by"
                :disabled="submitting"
                :items="paidByOptions"
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
                      name="i-ion-person-outline"
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

            <UAlert
              v-if="generalError"
              color="red"
              variant="subtle"
              icon="i-ion-alert-circle"
              class="text-xs sm:text-sm"
            >
              {{ generalError }}
            </UAlert>

            <div class="flex flex-col gap-2 sm:gap-3 pt-2 sm:pt-4">
              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <UButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="lg"
                  :disabled="submitting || deleting"
                  class="w-full sm:w-auto sm:flex-1 min-h-[44px]"
                  @click="closeModal"
                >
                  Annuler
                </UButton>
                <UButton
                  type="submit"
                  color="primary"
                  size="lg"
                  :loading="submitting"
                  :disabled="!formData.name.trim() || submitting || deleting"
                  class="w-full sm:w-auto sm:flex-1 min-h-[44px]"
                >
                  {{ isEditMode ? 'Enregistrer' : 'Créer' }}
                </UButton>
              </div>
              <UButton
                v-if="isEditMode && props.subscription"
                type="button"
                variant="ghost"
                color="red"
                size="lg"
                icon="i-ion-trash-outline"
                :loading="deleting"
                :disabled="submitting"
                class="w-full min-h-[44px] justify-center"
                @click="handleDelete"
              >
                Supprimer l'abonnement
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
import { useFamilyStore } from '~/stores/family'
import {
  useSubscriptions,
  type Subscription,
  type CreateSubscriptionData,
  type UpdateSubscriptionData,
} from '~/composables/useSubscriptions'
import MemberAvatar from '~/components/MemberAvatar.vue'

interface Props {
  modelValue: boolean
  subscription?: Subscription | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', subscription: Subscription): void
  (e: 'deleted', documentId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  subscription: null,
})

const emit = defineEmits<Emits>()

const { createSubscription, updateSubscription, deleteSubscription } = useSubscriptions()
const familyStore = useFamilyStore()
const { familyMembers } = storeToRefs(familyStore)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.subscription)

const formData = ref<{
  name: string
  amount: string | null
  renewal_day: number | null
  paid_by: number | null
}>({
  name: '',
  amount: null,
  renewal_day: null,
  paid_by: null,
})

const submitting = ref(false)
const deleting = ref(false)
const errors = ref<{ name?: string }>({})
const generalError = ref('')

const paidByOptions = computed(() => {
  const options: Array<{
    label: string
    value: number | null
    member?: { id: number; username: string }
  }> = [{ label: 'Non défini', value: null }]

  familyMembers.value.forEach((member) => {
    options.push({
      label: member.username,
      value: member.id,
      member: { id: member.id, username: member.username },
    })
  })

  return options
})

watch(
  [isOpen, () => props.subscription],
  ([newIsOpen, newSub]) => {
    if (newIsOpen) {
      if (newSub && isEditMode.value) {
        let renewalDay: number | null = null
        if (newSub.renewal_date) {
          const d = new Date(newSub.renewal_date)
          if (!Number.isNaN(d.getTime())) renewalDay = d.getDate()
        }
        formData.value = {
          name: newSub.name || '',
          amount:
            newSub.amount != null && newSub.amount !== ''
              ? String(newSub.amount)
              : null,
          renewal_day: renewalDay,
          paid_by: newSub.paid_by?.id ?? null,
        }
      } else {
        formData.value = {
          name: '',
          amount: null,
          renewal_day: null,
          paid_by: null,
        }
      }
      errors.value = {}
      generalError.value = ''
    }
  },
  { immediate: true }
)

function closeModal() {
  isOpen.value = false
}

/** Construit une date ISO (YYYY-MM-DD) à partir du jour du mois ; garde mois/année existants si fournis. */
function buildRenewalDateFromDay(
  day: number | null,
  existingDateStr: string | null | undefined
): string | null {
  if (day == null || day < 1 || day > 31) return null
  const refDate = existingDateStr ? new Date(existingDateStr) : new Date()
  if (Number.isNaN(refDate.getTime())) return null
  refDate.setDate(day)
  const y = refDate.getFullYear()
  const m = String(refDate.getMonth() + 1).padStart(2, '0')
  const d = String(refDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function handleSubmit() {
  if (!formData.value.name.trim()) {
    errors.value.name = 'Le nom est requis'
    return
  }

  submitting.value = true
  errors.value = {}
  generalError.value = ''

  try {
    const renewalDate = buildRenewalDateFromDay(
      formData.value.renewal_day,
      props.subscription?.renewal_date ?? null
    )

    if (isEditMode.value && props.subscription) {
      const updateData: UpdateSubscriptionData = {
        name: formData.value.name.trim(),
        amount:
          formData.value.amount != null && formData.value.amount !== ''
            ? Number(formData.value.amount)
            : null,
        renewal_date: renewalDate,
        paid_by: formData.value.paid_by,
      }

      const result = await updateSubscription(
        props.subscription.documentId,
        updateData
      )

      if (result.success && result.data) {
        emit('success', result.data)
        closeModal()
      } else {
        generalError.value = result.error || 'Erreur lors de la modification'
      }
    } else {
      const createData: CreateSubscriptionData = {
        name: formData.value.name.trim(),
        amount:
          formData.value.amount != null && formData.value.amount !== ''
            ? Number(formData.value.amount)
            : null,
        renewal_date: renewalDate,
        paid_by: formData.value.paid_by,
      }

      const result = await createSubscription(createData)

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
  if (!props.subscription?.documentId) return
  if (!confirm('Supprimer cet abonnement ?')) return

  deleting.value = true
  generalError.value = ''

  try {
    const result = await deleteSubscription(props.subscription.documentId)
    if (result.success) {
      emit('deleted', props.subscription.documentId)
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
