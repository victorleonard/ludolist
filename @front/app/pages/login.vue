<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()
const router = useRouter()
const toast = useToast()
const isLoading = ref(false)

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Entrez votre email',
  required: true
}, {
  name: 'password',
  label: 'Mot de passe',
  type: 'password',
  placeholder: 'Entrez votre mot de passe',
  required: true
}, {
  name: 'remember',
  label: 'Se souvenir de moi',
  type: 'checkbox'
}]

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  isLoading.value = true

  try {
    const result = await login(payload.data.email, payload.data.password)

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
  <UPageCard>
    <UAuthForm
      :schema="schema"
      description="Entrez vos identifiants pour accéder à votre compte."
      :fields="fields"
      :loading="isLoading"
      @submit="onSubmit"
    >
      <template #title>
        <div class="flex justify-center mb-2">
          <AppLogo size="lg" />
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
