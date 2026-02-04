<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="py-4 sm:py-6">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <UIcon
          name="i-ion-refresh"
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
          name="i-ion-alert-circle"
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
        class="space-y-4 sm:space-y-6"
      >
        <!-- Titre -->
        <h1 class="text-xl sm:text-2xl font-bold wrap-break-word min-w-0 mb-3 sm:mb-4">
          {{ book.titre }}
        </h1>

        <!-- Navigation par segments -->
        <div class="mb-2 sm:mb-4">
          <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 sm:p-1.5 w-full gap-1">
            <button
              :class="[
                'flex-1 px-3 sm:px-4 py-3 sm:py-2.5 rounded-md text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'detail'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'detail'"
            >
              <div class="flex items-center justify-center gap-2 sm:gap-2">
                <UIcon
                  name="i-ion-information-circle"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span>Détail</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-3 sm:px-4 py-3 sm:py-2.5 rounded-md text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'lectures'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'lectures'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-2 sm:flex-row">
                <UIcon
                  name="i-ion-book"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-sm leading-tight">Lectures</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Contenu des sections -->
        <div class="w-full">
          <!-- Section Détail -->
          <div
            v-show="activeTab === 'detail'"
            class="space-y-6 py-6"
          >
            <UCard class="bg-white dark:bg-gray-800">
              <div class="flex flex-col gap-4 p-4 sm:p-6">
                <div
                  class="w-full h-64 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden relative group"
                  @click.stop
                >
                  <img
                    v-if="book && book.image"
                    :src="book.image"
                    :alt="book.titre || 'Image du livre'"
                    class="w-full h-full object-contain pointer-events-none"
                  >
                  <div
                    v-else
                    class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 pointer-events-none"
                  >
                    <UIcon
                      name="i-ion-book"
                      class="w-16 h-16 mb-2"
                    />
                    <span class="text-xs text-center">Aucune image</span>
                  </div>
                  <UButton
                    color="neutral"
                    variant="solid"
                    size="xs"
                    icon="i-ion-create-outline"
                    class="absolute top-2 right-2 opacity-90 pointer-events-auto"
                    aria-label="Modifier l'image"
                    @click.stop="openCoverModal"
                  >
                    Modifier l'image
                  </UButton>
                </div>

                <!-- Informations principales -->
                <div class="space-y-3">
                  <div
                    v-if="book.auteur"
                    class="flex items-center gap-2"
                  >
                    <UIcon
                      name="i-ion-person"
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
                      name="i-ion-calendar"
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
                      name="i-ion-hash"
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
                      name="i-ion-business"
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
                      name="i-ion-document-text"
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

                <!-- Bouton Modifier en bas -->
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <UButton
                    color="primary"
                    variant="outline"
                    icon="i-ion-create-outline"
                    size="md"
                    class="w-full min-h-[44px] sm:min-h-0"
                    @click="handleEditBook"
                  >
                    Modifier les détails
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Section Lectures -->
          <div
            v-show="activeTab === 'lectures'"
            :key="'section-lectures-' + readingsList.length"
            class="space-y-3 sm:space-y-4 py-2 sm:py-6"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold">
                {{ memberStore.isMemberConnected ? 'Ma lecture' : 'Lectures des membres' }}
              </h2>
              <UButton
                color="primary"
                icon="i-ion-add"
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
                  name="i-ion-book"
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
                        <MemberAvatar
                          :member="readingMemberForAvatar(reading)"
                          size="sm"
                        />
                        <span class="font-semibold text-lg">{{ readingMemberName(reading) }}</span>
                      </div>

                      <div class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div
                          v-if="readingDate(reading, 'date_debut')"
                          class="flex items-center gap-1"
                        >
                          <UIcon
                            name="i-ion-calendar"
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
                            name="i-ion-calendar"
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
                            name="i-ion-star"
                            class="w-4 h-4 text-yellow-500"
                          />
                          <span class="font-medium">Note :</span>
                          <span class="font-bold text-yellow-600 dark:text-yellow-400">{{ readingNote(reading) }}/10</span>
                        </div>
                        <div
                          v-if="readingPagesLues(reading) != null"
                          class="flex items-center gap-1"
                        >
                          <UIcon
                            name="i-ion-document-text"
                            class="w-4 h-4"
                          />
                          <span class="font-medium">Pages lues :</span>
                          <span class="font-bold">{{ readingPagesLues(reading) }}</span>
                          <span
                            v-if="book?.nombre_pages"
                            class="text-gray-500"
                          >
                            / {{ book.nombre_pages }}
                          </span>
                        </div>
                      </div>

                      <!-- Barre de progression des pages lues -->
                      <div
                        v-if="readingPagesLues(reading) != null && book?.nombre_pages && book.nombre_pages > 0"
                        class="mt-3"
                      >
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Progression
                          </span>
                          <span class="text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {{ Math.round((readingPagesLues(reading)! / book.nombre_pages) * 100) }}%
                          </span>
                        </div>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            class="h-full bg-primary-500 dark:bg-primary-400 transition-all duration-300 rounded-full"
                            :style="{ width: `${Math.min((readingPagesLues(reading)! / book.nombre_pages) * 100, 100)}%` }"
                          />
                        </div>
                      </div>

                      <!-- Statut de lecture et durée -->
                      <div class="mt-3 flex flex-wrap items-center gap-2">
                        <UBadge
                          v-if="readingDate(reading, 'date_fin')"
                          color="success"
                          variant="subtle"
                          class="text-green-800 dark:text-green-200"
                        >
                          <UIcon
                            name="i-ion-checkmark-circle"
                            class="w-3 h-3 mr-1"
                          />
                          Terminé
                        </UBadge>
                        <UBadge
                          v-else-if="readingDate(reading, 'date_debut')"
                          color="warning"
                          variant="subtle"
                          class="text-orange-800 dark:text-orange-200"
                        >
                          <UIcon
                            name="i-ion-time"
                            class="w-3 h-3 mr-1"
                          />
                          En cours
                        </UBadge>
                        <UBadge
                          v-else
                          color="neutral"
                          variant="subtle"
                          class="text-gray-800 dark:text-gray-200"
                        >
                          <UIcon
                            name="i-ion-bookmark"
                            class="w-3 h-3 mr-1"
                          />
                          À lire
                        </UBadge>
                        <UBadge
                          v-if="readingDurationLabel(reading)"
                          color="primary"
                          variant="subtle"
                          class="text-primary-800 dark:text-primary-200"
                        >
                          <UIcon
                            name="i-ion-time"
                            class="w-3 h-3 mr-1"
                          />
                          {{ readingDurationLabel(reading) }}
                        </UBadge>
                      </div>
                    </div>

                    <UButton
                      color="neutral"
                      variant="ghost"
                      icon="i-ion-create-outline"
                      size="sm"
                      class="flex-shrink-0"
                      @click="openReadingModal(reading)"
                    />
                  </div>
                </UCard>
              </div>
            </div>
          </div>
        </div>
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

    <!-- Modal propositions de couverture -->
    <UModal
      :open="isCoverModalOpen"
      :ui="{ width: 'max-w-lg' }"
      @update:open="(value) => { isCoverModalOpen = value }"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Choisir une couverture
              </h3>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ion-close"
                size="sm"
                @click="isCoverModalOpen = false"
              />
            </div>
          </template>
          <div class="space-y-4">
            <div
              v-if="loadingCovers"
              class="flex flex-col items-center justify-center py-12"
            >
              <UIcon
                name="i-ion-refresh"
                class="w-10 h-10 animate-spin text-primary-500 mb-3"
              />
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Chargement des propositions...
              </p>
            </div>

            <template v-else>
              <p
                v-if="coverSuggestions.length > 0"
                class="text-sm text-gray-600 dark:text-gray-400"
              >
                Cliquez sur une image pour la sélectionner, puis Enregistrer.
              </p>
              <div
                v-if="coverSuggestions.length > 0"
                class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 max-h-[70vh] overflow-y-auto"
              >
                <button
                  v-for="(item, idx) in coverSuggestions"
                  :key="idx"
                  type="button"
                  class="relative block w-full rounded-lg overflow-hidden border-2 transition-all hover:border-primary-500 focus:border-primary-500 focus:outline-none bg-gray-100 dark:bg-gray-700"
                  :class="selectedCoverUrl === item.url ? 'border-primary-500 ring-2 ring-primary-300' : 'border-gray-200 dark:border-gray-600'"
                  @click="selectedCoverUrl = item.url"
                >
                  <!-- Ratio 2:3 (couverture livre) via padding, fiable sur mobile -->
                  <span class="block w-full pt-[150%]" />
                  <img
                    :src="item.displayUrl"
                    :alt="item.label ?? 'Couverture'"
                    class="absolute inset-0 w-full h-full object-cover"
                  >
                </button>
              </div>

              <div
                v-else
                class="py-8 text-center"
              >
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {{ coverModalError || 'Aucune couverture disponible pour ce livre.' }}
                </p>
                <UButton
                  v-if="book?.isbn"
                  type="button"
                  color="primary"
                  icon="i-ion-book"
                  @click="useIsbnCover"
                >
                  Utiliser la couverture par ISBN
                </UButton>
              </div>
            </template>

            <p
              v-if="coverModalError && coverSuggestions.length > 0"
              class="text-sm text-amber-600 dark:text-amber-400"
            >
              {{ coverModalError }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="isCoverModalOpen = false"
              >
                Annuler
              </UButton>
              <UButton
                color="primary"
                :loading="coverSaving"
                :disabled="!selectedCoverUrl"
                @click="saveSelectedCover"
              >
                Enregistrer
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useFamilyStore, type TransformedBook, type BookReading } from '~/stores/family'
import { useMemberStore } from '~/stores/member'
import { useAddBookModal } from '~/composables/useAddBookModal'
import BookReadingModal from '~/components/BookReadingModal.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const bookIdentifier = computed(() => route.params.id as string)

const familyStore = useFamilyStore()
const memberStore = useMemberStore()
const addBookModal = useAddBookModal()
const openEditBookModal = addBookModal.openModal

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
        note: att.note ?? r.note,
        pages_lues: att.pages_lues ?? r.pages_lues
      }
    }
    return r
  })
})
const loading = ref(true)
const error = ref<string | null>(null)
const isReadingModalOpen = ref(false)
const selectedReading = ref<BookReading | null>(null)

const isCoverModalOpen = ref(false)
const selectedCoverUrl = ref('')
const coverSuggestions = ref<Array<{ url: string, displayUrl: string, label?: string }>>([])
const loadingCovers = ref(false)
const coverModalError = ref<string | null>(null)
const coverSaving = ref(false)

function openCoverModal() {
  selectedCoverUrl.value = book.value?.image ?? ''
  coverModalError.value = null
  coverSuggestions.value = []
  isCoverModalOpen.value = true
  loadCoverSuggestions()
}

function openLibraryCoverUrl(isbn: string | number | null | undefined): string {
  if (isbn == null || String(isbn).trim() === '') return ''
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(String(isbn).trim())}-L.jpg`
}

function useIsbnCover() {
  const isbn = book.value?.isbn
  if (isbn) {
    selectedCoverUrl.value = openLibraryCoverUrl(isbn)
  }
}

async function getWorkIdForBook(): Promise<string | null> {
  const b = book.value
  if (!b) return null
  const key = b.open_library_key?.trim()
  if (key) {
    const normalized = key.replace(/^\/works\//i, '').trim()
    if (normalized) return normalized
  }
  const isbn = b.isbn?.trim()
  if (!isbn) return null
  try {
    const res = await $fetch<{ works?: Array<{ key: string }> }>(
      `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`
    )
    const workKey = res?.works?.[0]?.key
    if (workKey) return workKey.replace(/^\/works\//i, '').trim()
  } catch {
    // ignore
  }
  return null
}

async function loadCoverSuggestions() {
  const workId = await getWorkIdForBook()
  if (!workId) {
    coverModalError.value = 'Impossible de trouver l\'œuvre (ISBN ou clé Open Library requis).'
    return
  }
  loadingCovers.value = true
  coverModalError.value = null
  coverSuggestions.value = []
  const currentImage = book.value?.image?.trim()
  const list: Array<{ url: string, displayUrl: string, label?: string }> = []
  if (currentImage) {
    list.push({ url: currentImage, displayUrl: currentImage, label: 'Actuelle' })
  }
  const seen = new Set<string>(currentImage ? [currentImage] : [])
  try {
    const res = await $fetch<{ entries?: Array<{ covers?: number[], isbn_13?: string[], isbn_10?: string[], publish_date?: string }> }>(
      `https://openlibrary.org/works/${workId}/editions.json`,
      { params: { limit: 24 } }
    )
    const entries = res?.entries ?? []
    for (const entry of entries) {
      let urlL: string | null = null
      let displayUrl: string | null = null
      if (entry.covers?.[0]) {
        const id = entry.covers[0]
        urlL = `https://covers.openlibrary.org/b/id/${id}-L.jpg`
        displayUrl = `https://covers.openlibrary.org/b/id/${id}-M.jpg`
      } else if (entry.isbn_13?.[0]) {
        const isbn = entry.isbn_13[0]
        urlL = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        displayUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      } else if (entry.isbn_10?.[0]) {
        const isbn = entry.isbn_10[0]
        urlL = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
        displayUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
      }
      if (urlL && displayUrl && !seen.has(urlL)) {
        seen.add(urlL)
        list.push({ url: urlL, displayUrl, label: entry.publish_date ? `Éd. ${entry.publish_date}` : undefined })
      }
    }
    coverSuggestions.value = list
    if (list.length === 0) {
      coverModalError.value = 'Aucune couverture trouvée pour les éditions.'
    }
  } catch (err) {
    coverModalError.value = err instanceof Error ? err.message : 'Erreur lors du chargement des propositions.'
  } finally {
    loadingCovers.value = false
  }
}

async function saveSelectedCover() {
  if (!book.value) return
  coverModalError.value = null
  coverSaving.value = true
  try {
    const result = await familyStore.updateBook(book.value.documentId ?? book.value.id, {
      image_url: selectedCoverUrl.value.trim() || null
    })
    if (result.success) {
      isCoverModalOpen.value = false
      await loadBook()
    } else {
      coverModalError.value = result.error ?? 'Erreur lors de la mise à jour'
    }
  } catch (err) {
    coverModalError.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
  } finally {
    coverSaving.value = false
  }
}

const activeTab = ref<'detail' | 'lectures'>('detail')

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
    // Mode famille : afficher toutes les lectures de la famille pour ce livre
    console.log('[livres] onglet Lectures: GET /api/book-readings/book/' + bookId + ' (mode famille)')
    const result = await familyStore.fetchBookReadings(bookId)
    console.log('[livres] onglet Lectures: réponse API livre', {
      success: result.success,
      error: result.error ?? null,
      count: Array.isArray(result.data) ? result.data.length : 0,
      data: result.success && result.data ? result.data : null
    })
    const list = result.success && Array.isArray(result.data) ? result.data : []
    const fromBook = Array.isArray(book.value.book_readings) ? book.value.book_readings : []
    // Fusionner API + book_readings pour avoir toutes les lectures de la famille (dédupliquées par id)
    const seenIds = new Set<string | number>()
    const merged: typeof list = []
    for (const r of list) {
      const id = (r as { id?: number }).id ?? (r as { attributes?: { id?: number } }).attributes?.id
      if (id != null && !seenIds.has(id)) {
        seenIds.add(id)
        merged.push(r)
      }
    }
    for (const r of fromBook) {
      const id = (r as { id?: number }).id ?? (r as { attributes?: { id?: number } }).attributes?.id
      if (id != null && !seenIds.has(id)) {
        seenIds.add(id)
        merged.push(r)
      }
    }
    readings.value = merged.length > 0 ? merged : (fromBook.length > 0 ? fromBook : list)
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

/** Objet membre pour MemberAvatar (username + id si dispo) */
function readingMemberForAvatar(reading: Record<string, unknown>): { username: string, id?: number } {
  const username = readingMemberName(reading)
  const m = reading?.member
  const id = m && typeof m === 'object' && 'id' in m && typeof (m as { id: number }).id === 'number'
    ? (m as { id: number }).id
    : undefined
  return { username, id }
}

function readingDate(reading: Record<string, unknown>, field: 'date_debut' | 'date_fin'): string {
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

function readingPagesLues(reading: Record<string, unknown>): number | null {
  const v = reading?.pages_lues
  if (typeof v === 'number') return v
  if (v !== undefined && v !== null && typeof Number(v) === 'number' && !Number.isNaN(Number(v))) return Number(v)
  if (reading?.attributes && typeof reading.attributes === 'object' && 'pages_lues' in (reading.attributes as object)) {
    const n = (reading.attributes as { pages_lues?: unknown }).pages_lues
    if (typeof n === 'number') return n
    if (n != null) return Number(n)
  }
  return null
}

/** Durée de lecture en jours (début → fin). Retourne null si début ou fin manquant. */
function readingDurationDays(reading: Record<string, unknown>): number | null {
  const debut = readingDate(reading, 'date_debut')
  const fin = readingDate(reading, 'date_fin')
  if (!debut || !fin) return null
  const d1 = new Date(debut).getTime()
  const d2 = new Date(fin).getTime()
  if (Number.isNaN(d1) || Number.isNaN(d2)) return null
  const days = Math.round((d2 - d1) / (24 * 60 * 60 * 1000))
  return days >= 0 ? days : null
}

/** Libellé durée pour affichage : "1 jour" ou "X jours". */
function readingDurationLabel(reading: Record<string, unknown>): string | null {
  const days = readingDurationDays(reading)
  if (days == null) return null
  return days <= 1 ? '1 jour' : `${days} jours`
}

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

// Recharger le livre quand il est modifié via la modal globale
watch(() => familyStore.transformedBooks, async () => {
  if (book.value) {
    const updatedBook = familyStore.transformedBooks.find(b =>
      b.documentId === book.value?.documentId || b.id === book.value?.id
    )
    if (updatedBook) {
      book.value = updatedBook
    }
  }
}, { deep: true })

const handleEditBook = () => {
  if (book.value) {
    openEditBookModal({
      id: book.value.id,
      documentId: book.value.documentId,
      titre: book.value.titre,
      auteur: book.value.auteur || undefined,
      description: book.value.description || undefined,
      isbn: book.value.isbn || undefined,
      image: book.value.image || undefined,
      annee: book.value.annee || undefined,
      editeur: book.value.editeur || undefined,
      nombre_pages: book.value.nombre_pages || undefined
    })
  }
}

onMounted(async () => {
  await loadBook()
})
</script>
