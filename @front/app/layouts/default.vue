<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'

const route = useRoute()
const router = useRouter()
const { recherche } = useRecherche()

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const { user } = storeToRefs(authStore)
const { family } = storeToRefs(familyStore)
const { logout } = authStore

const isMenuOpen = ref(false)
const isAddDrawerOpen = ref(false)
const { isOpen: isAddGameModalOpen, selectedGame, openModal: openAddGameModal, closeModal: closeAddGameModal } = useAddGameModal()
const { openModal: openAddSessionModal } = useAddSessionModal()

// Détecter si on est sur une page de jeu
const isGamePage = computed(() => {
  return route.path.startsWith('/game/') && route.params.id
})

// Fonction pour gérer le retour depuis une page de jeu
const handleBackFromGame = () => {
  // Essayer de déterminer d'où on vient via le referrer
  if (typeof window !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)
      const referrerPath = referrerUrl.pathname

      // Si on vient de la page home, retourner à la page home
      if (referrerPath === '/' || referrerPath === '') {
        navigateTo('/')
        return
      }
      // Si on vient de la page jeux, retourner à la page jeux
      if (referrerPath === '/jeux') {
        navigateTo('/jeux')
        return
      }
    } catch (e) {
      // En cas d'erreur, utiliser router.back()
    }
  }

  // Par défaut, utiliser router.back() ou rediriger vers /jeux
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/jeux')
  }
}

const menuItems = [
  {
    label: 'Accueil',
    icon: 'i-lucide-home',
    to: '/'
  }
]

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleGameAdded = () => {
  familyStore.fetchFamily()
}

const openAddDrawer = () => {
  isAddDrawerOpen.value = true
}

const closeAddDrawer = () => {
  isAddDrawerOpen.value = false
}

const handleAddGame = () => {
  closeAddDrawer()
  openAddGameModal()
}

const handleAddSession = () => {
  closeAddDrawer()
  // Si on est sur une page de jeu, ouvrir directement le modal
  if (isGamePage.value) {
    openAddSessionModal()
  } else {
    // Sinon, rediriger vers la page des jeux pour sélectionner un jeu
    navigateTo('/jeux')
  }
}
</script>

<template>
  <UApp>
    <UHeader
      :mobile="false"
      class="relative"
    >
      <template #left>
        <div class="relative z-10">
          <UButton
            v-if="isGamePage"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-arrow-left"
            aria-label="Retour"
            @click="handleBackFromGame"
          >
            Retour
          </UButton>
          <UButton
            v-else
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Navigation"
            @click="toggleMenu"
          >
            <UIcon
              name="i-lucide-align-justify"
              class="w-5 h-5"
            />
          </UButton>
        </div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <AppLogo class="pointer-events-auto" />
        </div>
      </template>

      <template #right>
        <div class="flex items-center gap-3">
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
          <UButton
            color="neutral"
            icon="i-lucide-plus"
            size="sm"
            aria-label="Ajouter"
            variant="outline"
            @click="openAddDrawer"
          />
        </div>
      </template>
    </UHeader>

    <UMain class="pb-20 md:pb-0 min-h-screen bg-gray-50 dark:bg-gray-900">
      <slot />
    </UMain>

    <USeparator class="mt-8 hidden md:block" />

    <BottomTabNavigation class="md:hidden" />

    <UDrawer
      :open="isMenuOpen"
      direction="left"
      @update:open="(value) => { isMenuOpen = value }"
    >
      <template #content>
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between p-4 border-b">
            <h2 class="text-lg font-semibold">
              Menu
            </h2>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-lucide-x"
              size="sm"
              @click="closeMenu"
            />
          </div>

          <div class="flex flex-col gap-2 p-4 flex-1">
            <!-- Informations utilisateur -->
            <div class="px-4 py-3 mb-2 border-b">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-user"
                  class="w-5 h-5 text-gray-500"
                />
                <div class="flex flex-col">
                  <span class="font-semibold">{{ user?.username }}</span>
                  <span
                    v-if="family"
                    class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-users"
                      class="w-4 h-4"
                    />
                    {{ family.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Liens de navigation -->
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              @click="closeMenu"
            >
              <UIcon
                :name="item.icon"
                class="w-5 h-5"
              />
              <span class="font-medium">{{ item.label }}</span>
            </NuxtLink>

            <!-- Séparateur -->
            <div class="border-t my-2" />

            <!-- Dark mode -->
            <div class="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-moon"
                  class="w-5 h-5"
                />
                <span class="font-medium">Mode sombre</span>
              </div>
              <UColorModeButton />
            </div>

            <!-- Déconnexion -->
            <UButton
              variant="ghost"
              color="red"
              class="justify-start px-4 py-3"
              @click="logout"
            >
              <UIcon
                name="i-lucide-log-out"
                class="w-5 h-5"
              />
              <span class="font-medium">Déconnexion</span>
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Drawer pour ajouter (jeu ou partie) -->
    <UDrawer
      :open="isAddDrawerOpen"
      direction="bottom"
      @update:open="(value) => { isAddDrawerOpen = value }"
    >
      <template #content>
        <div class="flex flex-col">
          <div class="flex flex-col gap-2 p-4">
            <UButton
              color="primary"
              variant="ghost"
              class="justify-start px-4 py-3"
              @click="handleAddGame"
            >
              <UIcon
                name="i-lucide-dice-6"
                class="w-5 h-5"
              />
              <span class="font-medium">Ajouter un jeu</span>
            </UButton>
            <UButton
              color="primary"
              variant="ghost"
              class="justify-start px-4 py-3"
              @click="handleAddSession"
            >
              <UIcon
                name="i-lucide-gamepad-2"
                class="w-5 h-5"
              />
              <span class="font-medium">Nouvelle partie</span>
            </UButton>
          </div>
        </div>
      </template>
    </UDrawer>

    <AddGameModal
      :model-value="isAddGameModalOpen"
      :game="selectedGame"
      @update:model-value="(value) => { if (!value) closeAddGameModal() }"
      @success="handleGameAdded"
    />
  </UApp>
</template>
