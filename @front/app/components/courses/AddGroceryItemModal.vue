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
        <div class="flex items-center justify-between gap-3 px-4 py-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">
            Ajouter un produit
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            class="min-w-[44px] min-h-[44px] rounded-full -mr-1"
            :disabled="submitting"
            aria-label="Fermer"
            @click="closeModal"
          />
        </div>

        <div
          class="space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
        >
          <!-- Input réel mais invisible pour iOS - focusé immédiatement depuis l'événement de clic -->
          <input
            ref="iosInputRef"
            type="text"
            autocomplete="off"
            class="absolute opacity-0 pointer-events-none"
            style="position: fixed; left: 0; top: 0; width: 1px; height: 1px; z-index: -1;"
            tabindex="0"
            @blur="transferToRealInput"
          />
          <div class="form-field">
            <label
              for="grocery-item-name"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              <UIcon
                name="i-ion-cart"
                class="w-4 h-4 shrink-0"
              />
              Nom du produit <span class="text-red-500">*</span>
            </label>
            <UInput
              ref="nameInputRef"
              id="grocery-item-name"
              v-model="itemName"
              :disabled="submitting"
              :error="!!errors.name"
              class="w-full input-touch"
              placeholder="Ex. Lait, Pain, Pommes..."
              autocomplete="off"
              @input="handleInput"
            />
            <p
              v-if="errors.name"
              class="mt-1.5 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </div>

          <!-- Suggestions de produits existants -->
          <div
            v-if="suggestions.length > 0 && itemName.trim().length > 0"
            class="space-y-2"
          >
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Produits similaires :
            </p>
            <div class="space-y-1 max-h-48 overflow-y-auto">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion.documentId"
                type="button"
                class="w-full text-left px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between group"
                @click="selectSuggestion(suggestion)"
              >
                <span class="text-sm text-gray-900 dark:text-gray-100">
                  {{ suggestion.name }}
                </span>
                <UIcon
                  name="i-ion-add-circle"
                  class="w-5 h-5 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </div>
          </div>

          <!-- Message si produit déjà existant -->
          <UAlert
            v-if="alreadyExistsMessage"
            color="blue"
            variant="subtle"
            icon="i-ion-information-circle"
            class="mt-2"
          >
            {{ alreadyExistsMessage }}
          </UAlert>
        </div>

        <!-- Footer avec bouton d'action -->
        <div
          class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <UButton
            type="button"
            color="primary"
            size="lg"
            block
            :loading="submitting"
            :disabled="!itemName.trim() || submitting"
            @click="handleAdd"
          >
            {{ submitting ? 'Ajout en cours...' : 'Ajouter à la liste' }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useShoppingList, type GroceryItem } from '~/composables/useShoppingList'

interface Props {
  modelValue: boolean
  existingItems?: GroceryItem[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', item: GroceryItem): void
}

const props = withDefaults(defineProps<Props>(), {
  existingItems: () => [],
})

const emit = defineEmits<Emits>()

const { addGroceryItem } = useShoppingList()
const memberStore = useMemberStore()
const { currentMember } = storeToRefs(memberStore)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const itemName = ref('')
const submitting = ref(false)
const errors = ref<{ name?: string }>({})
const alreadyExistsMessage = ref('')
const nameInputRef = ref<InstanceType<typeof UInput> | null>(null)
const iosInputRef = ref<HTMLInputElement | null>(null)
const focusTransferred = ref(false)

// Suggestions basées sur les produits existants
const suggestions = computed(() => {
  if (!itemName.value.trim()) {
    return []
  }

  const searchTerm = itemName.value.trim().toLowerCase()
  return props.existingItems
    .filter((item) => {
      const itemNameLower = item.name.toLowerCase()
      return itemNameLower.includes(searchTerm) && itemNameLower !== searchTerm
    })
    .slice(0, 5) // Limiter à 5 suggestions
})

// Fonction pour transférer le focus de l'input iOS vers le vrai input
const transferToRealInput = () => {
  if (focusTransferred.value) return
  focusTransferred.value = true
  
  const inputElement = document.getElementById('grocery-item-name')
  if (inputElement) {
    const nativeInput = inputElement.querySelector('input') as HTMLInputElement
    if (nativeInput) {
      nativeInput.focus({ preventScroll: false })
    }
  }
}

// Exposer une méthode pour déclencher le focus depuis l'extérieur
// Cette méthode doit être appelée DIRECTEMENT depuis l'événement de clic
const triggerFocus = () => {
  // Focuser l'input iOS immédiatement (dans la chaîne d'événements utilisateur)
  // Pas de délai, pas de requestAnimationFrame - directement depuis le clic
  if (iosInputRef.value) {
    iosInputRef.value.focus()
    // Le transfert vers le vrai input se fera automatiquement via @blur
    // après un court délai pour laisser le clavier s'ouvrir
    setTimeout(() => {
      if (!focusTransferred.value) {
        transferToRealInput()
      }
    }, 100)
  }
}

defineExpose({
  triggerFocus
})

// Réinitialiser le formulaire quand le modal s'ouvre
watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    alreadyExistsMessage.value = ''
    focusTransferred.value = false
    // Le focus sera déclenché depuis l'événement de clic (via triggerFocus)
  } else {
    focusTransferred.value = false
  }
})

const handleInput = () => {
  errors.value = {}
  alreadyExistsMessage.value = ''
}

const selectSuggestion = (suggestion: GroceryItem) => {
  itemName.value = suggestion.name
  handleAdd()
}

const closeModal = () => {
  isOpen.value = false
}

const handleAdd = async () => {
  if (!itemName.value.trim()) {
    errors.value.name = 'Le nom du produit est requis'
    return
  }

  submitting.value = true
  errors.value = {}
  alreadyExistsMessage.value = ''

  try {
    const memberId = currentMember.value?.id || null
    const result = await addGroceryItem(itemName.value.trim(), memberId)

    if (result.success && result.data) {
      if (result.alreadyExists) {
        alreadyExistsMessage.value = 'Ce produit existe déjà dans la liste et a été ajouté'
      }
      emit('success', result.data)
      // Attendre un peu pour que l'utilisateur voie le message
      setTimeout(() => {
        closeModal()
      }, 1000)
    } else {
      errors.value.name = result.error || 'Erreur lors de l\'ajout du produit'
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout:', error)
    errors.value.name = 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}
</script>

