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
          @click="navigateTo('/livres/')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Livre non trouvé -->
      <div
        v-else-if="!loading && !book"
        class="flex flex-col items-center justify-center py-12"
      >
        <UIcon
          name="i-lucide-alert-circle"
          class="w-16 h-16 text-gray-400 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Livre non trouvé
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Le livre que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
          ID recherché : {{ bookIdentifier }}
        </p>
        <UButton
          color="primary"
          @click="navigateTo('/livres/')"
        >
          Retour à la collection
        </UButton>
      </div>

      <!-- Détails du livre -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Titre -->
        <h1 class="text-2xl font-bold wrap-break-word min-w-0 mb-4">
          {{ book.titre }}
        </h1>

        <!-- Navigation par onglets -->
        <UTabs
          v-model="activeTab"
          :items="tabs"
          variant="link"
          class="w-full"
        >
          <template #detail>
            <div class="space-y-6 py-6">
              <UCard class="bg-white dark:bg-gray-800">
                <template #header>
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">Détails</span>
                  </div>
                </template>
                <div class="flex flex-col gap-4">
                  <div class="w-full h-64 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      v-if="book && book.image"
                      :src="book.image"
                      :alt="book.titre || 'Image du livre'"
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

                  <!-- Informations principales -->
                  <div class="space-y-3">
                    <div
                      v-if="book.auteur"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        name="i-lucide-user"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">Auteur :</span>
                      <span>{{ book.auteur }}</span>
                    </div>

                    <div
                      v-if="book.annee"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        name="i-lucide-calendar"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">Année :</span>
                      <span>{{ book.annee }}</span>
                    </div>

                    <div
                      v-if="book.isbn"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        name="i-lucide-hash"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">ISBN :</span>
                      <span>{{ book.isbn }}</span>
                    </div>

                    <div
                      v-if="book.editeur"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        name="i-lucide-building"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">Éditeur :</span>
                      <span>{{ book.editeur }}</span>
                    </div>

                    <div
                      v-if="book.nombre_pages"
                      class="flex items-center gap-2"
                    >
                      <UIcon
                        name="i-lucide-file-text"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">Nombre de pages :</span>
                      <span>{{ book.nombre_pages }}</span>
                    </div>
                  </div>

                  <!-- Description -->
                  <div
                    v-if="book.description"
                    class="mt-4"
                  >
                    <h3 class="font-semibold mb-2">
                      Description
                    </h3>
                    <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {{ book.description }}
                    </p>
                  </div>

                  <!-- Sujets/Catégories -->
                  <div
                    v-if="book.sujets && Array.isArray(book.sujets) && book.sujets.length > 0"
                    class="mt-4"
                  >
                    <h3 class="font-semibold mb-2">
                      Catégories
                    </h3>
                    <div class="flex flex-wrap gap-2">
                      <UBadge
                        v-for="(subject, index) in book.sujets.slice(0, 10)"
                        :key="index"
                        color="primary"
                        variant="outline"
                        size="xs"
                      >
                        {{ subject }}
                      </UBadge>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </template>

          <template #lectures>
            <div
              :key="'section-lectures-' + readingsList.length"
              class="space-y-4 py-6"
            >
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold">
                  {{ memberStore.isMemberConnected ? 'Ma lecture' : 'Lectures des membres' }}
                </h2>
                <UButton
                  color="primary"
                  icon="i-lucide-plus"
                  @click="openReadingModal()"
                >
                  Ajouter ma lecture
                </UButton>
              </div>
              <p class="text-sm text-gray-500">
                Nombre de lectures : {{ readingsList.length }}
              </p>
              <div>
                <div
                  v-if="readingsList.length === 0"
                  class="text-center py-12 text-gray-500 dark:text-gray-400"
                >
                  <UIcon
                    name="i-lucide-book-open"
                    class="w-16 h-16 mx-auto mb-4 opacity-50"
                  />
                  <p>Aucune lecture enregistrée</p>
                  <p class="text-sm mt-2">
                    Ajoutez votre première lecture pour commencer à suivre votre progression !
                  </p>
                </div>
                <div
                  v-else
                  class="space-y-4"
                >
                  <UCard
                    v-for="(reading, index) in readingsList"
                    :key="'reading-' + index"
                    class="bg-white dark:bg-gray-800"
                  >
                    <div class="flex items-start justify-between p-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-3">
                          <div class="w-8 h-8 rounded-full bg-primary-500 text-white font-semibold text-sm flex items-center justify-center">
                            {{ readingMemberName(reading).charAt(0).toUpperCase() }}
                          </div>
                          <span class="font-semibold text-lg">{{ readingMemberName(reading) }}</span>
                        </div>

                        <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div
                            v-if="readingDate(reading, 'date_debut')"
                            class="flex items-center gap-1"
                          >
                            <UIcon
                              name="i-lucide-calendar"
                              class="w-4 h-4"
                            />
                            <span class="font-medium">Début :</span>
                            {{ formatDate(readingDate(reading, 'date_debut')) }}
                          </div>
                          <div
                            v-if="readingDate(reading, 'date_fin')"
                            class="flex items-center gap-1"
                          >
                            <UIcon
                              name="i-lucide-calendar-check"
                              class="w-4 h-4"
                            />
                            <span class="font-medium">Fin :</span>
                            {{ formatDate(readingDate(reading, 'date_fin')) }}
                          </div>
                          <div
                            v-if="readingNote(reading) != null"
                            class="flex items-center gap-1"
                          >
                            <UIcon
                              name="i-lucide-star"
                              class="w-4 h-4 text-yellow-500"
                            />
                            <span class="font-medium">Note :</span>
                            <span class="font-bold text-yellow-600 dark:text-yellow-400">{{ readingNote(reading) }}/10</span>
                          </div>
                        </div>

                        <!-- Statut de lecture -->
                        <div class="mt-3">
                          <UBadge
                            v-if="readingDate(reading, 'date_fin')"
                            color="success"
                            variant="subtle"
                          >
                            <UIcon
                              name="i-lucide-check-circle"
                              class="w-3 h-3 mr-1"
                            />
                            Terminé
                          </UBadge>
                          <UBadge
                            v-else-if="readingDate(reading, 'date_debut')"
                            color="warning"
                            variant="subtle"
                          >
                            <UIcon
                              name="i-lucide-clock"
                              class="w-3 h-3 mr-1"
                            />
                            En cours
                          </UBadge>
                          <UBadge
                            v-else
                            color="neutral"
                            variant="subtle"
                          >
                            <UIcon
                              name="i-lucide-bookmark"
                              class="w-3 h-3 mr-1"
                            />
                            À lire
                          </UBadge>
                        </div>
                      </div>

                      <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-edit"
                        size="sm"
                        @click="openReadingModal(reading)"
                      />
                    </div>
                  </UCard>
                </div>
              </div>
            </div>
          </template>
        </UTabs>
      </div>
    </div>

    <!-- Modal pour ajouter/modifier une lecture -->
    <BookReadingModal
      v-if="book"
      :model-value="isReadingModalOpen"
      :book-id="book.documentId || book.id"
      :reading="selectedReading"
      @update:model-value="(value) => { isReadingModalOpen = value }"
      @success="handleReadingSuccess"
    />
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useFamilyStore, type TransformedBook, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'
import BookReadingModal from '~/components/BookReadingModal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const bookIdentifier = computed(() => route.params.id as string)

const familyStore = useFamilyStore()
const memberStore = useMemberStore()

const book = ref<TransformedBook | null>(null)
const readings = ref<BookReading[]>([])
/** Normalise chaque lecture pour l'affichage (gère format Strapi avec attributes). */
const readingsList = computed(() => {
  const arr = Array.isArray(readings.value) ? readings.value : []
  return arr.map((r: Record<string, unknown>) => {
    if (r && typeof r === 'object' && 'attributes' in r && r.attributes && typeof r.attributes === 'object') {
      const att = r.attributes as Record<string, unknown>
      return {
        id: r.id ?? att.id,
        member: att.member ?? r.member,
        book: att.book ?? r.book,
        date_debut: att.date_debut ?? r.date_debut,
        date_fin: att.date_fin ?? r.date_fin,
        note: att.note ?? r.note
      }
    }
    return r
  })
})
const loading = ref(true)
const error = ref<string | null>(null)
const isReadingModalOpen = ref(false)
const selectedReading = ref<BookReading | null>(null)

const activeTab = ref('0')
const tabs = [
  { label: 'Détail', icon: 'i-lucide-info', slot: 'detail' },
  { label: 'Lectures', icon: 'i-lucide-book-open', slot: 'lectures' }
]

const loadBook = async () => {
  try {
    loading.value = true
    error.value = null
    book.value = null

    // S'assurer que la famille est chargée
    await familyStore.fetchFamily()

    const books = familyStore.transformedBooks

    if (books.length === 0) {
      error.value = 'Aucun livre dans votre collection'
      return
    }

    // Chercher par documentId d'abord, puis par id en fallback
    const foundBook = books.find((b) => {
      // Essayer de matcher par documentId (exact match)
      if (b.documentId && b.documentId === bookIdentifier.value) {
        return true
      }
      // Essayer de matcher par id (numérique ou string)
      const idAsNumber = parseInt(bookIdentifier.value, 10)
      if (!isNaN(idAsNumber) && b.id === idAsNumber) {
        return true
      }
      if (String(b.id) === bookIdentifier.value) {
        return true
      }
      return false
    })

    if (foundBook) {
      book.value = foundBook
      // Toujours initialiser les lectures depuis le livre (famille) pour avoir des données tout de suite
      const bookReadings = Array.isArray(foundBook.book_readings) ? foundBook.book_readings : []
      if (import.meta.dev) {
        console.debug('[livres] loadBook: livre trouvé', {
          bookId: foundBook.id,
          bookDocumentId: foundBook.documentId,
          bookReadingsFromFamily: bookReadings.length,
          isMemberConnected: memberStore.isMemberConnected
        })
      }
      if (memberStore.isMemberConnected && memberStore.currentMember) {
        const memberId = memberStore.currentMember.id
        readings.value = bookReadings.filter((r) => {
          const rid = r.member?.id
          return rid !== undefined && rid !== null && (Number(rid) === Number(memberId) || rid === memberId)
        })
        await fetchReadingsForLecturesTab()
      } else {
        readings.value = bookReadings
        await fetchReadingsForLecturesTab()
      }
    } else {
      console.warn('Livre non trouvé. Identifiant recherché:', bookIdentifier.value)
      console.warn('Livres disponibles:', books.map(b => ({ id: b.id, documentId: b.documentId, titre: b.titre })))
      error.value = 'Livre non trouvé'
    }
  } catch (err) {
    console.error('Erreur lors du chargement du livre:', err)
    error.value = 'Erreur lors du chargement du livre'
  } finally {
    loading.value = false
  }
}

/** Applique les lectures à afficher à partir du livre (données famille). Utilisé quand aucun membre n'est connecté. */
function applyReadingsFromBook(bookItem: TransformedBook | null) {
  if (!bookItem) {
    readings.value = []
    return
  }
  const list = Array.isArray(bookItem.book_readings) ? bookItem.book_readings : []
  readings.value = list
}

/** Appel déclenché au passage sur l'onglet Lectures : récupère les données et log tout côté front. */
async function fetchReadingsForLecturesTab() {
  if (!book.value) {
    console.log('[livres] onglet Lectures: pas de livre, annulé')
    return
  }
  const bookId = book.value.id
  const bookDocumentId = book.value.documentId
  const isMember = memberStore.isMemberConnected && memberStore.currentMember

  console.log('[livres] onglet Lectures: appel spécial démarré', {
    bookId,
    bookDocumentId,
    titre: book.value.titre,
    isMemberConnected: !!isMember,
    memberId: isMember ? memberStore.currentMember!.id : null
  })

  if (isMember) {
    const memberId = memberStore.currentMember!.id
    console.log('[livres] onglet Lectures: GET /api/book-readings/member/' + memberId)
    const result = await familyStore.fetchMemberBookReadings(memberId)
    console.log('[livres] onglet Lectures: réponse API membre', {
      success: result.success,
      error: result.error ?? null,
      count: Array.isArray(result.data) ? result.data.length : 0,
      data: result.success && result.data ? result.data : null
    })
    const list = result.success && Array.isArray(result.data) ? result.data : []
    const filtered = list.filter((r) => {
      const b = r.book
      if (b == null) return false
      if (typeof b === 'number') return b === bookId || Number(b) === Number(bookId)
      const rid = (b as { id?: number }).id
      const rDocId = (b as { documentId?: string }).documentId
      return rid === bookId || Number(rid) === Number(bookId) || rDocId === bookDocumentId || String(rid) === String(bookId)
    })
    if (filtered.length === 0 && Array.isArray(book.value.book_readings)) {
      const memberIdNum = Number(memberId)
      const fromFamily = book.value.book_readings.filter((r) => {
        const rid = r.member?.id
        return rid != null && (Number(rid) === memberIdNum || rid === memberId)
      })
      console.log('[livres] onglet Lectures: fallback famille (membre)', { fromFamilyCount: fromFamily.length })
      readings.value = [...fromFamily]
    } else {
      readings.value = [...filtered]
    }
  } else {
    console.log('[livres] onglet Lectures: GET /api/book-readings/book/' + bookId)
    const result = await familyStore.fetchBookReadings(bookId)
    console.log('[livres] onglet Lectures: réponse API livre', {
      success: result.success,
      error: result.error ?? null,
      count: Array.isArray(result.data) ? result.data.length : 0,
      data: result.success && result.data ? result.data : null
    })
    const list = result.success && Array.isArray(result.data) ? result.data : []
    if (list.length === 0 && Array.isArray(book.value.book_readings)) {
      console.log('[livres] onglet Lectures: fallback famille (tous)', { count: book.value.book_readings.length })
      readings.value = [...book.value.book_readings]
    } else {
      readings.value = [...list]
    }
  }

  const finalReadings = readings.value
  console.log('[livres] onglet Lectures: données finales récupérées', {
    count: finalReadings.length,
    readings: finalReadings
  })
  if (finalReadings.length > 0) {
    const first = finalReadings[0]
    console.log('[livres] onglet Lectures: structure du 1er élément - clés:', Object.keys(first))
    console.log('[livres] onglet Lectures: 1er élément (JSON):', JSON.stringify(first, null, 2))
    console.log('[livres] onglet Lectures: 1er élément - member:', first?.member, 'type:', typeof first?.member)
    if (first?.member && typeof first.member === 'object') {
      console.log('[livres] onglet Lectures: member clés:', Object.keys(first.member as object))
    }
  }
  await nextTick()
  const current = readings.value
  if (current.length > 0) {
    readings.value = current.slice()
  }
  console.log('[livres] onglet Lectures: après nextTick, readings.length =', readings.value.length)
}

/** Appel séparé : récupère les lectures du membre connecté pour le livre courant. */
async function loadMemberReadingsForBook() {
  if (!book.value || !memberStore.isMemberConnected || !memberStore.currentMember) {
    if (import.meta.dev) {
      console.debug('[livres] loadMemberReadingsForBook: annulé (pas de livre ou membre)', {
        hasBook: !!book.value,
        isMemberConnected: memberStore.isMemberConnected,
        hasCurrentMember: !!memberStore.currentMember
      })
    }
    readings.value = []
    return
  }
  const memberId = memberStore.currentMember.id
  const result = await familyStore.fetchMemberBookReadings(memberId)
  const list = result.success && Array.isArray(result.data) ? result.data : []
  if (import.meta.dev) {
    console.debug('[livres] loadMemberReadingsForBook: API membre', {
      success: result.success,
      count: list.length,
      bookId: book.value.id,
      bookDocumentId: book.value.documentId
    })
  }
  const bookId = book.value.id
  const bookDocumentId = book.value.documentId
  // Filtrer par livre : book peut être un objet (populé) ou un id numérique
  let filtered = list.filter((r) => {
    const b = r.book
    if (b == null) return false
    if (typeof b === 'number') return b === bookId || Number(b) === Number(bookId)
    const rid = (b as { id?: number }).id
    const rDocId = (b as { documentId?: string }).documentId
    return (
      rid === bookId
      || Number(rid) === Number(bookId)
      || rDocId === bookDocumentId
      || String(rid) === String(bookId)
    )
  })
  // Fallback : si l'API ne renvoie rien, utiliser les book_readings du livre (famille) filtrés par membre
  if (filtered.length === 0 && Array.isArray(book.value.book_readings)) {
    const memberIdNum = Number(memberId)
    filtered = book.value.book_readings.filter((r) => {
      const rid = r.member?.id
      return rid !== undefined && rid !== null && (Number(rid) === memberIdNum || rid === memberId)
    })
    if (import.meta.dev) {
      console.debug('[livres] loadMemberReadingsForBook: fallback famille', {
        bookReadingsCount: book.value.book_readings.length,
        filteredCount: filtered.length
      })
    }
  }
  // Ne pas écraser par un tableau vide si on avait déjà des lectures (ex. depuis la famille)
  if (filtered.length > 0 || readings.value.length === 0) {
    readings.value = filtered
  }
  if (import.meta.dev) {
    console.debug('[livres] loadMemberReadingsForBook: lectures affichées', readings.value.length)
  }
}

const openReadingModal = (reading?: BookReading) => {
  selectedReading.value = reading || null
  isReadingModalOpen.value = true
}

const handleReadingSuccess = async () => {
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    await loadMemberReadingsForBook()
  } else {
    await familyStore.fetchFamily()
    const books = familyStore.transformedBooks
    const currentId = book.value?.documentId ?? book.value?.id
    const updatedBook = books.find(b =>
      b.documentId === currentId || b.id === currentId || String(b.id) === String(currentId)
    )
    if (updatedBook) {
      book.value = updatedBook
      applyReadingsFromBook(updatedBook)
    }
  }
}

const formatDate = (dateString: string) => {
  if (!dateString || typeof dateString !== 'string') return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function readingMemberName(reading: Record<string, unknown>): string {
  const m = reading?.member
  if (m && typeof m === 'object' && 'username' in m && typeof (m as { username: string }).username === 'string') {
    return (m as { username: string }).username
  }
  if (m && typeof m === 'object' && 'attributes' in m) {
    const att = (m as { attributes?: { username?: string } }).attributes
    if (att?.username) return att.username
  }
  return 'Membre'
}

function readingDate (reading: Record<string, unknown>, field: 'date_debut' | 'date_fin'): string {
  const v = reading?.[field]
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'attributes' in reading) {
    const att = (reading.attributes as Record<string, unknown>)?.[field]
    if (typeof att === 'string') return att
  }
  return ''
}

function readingNote(reading: Record<string, unknown>): number | null {
  const v = reading?.note
  if (typeof v === 'number') return v
  if (v !== undefined && v !== null && typeof Number(v) === 'number' && !Number.isNaN(Number(v))) return Number(v)
  if (reading?.attributes && typeof reading.attributes === 'object' && 'note' in (reading.attributes as object)) {
    const n = (reading.attributes as { note?: unknown }).note
    if (typeof n === 'number') return n
    if (n != null) return Number(n)
  }
  return null
}

// Recharger quand l'identifiant du livre change
watch(bookIdentifier, async (newId) => {
  if (newId) {
    book.value = null
    readings.value = []
    error.value = null
    loading.value = true
    await loadBook()
  }
}, { immediate: false })

// Recharger les lectures quand le membre connecté change (connexion/déconnexion)
watch(() => memberStore.currentMember, async () => {
  if (!book.value) return
  if (memberStore.isMemberConnected && memberStore.currentMember) {
    await loadMemberReadingsForBook()
  } else {
    applyReadingsFromBook(book.value)
  }
})

onMounted(async () => {
  await loadBook()
})
</script>
