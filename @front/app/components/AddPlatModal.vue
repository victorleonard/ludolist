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
          class="space-y-4 overflow-y-auto flex-1 p-4 pb-safe"
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
              placeholder="Recette, ingrédients..."
            />
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <UIcon
                name="i-ion-image"
                class="w-4 h-4"
              />
              Photo du plat
            </label>
            <UFileUpload
              v-model="imageFile"
              color="neutral"
              highlight
              label="Déposez votre image ici"
              description="SVG, PNG, JPG ou GIF (max. 2MB)"
              class="w-full min-h-48"
              :disabled="submitting"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Ou indiquez une URL :
            </p>
            <UInput
              id="plat-image-url"
              v-model="state.image_url"
              :disabled="submitting"
              class="w-full mt-1"
              placeholder="https://..."
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

const state = reactive({
  name: '',
  description: '',
  image_url: '',
})

const errors = reactive<{ name?: string }>({})

function resetForm() {
  state.name = ''
  state.description = ''
  state.image_url = ''
  imageFile.value = null
  errors.name = undefined
  submitError.value = ''
}

function loadDishData() {
  if (props.dish) {
    state.name = props.dish.name
    state.description = props.dish.description || ''
    state.image_url = ''
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
