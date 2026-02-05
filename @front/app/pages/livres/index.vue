<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div>
      <div class="mt-4 sm:mt-6">
        <div class="mb-6 sm:mb-8">
          <div class="mb-4 sm:mb-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 class="text-xl sm:text-2xl font-bold">
                Ma collection de livres
              </h1>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Gérez votre collection de livres ici
              </p>
            </div>
            <UButton
              color="primary"
              icon="i-ion-add"
              size="sm"
              aria-label="Ajouter un livre"
              @click="openAddBookModal()"
            >
              Ajouter un livre
            </UButton>
          </div>
        </div>

        <!-- Loader pendant le chargement -->
        <div
          v-if="loading"
          class="flex flex-col items-center justify-center py-24"
        >
          <UIcon
            name="i-ion-refresh-circle"
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
            name="i-ion-book-open"
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
          <div class="hidden md:block space-y-8">
            <div
              v-for="(group, groupIndex) in groupedBooks"
              :key="'group-desktop-' + groupIndex"
            >
              <!-- Titre de section -->
              <h2
                v-if="group.title"
                class="text-lg font-bold mb-4 flex items-center gap-2"
              >
                <span>{{ group.title }}</span>
                <span class="text-sm font-normal text-gray-500 dark:text-gray-400">({{ group.books.length }})</span>
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UCard
                  v-for="book in group.books"
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

              <div class="flex flex-col gap-2.5">
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
                      name="i-ion-book"
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
                    name="i-ion-person"
                    class="w-3 h-3 inline mr-1"
                  />
                  {{ book.auteur }}
                </div>

                <!-- Propriétaire -->
                <div
                  v-if="book.owner"
                  class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
                >
                  <UIcon
                    name="i-ion-person-circle"
                    class="w-3 h-3"
                  />
                  <span>{{ book.owner.username }}</span>
                </div>

                <!-- Statut (membre connecté : sa lecture ; sinon première lecture) -->
                <div
                  v-if="showMemberReadingTags(book) && getBookStatus(book)"
                  class="flex flex-wrap items-center gap-2"
                >
                  <UBadge
                    :color="getBookStatus(book) === 'Lu' ? 'success' : getBookStatus(book) === 'En cours' ? 'warning' : 'neutral'"
                    variant="subtle"
                    size="xs"
                    :class="getBookStatus(book) === 'Lu' ? 'text-green-800 dark:text-green-200' : getBookStatus(book) === 'En cours' ? 'text-orange-800 dark:text-orange-200' : 'text-gray-800 dark:text-gray-200'"
                  >
                    {{ getBookStatus(book) }}
                  </UBadge>
                </div>

                <!-- Barre de progression (membre connecté) -->
                <div
                  v-if="memberStore.isMemberConnected && getDisplayReading(book) && readingPagesLues(getDisplayReading(book)) != null && book.nombre_pages && book.nombre_pages > 0"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Progression
                    </span>
                    <span class="text-xs font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                      {{ Math.round((readingPagesLues(getDisplayReading(book))! / book.nombre_pages) * 100) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 rounded-full"
                      :style="{ width: `${Math.min((readingPagesLues(getDisplayReading(book))! / book.nombre_pages) * 100, 100)}%` }"
                    />
                  </div>
                </div>

                <!-- Progressions des autres membres (mode famille) -->
                <div
                  v-if="!memberStore.isMemberConnected && getAllBookReadings(book).length > 0"
                  class="space-y-2"
                >
                  <div
                    v-for="reading in getAllBookReadings(book).slice(0, 3)"
                    :key="(reading as BookReading).id || Math.random()"
                  >
                    <div
                      v-if="getReadingMember(reading) && readingPagesLues(reading) != null && book.nombre_pages && book.nombre_pages > 0"
                      class="space-y-0.5"
                    >
                      <div class="flex items-center gap-1.5">
                        <MemberAvatar
                          :member="getReadingMember(reading)!"
                          size="xs"
                        />
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                          {{ getReadingMember(reading)!.username }}
                        </span>
                        <span class="text-xs font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                          {{ Math.round((readingPagesLues(reading)! / book.nombre_pages) * 100) }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 rounded-full"
                          :style="{ width: `${Math.min((readingPagesLues(reading)! / book.nombre_pages) * 100, 100)}%` }"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
              </div>
            </div>
          </div>

          <!-- Vue mobile : liste avec UPageList -->
          <div class="md:hidden space-y-6">
            <div
              v-for="(group, groupIndex) in groupedBooks"
              :key="'group-mobile-' + groupIndex"
            >
              <!-- Titre de section -->
              <h2
                v-if="group.title"
                class="text-base font-bold mb-3 flex items-center gap-2"
              >
                <span>{{ group.title }}</span>
                <span class="text-xs font-normal text-gray-500 dark:text-gray-400">({{ group.books.length }})</span>
              </h2>
              
              <UPageList class="space-y-4">
                <UPageCard
                  v-for="book in group.books"
                  :key="book.id"
                  variant="ghost"
                  class="border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer [&_[data-slot=body]]:w-full"
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
                        name="i-ion-book"
                        class="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col gap-2">
                    <div>
                      <h3 class="text-base font-semibold break-words line-clamp-2 mb-1">
                        {{ book.titre }}
                      </h3>
                      <p
                        v-if="book.auteur"
                        class="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {{ book.auteur }}
                      </p>
                      <!-- Propriétaire -->
                      <p
                        v-if="book.owner"
                        class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2"
                      >
                        <UIcon
                          name="i-ion-person-circle"
                          class="w-3 h-3"
                        />
                        <span>{{ book.owner.username }}</span>
                      </p>
                      <!-- Statut (membre connecté : sa lecture ; sinon première lecture) -->
                      <div
                        v-if="showMemberReadingTags(book) && getBookStatus(book)"
                        class="flex flex-wrap items-center gap-2"
                      >
                        <UBadge
                          :color="getBookStatus(book) === 'Lu' ? 'success' : getBookStatus(book) === 'En cours' ? 'warning' : 'neutral'"
                          variant="subtle"
                          size="xs"
                        >
                          {{ getBookStatus(book) }}
                        </UBadge>
                      </div>
                    </div>

                    <!-- Barre de progression (mobile, membre connecté) -->
                    <div
                      v-if="memberStore.isMemberConnected && getDisplayReading(book) && readingPagesLues(getDisplayReading(book)) != null && book.nombre_pages && book.nombre_pages > 0"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Progression
                        </span>
                        <span class="text-xs font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                          {{ Math.round((readingPagesLues(getDisplayReading(book))! / book.nombre_pages) * 100) }}%
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 rounded-full"
                          :style="{ width: `${Math.min((readingPagesLues(getDisplayReading(book))! / book.nombre_pages) * 100, 100)}%` }"
                        />
                      </div>
                    </div>

                    <!-- Progressions des autres membres (mobile, mode famille) -->
                    <div
                      v-if="!memberStore.isMemberConnected && getAllBookReadings(book).length > 0"
                      class="space-y-2"
                    >
                      <div
                        v-for="reading in getAllBookReadings(book).slice(0, 2)"
                        :key="(reading as BookReading).id || Math.random()"
                      >
                        <div
                          v-if="getReadingMember(reading) && readingPagesLues(reading) != null && book.nombre_pages && book.nombre_pages > 0"
                          class="space-y-0.5"
                        >
                          <div class="flex items-center gap-1.5 mb-0.5">
                            <MemberAvatar
                              :member="getReadingMember(reading)!"
                              size="xs"
                            />
                            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                              {{ getReadingMember(reading)!.username }}
                            </span>
                            <span class="text-xs font-bold text-primary-600 dark:text-primary-400 tabular-nums">
                              {{ Math.round((readingPagesLues(reading)! / book.nombre_pages) * 100) }}%
                            </span>
                          </div>
                          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              class="h-full bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 transition-all duration-500 rounded-full"
                              :style="{ width: `${Math.min((readingPagesLues(reading)! / book.nombre_pages) * 100, 100)}%` }"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UPageCard>
              </UPageList>
            </div>
          </div>
        </template>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFamilyStore, type TransformedBook, type BookReading } from '~/stores/family'
import { useMemberStore, type MemberLike } from '~/stores/member'
import { useAddBookModal } from '~/composables/useAddBookModal'
import StarRating from '~/components/StarRating.vue'
import MemberAvatar from '~/components/MemberAvatar.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const { openModal: openAddBookModal } = useAddBookModal()
const { isLoading: loading } = storeToRefs(familyStore)

/** Livres à afficher : tous les livres de la famille, triés par catégorie */
const books = computed(() => {
  const allBooks = familyStore.transformedBooks
  
  // En mode famille (parent), retourner tous les livres sans tri spécial
  if (!memberStore.isMemberConnected || !memberStore.currentMember) return allBooks
  
  const memberId = memberStore.currentMember.id
  
  // En mode membre, trier tous les livres : 1. En cours, 2. Propriétaire, 3. Autres
  return allBooks.slice().sort((a, b) => {
    const aReading = memberReadingsMap.value.get(String(a.id)) || memberReadingsMap.value.get(a.documentId ?? '')
    const bReading = memberReadingsMap.value.get(String(b.id)) || memberReadingsMap.value.get(b.documentId ?? '')
    
    const aIsOwner = a.owner != null && (Number(a.owner.id) === Number(memberId) || a.owner.id === memberId)
    const bIsOwner = b.owner != null && (Number(b.owner.id) === Number(memberId) || b.owner.id === memberId)
    
    // Vérifier si en cours de lecture (date_debut mais pas date_fin)
    const aInProgress = aReading && readingHasDate(aReading, 'date_debut') && !readingHasDate(aReading, 'date_fin')
    const bInProgress = bReading && readingHasDate(bReading, 'date_debut') && !readingHasDate(bReading, 'date_fin')
    
    // 1. Livres en cours en premier
    if (aInProgress && !bInProgress) return -1
    if (!aInProgress && bInProgress) return 1
    
    // 2. Si ni l'un ni l'autre en cours, propriétaire en premier
    if (!aInProgress && !bInProgress) {
      if (aIsOwner && !bIsOwner) return -1
      if (!aIsOwner && bIsOwner) return 1
    }
    
    // 3. Sinon, garder l'ordre original (par date de création)
    return 0
  })
})

/** Livres groupés par catégorie pour affichage avec titres */
const groupedBooks = computed(() => {
  if (!memberStore.isMemberConnected || !memberStore.currentMember) {
    return [{ title: null, books: books.value }]
  }
  
  const memberId = memberStore.currentMember.id
  const inProgress: TransformedBook[] = []
  const owned: TransformedBook[] = []
  const others: TransformedBook[] = []
  
  for (const book of books.value) {
    const reading = memberReadingsMap.value.get(String(book.id)) || memberReadingsMap.value.get(book.documentId ?? '')
    const isOwner = book.owner != null && (Number(book.owner.id) === Number(memberId) || book.owner.id === memberId)
    const isInProgress = reading && readingHasDate(reading, 'date_debut') && !readingHasDate(reading, 'date_fin')
    
    if (isInProgress) {
      inProgress.push(book)
    } else if (isOwner) {
      owned.push(book)
    } else {
      others.push(book)
    }
  }
  
  const groups: Array<{ title: string | null, books: TransformedBook[], icon?: string }> = []
  
  if (inProgress.length > 0) {
    groups.push({ 
      title: 'Lectures en cours', 
      books: inProgress,
      icon: 'i-ion-book-outline'
    })
  }
  
  if (owned.length > 0) {
    groups.push({ 
      title: 'Mes livres', 
      books: owned,
      icon: 'i-ion-person-circle-outline'
    })
  }
  
  if (others.length > 0) {
    groups.push({ 
      title: 'Autres livres', 
      books: others,
      icon: 'i-ion-library-outline'
    })
  }
  
  return groups
})

/** Map book id / documentId -> lecture du membre connecté (rempli par fetch). */
const memberReadingsMap = ref<Map<string, BookReading | Record<string, unknown>>>(new Map())

/** Map book id / documentId -> lectures de tous les membres (mode famille). */
const allMembersReadingsMap = ref<Map<string, Array<BookReading | Record<string, unknown>>>>(new Map())

async function loadMemberReadings() {
  if (!memberStore.isMemberConnected || !memberStore.currentMember) {
    memberReadingsMap.value = new Map()
    await loadAllMembersReadings()
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

async function loadAllMembersReadings() {
  if (memberStore.isMemberConnected) {
    allMembersReadingsMap.value = new Map()
    return
  }
  const members = familyStore.familyMembers
  if (!members || members.length === 0) {
    allMembersReadingsMap.value = new Map()
    return
  }

  const allReadingsMap = new Map<string, Array<BookReading | Record<string, unknown>>>()

  for (const member of members) {
    const result = await familyStore.fetchMemberBookReadings(member.id)
    const list = result.success && Array.isArray(result.data) ? result.data : []

    for (const r of list) {
      const book = (r as BookReading).book ?? (r as { attributes?: { book?: unknown } }).attributes?.book
      if (!book) continue
      const bookId = typeof book === 'object' && book !== null && 'id' in book ? String((book as { id: number }).id) : null
      const docId = typeof book === 'object' && book !== null && 'documentId' in book ? (book as { documentId: string }).documentId : null

      if (bookId) {
        const existing = allReadingsMap.get(bookId) || []
        existing.push(r)
        allReadingsMap.set(bookId, existing)
      }
      if (docId) {
        const existing = allReadingsMap.get(docId) || []
        existing.push(r)
        allReadingsMap.set(docId, existing)
      }
    }
  }
  allMembersReadingsMap.value = allReadingsMap
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

/** Extrait pages_lues d'une lecture (gère les structures Strapi). */
function readingPagesLues(reading: BookReading | Record<string, unknown> | null): number | null {
  if (!reading || typeof reading !== 'object') return null
  const r = reading as Record<string, unknown>
  const pagesLues = r.pages_lues ?? (r.attributes as Record<string, unknown> | undefined)?.pages_lues
  if (typeof pagesLues === 'number') return pagesLues
  if (pagesLues != null) return Number(pagesLues)
  return null
}

/** Récupère toutes les lectures d'un livre pour tous les membres (mode famille). */
function getAllBookReadings(book: TransformedBook): Array<BookReading | Record<string, unknown>> {
  if (!memberStore.isMemberConnected) {
    const bookId = String(book.id)
    const docId = book.documentId || ''
    const fromMap = allMembersReadingsMap.value.get(bookId) || allMembersReadingsMap.value.get(docId) || []
    if (fromMap.length === 0) {
      return Array.isArray(book.book_readings) ? book.book_readings : []
    }
    return fromMap
  }
  return []
}

/** Récupère le membre associé à une lecture (gère les structures Strapi). */
function getReadingMember(reading: BookReading | Record<string, unknown>): MemberLike | null {
  if (!reading || typeof reading !== 'object') return null
  const r = reading as Record<string, unknown>

  let member = (r as BookReading).member
  if (!member && r.attributes && typeof r.attributes === 'object') {
    const attrs = r.attributes as Record<string, unknown>
    if (attrs.member && typeof attrs.member === 'object') {
      member = attrs.member as MemberLike
    }
  }

  if (!member || typeof member !== 'object') return null

  if (member.data && typeof member.data === 'object') {
    const data = member.data as Record<string, unknown>
    const id = data.id as number
    const attrs = data.attributes as Record<string, unknown>
    if (attrs && typeof attrs === 'object') {
      return {
        id,
        username: attrs.username as string,
        icon: attrs.icon as string | undefined,
        avatar_url: attrs.avatar_url as string | undefined
      }
    }
  }

  if ('id' in member && 'username' in member) {
    return member as MemberLike
  }

  return null
}

onMounted(async () => {
  await familyStore.fetchFamily()
  await loadMemberReadings()
})

watch(() => [memberStore.isMemberConnected, memberStore.currentMember?.id], () => {
  loadMemberReadings()
})

watch(() => familyStore.familyMembers, () => {
  if (!memberStore.isMemberConnected) {
    loadAllMembersReadings()
  }
}, { deep: true })
</script>
