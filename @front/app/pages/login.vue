<script setup lang="ts">
import * as z from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const isLoading = ref(false)
const showPassword = ref(false)

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
  remember: z.boolean().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
  password: '',
  remember: false
})

const validate = async (state: Schema) => {
  const result = await schema.safeParseAsync(state)
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.errors.forEach((error) => {
      if (error.path[0]) {
        errors[error.path[0] as string] = error.message
      }
    })
    return errors
  }
  return {}
}

const errors = ref<Record<string, string>>({})

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const onSubmit = async (event: { data: Schema }) => {
  const validationErrors = await validate(event.data)
  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  errors.value = {}
  isLoading.value = true

  try {
    const result = await authStore.login(event.data.email, event.data.password)

    if (result.success) {
      toast.add({
        title: 'Connexion réussie',
        description: `Bienvenue ${result.data?.user.username}!`,
        color: 'success'
      })

      // Rediriger vers la page d'accueil
      await router.push('/')
    } else {
      toast.add({
        title: 'Erreur de connexion',
        description: result.error || 'Identifiants incorrects',
        color: 'error'
      })
    }
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la connexion',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="w-full px-4 sm:px-6">
    <!-- Contenu sans carte sur mobile, avec carte moderne sur desktop -->
    <div :class="[
      'space-y-6',
      'sm:bg-white/80 sm:dark:bg-gray-800/80',
      'sm:backdrop-blur-xl',
      'sm:rounded-2xl',
      'sm:border sm:border-gray-200/50 sm:dark:border-gray-700/50',
      'sm:shadow-2xl sm:shadow-gray-900/5',
      'sm:p-10',
      'transition-all duration-500',
      'sm:hover:shadow-gray-900/10 sm:hover:border-gray-300/50 sm:dark:hover:border-gray-600/50'
    ]">
      <!-- Logo et titre -->
      <div class="text-center space-y-3">
        <div class="flex justify-center mb-4">
          <div class="relative">
            <div class="absolute inset-0 bg-primary-500/10 blur-2xl rounded-full" />
            <AppLogo size="lg" class="relative" />
          </div>
        </div>
        <div class="space-y-1.5">
          <h1 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Connexion
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Accédez à votre espace personnel
          </p>
        </div>
      </div>

      <!-- Formulaire -->
      <form
        class="space-y-5"
        @submit.prevent="onSubmit({ data: state })"
      >
        <!-- Email -->
        <div class="space-y-2">
          <label
            for="email"
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <UInput
            id="email"
            v-model="state.email"
            type="email"
            placeholder="votre@email.com"
            size="lg"
            :disabled="isLoading"
            :error="!!errors.email"
            autocomplete="email"
            class="w-full"
            :ui="{
              base: 'transition-all duration-200 w-full',
              rounded: 'rounded-xl',
              size: { lg: 'text-base py-3' },
              variant: {
                default: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'
              }
            }"
          />
          <p
            v-if="errors.email"
            class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1"
          >
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            {{ errors.email }}
          </p>
        </div>

        <!-- Mot de passe -->
        <div class="space-y-2">
          <label
            for="password"
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            Mot de passe
          </label>
          <UInput
            id="password"
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            size="lg"
            :disabled="isLoading"
            :error="!!errors.password"
            autocomplete="current-password"
            class="w-full"
            :ui="{
              base: 'transition-all duration-200 w-full',
              rounded: 'rounded-xl',
              size: { lg: 'text-base py-3' },
              variant: {
                default: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20'
              }
            }"
          >
            <template #trailing>
              <UButton
                color="gray"
                variant="ghost"
                :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                :padded="false"
                size="sm"
                class="touch-manipulation text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click.stop="togglePasswordVisibility"
              />
            </template>
          </UInput>
          <p
            v-if="errors.password"
            class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1"
          >
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            {{ errors.password }}
          </p>
        </div>

        <!-- Bouton de connexion -->
        <UButton
          type="submit"
          block
          size="lg"
          :loading="isLoading"
          :ui="{
            rounded: 'rounded-xl',
            size: { lg: 'py-3.5 text-base font-semibold' },
            base: 'transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] touch-manipulation',
            variant: {
              solid: 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-primary-500/50'
            }
          }"
          class="mt-6"
        >
          <span v-if="!isLoading" class="flex items-center justify-center gap-2">
            <span>Se connecter</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>Connexion...</span>
          </span>
        </UButton>
      </form>
    </div>
  </div>
</template>
