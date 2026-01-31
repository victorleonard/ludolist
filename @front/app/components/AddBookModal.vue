<template>
  <UModal
    :open="isOpen"
    :fullscreen="isMobile"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <UCard class="w-full md:max-w-2xl md:max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 overflow-hidden">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ editingBook ? 'Modifier le livre' : 'Ajouter un nouveau livre' }}
            </h3>
            <div class="flex items-center gap-2">
              <UButton
                type="submit"
                form="book-form"
                color="primary"
                size="sm"
                :loading="submitting"
              >
                {{ editingBook ? 'Enregistrer' : 'Ajouter le livre' }}
              </UButton>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-x"
                size="sm"
                class="-my-1"
                :disabled="submitting"
                @click="closeModal"
              />
            </div>
          </div>
        </template>

        <!-- Mode prévisualisation -->
        <div
          v-if="showPreview && previewBook"
          class="space-y-4 overflow-y-auto flex-1 min-h-0"
          :style="{ height: isMobile ? 'calc(100vh - 61px)' : 'calc(100vh - 180px)' }"
        >
          <div class="mb-4">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              size="sm"
              @click="backToSearch"
            >
              Retour aux résultats
            </UButton>
          </div>

          <div class="space-y-6">
            <!-- Image et informations principales -->
            <div class="flex flex-col md:flex-row gap-6">
              <!-- Couverture -->
              <div class="w-full md:w-48 flex-shrink-0">
                <div class="aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
                  <img
                    v-if="previewBook.cover_url"
                    :src="previewBook.cover_url.replace('-M.jpg', '-L.jpg')"
                    :alt="previewBook.title"
                    class="w-full h-full object-cover"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-book"
                      class="w-20 h-20 text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <!-- Informations -->
              <div class="flex-1 space-y-4">
                <div>
                  <h2 class="text-2xl font-bold mb-2">
                    {{ previewBook.title }}
                  </h2>
                  <p
                    v-if="previewBook.author_name"
                    class="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2"
                  >
                    <UIcon
                      name="i-lucide-user"
                      class="w-4 h-4"
                    />
                    {{ previewBook.author_name }}
                  </p>
                </div>

                <!-- Métadonnées -->
                <div class="flex flex-wrap gap-3">
                  <UBadge
                    v-if="previewBook.first_publish_year"
                    color="primary"
                    variant="subtle"
                  >
                    <UIcon
                      name="i-lucide-calendar"
                      class="w-3 h-3 mr-1"
                    />
                    {{ previewBook.first_publish_year }}
                  </UBadge>
                  <UBadge
                    v-if="previewBook.isbn"
                    color="neutral"
                    variant="subtle"
                  >
                    <UIcon
                      name="i-lucide-hash"
                      class="w-3 h-3 mr-1"
                    />
                    ISBN: {{ Array.isArray(previewBook.isbn) ? previewBook.isbn[0] : previewBook.isbn }}
                  </UBadge>
                  <UBadge
                    v-if="previewBook.publisher"
                    color="neutral"
                    variant="subtle"
                  >
                    <UIcon
                      name="i-lucide-building"
                      class="w-3 h-3 mr-1"
                    />
                    {{ Array.isArray(previewBook.publisher) ? previewBook.publisher[0] : previewBook.publisher }}
                  </UBadge>
                  <UBadge
                    v-if="previewBook.number_of_pages"
                    color="neutral"
                    variant="subtle"
                  >
                    <UIcon
                      name="i-lucide-file-text"
                      class="w-3 h-3 mr-1"
                    />
                    {{ previewBook.number_of_pages }} pages
                  </UBadge>
                </div>

                <!-- Description -->
                <div
                  v-if="previewBook.description"
                  class="mt-4"
                >
                  <h3 class="font-semibold mb-2 flex items-center gap-2">
                    <UIcon
                      name="i-lucide-align-left"
                      class="w-4 h-4"
                    />
                    Description
                  </h3>
                  <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ previewBook.description }}
                  </p>
                </div>

                <!-- Sujets/Catégories -->
                <div
                  v-if="previewBook.subjects && previewBook.subjects.length > 0"
                  class="mt-4"
                >
                  <h3 class="font-semibold mb-2 flex items-center gap-2">
                    <UIcon
                      name="i-lucide-tag"
                      class="w-4 h-4"
                    />
                    Catégories
                  </h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="(subject, index) in previewBook.subjects.slice(0, 8)"
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
            </div>

            <!-- Message d'erreur -->
            <div
              v-if="submitError"
              class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p class="text-sm text-red-600 dark:text-red-400">
                {{ submitError }}
              </p>
            </div>

            <!-- Bouton d'action -->
            <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <UButton
                color="primary"
                size="lg"
                block
                icon="i-lucide-plus"
                :loading="submitting"
                :disabled="submitting"
                @click="addBookFromPreview"
              >
                Ajouter à ma collection
              </UButton>
            </div>
          </div>
        </div>

        <!-- Mode recherche Open Library (par défaut pour l'ajout) -->
        <div
          v-else-if="!editingBook && !showManualForm"
          class="space-y-4 overflow-y-auto flex-1"
        >
          <div class="flex items-center gap-2 mb-4">
            <UIcon
              name="i-lucide-search"
              class="w-5 h-5"
            />
            <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Rechercher un livre
            </h4>
          </div>

          <div class="flex gap-2">
            <UInput
              id="book-search"
              v-model="searchQuery"
              placeholder="Titre, auteur, ISBN..."
              :disabled="submitting || searching"
              class="flex-1"
              size="lg"
              @keyup.enter="searchBooks"
            />
            <UButton
              type="button"
              color="primary"
              :loading="searching || submitting"
              :disabled="submitting || searching || !searchQuery.trim()"
              size="lg"
              @click="searchBooks"
            >
              Rechercher
            </UButton>
          </div>

          <!-- Résultats de recherche -->
          <div
            v-if="searchError"
            class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ searchError }}
            </p>
          </div>

          <div
            v-if="searchResults.length > 0"
            class="mt-4 space-y-2 max-h-96 overflow-y-auto"
          >
            <div
              v-for="book in searchResults"
              :key="book.key"
              class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
              :class="{
                'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer': !submitting,
                'opacity-50 cursor-not-allowed': submitting
              }"
              @click="!submitting && selectBook(book)"
            >
              <div class="flex items-start gap-4">
                <!-- Image du livre -->
                <div class="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    v-if="book.cover_url"
                    :src="book.cover_url"
                    :alt="book.title"
                    class="w-full h-full object-cover"
                    @error="book.cover_url = null"
                  >
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                  >
                    <UIcon
                      name="i-lucide-book"
                      class="w-6 h-6 text-gray-400"
                    />
                  </div>
                </div>

                <!-- Informations du livre -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-base line-clamp-2">
                    {{ book.title }}
                  </p>
                  <p
                    v-if="book.author_name"
                    class="text-sm text-gray-600 dark:text-gray-400 mt-1"
                  >
                    {{ book.author_name }}
                  </p>
                  <div class="flex flex-wrap gap-2 mt-2">
                    <UBadge
                      v-if="book.first_publish_year"
                      color="neutral"
                      variant="subtle"
                      size="xs"
                    >
                      {{ book.first_publish_year }}
                    </UBadge>
                    <UBadge
                      v-if="book.isbn"
                      color="primary"
                      variant="subtle"
                      size="xs"
                    >
                      ISBN: {{ book.isbn }}
                    </UBadge>
                  </div>
                </div>

                <!-- Bouton sélectionner -->
                <UButton
                  type="button"
                  color="primary"
                  variant="outline"
                  size="sm"
                  class="shrink-0"
                  :loading="submitting"
                  :disabled="submitting"
                  @click.stop="selectBook(book)"
                >
                  Sélectionner
                </UButton>
              </div>
            </div>
          </div>

          <!-- Bouton pour ajouter manuellement -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              block
              icon="i-lucide-plus"
              @click="showManualForm = true"
            >
              Ajouter manuellement
            </UButton>
          </div>
        </div>

        <!-- Formulaire manuel -->
        <form
          v-else
          id="book-form"
          class="space-y-4 overflow-y-auto flex-1"
          @submit.prevent="handleSubmit"
        >
          <!-- Bouton retour à la recherche (uniquement pour l'ajout) -->
          <div
            v-if="!editingBook"
            class="mb-4"
          >
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              size="sm"
              @click="showManualForm = false"
            >
              Retour à la recherche
            </UButton>
          </div>

          <div>
            <label
              for="title"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-book"
                class="w-4 h-4"
              />
              Titre du livre <span class="text-red-500">*</span>
            </label>
            <UInput
              id="title"
              v-model="state.title"
              :disabled="submitting"
              :error="!!errors.title"
              class="w-full"
            />
            <p
              v-if="errors.title"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ errors.title }}
            </p>
          </div>

          <div>
            <label
              for="author"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-user"
                class="w-4 h-4"
              />
              Auteur
            </label>
            <UInput
              id="author"
              v-model="state.author"
              :disabled="submitting"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="isbn"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-hash"
                class="w-4 h-4"
              />
              ISBN
            </label>
            <UInput
              id="isbn"
              v-model="state.isbn"
              :disabled="submitting"
              class="w-full"
              placeholder="978-..."
            />
          </div>

          <div>
            <label
              for="year"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              Année de publication
            </label>
            <UInput
              id="year"
              v-model.number="state.year"
              type="number"
              min="1000"
              :max="currentYear"
              :disabled="submitting"
              class="w-full"
            />
          </div>

          <div>
            <label
              for="description"
              class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              <UIcon
                name="i-lucide-file-text"
                class="w-4 h-4"
              />
              Description
            </label>
            <UTextarea
              id="description"
              v-model="state.description"
              :disabled="submitting"
              class="w-full"
              :rows="4"
            />
          </div>

          <div
            v-if="submitError"
            class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p class="text-sm text-red-600 dark:text-red-400">
              {{ submitError }}
            </p>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useFamilyStore } from '~/stores/family'
import type { Book } from '~/composables/useAddBookModal'

const isMobile = useMediaQuery('(max-width: 767px)')

interface Props {
  modelValue: boolean
  book?: Book | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  book: null
})

const emit = defineEmits<Emits>()

const editingBook = computed(() => props.book !== null && props.book !== undefined)

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
    showManualForm.value = false
    showPreview.value = false
  } else if (newValue && editingBook.value) {
    loadBookData()
    showManualForm.value = true
    showPreview.value = false
  } else {
    showManualForm.value = false
    showPreview.value = false
  }
})

watch(() => props.book, (newBook) => {
  if (newBook && isOpen.value) {
    loadBookData()
  }
})

const submitting = ref(false)
const submitError = ref<string | null>(null)
const currentYear = new Date().getFullYear()

// Mode d'affichage (recherche, prévisualisation ou formulaire manuel)
const showManualForm = ref(false)
const showPreview = ref(false)
const previewBook = ref<OpenLibraryBook | null>(null)

// Recherche Open Library
const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const searchError = ref<string | null>(null)
const loadingDetails = ref(false)

interface OpenLibraryBook {
  key: string
  title: string
  author_name?: string
  first_publish_year?: number
  isbn?: string | string[]
  cover_i?: number
  cover_url?: string | null
  publisher?: string | string[]
  number_of_pages?: number
  subjects?: string[]
  description?: string
}

const state = reactive({
  title: '',
  author: '',
  isbn: '',
  year: null as number | null,
  description: '',
  coverUrl: ''
})

const errors = reactive({
  title: ''
})

// Recherche sur Open Library
const searchBooks = async () => {
  if (!searchQuery.value.trim()) {
    return
  }

  searching.value = true
  searchError.value = null
  searchResults.value = []

  try {
    const response = await $fetch<{ docs: any[], numFound: number }>(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery.value)}&limit=20&fields=key,title,author_name,first_publish_year,isbn,cover_i,publisher`,
      {
        // Pas besoin d'authentification pour Open Library
      }
    )

    if (response?.docs) {
      // Transformer les résultats et ajouter les URLs des couvertures
      searchResults.value = response.docs.map((doc: any) => ({
        key: doc.key,
        title: doc.title,
        author_name: doc.author_name ? doc.author_name.join(', ') : undefined,
        first_publish_year: doc.first_publish_year,
        isbn: doc.isbn ? doc.isbn[0] : undefined,
        cover_url: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : null,
        publisher: doc.publisher ? doc.publisher[0] : undefined
      }))

      if (response.docs.length === 0) {
        searchError.value = 'Aucun livre trouvé pour cette recherche.'
      }
    } else {
      searchError.value = 'Erreur lors de la recherche.'
    }
  } catch (err: unknown) {
    console.error('Erreur lors de la recherche Open Library:', err)
    searchError.value = err instanceof Error ? err.message : 'Erreur lors de la recherche sur Open Library'
  } finally {
    searching.value = false
  }
}

const selectBook = async (book: OpenLibraryBook) => {
  loadingDetails.value = true
  previewBook.value = null

  try {
    // Récupérer les détails complets du livre depuis Open Library
    const workKey = book.key.replace('/works/', '')
    const detailsResponse = await $fetch<any>(
      `https://openlibrary.org${book.key}.json`
    )

    // Enrichir les données du livre
    const enrichedBook = {
      ...book,
      description: detailsResponse.description?.value || detailsResponse.description || '',
      subjects: detailsResponse.subjects?.slice(0, 10) || [],
      number_of_pages: detailsResponse.number_of_pages
    }

    previewBook.value = enrichedBook
    showPreview.value = true
  } catch (err) {
    console.error('Erreur lors du chargement des détails:', err)
    // En cas d'erreur, utiliser les données de base
    previewBook.value = book
    showPreview.value = true
  } finally {
    loadingDetails.value = false
  }
}

const addBookFromPreview = async () => {
  if (!previewBook.value) return

  submitting.value = true
  submitError.value = null

  try {
    const familyStore = useFamilyStore()
    const memberStore = useMemberStore()

    const bookData = {
      titre: previewBook.value.title.trim(),
      auteur: previewBook.value.author_name?.trim() || undefined,
      isbn: Array.isArray(previewBook.value.isbn) 
        ? previewBook.value.isbn[0]?.trim() 
        : (previewBook.value.isbn?.trim() || undefined),
      annee: previewBook.value.first_publish_year || undefined,
      description: previewBook.value.description?.trim() || undefined,
      image_url: previewBook.value.cover_url || undefined,
      editeur: Array.isArray(previewBook.value.publisher)
        ? previewBook.value.publisher[0]?.trim()
        : (previewBook.value.publisher?.trim() || undefined),
      nombre_pages: previewBook.value.number_of_pages || undefined,
      sujets: previewBook.value.subjects || undefined,
      open_library_key: previewBook.value.key || undefined
    }

    // Si membre connecté, passer son id pour marquer le livre comme ajouté par lui
    const memberId = memberStore.isMemberConnected && memberStore.currentMember
      ? memberStore.currentMember.id
      : undefined

    const result = await familyStore.addBookToFamily(bookData, memberId)

    if (!result.success) {
      submitError.value = result.error || 'Erreur lors de l\'ajout du livre'
      return
    }

    // Succès : fermer le modal et émettre l'événement
    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error('Erreur lors de l\'ajout du livre:', err)
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'ajout du livre'
    submitError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

const backToSearch = () => {
  showPreview.value = false
  previewBook.value = null
}

const loadBookData = () => {
  if (props.book) {
    state.title = props.book.titre
    state.author = props.book.auteur || ''
    state.isbn = props.book.isbn || ''
    state.year = props.book.annee || null
    state.description = props.book.description || ''
    state.coverUrl = props.book.image || ''
  }
}

const resetForm = () => {
  state.title = ''
  state.author = ''
  state.isbn = ''
  state.year = null
  state.description = ''
  state.coverUrl = ''
  submitError.value = null
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = null
  errors.title = ''
  showPreview.value = false
  previewBook.value = null
  submitting.value = false
}

// Réinitialiser les erreurs quand les champs sont modifiés
watch(() => state.title, () => {
  if (errors.title) errors.title = ''
})

const validateForm = (): boolean => {
  errors.title = ''

  if (!state.title.trim()) {
    errors.title = 'Le titre est requis'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    // Pour l'instant, on stocke localement dans le localStorage
    // Plus tard, on pourra créer une API backend pour ça
    const books = JSON.parse(localStorage.getItem('ludolist-books') || '[]')

    const bookData = {
      id: editingBook.value && props.book ? props.book.id : Date.now(),
      titre: state.title.trim(),
      auteur: state.author.trim() || undefined,
      isbn: state.isbn.trim() || undefined,
      annee: state.year || undefined,
      description: state.description.trim() || undefined,
      image: state.coverUrl || undefined,
      createdAt: new Date().toISOString()
    }

    if (editingBook.value && props.book) {
      // Mise à jour
      const index = books.findIndex((b: Book) => b.id === props.book!.id)
      if (index !== -1) {
        books[index] = { ...books[index], ...bookData }
      }
    } else {
      // Ajout
      books.push(bookData)
    }

    localStorage.setItem('ludolist-books', JSON.stringify(books))

    resetForm()
    emit('success')
    isOpen.value = false
  } catch (err: unknown) {
    console.error(`Erreur lors de ${editingBook.value ? 'la mise à jour' : 'la création'} du livre:`, err)
    const errorMessage = err instanceof Error ? err.message : `Une erreur est survenue lors de ${editingBook.value ? 'la mise à jour' : 'la création'} du livre`
    submitError.value = errorMessage
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  if (!submitting.value) {
    resetForm()
    isOpen.value = false
  }
}
</script>
