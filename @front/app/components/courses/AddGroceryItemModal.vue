<template>
  <!-- PWA (standalone) : plein écran sans drawer pour que le clavier s'ouvre sur iOS -->
  <div
    v-if="isStandalone && isOpen"
    class="grocery-pwa-fullscreen bg-white dark:bg-gray-900"
    role="dialog"
    aria-modal="true"
    aria-labelledby="grocery-pwa-title"
  >
    <div class="grocery-pwa-inner">
      <form
        @submit.prevent="handleAdd"
        class="mb-4"
      >
        <div
          class="relative flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500"
          :class="{ 'border-red-500 dark:border-red-500': !!errors.name }"
        >
          <input
            ref="nameInputRef"
            id="grocery-item-name-pwa"
            v-model="itemName"
            type="text"
            autocomplete="off"
            inputmode="text"
            placeholder="Ajouter des éléments supplémentaires"
            :disabled="submitting"
            class="grocery-native-input flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none disabled:opacity-50"
            @input="handleInput"
          />
          <UButton
            type="submit"
            color="primary"
            icon="i-ion-add"
            variant="link"
            size="sm"
            :loading="submitting"
            :disabled="!itemName.trim() || submitting"
            class="min-w-[40px] shrink-0"
            aria-label="Ajouter"
          />
        </div>
        <p
          v-if="errors.name"
          class="mt-1.5 text-xs text-red-600 dark:text-red-400"
        >
          {{ errors.name }}
        </p>
      </form>

      <div class="flex items-center justify-between mb-4">
        <h3
          id="grocery-pwa-title"
          class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
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

      <UAlert
        v-if="alreadyExistsMessage"
        color="blue"
        variant="subtle"
        icon="i-ion-information-circle"
        class="mb-4 text-xs"
      >
        {{ alreadyExistsMessage }}
      </UAlert>
    </div>
  </div>

  <!-- Navigateur : drawer classique -->
  <UDrawer
    v-else
    :open="isOpen"
    direction="top"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-b-2xl overflow-hidden"
        style="padding-top: max(1rem, env(safe-area-inset-top, 1rem));"
      >
        <div class="px-4 py-4 sm:px-6 sm:py-5">
          <form
            @submit.prevent="handleAdd"
            class="mb-4"
          >
            <div
              class="relative flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500"
              :class="{ 'border-red-500 dark:border-red-500': !!errors.name }"
            >
              <input
                ref="nameInputRef"
                id="grocery-item-name"
                v-model="itemName"
                type="text"
                autocomplete="off"
                inputmode="text"
                placeholder="Ajouter des éléments supplémentaires"
                :disabled="submitting"
                class="grocery-native-input flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none disabled:opacity-50"
                @input="handleInput"
              />
              <UButton
                type="submit"
                color="primary"
                icon="i-ion-add"
                variant="link"
                size="sm"
                :loading="submitting"
                :disabled="!itemName.trim() || submitting"
                class="min-w-[40px] shrink-0"
                aria-label="Ajouter"
              />
            </div>
            <p
              v-if="errors.name"
              class="mt-1.5 text-xs text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </form>

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

          <UAlert
            v-if="alreadyExistsMessage"
            color="blue"
            variant="subtle"
            icon="i-ion-information-circle"
            class="mb-4 text-xs"
          >
            {{ alreadyExistsMessage }}
          </UAlert>
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
import { usePwaStandalone } from '~/composables/usePwaStandalone'

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
const { isStandalone } = usePwaStandalone()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const itemName = ref('')
const submitting = ref(false)
const errors = ref<{ name?: string }>({})
const alreadyExistsMessage = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

// Focus après ouverture du drawer (optionnel ; sur iOS le clavier s'ouvre surtout au tap direct sur l'input)
const focusInput = () => {
  const run = (delay: number) => {
    setTimeout(() => {
      const el = nameInputRef.value
      if (el && !el.disabled) {
        el.focus({ preventScroll: false })
      }
    }, delay)
  }
  run(100)
  run(350)
  run(600)
}

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

// Réinitialiser le formulaire quand le modal s'ouvre et mettre le focus sur l'input
watch(isOpen, async (newValue) => {
  if (newValue) {
    itemName.value = ''
    errors.value = {}
    alreadyExistsMessage.value = ''

    await nextTick()
    focusInput()
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

<style scoped>
.grocery-native-input {
  -webkit-appearance: none;
  appearance: none;
}

/* PWA : plein écran sans transform pour que le clavier iOS s'ouvre au tap sur l'input */
.grocery-pwa-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding-top: max(1rem, env(safe-area-inset-top, 1rem));
  padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
  padding-left: max(1rem, env(safe-area-inset-left, 1rem));
  padding-right: max(1rem, env(safe-area-inset-right, 1rem));
  overflow-y: auto;
}

.grocery-pwa-inner {
  padding: 1rem 1.25rem;
  max-width: 28rem;
  margin: 0 auto;
  width: 100%;
}
</style>
