<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl sm:pb-6">
    <ClientOnly>
      <!-- Loader pendant le chargement initial -->
      <div
        v-if="pageLoading"
        class="flex flex-col items-center justify-center min-h-[50vh] gap-4"
      >
        <UIcon
          name="i-ion-refresh-circle"
          class="w-12 h-12 text-primary-500 animate-spin"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Chargement…
        </p>
      </div>

      <div v-else>
        <div class="mt-4 sm:mt-6 pb-0">
        <!-- Dernières parties : carousel horizontal, cartes carrées, image en fond + infos en overlay -->
        <div
          v-if="latestSessions && latestSessions.length > 0"
          class="mb-4 sm:mb-10"
        >
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dernières parties
            </h2>
            <NuxtLink
              to="/jeux"
              class="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <UIcon
                name="i-ion-chevron-forward"
                class="w-4 h-4"
              />
            </NuxtLink>
          </div>
          <!-- Sur mobile : pas de marge négative à gauche pour garder l'espace du container ; spacer pour décaler la 1ère carte -->
          <div class="relative">
            <div class="flex flex-nowrap justify-start gap-4 sm:gap-5 overflow-x-auto pb-3 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-proximity scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full">
              <div
                class="shrink-0 w-5 sm:w-6"
                style="min-width: 20px;"
              />
              <button
                v-for="session in latestSessions"
                :key="session.id"
                type="button"
                class="group relative shrink-0 w-[min(200px,48vw)] sm:w-[220px] aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md hover:shadow-xl"
                @click="navigateTo(`/game/${session.game.documentId || session.game.id}`)"
              >
                <!-- Fond : image du jeu -->
                <img
                  v-if="getSessionGameImage(session)"
                  :src="getSessionGameImage(session) ?? ''"
                  :alt="session.game.name"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                >
                <div
                  v-else
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-gray-300 dark:from-primary-600/30 dark:via-primary-500/20 dark:to-gray-600"
                >
                  <UIcon
                    name="i-ion-dice"
                    class="w-16 h-16 sm:w-20 sm:h-20 text-primary-500 dark:text-primary-400 opacity-60"
                  />
                </div>
                <!-- Overlay gradient amélioré pour meilleure lisibilité -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <!-- Infos par-dessus, calé à gauche -->
                <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-4 sm:p-5 text-white">
                  <h3 class="font-bold text-base sm:text-lg line-clamp-2 drop-shadow-lg w-full mb-2">
                    {{ session.game.name }}
                  </h3>
                  <div class="flex flex-col gap-1.5 w-full">
                    <p class="text-xs sm:text-sm opacity-95 flex items-center gap-1.5 font-medium">
                      <UIcon
                        name="i-ion-calendar"
                        class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                      />
                      {{ formatDateShort(session.played_at) }}
                    </p>
                    <p
                      v-if="getSessionWinner(session)"
                      class="text-xs sm:text-sm flex items-center gap-1.5 font-semibold text-amber-300 drop-shadow-md"
                    >
                      <UIcon
                        name="i-ion-trophy"
                        class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                      />
                      <span class="truncate">{{ getSessionWinner(session)?.member.username }}</span>
                      <span
                        v-if="getSessionWinner(session)?.score !== undefined"
                        class="font-normal opacity-95 whitespace-nowrap"
                      >
                        ({{ getSessionWinner(session)?.score }} pts)
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-16 sm:py-20"
        >
          <div class="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
            <UIcon
              name="i-ion-dice"
              class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucune partie récente
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Commencez à jouer pour voir vos parties ici
          </p>
          <NuxtLink
            to="/jeux"
            class="mt-4 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Voir mes jeux
          </NuxtLink>
        </div>

        <!-- Lectures en cours : carousel horizontal -->
        <div
          v-if="readingsInProgress.length > 0"
          class="mb-4 sm:mb-10"
        >
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Lectures en cours
            </h2>
            <NuxtLink
              to="/livres"
              class="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <UIcon
                name="i-ion-chevron-forward"
                class="w-4 h-4"
              />
            </NuxtLink>
          </div>
          <div class="relative">
            <div class="flex flex-nowrap justify-start gap-4 sm:gap-5 overflow-x-auto pb-3 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-proximity scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full">
              <div
                class="shrink-0 w-5 sm:w-6"
                style="min-width: 20px;"
              />
              <button
                v-for="item in readingsInProgress"
                :key="item.reading.id + '-' + item.book.id"
                type="button"
                class="group relative shrink-0 w-[min(200px,48vw)] sm:w-[220px] aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md hover:shadow-xl"
                @click="navigateTo(`/livres/${item.book.documentId || item.book.id}`)"
              >
                <img
                  v-if="item.book.image"
                  :src="item.book.image"
                  :alt="item.book.titre"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                >
                <div
                  v-else
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-gray-300 dark:from-emerald-600/30 dark:via-emerald-500/20 dark:to-gray-600"
                >
                  <UIcon
                    name="i-ion-book-open"
                    class="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 dark:text-emerald-400 opacity-60"
                  />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-4 sm:p-5 text-white">
                  <h3 class="font-bold text-base sm:text-lg line-clamp-2 drop-shadow-lg w-full mb-2">
                    {{ item.book.titre }}
                  </h3>
                  <div class="flex items-center gap-2.5 w-full">
                    <MemberAvatar
                      :member="{ id: item.reading.member?.id, username: item.reading.member?.username ?? 'Membre' }"
                      size="sm"
                      class="shrink-0"
                    />
                    <p
                      v-if="getReadingDebutLabel(item.reading)"
                      class="text-xs sm:text-sm opacity-95 flex items-center gap-1.5 font-medium flex-1 min-w-0"
                    >
                      <UIcon
                        name="i-ion-calendar"
                        class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
                      />
                      <span class="truncate">Depuis {{ getReadingDebutLabel(item.reading) }}</span>
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Derniers plats ajoutés : carousel horizontal -->
        <div
          v-if="latestDishes.length > 0"
          class="mb-4 sm:mb-10"
        >
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Derniers plats ajoutés
            </h2>
            <NuxtLink
              to="/plats"
              class="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1"
            >
              Voir tout
              <UIcon
                name="i-ion-chevron-forward"
                class="w-4 h-4"
              />
            </NuxtLink>
          </div>
          <div class="relative">
            <div class="flex flex-nowrap justify-start gap-4 sm:gap-5 overflow-x-auto pb-3 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-proximity scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full">
              <div
                class="shrink-0 w-5 sm:w-6"
                style="min-width: 20px;"
              />
              <button
                v-for="dish in latestDishes"
                :key="dish.id"
                type="button"
                class="group relative shrink-0 w-[min(200px,48vw)] sm:w-[220px] aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-md hover:shadow-xl"
                @click="navigateTo(`/plat/${dish.documentId || dish.id}`)"
              >
                <img
                  v-if="dish.image"
                  :src="dish.image"
                  :alt="dish.name"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                >
                <div
                  v-else
                  class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-gray-300 dark:from-amber-600/30 dark:via-amber-500/20 dark:to-gray-600"
                >
                  <UIcon
                    name="i-ion-restaurant"
                    class="w-16 h-16 sm:w-20 sm:h-20 text-amber-500 dark:text-amber-400 opacity-60"
                  />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-4 sm:p-5 text-white">
                  <h3 class="font-bold text-base sm:text-lg line-clamp-2 drop-shadow-lg w-full mb-2">
                    {{ dish.name }}
                  </h3>
                  <div
                    v-if="getDishAverageRating(dish) > 0"
                    class="flex items-center gap-1.5"
                  >
                    <UIcon
                      name="i-ion-star"
                      class="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-amber-300 fill-amber-300"
                    />
                    <span class="text-xs sm:text-sm opacity-95 font-semibold">
                      {{ getDishAverageRating(dish).toFixed(1) }} / 10
                    </span>
                  </div>
                  <div
                    v-else
                    class="text-xs sm:text-sm opacity-75 italic"
                  >
                    Pas encore noté
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="!pageLoading && familyStore.transformedDishes.length === 0"
          class="flex flex-col items-center justify-center py-16 sm:py-20"
        >
          <div class="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
            <UIcon
              name="i-ion-restaurant"
              class="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500"
            />
          </div>
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aucun plat pour l'instant
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
            Ajoutez vos premiers plats pour commencer à les noter
          </p>
          <NuxtLink
            to="/plats"
            class="px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Ajouter un plat
          </NuxtLink>
        </div>
        </div>
      </div>
      <template #fallback>
        <!-- Fallback pour SSR : afficher le loader -->
        <div class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <UIcon
            name="i-ion-refresh-circle"
            class="w-12 h-12 text-primary-500 animate-spin"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Chargement…
          </p>
        </div>
      </template>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore, type GameSession, type BookReading, type TransformedDish, type DishRating } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
  ssr: false // Désactiver le SSR pour éviter les problèmes d'hydratation avec les données asynchrones
})

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const { fetchReadingsForBook } = useBookReadings()
const { currentMember, isMemberConnected } = storeToRefs(memberStore)

// Initialiser pageLoading à true de manière cohérente pour SSR
const pageLoading = ref(true)
const latestSessions = ref<GameSession[]>([])

type BookForDisplay = { id: number, documentId?: string, titre: string, image: string | null }
type ReadingInProgressItem = { book: BookForDisplay, reading: BookReading }

const readingsInProgress = ref<ReadingInProgressItem[]>([])

/** Derniers plats ajoutés (déjà triés par createdAt desc dans le store), limités à 10 */
const latestDishes = computed(() => {
  const dishes = familyStore.transformedDishes
  return dishes.slice(0, 10)
})

function getDishAverageRating(dish: TransformedDish): number {
  if (!dish.ratings || dish.ratings.length === 0) return 0
  const ratings = dish.ratings.filter((r: DishRating) => r.rating > 0)
  if (ratings.length === 0) return 0
  const sum = ratings.reduce((acc: number, r: DishRating) => acc + r.rating, 0)
  return sum / ratings.length
}

function readingAbandonne(r: Record<string, unknown>): boolean {
  const abandonne = r.abandonne ?? (r.attributes as Record<string, unknown> | undefined)?.abandonne
  return Boolean(abandonne)
}

function isReadingInProgress(r: Record<string, unknown>): boolean {
  const debut = r.date_debut ?? (r.attributes as Record<string, unknown> | undefined)?.date_debut
  const fin = r.date_fin ?? (r.attributes as Record<string, unknown> | undefined)?.date_fin
  if (!debut || (typeof debut !== 'string' && typeof debut !== 'number')) return false
  if (fin !== undefined && fin !== null && String(fin).trim() !== '') return false
  if (readingAbandonne(r)) return false
  return true
}

function normalizeBookFromApi(book: Record<string, unknown>): BookForDisplay {
  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'
  let imageUrl: string | null = null
  const imageUrlDirect = book.image_url as string
  if (imageUrlDirect && typeof imageUrlDirect === 'string') {
    imageUrl = imageUrlDirect
  } else {
    const img = book.image as { url?: string, formats?: { medium?: { url?: string } } } | undefined
    if (img && typeof img === 'object' && img.url) {
      imageUrl = img.formats?.medium?.url ? `${apiUrl}${img.formats.medium.url}` : `${apiUrl}${img.url}`
    }
  }
  return {
    id: (book.id as number),
    documentId: book.documentId as string | undefined,
    titre: (book.titre as string) ?? '',
    image: imageUrl
  }
}

/** Mode famille : toutes les lectures en cours de la famille (tous les membres), à partir des livres déjà chargés. */
function buildFromFamilyBooks(): ReadingInProgressItem[] {
  const books = familyStore.transformedBooks
  const list: ReadingInProgressItem[] = []
  for (const book of books) {
    const readings = book.book_readings ?? []
    for (const r of readings) {
      const reading = r as Record<string, unknown>
      if (!isReadingInProgress(reading)) continue
      list.push({
        book: { id: book.id, documentId: book.documentId, titre: book.titre, image: book.image },
        reading: r as unknown as BookReading
      })
    }
  }
  list.sort((a, b) => {
    const da = readingDateDebut(a.reading)
    const db = readingDateDebut(b.reading)
    if (!da) return 1
    if (!db) return -1
    return new Date(db).getTime() - new Date(da).getTime()
  })
  return list
}

/** Mode famille : récupère toutes les lectures en cours via l’API par livre (fallback si book_readings non populés). */
async function fetchAllFamilyReadingsInProgress(): Promise<ReadingInProgressItem[]> {
  const books = familyStore.transformedBooks
  const list: ReadingInProgressItem[] = []
  for (const book of books) {
    const result = await fetchReadingsForBook(book.id)
    const raw = result.success && Array.isArray(result.data) ? result.data : []
    for (const r of raw) {
      const reading = r as Record<string, unknown>
      if (!isReadingInProgress(reading)) continue
      const bookFromApi = reading.book
      if (bookFromApi && typeof bookFromApi === 'object') {
        list.push({
          book: normalizeBookFromApi(bookFromApi as Record<string, unknown>),
          reading: r as unknown as BookReading
        })
      } else {
        list.push({
          book: { id: book.id, documentId: book.documentId, titre: book.titre, image: book.image },
          reading: r as unknown as BookReading
        })
      }
    }
  }
  list.sort((a, b) => {
    const da = readingDateDebut(a.reading)
    const db = readingDateDebut(b.reading)
    if (!da) return 1
    if (!db) return -1
    return new Date(db).getTime() - new Date(da).getTime()
  })
  return list
}

async function loadReadingsInProgress() {
  if (isMemberConnected.value && currentMember.value) {
    const result = await familyStore.fetchMemberBookReadings(currentMember.value.id)
    const raw = result.success && Array.isArray(result.data) ? result.data : []
    const list: ReadingInProgressItem[] = []
    for (const r of raw) {
      const reading = r as Record<string, unknown>
      if (!isReadingInProgress(reading)) continue
      const book = reading.book
      if (!book || typeof book !== 'object') continue
      list.push({
        book: normalizeBookFromApi(book as Record<string, unknown>),
        reading: r as unknown as BookReading
      })
    }
    list.sort((a, b) => {
      const da = readingDateDebut(a.reading)
      const db = readingDateDebut(b.reading)
      if (!da) return 1
      if (!db) return -1
      return new Date(db).getTime() - new Date(da).getTime()
    })
    readingsInProgress.value = list
  } else {
    // Mode famille : afficher toutes les lectures en cours de la famille (tous les membres)
    const fromBooks = buildFromFamilyBooks()
    if (fromBooks.length > 0) {
      readingsInProgress.value = fromBooks
    } else {
      // Fallback : récupérer via l’API par livre si book_readings n’étaient pas populés
      readingsInProgress.value = await fetchAllFamilyReadingsInProgress()
    }
  }
}

function readingDateDebut(reading: BookReading | Record<string, unknown>): string | null {
  if (!reading || typeof reading !== 'object') return null
  const r = reading as Record<string, unknown>
  const v = r.date_debut ?? (r.attributes as Record<string, unknown> | undefined)?.date_debut
  return typeof v === 'string' ? v : null
}

const formatDateDebutShort = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short'
  }).format(date)
}

function getReadingDebutLabel(reading: BookReading | Record<string, unknown>): string {
  const debut = readingDateDebut(reading)
  return debut ? formatDateDebutShort(debut) : ''
}

const loadLatestSessions = async () => {
  const result = await familyStore.getLatest10Sessions()
  if (result.success && result.data) {
    latestSessions.value = result.data
  }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    await familyStore.fetchFamily()
    await loadLatestSessions()
    await loadReadingsInProgress()
  } finally {
    pageLoading.value = false
  }
})

watch(
  () => currentMember.value?.id,
  () => {
    loadReadingsInProgress()
  }
)

const _formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getSessionGameImage = (session: GameSession): string | undefined => {
  const game = session?.game
  if (!game) return undefined

  // Image provenant d'une URL externe (ex. BGG)
  const imageUrl = (game as { image_url?: string | null }).image_url
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    return imageUrl.trim()
  }

  // Image Strapi (objet avec formats)
  const imageData = game.image
  if (!imageData || typeof imageData !== 'object') return undefined

  const config = useRuntimeConfig()
  const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'
  if (imageData.formats?.medium?.url) {
    return `${apiUrl}${imageData.formats.medium.url}`
  }
  if (imageData.formats?.small?.url) {
    return `${apiUrl}${imageData.formats.small.url}`
  }
  if (imageData.formats?.thumbnail?.url) {
    return `${apiUrl}${imageData.formats.thumbnail.url}`
  }
  if (imageData.url) {
    return `${apiUrl}${imageData.url}`
  }
  return undefined
}

const getSessionWinner = (session: GameSession) => {
  if (!session?.player_scores || session.player_scores.length === 0) {
    return null
  }

  const winner = session.player_scores.find(ps => ps.is_winner)
  if (winner) {
    return {
      member: winner.member,
      score: winner.score
    }
  }

  // Si aucun vainqueur marqué, prendre le meilleur score
  const sortedScores = [...session.player_scores].sort((a, b) => b.score - a.score)
  if (sortedScores.length > 0 && sortedScores[0]) {
    return {
      member: sortedScores[0].member,
      score: sortedScores[0].score
    }
  }

  return null
}
</script>
