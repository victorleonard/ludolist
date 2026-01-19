<script setup>
const { recherche } = useRecherche()
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
        <UColorModeButton />
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
