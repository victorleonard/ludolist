<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useFamilyStore } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

const route = useRoute()
const router = useRouter()
const { recherche } = useRecherche()

const authStore = useAuthStore()
const familyStore = useFamilyStore()
const memberStore = useMemberStore()

const { user } = storeToRefs(authStore)
const { family, familyMembers } = storeToRefs(familyStore)
const { currentMember, isMemberConnected } = storeToRefs(memberStore)
const { logout } = authStore

const isMenuOpen = ref(false)
const isMemberDrawerOpen = ref(false)
const memberForCode = ref(null)
const memberCode = ref('')
const memberCodeError = ref(null)
const memberCodeLoading = ref(false)
const { isOpen: isAddGameModalOpen, selectedGame, closeModal: closeAddGameModal } = useAddGameModal()
const { isOpen: isAddBookModalOpen, selectedBook, closeModal: closeAddBookModal } = useAddBookModal()

// Détecter si on est sur une page de jeu
const isGamePage = computed(() => {
  return route.path.startsWith('/game/') && route.params.id
})

// Détecter si on est sur une page de livre
const isBookPage = computed(() => {
  return route.path.startsWith('/livres/') && route.params.id && route.path !== '/livres/'
})

// Détecter si on est sur une page de plat
const isDishPage = computed(() => {
  return route.path.startsWith('/plat/') && route.params.id && route.path !== '/plats/'
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
    } catch {
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

// Fonction pour gérer le retour depuis une page de livre
const handleBackFromBook = () => {
  // Toujours rediriger vers la liste des livres
  navigateTo('/livres/')
}

// Fonction pour gérer le retour depuis une page de plat
const handleBackFromDish = () => {
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
      // Si on vient de la page plats, retourner à la page plats
      if (referrerPath === '/plats/' || referrerPath.startsWith('/plats/')) {
        navigateTo('/plats/')
        return
      }
    } catch {
      // En cas d'erreur, utiliser router.back()
    }
  }

  // Par défaut, utiliser router.back() ou rediriger vers /plats/
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateTo('/plats/')
  }
}

const menuItems = [
  {
    label: 'Accueil',
    icon: 'i-ion-home',
    to: '/'
  },
  {
    label: 'Jeux',
    icon: 'i-ion-dice',
    to: '/jeux'
  },
  {
    label: 'Livres',
    icon: 'i-ion-book',
    to: '/livres/'
  },
  {
    label: 'Plats',
    icon: 'i-ion-restaurant',
    to: '/plats/'
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

const handleBookAdded = () => {
  familyStore.fetchFamily()
}

const openMemberDrawer = async () => {
  if (familyMembers.value.length === 0) {
    await familyStore.fetchFamily()
  }
  isMemberDrawerOpen.value = true
}

const closeMemberDrawer = () => {
  isMemberDrawerOpen.value = false
  memberForCode.value = null
  memberCode.value = ''
  memberCodeError.value = null
}

const onMemberDrawerOpenChange = (value) => {
  isMemberDrawerOpen.value = value
  if (!value) {
    memberForCode.value = null
    memberCode.value = ''
    memberCodeError.value = null
  }
}

const handleSelectMember = (member) => {
  if (currentMember.value?.id === member.id) {
    closeMemberDrawer()
    return
  }
  memberForCode.value = member
  memberCode.value = ''
  memberCodeError.value = null
}

const cancelMemberCode = () => {
  memberForCode.value = null
  memberCode.value = ''
  memberCodeError.value = null
}

const handleMemberCodeInput = (e) => {
  const raw = e?.target?.value ?? (typeof e === 'string' ? e : '')
  const v = String(raw).replace(/\D/g, '').slice(0, 4)
  memberCode.value = v
  if (memberCodeError.value) memberCodeError.value = null
}

const submitMemberCode = async () => {
  if (!memberForCode.value || memberCode.value.length !== 4) return
  memberCodeLoading.value = true
  memberCodeError.value = null
  try {
    const result = await memberStore.loginAsMember(memberForCode.value.id, memberCode.value)
    if (result.success) {
      closeMemberDrawer()
    } else {
      memberCodeError.value = result.error || 'Code incorrect'
      memberCode.value = ''
    }
  } catch {
    memberCodeError.value = 'Une erreur est survenue'
    memberCode.value = ''
  } finally {
    memberCodeLoading.value = false
  }
}

const handleFamilyMode = () => {
  memberStore.logoutMember()
  closeMemberDrawer()
}

const handleMemberLogout = () => {
  memberStore.logoutMember()
  closeMenu()
}
</script>

<template>
  <UApp class="app-wrapper">
    <UHeader
      :mobile="false"
      class="header-fixed bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg safe-header"
    >
      <template #left>
        <div class="relative z-10">
          <UButton
            v-if="isGamePage"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-ion-chevron-back"
            aria-label="Retour"
            class="w-11 h-11 min-w-11 [&_svg]:w-10 [&_svg]:h-10 -ml-1"
            @click="handleBackFromGame"
          />
          <UButton
            v-else-if="isBookPage"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-ion-chevron-back"
            aria-label="Retour"
            class="w-11 h-11 min-w-11 [&_svg]:w-10 [&_svg]:h-10 -ml-1"
            @click="handleBackFromBook"
          />
          <UButton
            v-else-if="isDishPage"
            variant="ghost"
            color="neutral"
            size="lg"
            icon="i-ion-chevron-back"
            aria-label="Retour"
            class="w-11 h-11 min-w-11 [&_svg]:w-10 [&_svg]:h-10 -ml-1"
            @click="handleBackFromDish"
          />
          <UButton
            v-else
            variant="ghost"
            color="neutral"
            size="sm"
            aria-label="Navigation"
            @click="toggleMenu"
          >
            <UIcon
              name="i-ion-menu"
              class="w-5 h-5"
            />
          </UButton>
        </div>
        <div
          class="absolute left-1/2 transform -translate-x-1/2 inset-y-0 flex items-center pointer-events-none header-logo"
        >
          <AppLogo class="pointer-events-auto" />
        </div>
      </template>

      <template #right>
        <ClientOnly>
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Avatar ou icône choix du membre → drawer liste des membres -->
            <UButton
              v-if="isMemberConnected && currentMember"
              :aria-label="`Membre connecté : ${currentMember.username}`"
              variant="ghost"
              color="neutral"
              class="rounded-full p-0 min-w-0 hover:opacity-90 transition-opacity bg-transparent hover:bg-transparent"
              @click="openMemberDrawer"
            >
              <MemberAvatar
                :member="currentMember"
                size="xs"
                show-ring
              />
            </UButton>
            <!-- Mode famille : afficher tous les avatars en superposition -->
            <UButton
              v-else-if="!isMemberConnected && familyMembers && familyMembers.length > 0"
              color="neutral"
              variant="ghost"
              class="p-0 min-w-0 hover:opacity-90 transition-opacity bg-transparent hover:bg-transparent"
              aria-label="Mode famille — Choisir un membre"
              @click="openMemberDrawer"
            >
              <div class="flex items-center">
                <div
                  v-for="(member, index) in familyMembers.slice(0, 4)"
                  :key="member.id"
                  class="relative"
                  :class="index > 0 ? '-ml-4' : ''"
                  :style="{ zIndex: 10 - index }"
                >
                  <MemberAvatar
                    :member="member"
                    size="xs"
                    :class="index > 0 ? 'ring-2 ring-white dark:ring-gray-900' : ''"
                  />
                </div>
              </div>
            </UButton>
            <UButton
              v-else
              color="neutral"
              variant="ghost"
              icon="i-ion-person-circle"
              size="sm"
              aria-label="Choisir un membre"
              @click="openMemberDrawer"
            />
          </div>
          <template #fallback>
            <!-- Fallback pour SSR : afficher juste l'icône -->
            <div class="flex items-center gap-2 sm:gap-3">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-ion-person-circle"
                size="sm"
                aria-label="Choisir un membre"
                @click="openMemberDrawer"
              />
            </div>
          </template>
        </ClientOnly>
      </template>
    </UHeader>

    <UMain class="main-content safe-area-x min-h-screen bg-gray-50 dark:bg-gray-900">
      <slot />
    </UMain>

    <BottomTabNavigation />

    <!-- PWA Components -->
    <PwaInstallPrompt />
    <PwaUpdatePrompt />

    <UDrawer
      :open="isMenuOpen"
      direction="left"
      @update:open="(value) => { isMenuOpen = value }"
    >
      <template #content>
        <div class="flex flex-col h-full bg-white dark:bg-gray-900">
          <!-- Header du menu -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
              Menu
            </h2>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ion-close"
              size="sm"
              class="hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="closeMenu"
            />
          </div>

          <div class="flex flex-col flex-1 overflow-y-auto">
            <!-- Informations utilisateur -->
            <div class="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary-500 dark:bg-primary-600 flex items-center justify-center shrink-0">
                  <span class="text-white font-semibold text-lg">
                    {{ user?.username?.charAt(0)?.toUpperCase() || 'U' }}
                  </span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="font-semibold text-gray-900 dark:text-gray-100 text-base truncate">
                    {{ user?.username }}
                  </span>
                  <span
                    v-if="family"
                    class="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-0.5"
                  >
                    <UIcon
                      name="i-ion-persons"
                      class="w-4 h-4 shrink-0"
                    />
                    <span class="truncate">{{ family.name }}</span>
                  </span>
                  <span
                    v-if="isMemberConnected && currentMember"
                    class="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mt-1.5 font-medium"
                  >
                    <UIcon
                      name="i-ion-person-circle"
                      class="w-3.5 h-3.5 shrink-0"
                    />
                    <span class="truncate">Connecté : {{ currentMember.username }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Navigation principale -->
            <div class="px-2 py-3">
              <NuxtLink
                v-for="item in menuItems"
                :key="item.to"
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-150 group"
                :class="route.path === item.to ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'"
                @click="closeMenu"
              >
                <UIcon
                  :name="item.icon"
                  class="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
                  :class="route.path === item.to ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'"
                />
                <span class="font-medium text-sm">{{ item.label }}</span>
                <UIcon
                  v-if="route.path === item.to"
                  name="i-ion-chevron-forward"
                  class="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400"
                />
              </NuxtLink>
            </div>

            <!-- Séparateur -->
            <div class="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-5" />

            <!-- Connexion membre -->
            <div class="px-2 py-2">
              <button
                v-if="!isMemberConnected"
                type="button"
                class="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-150 w-full text-left group"
                @click="closeMenu(); openMemberDrawer()"
              >
                <UIcon
                  name="i-ion-person-circle"
                  class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform"
                />
                <span class="font-medium text-sm text-gray-700 dark:text-gray-300">Se connecter en tant que membre</span>
                <UIcon
                  name="i-ion-chevron-forward"
                  class="w-4 h-4 ml-auto text-gray-400 dark:text-gray-500"
                />
              </button>

              <button
                v-else
                type="button"
                class="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-all duration-150 w-full text-left group"
                @click="handleMemberLogout"
              >
                <UIcon
                  name="i-ion-log-out"
                  class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform"
                />
                <span class="font-medium text-sm text-gray-700 dark:text-gray-300">
                  Déconnexion membre
                </span>
                <span class="ml-auto text-xs text-gray-500 dark:text-gray-400">
                  {{ currentMember?.username }}
                </span>
              </button>
            </div>

            <!-- Séparateur -->
            <div class="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-5" />

            <!-- Paramètres -->
            <div class="px-2 py-2">
              <!-- Dark mode -->
              <div class="flex items-center justify-between px-3 py-2.5 mx-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150">
                <div class="flex items-center gap-3">
                  <UIcon
                    name="i-ion-moon"
                    class="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400"
                  />
                  <span class="font-medium text-sm text-gray-700 dark:text-gray-300">Mode sombre</span>
                </div>
                <UColorModeButton class="shrink-0" />
              </div>
            </div>

            <!-- Séparateur -->
            <div class="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-5" />

            <!-- Déconnexion -->
            <div class="px-2 py-2" style="padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0.5rem));">
              <button
                type="button"
                class="flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-all duration-150 w-full text-left group"
                @click="logout"
              >
                <UIcon
                  name="i-ion-log-out"
                  class="w-5 h-5 shrink-0 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform"
                />
                <span class="font-medium text-sm text-red-600 dark:text-red-400">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </UDrawer>

    <!-- Drawer choix du membre / mode famille / saisie code -->
    <UDrawer
      :open="isMemberDrawerOpen"
      direction="bottom"
      @update:open="onMemberDrawerOpenChange"
    >
      <template #content>
        <div class="flex flex-col p-4" style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));">
          <!-- Vue liste des membres -->
          <template v-if="!memberForCode">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">
                Choisir un membre
              </h2>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ion-close"
                size="sm"
                @click="closeMemberDrawer"
              />
            </div>
            <div class="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
              <button
                v-for="member in familyMembers"
                :key="member.id"
                type="button"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
                @click="handleSelectMember(member)"
              >
                <MemberAvatar
                  :member="member"
                  size="md"
                  :show-ring="isMemberConnected && currentMember?.id === member.id"
                />
                <span class="font-medium">{{ member.username }}</span>
                <span
                  v-if="isMemberConnected && currentMember?.id === member.id"
                  class="text-xs text-primary-600 dark:text-primary-400 ml-auto"
                >
                  Connecté
                </span>
              </button>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              <UButton
                variant="outline"
                color="neutral"
                class="w-full justify-center"
                icon="i-ion-persons"
                @click="handleFamilyMode"
              >
                Mode famille — tout voir
              </UButton>
            </div>
          </template>

          <!-- Vue saisie du code pour le membre sélectionné -->
          <template v-else>
            <div class="flex items-center gap-2 mb-4">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ion-chevron-back"
                size="sm"
                @click="cancelMemberCode"
              />
              <h2 class="text-lg font-semibold flex-1">
                Code pour {{ memberForCode.username }}
              </h2>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ion-close"
                size="sm"
                @click="closeMemberDrawer"
              />
            </div>
            <div class="space-y-4">
              <div>
                <UInput
                  :model-value="memberCode"
                  type="text"
                  inputmode="numeric"
                  maxlength="4"
                  placeholder="0000"
                  size="lg"
                  class="w-full text-center text-2xl tracking-widest font-mono"
                  :disabled="memberCodeLoading"
                  @update:model-value="(v) => handleMemberCodeInput(v ?? '')"
                />
              </div>
              <p
                v-if="memberCodeError"
                class="text-sm text-red-600 dark:text-red-400 text-center"
              >
                {{ memberCodeError }}
              </p>
              <UButton
                color="primary"
                size="lg"
                block
                :loading="memberCodeLoading"
                :disabled="memberCode.length !== 4"
                @click="submitMemberCode"
              >
                Se connecter
              </UButton>
            </div>
          </template>
        </div>
      </template>
    </UDrawer>

    <AddGameModal
      :model-value="isAddGameModalOpen"
      :game="selectedGame"
      @update:model-value="(value) => { if (!value) closeAddGameModal() }"
      @success="handleGameAdded"
    />

    <AddBookModal
      :model-value="isAddBookModalOpen"
      :book="selectedBook"
      @update:model-value="(value) => { if (!value) closeAddBookModal() }"
      @success="handleBookAdded"
    />
  </UApp>
</template>
