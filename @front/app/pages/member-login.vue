<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="min-h-screen flex items-center justify-center py-6 sm:py-12">
      <UCard class="w-full max-w-md mx-4 sm:mx-auto">
        <template #header>
          <div class="flex flex-col items-center gap-4">
            <AppLogo size="lg" />
            <h1 class="text-2xl font-bold text-center">
              Connexion en tant que membre
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
              Choisissez un membre et entrez son code à 4 chiffres
            </p>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Sélection du membre -->
          <div>
            <label
              for="member"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Membre
            </label>
            <SelectWithModal
              id="member"
              v-model="selectedMemberId"
              :items="memberOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Choisissez un membre"
              modal-title="Choisir un membre"
              :disabled="isLoading"
              size="lg"
              class="w-full"
            />
          </div>

          <!-- Code PIN -->
          <div>
            <label
              for="code"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Code à 4 chiffres
            </label>
            <UInput
              id="code"
              v-model="code"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="4"
              placeholder="0000"
              :disabled="isLoading || !selectedMemberId"
              size="lg"
              class="w-full text-center text-2xl tracking-widest font-mono"
              @input="handleCodeInput"
            />
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Entrez le code du membre sélectionné
            </p>
          </div>

          <!-- Message d'erreur -->
          <div
            v-if="error"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400 text-center">
              {{ error }}
            </p>
          </div>

          <!-- Bouton de connexion -->
          <UButton
            color="primary"
            size="lg"
            block
            :loading="isLoading"
            :disabled="!selectedMemberId || code.length !== 4"
            @click="handleLogin"
          >
            Se connecter
          </UButton>

          <!-- Mode famille : tout voir sans code -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
              Ou accédez à toute la collection sans code
            </p>
            <UButton
              variant="outline"
              color="neutral"
              size="lg"
              block
              icon="i-lucide-users"
              @click="handleFamilyMode"
            >
              Mode famille — tout voir
            </UButton>
          </div>

          <!-- Lien retour -->
          <div class="text-center">
            <UButton
              variant="ghost"
              color="neutral"
              @click="navigateTo('/')"
            >
              Retour à l'accueil
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const memberStore = useMemberStore()

const { familyMembers } = storeToRefs(familyStore)

const selectedMemberId = ref<number | null>(null)
const code = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

const memberOptions = computed(() => {
  return familyMembers.value.map(member => ({
    label: member.username,
    value: member.id
  }))
})

const handleCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // Ne garder que les chiffres
  const numericValue = target.value.replace(/\D/g, '')
  code.value = numericValue.slice(0, 4)
}

const handleLogin = async () => {
  if (!selectedMemberId.value || code.value.length !== 4) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const result = await memberStore.loginAsMember(selectedMemberId.value!, code.value)

    if (result.success) {
      // Rediriger vers la page d'accueil
      await navigateTo('/')
    } else {
      error.value = result.error || 'Code incorrect'
      code.value = ''
    }
  } catch (err) {
    error.value = 'Une erreur est survenue lors de la connexion'
    code.value = ''
  } finally {
    isLoading.value = false
  }
}

/** Mode famille : aucun membre sélectionné, voir toute la collection. */
const handleFamilyMode = () => {
  memberStore.clearMember()
  navigateTo('/')
}

onMounted(async () => {
  // Charger la famille si elle n'est pas déjà chargée
  if (familyMembers.value.length === 0) {
    await familyStore.fetchFamily()
  }
})
</script>
