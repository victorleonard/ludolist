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

// Fonction helper pour mettre le focus et afficher le clavier sur mobile
const focusInput = (inputId: string) => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const inputElement = document.getElementById(inputId)
      if (inputElement) {
        const nativeInput = inputElement.querySelector('input') as HTMLInputElement
        if (nativeInput) {
          // Sur mobile, utiliser click() en plus de focus() pour déclencher le clavier
          nativeInput.click()
          nativeInput.focus({ preventScroll: false })
          // Forcer le scroll vers l'input si nécessaire
          nativeInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 200) // Délai plus long pour s'assurer que le modal est complètement rendu
  })
}

// Réinitialiser le formulaire et mettre le focus quand le modal s'ouvre
watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    alreadyExistsMessage.value = ''
    // Mettre le focus sur le champ input après l'ouverture du modal
    await nextTick()
    focusInput('grocery-item-name')
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

