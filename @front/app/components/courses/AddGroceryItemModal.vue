<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        ref="modalContentRef"
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
          ref="scrollContainerRef"
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
          <div
            ref="inputFieldRef"
            class="form-field"
          >
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
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
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
const scrollContainerRef = ref<HTMLElement | null>(null)
const modalContentRef = ref<HTMLElement | null>(null)
const inputFieldRef = ref<HTMLElement | null>(null)
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
      // Mettre le focus d'abord
      nativeInput.focus({ preventScroll: false })
      
      // Attendre que le clavier s'affiche, puis scroller pour rendre l'input visible
      setTimeout(() => {
        // Utiliser le conteneur du champ (label + input) pour le scroll
        const fieldContainer = inputFieldRef.value || inputElement.parentElement
        if (fieldContainer) {
          // Scroller le conteneur du champ en haut de la zone visible
          fieldContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          })
          
          // Après le scroll initial, ajuster précisément avec le conteneur scrollable
          setTimeout(() => {
            const visualViewport = window.visualViewport
            if (visualViewport) {
              const viewportHeight = visualViewport.height
              const fieldRect = fieldContainer.getBoundingClientRect()
              
              // Zone disponible au-dessus du clavier (avec une marge de 100px)
              const availableHeight = viewportHeight - 100
              
              // Si le champ est sous la zone visible
              if (fieldRect.bottom > availableHeight) {
                const scrollContainer = scrollContainerRef.value || inputElement.closest('.overflow-y-auto') as HTMLElement
                if (scrollContainer) {
                  const currentScrollTop = scrollContainer.scrollTop
                  const containerRect = scrollContainer.getBoundingClientRect()
                  const fieldTopRelativeToContainer = fieldRect.top - containerRect.top
                  const targetTop = 80 // Position cible : 80px du haut du conteneur
                  const scrollNeeded = fieldTopRelativeToContainer - targetTop
                  
                  scrollContainer.scrollTo({
                    top: currentScrollTop + scrollNeeded,
                    behavior: 'smooth'
                  })
                }
              }
            }
          }, 300)
        } else {
          // Fallback : scroller l'input directement
          inputElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          })
        }
      }, 600) // Délai pour laisser le clavier s'afficher complètement
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
    // après un délai pour laisser le clavier s'ouvrir
    setTimeout(() => {
      if (!focusTransferred.value) {
        transferToRealInput()
      }
    }, 300) // Délai pour laisser le clavier s'afficher complètement
  }
}

defineExpose({
  triggerFocus
})

// Écouter les changements de visualViewport pour ajuster le scroll quand le clavier apparaît
let viewportResizeHandler: (() => void) | null = null

watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    alreadyExistsMessage.value = ''
    focusTransferred.value = false
    
    // Écouter les changements de visualViewport (quand le clavier apparaît/disparaît)
    if (window.visualViewport && !viewportResizeHandler) {
      viewportResizeHandler = () => {
        // Quand le clavier apparaît, ajuster le scroll pour rendre l'input visible
        const inputElement = document.getElementById('grocery-item-name')
        if (inputElement && focusTransferred.value) {
          const nativeInput = inputElement.querySelector('input') as HTMLInputElement
          if (nativeInput && document.activeElement === nativeInput) {
            setTimeout(() => {
              const visualViewport = window.visualViewport
              if (visualViewport) {
                const viewportHeight = visualViewport.height
                const inputRect = inputElement.getBoundingClientRect()
                const labelElement = inputElement.previousElementSibling as HTMLElement
                const labelHeight = labelElement ? labelElement.getBoundingClientRect().height : 0
                const inputTop = inputRect.top - labelHeight
                
                // Si l'input est sous la zone visible
                if (inputTop < 0 || inputRect.bottom > viewportHeight - 20) {
                  const scrollContainer = scrollContainerRef.value || inputElement.closest('.overflow-y-auto') as HTMLElement
                  if (scrollContainer) {
                    const currentScrollTop = scrollContainer.scrollTop
                    const targetTop = 80
                    const scrollNeeded = inputTop - targetTop
                    
                    scrollContainer.scrollTo({
                      top: currentScrollTop + scrollNeeded,
                      behavior: 'smooth'
                    })
                  }
                }
              }
            }, 100)
          }
        }
      }
      window.visualViewport.addEventListener('resize', viewportResizeHandler)
      window.visualViewport.addEventListener('scroll', viewportResizeHandler)
    }
    
    // Le focus sera déclenché depuis l'événement de clic (via triggerFocus)
  } else {
    focusTransferred.value = false
    
    // Nettoyer l'écouteur quand le modal se ferme
    if (viewportResizeHandler && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', viewportResizeHandler)
      window.visualViewport.removeEventListener('scroll', viewportResizeHandler)
      viewportResizeHandler = null
    }
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
  // S'assurer que le clavier est fermé avant de fermer le modal
  const inputElement = document.getElementById('grocery-item-name')
  if (inputElement) {
    const nativeInput = inputElement.querySelector('input') as HTMLInputElement
    if (nativeInput) {
      nativeInput.blur()
    }
  }
  if (iosInputRef.value) {
    iosInputRef.value.blur()
  }
  
  // Nettoyer les écouteurs
  if (viewportResizeHandler && window.visualViewport) {
    window.visualViewport.removeEventListener('resize', viewportResizeHandler)
    window.visualViewport.removeEventListener('scroll', viewportResizeHandler)
    viewportResizeHandler = null
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

