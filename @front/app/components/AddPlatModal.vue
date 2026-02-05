<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div class="flex flex-col max-h-[85vh] bg-white dark:bg-gray-900 overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 class="text-lg font-semibold">
            {{ editingDish ? 'Modifier le plat' : 'Ajouter un plat' }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton
              v-if="editingDish"
              color="red"
              variant="outline"
              icon="i-ion-trash"
              size="sm"
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
              size="sm"
              :loading="submitting"
              :disabled="deleting"
            >
              {{ editingDish ? 'Enregistrer' : 'Ajouter le plat' }}
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ion-close"
              size="sm"
              :disabled="submitting || deleting"
              @click="closeModal"
            />
          </div>
        </div>

        <form
          id="plat-form"
          class="space-y-4 overflow-y-auto flex-1 p-4"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="plat-name"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-restaurant"
                class="w-4 h-4"
              />
              Nom du plat <span class="text-red-500">*</span>
            </label>
            <UInput
              id="plat-name"
              v-model="state.name"
              :disabled="submitting"
              :error="!!errors.name"
              class="w-full"
              placeholder="Ex. Tarte aux pommes"
            />
            <p
              v-if="errors.name"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.name }}
            </p>
          </div>

          <div>
            <label
              for="plat-description"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-document-text"
                class="w-4 h-4"
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

          <div>
            <label
              for="plat-category"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-bookmark"
                class="w-4 h-4"
              />
              Catégorie
            </label>
            <USelect
              id="plat-category"
              v-model="state.category"
              :items="categoryOptions"
              :disabled="submitting"
              placeholder="Choisir une catégorie..."
              class="w-full"
            />
          </div>

          <div>
            <label
              for="plat-preparation-time"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-time"
                class="w-4 h-4"
              />
              Temps de préparation (minutes)
            </label>
            <UInput
              id="plat-preparation-time"
              v-model.number="state.preparation_time"
              type="number"
              :disabled="submitting"
              class="w-full"
              placeholder="Ex. 30"
              min="0"
            />
          </div>

          <div>
            <label
              for="plat-cooking-time"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-ion-flame"
                class="w-4 h-4"
              />
              Temps de cuisson (minutes)
            </label>
            <UInput
              id="plat-cooking-time"
              v-model.number="state.cooking_time"
              type="number"
              :disabled="submitting"
              class="w-full"
              placeholder="Ex. 45"
              min="0"
            />
          </div>

          <div>
            <label
              for="plat-ingredient-input"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <UIcon
                name="i-ion-list"
                class="w-4 h-4"
              />
              Ingrédients
            </label>
            
            <!-- Champ de saisie avec bouton -->
            <div class="flex gap-2 mb-3">
              <UInput
                id="plat-ingredient-input"
                v-model="newIngredient"
                :disabled="submitting"
                class="flex-1"
                placeholder="Ajouter un ingrédient..."
                @keyup.enter="addIngredient"
              />
              <UButton
                type="button"
                color="primary"
                icon="i-ion-add"
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

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <UIcon
                name="i-ion-image"
                class="w-4 h-4"
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
              class="w-full mb-3"
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
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>
        </form>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
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

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  } else if (editingDish.value) {
    loadDishData()
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
