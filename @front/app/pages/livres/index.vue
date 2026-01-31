<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div>
      <div class="mt-4 sm:mt-6">
        <div class="mb-6 sm:mb-8">
          <div class="mb-4 sm:mb-6">
            <h1 class="text-xl sm:text-2xl font-bold">
              Ma collection de livres
            </h1>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Gérez votre collection de livres ici
            </p>
          </div>
        </div>

        <!-- Loader pendant le chargement -->
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center py-24"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="w-12 h-12 animate-spin text-primary-500 mb-4"
          />
          <p class="text-gray-600 dark:text-gray-400">
            Chargement de votre collection...
          </p>
        </div>

        <!-- État vide -->
        <div
          v-else-if="books.length === 0"
          class="flex flex-col items-center justify-center py-24"
        >
          <UIcon
            name="i-lucide-book-open"
            class="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4"
          />
          <p class="text-lg text-gray-500 dark:text-gray-400 text-center mb-4">
            Votre collection de livres apparaîtra ici
          </p>
          <p class="text-sm text-gray-400 dark:text-gray-500 text-center">
            Cliquez sur le bouton <span class="font-semibold">+</span> en haut pour ajouter votre premier livre
          </p>
        </div>

        <template v-else>
          <!-- Vue desktop : grille avec UCard -->
          <div class="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <UCard
              v-for="book in books"
              :key="book.id"
              class="cursor-pointer hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800"
              @click="navigateTo(`/livres/${book.documentId || book.id}`)"
            >
              <template #header>
                <div class="flex items-start justify-between gap-2">
                  <h2 class="text-lg font-bold break-words min-w-0 flex-1 line-clamp-2">
                    {{ book.titre }}
                  </h2>
                </div>
              </template>

              <div class="flex flex-col gap-3">
                <div class="w-full h-64 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="book.image"
                    :src="book.image"
                    :alt="book.titre"
                    class="w-full h-full object-contain"
                  >
                  <div
                    v-else
                    class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4"
                  >
                    <UIcon
                      name="i-lucide-book"
                      class="w-16 h-16 mb-2"
                    />
                    <span class="text-xs text-center">Aucune image</span>
                  </div>
                </div>

                <div
                  v-if="book.auteur"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  <UIcon
                    name="i-lucide-user"
                    class="w-3 h-3 inline mr-1"
                  />
                  {{ book.auteur }}
                </div>

                <!-- Note, statut et durée (membre connecté : sa lecture ; sinon première lecture) -->
                <div
                  v-if="showMemberReadingTags(book)"
                  class="flex flex-wrap items-center gap-2"
                >
                  <StarRating
                    :model-value="getBookNoteRaw(book)"
                    :max="10"
                    readonly
                    size="sm"
                  />
                  <UBadge
                    v-if="getBookStatus(book)"
                    :color="getBookStatus(book) === 'Lu' ? 'success' : getBookStatus(book) === 'En cours' ? 'warning' : 'neutral'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ getBookStatus(book) }}
                  </UBadge>
                  <UBadge
                    v-if="getBookDurationLabel(book)"
                    color="primary"
                    variant="subtle"
                    size="xs"
                  >
                    <UIcon
                      name="i-lucide-timer"
                      class="w-3 h-3 mr-1"
                    />
                    {{ getBookDurationLabel(book) }}
                  </UBadge>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UBadge
                    v-if="book.annee"
                    color="neutral"
                    variant="subtle"
                  >
                    {{ book.annee }}
                  </UBadge>
                  <UBadge
                    v-if="getBookFirstCategory(book)"
                    color="primary"
                    variant="outline"
                    size="xs"
                  >
                    {{ getBookFirstCategory(book) }}
                  </UBadge>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Vue mobile : liste avec UPageList -->
          <UPageList class="md:hidden space-y-4">
            <UPageCard
              v-for="book in books"
              :key="book.id"
              variant="ghost"
              class="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
              @click="navigateTo(`/livres/${book.documentId || book.id}`)"
            >
              <template #body>
                <div class="flex items-start gap-4 w-full">
                  <div class="w-16 h-24 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      v-if="book.image"
                      :src="book.image"
                      :alt="book.titre"
                      class="w-full h-full object-cover"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-2"
                    >
                      <UIcon
                        name="i-lucide-book"
                        class="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold break-words line-clamp-2 mb-1">
                      {{ book.titre }}
                    </h3>
                    <p
                      v-if="book.auteur"
                      class="text-sm text-gray-600 dark:text-gray-400 mb-2"
                    >
                      {{ book.auteur }}
                    </p>
                    <!-- Note, statut et durée (membre connecté : sa lecture ; sinon première lecture) -->
                    <div
                      v-if="showMemberReadingTags(book)"
                      class="flex flex-wrap items-center gap-2 mb-2"
                    >
                      <StarRating
                        :model-value="getBookNoteRaw(book)"
                        :max="10"
                        readonly
                        size="sm"
                      />
                      <UBadge
                        v-if="getBookStatus(book)"
                        :color="getBookStatus(book) === 'Lu' ? 'success' : getBookStatus(book) === 'En cours' ? 'warning' : 'neutral'"
                        variant="subtle"
                        size="xs"
                      >
                        {{ getBookStatus(book) }}
                      </UBadge>
                      <UBadge
                        v-if="getBookDurationLabel(book)"
                        color="primary"
                        variant="subtle"
                        size="xs"
                      >
                        <UIcon
                          name="i-lucide-timer"
                          class="w-3 h-3 mr-1"
                        />
                        {{ getBookDurationLabel(book) }}
                      </UBadge>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <UBadge
                        v-if="book.annee"
                        color="neutral"
                        variant="subtle"
                        size="xs"
                      >
                        {{ book.annee }}
                      </UBadge>
                      <UBadge
                        v-if="getBookFirstCategory(book)"
                        color="primary"
                        variant="outline"
                        size="xs"
                      >
                        {{ getBookFirstCategory(book) }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </template>
            </UPageCard>
          </UPageList>
        </template>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore, type TransformedBook, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'
import { useAddBookModal } from '~/composables/useAddBookModal'
import StarRating from '~/components/StarRating.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const { isLoading: loading } = storeToRefs(familyStore)

/** Livres à afficher : tous si parent, uniquement ceux ajoutés par le membre si membre connecté. */
const books = computed(() => {
  const allBooks = familyStore.transformedBooks
  if (!memberStore.isMemberConnected || !memberStore.currentMember) return allBooks
  const memberId = memberStore.currentMember.id
  return allBooks.filter(
    (book) =>
      book.added_by != null &&
      (Number(book.added_by.id) === Number(memberId) || book.added_by.id === memberId)
  )
})

/** Map book id / documentId -> lecture du membre connecté (rempli par fetch). */
const memberReadingsMap = ref<Map<string, BookReading | Record<string, unknown>>>(new Map())

async function loadMemberReadings() {
  if (!memberStore.isMemberConnected || !memberStore.currentMember) {
    memberReadingsMap.value = new Map()
    return
  }
  const memberId = memberStore.currentMember.id
  const result = await familyStore.fetchMemberBookReadings(memberId)
  const list = result.success && Array.isArray(result.data) ? result.data : []
  const map = new Map<string, BookReading | Record<string, unknown>>()
  for (const r of list) {
    const book = (r as BookReading).book ?? (r as { attributes?: { book?: unknown } }).attributes?.book
    if (!book) continue
    const bookId = typeof book === 'object' && book !== null && 'id' in book ? String((book as { id: number }).id) : null
    const docId = typeof book === 'object' && book !== null && 'documentId' in book ? (book as { documentId: string }).documentId : null
    if (bookId) map.set(bookId, r)
    if (docId) map.set(docId, r)
  }
  memberReadingsMap.value = map
}

/** Lecture à afficher pour un livre : priorité aux lectures du membre chargées, sinon book_readings. */
function getDisplayReading(book: TransformedBook): BookReading | Record<string, unknown> | null {
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    const fromMap = memberReadingsMap.value.get(String(book.id)) ?? memberReadingsMap.value.get(book.documentId ?? '')
    if (fromMap) return fromMap
  }
  const readings = book.book_readings ?? []
  if (readings.length === 0) return null
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    const memberId = memberStore.currentMember.id
    const mine = readings.find((r: Record<string, unknown>) => {
      const m = (r as BookReading).member ?? (r as { attributes?: { member?: { id?: number } } }).attributes?.member
      const rid = m?.id ?? (m as { id?: number })?.id
      return rid !== undefined && (Number(rid) === Number(memberId) || rid === memberId)
    })
    return (mine ?? null) as BookReading | null
  }
  return (readings[0] ?? null) as BookReading | null
}

function readingNote(reading: BookReading | Record<string, unknown> | null): number | null {
  if (!reading || typeof reading !== 'object') return null
  const r = reading as Record<string, unknown>
  const note = r.note ?? (r.attributes as Record<string, unknown> | undefined)?.note
  if (typeof note === 'number') return note
  if (note != null) return Number(note)
  return null
}

function readingHasDate(reading: BookReading | Record<string, unknown> | null, field: 'date_debut' | 'date_fin'): boolean {
  if (!reading || typeof reading !== 'object') return false
  const r = reading as Record<string, unknown>
  const v = r[field] ?? (r.attributes as Record<string, unknown> | undefined)?.[field]
  return !!v
}

function readingDateValue(reading: BookReading | Record<string, unknown> | null, field: 'date_debut' | 'date_fin'): string {
  if (!reading || typeof reading !== 'object') return ''
  const r = reading as Record<string, unknown>
  const v = r[field] ?? (r.attributes as Record<string, unknown> | undefined)?.[field]
  return typeof v === 'string' ? v : ''
}

/** Durée de lecture en jours (début → fin). Retourne null si début ou fin manquant. */
function readingDurationDays(reading: BookReading | Record<string, unknown> | null): number | null {
  const debut = readingDateValue(reading, 'date_debut')
  const fin = readingDateValue(reading, 'date_fin')
  if (!debut || !fin) return null
  const d1 = new Date(debut).getTime()
  const d2 = new Date(fin).getTime()
  if (Number.isNaN(d1) || Number.isNaN(d2)) return null
  const days = Math.round((d2 - d1) / (24 * 60 * 60 * 1000))
  return days >= 0 ? days : null
}

/** Libellé durée pour la carte livre : "1 jour" ou "X jours", ou null. */
function getBookDurationLabel(book: TransformedBook): string | null {
  const days = readingDurationDays(getDisplayReading(book))
  if (days == null) return null
  return days <= 1 ? '1 jour' : `${days} jours`
}

/** Note sur 10 pour l'affichage (étoiles). */
function getBookNoteRaw(book: TransformedBook): number {
  const note = readingNote(getDisplayReading(book))
  if (note == null) return 0
  return Math.min(10, Math.max(0, Math.round(note)))
}

/** Statut de lecture : Lu, En cours, À lire. Si membre connecté sans lecture, on affiche "À lire". */
function getBookStatus(book: TransformedBook): 'Lu' | 'En cours' | 'À lire' | null {
  const reading = getDisplayReading(book)
  if (memberStore.isMemberConnected) {
    if (!reading) return 'À lire'
  } else if (!reading) return null
  const hasEnd = readingHasDate(reading!, 'date_fin')
  const hasStart = readingHasDate(reading!, 'date_debut')
  if (hasEnd) return 'Lu'
  if (hasStart) return 'En cours'
  return 'À lire'
}

/** True si on doit afficher la ligne note/statut (membre connecté). */
function showMemberReadingTags(book: TransformedBook): boolean {
  return memberStore.isMemberConnected || !!getDisplayReading(book)
}

/** Première catégorie/sujet du livre (API Open Library), si disponible. */
function getBookFirstCategory(book: TransformedBook): string | null {
  const sujets = book.sujets
  if (!sujets || !Array.isArray(sujets) || sujets.length === 0) return null
  const first = sujets[0]
  return typeof first === 'string' ? first : null
}

onMounted(async () => {
  await familyStore.fetchFamily()
  await loadMemberReadings()
})

watch(() => [memberStore.isMemberConnected, memberStore.currentMember?.id], () => {
  loadMemberReadings()
})
</script>
