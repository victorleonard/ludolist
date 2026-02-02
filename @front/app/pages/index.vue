<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <!-- Loader pendant le chargement initial -->
    <div
      v-if="pageLoading"
      class="flex flex-col items-center justify-center min-h-[50vh] gap-4"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="w-12 h-12 text-primary-500 animate-spin"
      />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Chargement…
      </p>
    </div>

    <div v-else>
      <div class="mt-4 sm:mt-6">
        <!-- Dernières parties : carousel horizontal, cartes carrées, image en fond + infos en overlay -->
        <div
          v-if="latestSessions && latestSessions.length > 0"
          class="mb-6 sm:mb-8"
        >
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Dernières parties
          </h2>
          <!-- Sur mobile : pas de marge négative à gauche pour garder l'espace du container ; spacer pour décaler la 1ère carte -->
          <div class="flex flex-nowrap justify-start gap-4 overflow-x-auto pb-2 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div
              class="shrink-0 w-5 sm:w-6"
              aria-hidden="true"
              style="min-width: 20px;"
            />
            <button
              v-for="session in latestSessions"
              :key="session.id"
              type="button"
              class="relative shrink-0 w-[min(180px,45vw)] aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              @click="navigateTo(`/game/${session.game.id}`)"
            >
              <!-- Fond : image du jeu -->
              <img
                v-if="getSessionGameImage(session)"
                :src="getSessionGameImage(session) ?? ''"
                :alt="session.game.name"
                class="absolute inset-0 w-full h-full object-cover"
              >
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600"
              >
                <UIcon
                  name="i-lucide-dice-6"
                  class="w-12 h-12 text-gray-500 dark:text-gray-400"
                />
              </div>
              <!-- Overlay gradient pour lisibilité du texte -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <!-- Infos par-dessus, calé à gauche -->
              <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-3 text-white">
                <h3 class="font-bold text-sm line-clamp-2 drop-shadow-md w-full">
                  {{ session.game.name }}
                </h3>
                <p class="text-xs opacity-90 mt-1 flex items-center gap-1">
                  <UIcon
                    name="i-lucide-calendar"
                    class="w-3 h-3 shrink-0"
                  />
                  {{ formatDateShort(session.played_at) }}
                </p>
                <p
                  v-if="getSessionWinner(session)"
                  class="text-xs mt-1 flex items-center gap-1 font-semibold text-amber-300"
                >
                  <UIcon
                    name="i-lucide-crown"
                    class="w-3 h-3 shrink-0"
                  />
                  {{ getSessionWinner(session)?.member.username }}
                  <span
                    v-if="getSessionWinner(session)?.score !== undefined"
                    class="font-normal opacity-90"
                  >
                    ({{ getSessionWinner(session)?.score }} pts)
                  </span>
                </p>
              </div>
            </button>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12"
        >
          <UIcon
            name="i-lucide-dice-6"
            class="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4"
          />
          <p class="text-gray-500 dark:text-gray-400 text-center">
            Aucun jeu joué récemment
          </p>
        </div>

        <!-- Lectures en cours : carousel horizontal -->
        <div
          v-if="readingsInProgress.length > 0"
          class="mb-6 sm:mb-8"
        >
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Lectures en cours
          </h2>
          <div class="flex flex-nowrap justify-start gap-4 overflow-x-auto pb-2 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div
              class="shrink-0 w-5 sm:w-6"
              aria-hidden="true"
              style="min-width: 20px;"
            />
            <button
              v-for="item in readingsInProgress"
              :key="item.reading.id + '-' + item.book.id"
              type="button"
              class="relative shrink-0 w-[min(180px,45vw)] aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              @click="navigateTo(`/livres/${item.book.documentId || item.book.id}`)"
            >
              <img
                v-if="item.book.image"
                :src="item.book.image"
                :alt="item.book.titre"
                class="absolute inset-0 w-full h-full object-cover"
              >
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="w-12 h-12 text-gray-500 dark:text-gray-400"
                />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-3 text-white">
                <h3 class="font-bold text-sm line-clamp-2 drop-shadow-md w-full">
                  {{ item.book.titre }}
                </h3>
                <div class="mt-1 flex items-center gap-2">
                  <MemberAvatar
                    :member="{ id: item.reading.member?.id, username: item.reading.member?.username ?? 'Membre' }"
                    size="xs"
                  />
                  <p
                    v-if="getReadingDebutLabel(item.reading)"
                    class="text-xs opacity-90 flex items-center gap-1"
                  >
                    <UIcon
                      name="i-lucide-calendar"
                      class="w-3 h-3 shrink-0"
                    />
                    Depuis {{ getReadingDebutLabel(item.reading) }}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Derniers plats ajoutés : carousel horizontal -->
        <div
          v-if="latestDishes.length > 0"
          class="mb-6 sm:mb-8"
        >
          <h2 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
            Derniers plats ajoutés
          </h2>
          <div class="flex flex-nowrap justify-start gap-4 overflow-x-auto pb-2 ml-0 -mr-4 pl-4 pr-4 sm:-mx-6 sm:pl-6 sm:pr-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div
              class="shrink-0 w-5 sm:w-6"
              aria-hidden="true"
              style="min-width: 20px;"
            />
            <button
              v-for="dish in latestDishes"
              :key="dish.id"
              type="button"
              class="relative shrink-0 w-[min(180px,45vw)] aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 snap-start cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              @click="navigateTo(`/plat/${dish.documentId || dish.id}`)"
            >
              <img
                v-if="dish.image"
                :src="dish.image"
                :alt="dish.name"
                class="absolute inset-0 w-full h-full object-cover"
              >
              <div
                v-else
                class="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-600"
              >
                <UIcon
                  name="i-lucide-chef-hat"
                  class="w-12 h-12 text-gray-500 dark:text-gray-400"
                />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div class="absolute inset-0 flex flex-col justify-end items-start text-left p-3 text-white">
                <h3 class="font-bold text-sm line-clamp-2 drop-shadow-md w-full">
                  {{ dish.name }}
                </h3>
                <div
                  v-if="getDishAverageRating(dish) > 0"
                  class="mt-1 flex items-center gap-1"
                >
                  <UIcon
                    name="i-lucide-star"
                    class="w-3 h-3 shrink-0 text-amber-300 fill-amber-300"
                  />
                  <span class="text-xs opacity-90">
                    {{ getDishAverageRating(dish).toFixed(1) }} / 10
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div
          v-else-if="!pageLoading && familyStore.transformedDishes.length === 0"
          class="flex flex-col items-center justify-center py-8"
        >
          <UIcon
            name="i-lucide-chef-hat"
            class="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2"
          />
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            Aucun plat pour l'instant
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore, type GameSession, type BookReading, type TransformedDish, type DishRating } from '~/stores/family'
import { useMemberStore } from '~/stores/member'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const { currentMember, isMemberConnected } = storeToRefs(memberStore)

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

function isReadingInProgress(r: Record<string, unknown>): boolean {
  const debut = r.date_debut ?? (r.attributes as Record<string, unknown> | undefined)?.date_debut
  const fin = r.date_fin ?? (r.attributes as Record<string, unknown> | undefined)?.date_fin
  if (!debut || (typeof debut !== 'string' && typeof debut !== 'number')) return false
  if (fin !== undefined && fin !== null && String(fin).trim() !== '') return false
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
    const result = await familyStore.fetchBookReadings(book.id)
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
