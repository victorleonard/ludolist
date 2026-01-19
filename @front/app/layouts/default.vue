<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'

const { recherche } = useRecherche()

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const { user } = storeToRefs(authStore)
const { family } = storeToRefs(familyStore)
const { logout } = authStore
</script>

<template>
  <UApp>
    <UHeader :mobile="false">
      <template #left>
        <AppLogo />
      </template>

      <template #right>
        <div class="relative w-64 hidden md:block">
          <UInput
            v-model="recherche"
            placeholder="Rechercher un jeu..."
            icon="i-lucide-search"
            size="sm"
            class="w-full"
          >
            <template
              v-if="recherche"
              #trailing
            >
              <UButton
                color="gray"
                variant="ghost"
                icon="i-lucide-x"
                size="xs"
                :padded="false"
                @click="recherche = ''"
              />
            </template>
          </UInput>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-user" />
            <span>{{ user?.username }}</span>
            <span v-if="family" class="text-gray-400 dark:text-gray-500">•</span>
            <UIcon v-if="family" name="i-lucide-users" />
            <span v-if="family">{{ family.name }}</span>
          </div>
          <UColorModeButton />
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-log-out"
            size="sm"
            @click="logout"
          />
        </div>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <USeparator class="mt-8" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right />
    </UFooter>
  </UApp>
</template>
