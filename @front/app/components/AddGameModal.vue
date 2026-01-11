<template>
  <UModal
    :open="isOpen"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <UCard class="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ editingGame ? 'Modifier le jeu' : 'Ajouter un nouveau jeu' }}
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                v-if="editingGame"
                color="red"
                variant="outline"
                icon="i-lucide-trash-2"
                size="sm"
                :loading="deleting"
                :disabled="submitting"
                @click="handleDelete"
              >
                Supprimer
              </UButton>
              <UButton
                type="submit"
                form="game-form"
                color="primary"
                size="sm"
                :loading="submitting"
                :disabled="deleting"
              >
                {{ editingGame ? 'Enregistrer' : 'Ajouter le jeu' }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="sm"
                class="-my-1"
                :disabled="submitting || deleting"
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
            <USelect
              id="age"
              v-model="state.age"
              :items="ageOptions"
              option-attribute="label"
              value-attribute="value"
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
            <USelect
              id="playing_time"
              v-model="state.playing_time"
              :items="dureeOptions"
              option-attribute="label"
              value-attribute="value"
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
            <USelect
              id="player_min"
              v-model="state.player_min"
              :items="playerMinOptions"
              option-attribute="label"
              value-attribute="value"
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
            <USelect
              id="player_max"
              v-model="state.player_max"
              :items="filteredPlayerMaxOptions"
              option-attribute="label"
              value-attribute="value"
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
import { ref, reactive, watch, computed } from 'vue'
import { useGames, type Game } from '../composables/useGames'

interface Props {
  modelValue: boolean
  game?: Game | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  game: null
})

const emit = defineEmits<Emits>()

const { createGame, updateGame, deleteGame } = useGames()

const editingGame = computed(() => props.game !== null && props.game !== undefined)

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
  } else if (newValue && editingGame.value) {
    loadGameData()
  }
})

watch(() => props.game, (newGame) => {
  if (newGame && isOpen.value) {
    loadGameData()
  }
})

const submitting = ref(false)
const deleting = ref(false)
const submitError = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const ageOptions = Array.from({ length: 19 }, (_, i) => ({
  label: `${i}${i === 0 ? '' : '+'} ans`,
  value: i
}))

const dureeOptions = [
  { label: '< 30 min', value: '< 30 min' },
  { label: '30-60 min', value: '30-60 min' },
  { label: '60-90 min', value: '60-90 min' },
  { label: '90-120 min', value: '90-120 min' },
  { label: '> 120 min', value: '> 120 min' }
]

const playerMinOptions = Array.from({ length: 10 }, (_, i) => ({
  label: `${i + 1} joueur${i > 0 ? 's' : ''}`,
  value: i + 1
}))

const playerMaxOptions = [
  { label: 'Aucun maximum', value: null },
  ...Array.from({ length: 20 }, (_, i) => ({
    label: `${i + 1} joueur${i > 0 ? 's' : ''}`,
    value: i + 1
  }))
]

const state = reactive({
  name: '',
  age: null as number | null,
  playing_time: '',
  player_min: 2,
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

const loadGameData = () => {
  if (props.game) {
    state.name = props.game.titre
    state.age = props.game.age

    // Convertir la durée en valeur correspondant aux options du menu déroulant
    const duree = props.game.duree
    if (duree < 30) {
      state.playing_time = '< 30 min'
    } else if (duree >= 30 && duree <= 60) {
      state.playing_time = '30-60 min'
    } else if (duree > 60 && duree <= 90) {
      state.playing_time = '60-90 min'
    } else if (duree > 90 && duree <= 120) {
      state.playing_time = '90-120 min'
    } else {
      state.playing_time = '> 120 min'
    }

    state.player_min = props.game.player_min
    state.player_max = props.game.player_max
    imageFile.value = null // On ne charge pas l'image existante, l'utilisateur peut en uploader une nouvelle
  }
}

const resetForm = () => {
  state.name = ''
  state.age = null
  state.playing_time = ''
  state.player_min = 2
  state.player_max = null
  imageFile.value = null
  submitError.value = null
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })
}

// Filtrer les options de player_max pour qu'elles soient >= player_min
const filteredPlayerMaxOptions = computed(() => {
  if (state.player_min === null) {
    return playerMaxOptions
  }
  return playerMaxOptions.filter(option =>
    option.value === null || option.value >= state.player_min
  )
})

const validateForm = (): boolean => {
  let isValid = true
  Object.keys(errors).forEach((key) => {
    errors[key as keyof typeof errors] = ''
  })

  if (!state.name.trim()) {
    errors.name = 'Le titre est requis'
    isValid = false
  }

  if (!state.age || state.age < 0) {
    errors.age = 'L\'âge doit être un nombre positif'
    isValid = false
  }

  if (!state.playing_time.trim()) {
    errors.playing_time = 'La durée de jeu est requise'
    isValid = false
  }

  if (!state.player_min || state.player_min < 1) {
    errors.player_min = 'Le nombre minimum de joueurs doit être au moins 1'
    isValid = false
  }

  if (state.player_max !== null && state.player_max < state.player_min) {
    errors.player_max = 'Le nombre maximum doit être supérieur ou égal au minimum'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  // La validation garantit que age n'est pas null, mais TypeScript ne le sait pas
  if (state.age === null) {
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    const gameData = {
      name: state.name.trim(),
      description: props.game?.description || '',
      age: state.age,
      playing_time: state.playing_time.trim(),
      player_min: state.player_min,
      player_max: state.player_max,
      image: imageFile.value
    }

    if (editingGame.value && props.game) {
      await updateGame({
        ...gameData,
        id: props.game.id,
        documentId: props.game.documentId
      })
    } else {
      await createGame(gameData)
    }

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error(`Erreur lors de ${editingGame.value ? 'la mise à jour' : 'la création'} du jeu:`, err)
    const errorMessage = err instanceof Error ? err.message : `Une erreur est survenue lors de ${editingGame.value ? 'la mise à jour' : 'la création'} du jeu`
    submitError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!props.game || !confirm(`Êtes-vous sûr de vouloir supprimer "${props.game.titre}" ?`)) {
    return
  }

  deleting.value = true
  submitError.value = null

  try {
    await deleteGame(props.game.id, props.game.documentId)
    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de la suppression du jeu:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression du jeu'
    submitError.value = errorMessage
  } finally {
    deleting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    resetForm()
    isOpen.value = false
  }
}
</script>
