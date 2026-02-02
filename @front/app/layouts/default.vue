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

const menuItems = [
  {
    label: 'Accueil',
    icon: 'i-lucide-home',
    to: '/'
  },
  {
    label: 'Ma collection de livres',
    icon: 'i-lucide-book',
    to: '/livres/'
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
            icon="i-lucide-chevron-left"
            aria-label="Retour"
            class="w-11 h-11 min-w-11 [&_svg]:w-6 [&_svg]:h-6 -ml-1"
            @click="handleBackFromGame"
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
              name="i-lucide-align-justify"
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
          <UButton
            v-else
            color="neutral"
            variant="ghost"
            icon="i-lucide-user-circle"
            size="sm"
            aria-label="Choisir un membre"
            @click="openMemberDrawer"
          />
        </div>
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
                  <span
                    v-if="isMemberConnected && currentMember"
                    class="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-1"
                  >
                    <UIcon
                      name="i-lucide-user-circle"
                      class="w-4 h-4"
                    />
                    Connecté en tant que : {{ currentMember.username }}
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

            <!-- Connexion membre (ouvre le drawer) -->
            <UButton
              v-if="!isMemberConnected"
              variant="ghost"
              color="neutral"
              class="justify-start px-4 py-3 w-full"
              @click="closeMenu(); openMemberDrawer()"
            >
              <UIcon
                name="i-lucide-user-circle"
                class="w-5 h-5"
              />
              <span class="font-medium">Se connecter en tant que membre</span>
            </UButton>

            <UButton
              v-else
              variant="ghost"
              color="neutral"
              class="justify-start px-4 py-3"
              @click="handleMemberLogout"
            >
              <UIcon
                name="i-lucide-log-out"
                class="w-5 h-5"
              />
              <span class="font-medium">Déconnexion membre ({{ currentMember?.username }})</span>
            </UButton>

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

    <!-- Drawer choix du membre / mode famille / saisie code -->
    <UDrawer
      :open="isMemberDrawerOpen"
      direction="bottom"
      @update:open="onMemberDrawerOpenChange"
    >
      <template #content>
        <div class="flex flex-col p-4 pb-safe">
          <!-- Vue liste des membres -->
          <template v-if="!memberForCode">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold">
                Choisir un membre
              </h2>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
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
                icon="i-lucide-users"
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
                icon="i-lucide-chevron-left"
                size="sm"
                @click="cancelMemberCode"
              />
              <h2 class="text-lg font-semibold flex-1">
                Code pour {{ memberForCode.username }}
              </h2>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
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
