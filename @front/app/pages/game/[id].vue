<template>
  <UContainer>
    <div class="py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-12"
      >
        <p class="text-red-500 mb-4">
          {{ error }}
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/jeux')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Jeu non trouvé -->
      <div
        v-else-if="!jeu"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Jeu non trouvé
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Le jeu que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/jeux')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Détails du jeu -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Titre -->
        <h1 class="text-2xl font-bold wrap-break-word min-w-0 mb-4">
          {{ jeu.titre }}
        </h1>

        <!-- Navigation avec onglets -->
        <UTabs
          v-model="activeTab"
          :items="tabs"
          variant="link"
          class="w-full"
        >
          <template #detail>
            <div class="space-y-6 py-6">
              <!-- Card avec image et infos synthétiques -->
              <UCard class="bg-white dark:bg-gray-800">
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">Détails</span>
                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-edit"
                      size="sm"
                      @click="openEditModal"
                    />
                  </div>
                </template>
                <div class="flex flex-col gap-4">
                  <div class="w-full h-48 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="jeu && jeu.image"
                      :src="jeu.image"
                      :alt="jeu.titre || 'Image du jeu'"
                      class="w-full h-full object-contain"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-16 h-16 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span class="text-xs text-center">Aucune image</span>
                    </div>
                  </div>
                  <div
                    v-if="averageRating > 0"
                    class="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                  >
                    <StarRating
                      :model-value="averageRating"
                      size="sm"
                      readonly
                    />
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      color="neutral"
                      variant="subtle"
                      class="whitespace-nowrap"
                    >
                      {{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans
                    </UBadge>
                    <UBadge
                      v-for="tag in jeu.tags"
                      :key="tag"
                      :color="tag.includes('joueurs') ? 'info' : 'primary'"
                      variant="subtle"
                    >
                      {{ tag }}
                    </UBadge>
                  </div>
                </div>
              </UCard>
            </div>
          </template>

          <template #notes>
            <div class="space-y-6 py-6">
              <div
                v-if="familyMembers.length > 0"
              >
                <div class="space-y-4">
                  <UCard
                    v-for="member in familyMembers"
                    :key="member.id"
                    class="bg-white dark:bg-gray-800"
                  >
                    <div class="flex items-center gap-3 mb-3">
                      <div :class="['w-10 h-10 rounded-full flex items-center justify-center', getMemberAvatarColor(member.id).bg]">
                        <span :class="['text-sm font-semibold', getMemberAvatarColor(member.id).text]">
                          {{ member.username?.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between flex-1">
                        <span class="font-medium">{{ member.username }}</span>
                        <UButton
                          v-if="getMemberRating(member.id) > 0"
                          color="red"
                          variant="ghost"
                          icon="i-lucide-trash-2"
                          size="xs"
                          @click="setMemberRating(member.id, 0)"
                        />
                      </div>
                    </div>
                    <div class="flex justify-center">
                      <StarRating
                        :model-value="getMemberRating(member.id)"
                        size="lg"
                        @update:model-value="(rating) => setMemberRating(member.id, rating)"
                      />
                    </div>
                  </UCard>
                </div>

                <!-- Note moyenne -->
                <UCard
                  v-if="averageRating > 0"
                  class="mt-4 bg-white dark:bg-gray-800"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-primary-900 dark:text-primary-100">
                      Note moyenne
                    </span>
                    <div class="flex items-center gap-2">
                      <StarRating
                        :model-value="averageRating"
                        readonly
                      />
                      <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {{ averageRating.toFixed(1) }} / 5
                      </span>
                    </div>
                  </div>
                </UCard>
              </div>
              <div
                v-else
                class="text-center py-12 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-users"
                  class="w-16 h-16 mx-auto mb-4 opacity-50"
                />
                <p>Aucun membre dans la famille</p>
              </div>
            </div>
          </template>

          <template #parties>
            <div class="space-y-6 py-6">
              <!-- Liste des parties -->
              <GameSessions
                v-if="gameId"
                :game-id="gameId"
              />
            </div>
          </template>

          <template #podium>
            <div class="space-y-6 py-6">
              <!-- Podium des top 3 -->
              <UCard
                v-if="top3Winners.length > 0"
                class="bg-white dark:bg-gray-800 mb-6 overflow-hidden podium-card"
              >
                <div class="relative flex items-end justify-center gap-3 px-4 pt-6 pb-0">
                  <!-- Confettis pour le 1er -->
                  <div
                    v-if="top3Winners[0]"
                    :class="['absolute top-0 left-0 right-0 h-full pointer-events-none overflow-hidden confetti-container', { 'show-confetti': showPodiumAnimation }]"
                  >
                    <div class="confetti confetti-1">
                      🎉
                    </div>
                    <div class="confetti confetti-2">
                      ⭐
                    </div>
                    <div class="confetti confetti-3">
                      ✨
                    </div>
                    <div class="confetti confetti-4">
                      🎊
                    </div>
                    <div class="confetti confetti-5">
                      🌟
                    </div>
                  </div>

                  <!-- 2ème place -->
                  <div
                    v-if="top3Winners[1]"
                    class="flex flex-col items-center flex-1 max-w-[120px] podium-second"
                  >
                    <div :class="['medal-container mb-2 podium-text', { 'reveal-text': showPodiumAnimation }]">
                      <span class="medal-emoji">🥈</span>
                    </div>
                    <div :class="['w-18 h-18 rounded-full flex items-center justify-center mb-3 shadow-lg transform hover:scale-110 transition-transform podium-avatar', { 'reveal-avatar': showPodiumAnimation }, getMemberAvatarColor(top3Winners[1].member.id).bg]">
                      <span :class="['text-lg font-bold', getMemberAvatarColor(top3Winners[1].member.id).text]">
                        {{ top3Winners[1].member.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div
                      class="w-full bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-t-2xl p-3 text-center shadow-lg podium-base"
                      style="height: 90px;"
                    >
                      <div class="flex flex-col items-center justify-center h-full">
                        <span :class="['text-xs font-bold text-slate-800 dark:text-slate-100 mb-1 podium-text', { 'reveal-text': showPodiumAnimation }]">2ème</span>
                        <span :class="['text-xs font-bold text-slate-900 dark:text-slate-50 truncate w-full podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[1].member.username }}
                        </span>
                        <span :class="['text-xs text-slate-700 dark:text-slate-300 mt-1 podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[1].wins }} {{ top3Winners[1].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 1ère place -->
                  <div
                    v-if="top3Winners[0]"
                    class="flex flex-col items-center flex-1 max-w-[140px] podium-first"
                  >
                    <div :class="['crown-container mb-2 podium-text', { 'reveal-text': showPodiumAnimation }]">
                      <UIcon
                        name="i-lucide-crown"
                        class="w-8 h-8 text-yellow-400 animate-bounce"
                      />
                      <div class="stars">
                        <span class="star star-1">⭐</span>
                        <span class="star star-2">⭐</span>
                        <span class="star star-3">⭐</span>
                      </div>
                    </div>
                    <div :class="['w-24 h-24 rounded-full flex items-center justify-center mb-3 border-4 border-yellow-400 shadow-2xl glow-gold transform hover:scale-110 transition-transform podium-avatar', { 'reveal-avatar': showPodiumAnimation }, getMemberAvatarColor(top3Winners[0].member.id).bg]">
                      <span :class="['text-2xl font-bold', getMemberAvatarColor(top3Winners[0].member.id).text]">
                        {{ top3Winners[0].member.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div
                      class="w-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-700 rounded-t-2xl p-4 text-center shadow-2xl podium-base podium-gold"
                      style="height: 120px;"
                    >
                      <div class="flex flex-col items-center justify-center h-full">
                        <span :class="['text-sm font-bold text-yellow-900 dark:text-yellow-50 mb-1 podium-text', { 'reveal-text': showPodiumAnimation }]">🏆 1er 🏆</span>
                        <span :class="['text-lg font-bold text-yellow-900 dark:text-yellow-50 truncate w-full podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[0].member.username }}
                        </span>
                        <span :class="['text-xs text-yellow-800 dark:text-yellow-100 mt-1 podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[0].wins }} {{ top3Winners[0].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 3ème place -->
                  <div
                    v-if="top3Winners[2]"
                    class="flex flex-col items-center flex-1 max-w-[120px] podium-third"
                  >
                    <div :class="['medal-container mb-2 podium-text', { 'reveal-text': showPodiumAnimation }]">
                      <span class="medal-emoji">🥉</span>
                    </div>
                    <div :class="['w-18 h-18 rounded-full flex items-center justify-center mb-3 shadow-lg transform hover:scale-110 transition-transform podium-avatar', { 'reveal-avatar': showPodiumAnimation }, getMemberAvatarColor(top3Winners[2].member.id).bg]">
                      <span :class="['text-lg font-bold', getMemberAvatarColor(top3Winners[2].member.id).text]">
                        {{ top3Winners[2].member.username.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div
                      class="w-full bg-gradient-to-b from-amber-300 to-amber-400 dark:from-amber-600 dark:to-amber-700 rounded-t-2xl p-3 text-center shadow-lg podium-base"
                      style="height: 80px;"
                    >
                      <div class="flex flex-col items-center justify-center h-full">
                        <span :class="['text-xs font-bold text-amber-900 dark:text-amber-50 mb-0.5 podium-text', { 'reveal-text': showPodiumAnimation }]">3ème</span>
                        <span :class="['text-sm font-bold text-amber-900 dark:text-amber-50 truncate w-full leading-tight podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[2].member.username }}
                        </span>
                        <span :class="['text-xs text-amber-800 dark:text-amber-100 mt-0.5 podium-text', { 'reveal-text': showPodiumAnimation }]">
                          {{ top3Winners[2].wins }} {{ top3Winners[2].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </UCard>

              <!-- Message si aucun gagnant -->
              <div
                v-else
                class="text-center py-12 text-gray-500 dark:text-gray-400"
              >
                <UIcon
                  name="i-lucide-trophy"
                  class="w-16 h-16 mx-auto mb-4 opacity-50"
                />
                <p>
                  Aucun gagnant pour le moment
                </p>
                <p class="text-sm mt-2">
                  Jouez des parties pour voir le podium !
                </p>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </div>

    <!-- Modal de modification -->
    <AddGameModal
      v-model="isModalOpen"
      :game="jeu"
      @success="handleGameUpdated"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useFamilyStore, type Rating } from '~/stores/family'
import StarRating from '~/components/StarRating.vue'
import GameSessions from '~/components/GameSessions.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const familyStore = useFamilyStore()

const isModalOpen = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const top3Winners = ref<Array<{ member: { id: number, username: string }, wins: number }>>([])
const activeTab = ref('0')
const showPodiumAnimation = ref(false)

// Définir les onglets avec des slots personnalisés
const tabs = [
  {
    label: 'Détail',
    icon: 'i-lucide-info',
    slot: 'detail'
  },
  {
    label: 'Notes',
    icon: 'i-lucide-star',
    slot: 'notes'
  },
  {
    label: 'Parties',
    icon: 'i-lucide-gamepad-2',
    slot: 'parties'
  },
  {
    label: '',
    icon: 'i-lucide-trophy',
    slot: 'podium'
  }
]

// Récupérer l'ID depuis la route
const gameId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id, 10) : null
})

// Trouver le jeu dans le store
const jeu = computed(() => {
  if (!gameId.value) return null
  return familyStore.transformedGames.find(g => g.id === gameId.value)
})

// Récupérer les membres de la famille
const familyMembers = computed(() => familyStore.familyMembers)

// Charger les top 3 gagnants
const loadTop3Winners = async () => {
  if (!gameId.value) return

  const result = await familyStore.getTop3Winners(gameId.value)
  if (result.success && result.data) {
    top3Winners.value = result.data
  } else {
    top3Winners.value = []
  }
}

// Charger la famille au montage
onMounted(async () => {
  try {
    loading.value = true
    await familyStore.fetchFamily()

    if (!jeu.value) {
      error.value = 'Jeu non trouvé'
    } else {
      await loadTop3Winners()
    }
  } catch (err) {
    console.error('Erreur lors du chargement du jeu:', err)
    error.value = 'Erreur lors du chargement du jeu'
  } finally {
    loading.value = false
  }
})

// Recharger les top 3 gagnants quand le jeu change
watch(gameId, () => {
  if (gameId.value) {
    loadTop3Winners()
  }
})

// Ouvrir le modal de modification
const openEditModal = () => {
  isModalOpen.value = true
}

// Gérer la mise à jour du jeu
const handleGameUpdated = async () => {
  await familyStore.fetchFamily()
  await loadTop3Winners()
  isModalOpen.value = false
}

// Récupérer la note d'un membre
const getMemberRating = (memberId: number): number => {
  if (!jeu.value?.ratings) return 0
  const memberRating = jeu.value.ratings.find((r: Rating) => r.member.id === memberId)
  return memberRating ? memberRating.rating : 0
}

// Définir la note d'un membre
const setMemberRating = async (memberId: number, rating: number) => {
  if (!gameId.value) return

  try {
    const result = await familyStore.setRating(gameId.value, memberId, rating)

    if (!result.success) {
      console.error('Erreur lors de l\'enregistrement de la note:', result.error)
      error.value = result.error || 'Erreur lors de l\'enregistrement de la note'
    }
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement de la note:', err)
    error.value = 'Erreur lors de l\'enregistrement de la note'
  }
}

// Calculer la note moyenne
const averageRating = computed(() => {
  if (!jeu.value?.ratings || jeu.value.ratings.length === 0) return 0

  const ratings = jeu.value.ratings.filter((r: Rating) => r.rating > 0)
  if (ratings.length === 0) return 0

  const sum = ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0)
  return sum / ratings.length
})

// Obtenir les classes de couleur pour l'avatar d'un membre
const getMemberAvatarColor = (memberId: number) => {
  const colors = [
    { bg: 'bg-primary-100 dark:bg-primary-900', text: 'text-primary-600 dark:text-primary-400' },
    { bg: 'bg-info-100 dark:bg-info-900', text: 'text-info-600 dark:text-info-400' },
    { bg: 'bg-success-100 dark:bg-success-900', text: 'text-success-600 dark:text-success-400' },
    { bg: 'bg-warning-100 dark:bg-warning-900', text: 'text-warning-600 dark:text-warning-400' },
    { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-400' },
    { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-600 dark:text-pink-400' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-600 dark:text-indigo-400' }
  ]
  const colorIndex = memberId % colors.length
  return colors[colorIndex]
}

// Watcher pour détecter quand on arrive sur l'onglet podium
watch(activeTab, (newTab) => {
  console.log('Active tab changed to:', newTab, 'type:', typeof newTab, 'top3Winners length:', top3Winners.value.length)
  // L'onglet podium est à l'index 3 - convertir en nombre pour être sûr
  const tabIndex = Number(newTab)
  const isPodiumTab = tabIndex === 3
  const hasWinners = top3Winners.value && top3Winners.value.length > 0
  console.log('tabIndex:', tabIndex, 'isPodiumTab:', isPodiumTab, 'hasWinners:', hasWinners)

  if (isPodiumTab && hasWinners) {
    console.log('Podium tab activated, starting animation')
    // Réinitialiser l'animation d'abord pour pouvoir la relancer
    showPodiumAnimation.value = false
    console.log('showPodiumAnimation reset to false')
    // Attendre que le DOM soit prêt, puis déclencher l'animation
    nextTick(() => {
      // Petit délai pour s'assurer que les éléments sont bien cachés
      setTimeout(() => {
        console.log('Starting podium reveal animation')
        showPodiumAnimation.value = true
        console.log('showPodiumAnimation set to:', showPodiumAnimation.value)
      }, 300)
    })
  } else {
    console.log('Not podium tab or no winners, resetting animation')
    // Réinitialiser quand on quitte l'onglet podium
    showPodiumAnimation.value = false
  }
}, { immediate: true })
</script>

<style scoped>
/* Supprimer le padding en bas de la card podium */
.podium-card :deep([data-slot="body"]) {
  padding-bottom: 0 !important;
}

.podium-card :deep(> div) {
  padding-bottom: 0 !important;
}

.podium-card > div {
  padding-bottom: 0 !important;
}

/* Animation progressive de révélation des noms */
.podium-text {
  /* État par défaut : texte caché */
  opacity: 0;
  transform: translateY(20px);
}

/* Animation progressive de révélation des avatars */
.podium-avatar {
  /* État par défaut : avatar caché */
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* Animation de révélation du texte */
.podium-text.reveal-text {
  animation-fill-mode: forwards;
}

/* 3ème place - texte et avatar apparaissent en premier */
.podium-third .podium-text.reveal-text,
.podium-third .podium-avatar.reveal-avatar {
  animation: revealText 2.5s ease-out forwards;
  animation-delay: 0s;
}

/* 2ème place - texte et avatar apparaissent ensuite */
.podium-second .podium-text.reveal-text,
.podium-second .podium-avatar.reveal-avatar {
  animation: revealText 2.5s ease-out forwards;
  animation-delay: 1.5s;
}

/* 1ère place - texte et avatar apparaissent en dernier */
.podium-first .podium-text.reveal-text,
.podium-first .podium-avatar.reveal-avatar {
  animation: revealText 2.5s ease-out forwards;
  animation-delay: 3s;
}

/* Animation de révélation du texte et avatar - simple et lente */
@keyframes revealText {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Effet de brillance pour le podium doré */
.podium-gold {
  position: relative;
  overflow: hidden;
}

.podium-gold::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Glow doré pour l'avatar du 1er */
.glow-gold {
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.4);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.6);
  }
}

/* Base du podium avec ombre animée */
.podium-base {
  position: relative;
  transition: transform 0.3s ease;
}

.podium-base:hover {
  transform: translateY(-5px);
}

/* Container pour la couronne */
.crown-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Étoiles animées autour de la couronne */
.stars {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  font-size: 1rem;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: -10px;
  left: -15px;
  animation-delay: 0s;
}

.star-2 {
  top: -10px;
  right: -15px;
  animation-delay: 0.5s;
}

.star-3 {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 1s;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Container pour les médailles */
.medal-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal-emoji {
  font-size: 2rem;
  display: inline-block;
}

/* Container des confettis */
.confetti-container {
  opacity: 0;
  pointer-events: none;
}

.confetti-container.show-confetti {
  animation: fadeInConfetti 0.5s ease-in 2.4s forwards;
}

@keyframes fadeInConfetti {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Confettis animés */
.confetti {
  position: absolute;
  font-size: 1.5rem;
  pointer-events: none;
  opacity: 0;
}

.confetti-container.show-confetti .confetti {
  opacity: 1;
  animation: confetti-fall 4s ease-in infinite;
}

.confetti-1 {
  left: 10%;
  animation-delay: 0s;
}

.confetti-2 {
  left: 30%;
  animation-delay: 0.5s;
}

.confetti-3 {
  left: 50%;
  animation-delay: 1s;
}

.confetti-4 {
  left: 70%;
  animation-delay: 1.5s;
}

.confetti-5 {
  left: 90%;
  animation-delay: 2s;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translateY(-100px) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(400px) rotate(720deg);
  }
}
</style>
