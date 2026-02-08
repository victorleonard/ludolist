<template>
  <Teleport to="body">
    <div>
      <!-- Overlay sombre en arrière-plan -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 bg-black/50 z-[100]"
          @click="closeModal"
        />
      </Transition>

      <!-- Barre de saisie flottante compacte au-dessus du clavier -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-full"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-full"
      >
        <div
          v-if="isOpen"
          class="fixed inset-x-0 bottom-0 z-[101] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >

      <div class="px-4 py-4 sm:px-6 sm:py-5">
        <!-- En-tête avec titre et bouton fermer -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ajouter des éléments
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

        <!-- Suggestions de produits existants (affichées en haut) -->
        <div
          v-if="suggestions.length > 0 && itemName.trim().length > 0"
          class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto"
        >
          <p class="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2.5">
            Produits similaires :
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.documentId"
              type="button"
              class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              @click="selectSuggestion(suggestion)"
            >
              {{ suggestion.name }}
            </button>
          </div>
        </div>

        <!-- Message si produit déjà existant -->
        <UAlert
          v-if="alreadyExistsMessage"
          color="blue"
          variant="subtle"
          icon="i-ion-information-circle"
          class="mb-4 text-xs"
        >
          {{ alreadyExistsMessage }}
        </UAlert>

        <!-- Formulaire avec input et bouton intégré (en bas) -->
        <form
          @submit.prevent="handleAdd"
          class="pb-6"
        >
          <div class="relative">
            <!-- Input invisible pour iOS - focusé depuis l'événement de clic -->
            <input
              ref="iosInputRef"
              type="text"
              autocomplete="off"
              class="absolute opacity-0 pointer-events-none"
              style="position: fixed; left: 0; top: 0; width: 1px; height: 1px; z-index: -1;"
              tabindex="0"
              @blur="transferToRealInput"
            />
            <UInput
              ref="nameInputRef"
              id="grocery-item-name"
              v-model="itemName"
              :disabled="submitting"
              :error="!!errors.name"
              :ui="{ trailing: 'pr-0.5' }"
              class="w-full input-touch"
              placeholder="Ajouter des éléments supplémentaires"
              autocomplete="off"
              size="lg"
              @input="handleInput"
              @keyup.enter="handleAdd"
            >
              <template #trailing>
                <UButton
                  type="submit"
                  color="primary"
                  icon="i-ion-add"
                  variant="link"
                  size="sm"
                  :loading="submitting"
                  :disabled="!itemName.trim() || submitting"
                  class="min-w-[40px]"
                  aria-label="Ajouter"
                />
              </template>
            </UInput>
            <p
              v-if="errors.name"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400 absolute -bottom-5 left-0"
            >
              {{ errors.name }}
            </p>
          </div>
        </form>
      </div>
    </div>
  </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useShoppingList, type GroceryItem } from '~/composables/useShoppingList'
import type { UInput } from '#components'

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
    const nativeInput = inputElement.querySelector('input')
    if (nativeInput instanceof HTMLInputElement) {
      // Mettre le focus sur le vrai input
      nativeInput.focus({ preventScroll: false })
    }
  }
}

// Exposer une méthode pour déclencher le focus depuis l'extérieur
const triggerFocus = () => {
  // Focuser l'input iOS immédiatement (dans la chaîne d'événements utilisateur)
  if (iosInputRef.value) {
    iosInputRef.value.focus()
    // Le transfert vers le vrai input se fera automatiquement via @blur
    setTimeout(() => {
      if (!focusTransferred.value) {
        transferToRealInput()
      }
    }, 300)
  }
}

defineExpose({
  triggerFocus
})

// Focus automatique sur l'input quand le modal s'ouvre
watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    alreadyExistsMessage.value = ''
    focusTransferred.value = false
    
    // Attendre que le composant soit complètement rendu
    await nextTick()
    await nextTick()
    
    // Déclencher le focus via l'input iOS
    if (iosInputRef.value) {
      iosInputRef.value.focus()
      setTimeout(() => {
        if (!focusTransferred.value) {
          transferToRealInput()
        }
      }, 300)
    }
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
  // Fermer le clavier si ouvert
  const inputElement = document.getElementById('grocery-item-name')
  if (inputElement) {
    const nativeInput = inputElement.querySelector('input')
    if (nativeInput instanceof HTMLInputElement) {
      nativeInput.blur()
    }
  }
  if (iosInputRef.value) {
    iosInputRef.value.blur()
  }
  
  // Fermer le modal
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
      emit('success', result.data)
      
      // Fermer le modal après succès
      closeModal()
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
