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
            {{ editingDish ? 'Modifier le plat' : 'Ajouter un plat' }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-ion-close"
            size="sm"
            class="min-w-[44px] min-h-[44px] rounded-full -mr-1"
            :disabled="submitting || deleting"
            aria-label="Fermer"
            @click="closeModal"
          />
        </div>

        <form
          id="plat-form"
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          @submit.prevent="handleSubmit"
        >
          <div class="form-field">
            <label
              for="plat-name"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-restaurant"
                class="w-4 h-4 shrink-0"
              />
              Nom du plat <span class="text-red-500">*</span>
            </label>
            <UInput
              id="plat-name"
              v-model="state.name"
              :disabled="submitting"
              :error="!!errors.name"
              class="w-full input-touch"
              placeholder="Ex. Tarte aux pommes"
            />
            <p
              v-if="errors.name"
              class="mt-1.5 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </div>

          <div class="form-field">
            <label
              for="plat-description"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-document-text-outline"
                class="w-4 h-4 shrink-0"
              />
              Description
            </label>
            <UTextarea
              id="plat-description"
              v-model="state.description"
              :disabled="submitting"
              class="w-full"
              :rows="4"
              placeholder="Recette, description..."
            />
          </div>

          <div class="form-field">
            <label
              for="plat-category"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-bookmark-outline"
                class="w-4 h-4 shrink-0"
              />
              Catégorie
            </label>
            <USelect
              id="plat-category"
              v-model="state.category"
              :items="categoryOptions"
              :disabled="submitting"
              placeholder="Choisir une catégorie..."
              class="w-full input-touch"
            />
          </div>

          <div class="form-field">
            <label
              for="plat-preparation-time"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-time-outline"
                class="w-4 h-4 shrink-0"
              />
              Préparation (min)
            </label>
            <UInput
              id="plat-preparation-time"
              v-model.number="state.preparation_time"
              type="number"
              :disabled="submitting"
              class="w-full input-touch"
              placeholder="Ex. 30"
              min="0"
            />
          </div>

          <div class="form-field">
            <label
              for="plat-cooking-time"
              class="label-mobile"
            >
              <UIcon
                name="i-ion-flame-outline"
                class="w-4 h-4 shrink-0"
              />
              Cuisson (min)
            </label>
            <UInput
              id="plat-cooking-time"
              v-model.number="state.cooking_time"
              type="number"
              :disabled="submitting"
              class="w-full input-touch"
              placeholder="Ex. 45"
              min="0"
            />
          </div>

          <div class="form-field">
            <label
              for="plat-ingredient-input"
              class="label-mobile mb-2"
            >
              <UIcon
                name="i-ion-list-outline"
                class="w-4 h-4 shrink-0"
              />
              Ingrédients
            </label>
            <!-- Champ de saisie avec bouton -->
            <div class="flex gap-2 mb-3">
              <UInput
                id="plat-ingredient-input"
                v-model="newIngredient"
                :disabled="submitting"
                class="flex-1 input-touch"
                placeholder="Ajouter un ingrédient..."
                @keyup.enter="addIngredient"
              />
              <UButton
                type="button"
                color="primary"
                icon="i-ion-add"
                class="min-h-[48px] shrink-0"
                :disabled="submitting || !newIngredient.trim()"
                @click="addIngredient"
              >
                Ajouter
              </UButton>
            </div>

            <!-- Liste des ingrédients -->
            <div
              v-if="state.ingredients.length > 0"
              class="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[60px]"
            >
              <UBadge
                v-for="(ingredient, index) in state.ingredients"
                :key="index"
                color="primary"
                variant="subtle"
                class="flex items-center gap-1.5 pr-1"
              >
                <span>{{ ingredient }}</span>
                <button
                  type="button"
                  :disabled="submitting"
                  class="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors"
                  @click="removeIngredient(index)"
                >
                  <UIcon
                    name="i-ion-close"
                    class="w-3 h-3"
                  />
                </button>
              </UBadge>
            </div>
            <div
              v-else
              class="flex items-center justify-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[60px] text-sm text-gray-500 dark:text-gray-400"
            >
              Aucun ingrédient ajouté
            </div>
          </div>

          <div class="form-field">
            <label class="label-mobile">
              <UIcon
                name="i-ion-image-outline"
                class="w-4 h-4 shrink-0"
              />
              Photo du plat
            </label>
            <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Indiquez une URL :
            </p>
            <UInput
              id="plat-image-url"
              v-model="state.image_url"
              :disabled="submitting"
              class="w-full mb-3 input-touch"
              placeholder="https://..."
            />
            <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Ou téléchargez une image :
            </p>
            <UFileUpload
              v-model="imageFile"
              color="neutral"
              highlight
              label="Déposez votre image ici"
              description="SVG, PNG, JPG ou GIF (max. 2MB)"
              class="w-full min-h-48"
              :disabled="submitting"
            />
          </div>

          <div
            v-if="submitError"
            class="p-3.5 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>
        </form>

        <!-- Footer avec boutons d'action -->
        <div
          class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 flex flex-col gap-2"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div
            v-if="editingDish"
            class="flex gap-2"
          >
            <UButton
              color="red"
              variant="outline"
              icon="i-ion-trash"
              size="lg"
              block
              :loading="deleting"
              :disabled="submitting"
              @click="handleDelete"
            >
              Supprimer
            </UButton>
            <UButton
              type="submit"
              form="plat-form"
              color="primary"
              size="lg"
              block
              :loading="submitting"
              :disabled="deleting"
            >
              Enregistrer
            </UButton>
          </div>
          <UButton
            v-else
            type="submit"
            form="plat-form"
            color="primary"
            size="lg"
            block
            :loading="submitting"
            :disabled="deleting"
          >
            Ajouter
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore } from '~/stores/family'
import type { TransformedDish } from '~/stores/family'
import { useAddPlatModal } from '~/composables/useAddPlatModal'
import { useAuthStore } from '~/stores/auth'

interface Props {
  modelValue: boolean
  dish?: TransformedDish | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  dish: null,
})

const emit = defineEmits<Emits>()
const config = useRuntimeConfig()
const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'
const authStore = useAuthStore()
const { token } = storeToRefs(authStore)
const familyStore = useFamilyStore()
const { closeModal: closeModalComposable } = useAddPlatModal()

interface StrapiImage {
  id: number
  url: string
  formats?: {
    thumbnail?: { url: string }
    small?: { url: string }
    medium?: { url: string }
  }
}

const editingDish = computed(() => props.dish !== null && props.dish !== undefined)

const isOpen = ref(props.modelValue)
const submitting = ref(false)
const deleting = ref(false)
const submitError = ref('')
const imageFile = ref<File | null>(null)

const categoryOptions = [
  { label: 'Entrée', value: 'Entrée' },
  { label: 'Plat principal', value: 'Plat principal' },
  { label: 'Dessert', value: 'Dessert' },
  { label: 'Apéritif', value: 'Apéritif' },
  { label: 'Boisson', value: 'Boisson' },
  { label: 'Accompagnement', value: 'Accompagnement' },
  { label: 'Sauce', value: 'Sauce' },
  { label: 'Petit-déjeuner', value: 'Petit-déjeuner' },
  { label: 'Goûter', value: 'Goûter' },
  { label: 'Autre', value: 'Autre' },
]

const state = reactive({
  name: '',
  description: '',
  image_url: '',
  category: null as string | null,
  preparation_time: null as number | null,
  cooking_time: null as number | null,
  ingredients: [] as string[],
})

const newIngredient = ref('')

const errors = reactive<{ name?: string }>({})

function resetForm() {
  state.name = ''
  state.description = ''
  state.image_url = ''
  state.category = null
  state.preparation_time = null
  state.ingredients = []
  newIngredient.value = ''
  imageFile.value = null
  errors.name = undefined
  submitError.value = ''
}

function addIngredient() {
  const trimmed = newIngredient.value.trim()
  if (trimmed && !state.ingredients.includes(trimmed)) {
    state.ingredients.push(trimmed)
    newIngredient.value = ''
  }
}

function removeIngredient(index: number) {
  state.ingredients.splice(index, 1)
}

function loadDishData() {
  if (props.dish) {
    state.name = props.dish.name
    state.description = props.dish.description || ''
    state.image_url = ''
    state.category = props.dish.category || null
    state.preparation_time = props.dish.preparation_time || null
    state.cooking_time = props.dish.cooking_time || null
    state.ingredients = props.dish.ingredients ? [...props.dish.ingredients] : []
    newIngredient.value = ''
  }
}

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
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

watch(isOpen, async (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  } else if (editingDish.value) {
    loadDishData()
  } else {
    // Mettre le focus sur le champ nom après l'ouverture du modal
    await nextTick()
    focusInput('plat-name')
  }
})

watch(() => props.dish, (newDish) => {
  if (newDish && isOpen.value) {
    loadDishData()
  }
})

async function handleSubmit() {
  errors.name = undefined
  submitError.value = ''

  const nameTrimmed = state.name?.trim()
  if (!nameTrimmed) {
    errors.name = 'Le nom est requis'
    return
  }

  let imageId: number | null = null
  if (imageFile.value) {
    const formData = new FormData()
    formData.append('files', imageFile.value)

    const uploadHeaders: Record<string, string> = {}
    if (token.value) {
      uploadHeaders.Authorization = `Bearer ${token.value}`
    }

    try {
      const uploadResponse = await $fetch<StrapiImage[]>(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: uploadHeaders,
        body: formData,
      })

      if (uploadResponse && uploadResponse.length > 0) {
        imageId = uploadResponse[0].id
      }
    } catch (err) {
      console.error('Erreur upload photo:', err)
      submitError.value = 'Erreur lors de l\'upload de la photo'
      return
    }
  }

  submitting.value = true
  try {
    if (editingDish.value && props.dish) {
      const result = await familyStore.updateDish(
        props.dish.documentId ?? props.dish.id,
        {
          name: nameTrimmed,
          description: state.description?.trim() || undefined,
          image_url: state.image_url?.trim() || null,
          category: state.category || undefined,
          preparation_time: state.preparation_time || undefined,
          cooking_time: state.cooking_time || undefined,
          ingredients: state.ingredients.length > 0 ? state.ingredients : undefined,
          ...(imageId != null && { image: imageId }),
        },
      )
      if (!result.success) {
        submitError.value = result.error || 'Erreur lors de l\'enregistrement'
        return
      }
    } else {
      const result = await familyStore.addDishToFamily({
        name: nameTrimmed,
        description: state.description?.trim() || undefined,
        image_url: state.image_url?.trim() || undefined,
          category: state.category || undefined,
        preparation_time: state.preparation_time || undefined,
        cooking_time: state.cooking_time || undefined,
        ingredients: state.ingredients.length > 0 ? state.ingredients : undefined,
        ...(imageId != null && { image: imageId }),
      })
      if (!result.success) {
        submitError.value = result.error || 'Erreur lors de l\'ajout'
        return
      }
    }
    closeModalComposable()
    isOpen.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!editingDish.value || !props.dish) return
  if (!confirm('Supprimer ce plat ?')) return

  deleting.value = true
  submitError.value = ''
  try {
    const result = await familyStore.removeDishFromFamily(
      props.dish.documentId ?? props.dish.id,
    )
    if (!result.success) {
      submitError.value = result.error || 'Erreur lors de la suppression'
      return
    }
    closeModalComposable()
    isOpen.value = false
    emit('success')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
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
  .form-field :deep(input[type="number"]) {
    min-height: 48px;
    font-size: 16px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
