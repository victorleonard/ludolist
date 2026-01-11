<template>
  <UModal
    :open="isOpen"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <UCard
        class="w-full max-w-2xl max-h-[90vh] flex flex-col"
        :ui="{ body: 'p-4 sm:p-6 overflow-auto' }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Ajouter un nouveau jeu
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                type="submit"
                form="game-form"
                color="primary"
                :loading="submitting"
              >
                Ajouter le jeu
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                class="-my-1"
                @click="closeModal"
              />
            </div>
          </div>
        </template>

        <form
          id="game-form"
          class="space-y-4 overflow-y-auto flex-1"
          @submit.prevent="handleSubmit"
        >
          <div>
            <label
              for="name"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-gamepad-2"
                class="w-4 h-4"
              />
              Titre du jeu <span class="text-red-500">*</span>
            </label>
            <UInput
              id="name"
              v-model="state.name"
              placeholder="Ex: Catan"
              :disabled="submitting"
              :error="!!errors.name"
              class="w-full"
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
              for="age"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              Âge minimum <span class="text-red-500">*</span>
            </label>
            <UInput
              id="age"
              v-model.number="state.age"
              type="number"
              min="0"
              placeholder="8"
              :disabled="submitting"
              :error="!!errors.age"
              class="w-full"
            />
            <p
              v-if="errors.age"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.age }}
            </p>
          </div>

          <div>
            <label
              for="playing_time"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-clock"
                class="w-4 h-4"
              />
              Durée de jeu <span class="text-red-500">*</span>
            </label>
            <UInput
              id="playing_time"
              v-model="state.playing_time"
              placeholder="Ex: 30-60 min"
              :disabled="submitting"
              :error="!!errors.playing_time"
              class="w-full"
            />
            <p
              v-if="errors.playing_time"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.playing_time }}
            </p>
          </div>

          <div>
            <label
              for="player_min"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-users"
                class="w-4 h-4"
              />
              Nombre minimum de joueurs <span class="text-red-500">*</span>
            </label>
            <UInput
              id="player_min"
              v-model.number="state.player_min"
              type="number"
              min="1"
              placeholder="Ex: 2"
              :disabled="submitting"
              :error="!!errors.player_min"
              class="w-full"
            />
            <p
              v-if="errors.player_min"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.player_min }}
            </p>
          </div>

          <div>
            <label
              for="player_max"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-users"
                class="w-4 h-4"
              />
              Nombre maximum de joueurs
            </label>
            <UInput
              id="player_max"
              v-model.number="state.player_max"
              type="number"
              min="1"
              placeholder="4"
              :disabled="submitting"
              :error="!!errors.player_max"
              class="w-full"
            />
            <p
              v-if="errors.player_max"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.player_max }}
            </p>
          </div>

          <div>
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
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useGames } from '../composables/useGames'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { createGame } = useGames()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  }
})

const submitting = ref(false)
const submitError = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const state = reactive({
  name: '',
  age: null as number | null,
  playing_time: '',
  player_min: null as number | null,
  player_max: null as number | null
})

// Réinitialiser les erreurs quand les champs sont modifiés
watch(() => state.name, () => {
  if (errors.name) errors.name = ''
})

watch(() => state.age, () => {
  if (errors.age) errors.age = ''
})

watch(() => state.playing_time, () => {
  if (errors.playing_time) errors.playing_time = ''
})

watch(() => state.player_min, () => {
  if (errors.player_min) errors.player_min = ''
})

watch(() => state.player_max, () => {
  if (errors.player_max) errors.player_max = ''
})

const errors = reactive({
  name: '',
  age: '',
  playing_time: '',
  player_min: '',
  player_max: ''
})

const resetForm = () => {
  state.name = ''
  state.age = null
  state.playing_time = ''
  state.player_min = null
  state.player_max = null
  imageFile.value = null
  submitError.value = null
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

const validateForm = (): boolean => {
  let isValid = true
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!state.name.trim()) {
    errors.name = 'Le titre est requis'
    isValid = false
  }

  if (state.age === null || state.age === undefined || state.age < 0) {
    errors.age = 'L\'âge doit être un nombre positif'
    isValid = false
  }

  if (!state.playing_time.trim()) {
    errors.playing_time = 'La durée de jeu est requise'
    isValid = false
  }

  if (state.player_min === null || state.player_min === undefined || state.player_min < 1) {
    errors.player_min = 'Le nombre minimum de joueurs doit être au moins 1'
    isValid = false
  }

  if (state.player_max !== null && state.player_max !== undefined && state.player_min !== null && state.player_max < state.player_min) {
    errors.player_max = 'Le nombre maximum doit être supérieur ou égal au minimum'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    await createGame({
      name: state.name.trim(),
      description: '',
      age: state.age!,
      playing_time: state.playing_time.trim(),
      player_min: state.player_min!,
      player_max: state.player_max,
      image: imageFile.value
    })

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la création du jeu:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la création du jeu'
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
