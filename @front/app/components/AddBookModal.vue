<template>
  <UDrawer
    :open="isOpen"
    direction="bottom"
    @update:open="(value) => { isOpen = value }"
  >
    <template #content>
      <div
        class="relative flex flex-col max-h-[90dvh] sm:max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden"
        style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
      >
        <!-- Indicateur d'étapes (stepper) - circuit clair -->
        <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {{ stepTitle }}
          </h2>
          <!-- Parcours recherche : Recherche → Confirmation -->
          <div
            v-if="!showManualForm || editingBook"
            class="flex items-center gap-2"
          >
            <div class="flex items-center gap-1.5">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"
                :class="stepIndicator.search.active
                  ? 'bg-primary-500 text-white'
                  : stepIndicator.search.completed
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
              >
                {{ stepIndicator.search.completed ? '✓' : '1' }}
              </span>
              <span
                class="text-sm font-medium"
                :class="stepIndicator.search.active
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'"
              >
                Rechercher
              </span>
            </div>
            <div
              class="flex-1 h-0.5 min-w-4 max-w-12 rounded transition-colors"
              :class="stepIndicator.preview.active
                ? 'bg-primary-400 dark:bg-primary-600'
                : 'bg-gray-200 dark:bg-gray-700'"
            />
            <div class="flex items-center gap-1.5">
              <span
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors"
                :class="stepIndicator.preview.active
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'"
              >
                2
              </span>
              <span
                class="text-sm font-medium"
                :class="stepIndicator.preview.active
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-500 dark:text-gray-400'"
              >
                Confirmer
              </span>
            </div>
          </div>
          <!-- Parcours manuel -->
          <div
            v-else
            class="flex items-center gap-2"
          >
            <div class="flex items-center gap-1.5">
              <span class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-primary-500 text-white">
                1
              </span>
              <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
                Saisie manuelle
              </span>
            </div>
          </div>
        </div>

        <!-- Mode prévisualisation -->
        <div
          v-if="showPreview && previewBook"
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 min-h-0 max-h-[70vh] overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
        >
          <div class="mb-4">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-ion-arrow-back"
              size="sm"
              class="min-h-[44px] sm:min-h-0"
              @click="backToSearch"
            >
              ← Retour à l’étape 1
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
                      name="i-ion-book"
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
                      name="i-ion-person"
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
                      name="i-ion-calendar"
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
                      name="i-ion-hash"
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
                      name="i-ion-business"
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
                      name="i-ion-document-text"
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
                      name="i-ion-text"
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
                      name="i-ion-pricetag"
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

            <!-- Bouton d'action - Étape 2 : Confirmer -->
            <div class="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Les informations vous conviennent ? Ajoutez ce livre à votre collection.
              </p>
              <UButton
                color="primary"
                size="lg"
                block
                icon="i-ion-add"
                class="min-h-[52px] sm:min-h-0 text-base font-semibold rounded-xl"
                :loading="submitting"
                :disabled="submitting"
                @click="addBookFromPreview"
              >
                Ajouter à ma collection
              </UButton>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                block
                class="min-h-[48px] mt-2"
                :disabled="submitting"
                @click="closeModal"
              >
                Annuler
              </UButton>
            </div>
          </div>
        </div>

        <!-- Mode recherche Open Library (par défaut pour l'ajout) - Étape 1 -->
        <div
          v-else-if="!editingBook && !showManualForm"
          class="space-y-5 sm:space-y-4 overflow-y-auto flex-1 overscroll-contain px-4 py-4 sm:p-4"
          style="padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 1rem));"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Recherchez votre livre puis sélectionnez-le pour vérifier les informations.
          </p>
          <div
            class="relative flex items-center gap-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-500 mb-4"
          >
            <input
              id="book-search"
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              placeholder="Titre, auteur, ISBN..."
              :disabled="submitting || searching"
              class="flex-1 min-h-[44px] w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none disabled:opacity-50"
              @keydown.enter.prevent="searchBooks"
            >
            <UButton
              type="button"
              color="primary"
              icon="i-ion-search"
              variant="link"
              size="sm"
              class="min-w-[40px] shrink-0"
              :loading="searching || submitting"
              :disabled="submitting || searching || !searchQuery.trim()"
              aria-label="Rechercher"
              @click="searchBooks"
            />
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
                      name="i-ion-book"
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

          <!-- Proposition de saisie manuelle (toujours visible : résultats ou non) -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {{ searchError
                ? 'Recherche infructueuse. Vous pouvez ajouter ce livre manuellement.'
                : searchResults.length > 0
                  ? 'Votre livre n\'est pas dans la liste ? Saisissez-le manuellement.'
                  : 'Vous pouvez ajouter un livre manuellement.' }}
            </p>
            <UButton
              type="button"
              color="primary"
              variant="outline"
              block
              icon="i-ion-create-outline"
              @click="goToManualForm"
            >
              Saisir manuellement
            </UButton>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              block
              class="min-h-[48px] mt-4"
              :disabled="submitting"
              @click="closeModal"
            >
              Annuler
            </UButton>
          </div>
        </div>

        <!-- Formulaire manuel multi-pages avec slides -->
        <form
          v-else
          id="book-form"
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSubmit"
        >
          <!-- En-tête : retour + indicateur d'étapes -->
          <div class="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <UButton
              v-if="manualFormStep > 1 || !editingBook"
              type="button"
              color="neutral"
              variant="ghost"
              icon="i-ion-arrow-back"
              size="sm"
              class="min-h-[44px] sm:min-h-0"
              @click="manualFormStep === 1 ? (showManualForm = false) : manualFormStep--"
            >
              {{ manualFormStep === 1 ? 'Retour' : 'Précédent' }}
            </UButton>
            <div
              v-else
              class="w-10"
            />
            <div class="flex items-center gap-2">
              <button
                v-for="s in 3"
                :key="s"
                type="button"
                class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300"
                :class="manualFormStep === s
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'"
                :aria-label="`Étape ${s}`"
                @click="manualFormStep = s"
              >
                {{ s }}
              </button>
            </div>
            <div class="w-10" />
          </div>

          <!-- Slider des pages -->
          <div class="flex-1 min-h-0 overflow-hidden">
            <div
              class="flex h-full transition-transform duration-300 ease-out"
              :style="{ width: '300%', transform: `translateX(-${(manualFormStep - 1) * (100 / 3)}%)` }"
            >
              <!-- Page 1 : Titre, Auteur -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Les informations essentielles du livre.
                </p>
                <div class="form-field">
                  <label
                    for="title"
                    class="label-mobile"
                  >
                    <UIcon
                      name="i-ion-book-outline"
                      class="w-4 h-4 shrink-0"
                    />
                    Titre du livre <span class="text-red-500">*</span>
                  </label>
                  <UInput
                    id="title"
                    v-model="state.title"
                    :disabled="submitting"
                    :error="!!errors.title"
                    class="w-full input-touch"
                  />
                  <p
                    v-if="errors.title"
                    class="mt-1.5 text-sm text-red-600 dark:text-red-400"
                  >
                    {{ errors.title }}
                  </p>
                </div>

                <div class="form-field">
                  <label
                    for="author"
                    class="label-mobile"
                  >
                    <UIcon
                      name="i-ion-person-outline"
                      class="w-4 h-4 shrink-0"
                    />
                    Auteur
                  </label>
                  <UInput
                    id="author"
                    v-model="state.author"
                    :disabled="submitting"
                    class="w-full input-touch"
                  />
                </div>
              </div>

              <!-- Page 2 : Année, Nombre de pages -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Les métadonnées du livre (optionnel).
                </p>
                <div class="form-field">
                  <label
                    for="year"
                    class="label-mobile"
                  >
                    <UIcon
                      name="i-ion-calendar-outline"
                      class="w-4 h-4 shrink-0"
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
                    class="w-full input-touch"
                  />
                </div>

                <div class="form-field">
                  <label
                    for="nombrePages"
                    class="label-mobile"
                  >
                    <UIcon
                      name="i-ion-document-text-outline"
                      class="w-4 h-4 shrink-0"
                    />
                    Nombre de pages
                  </label>
                  <UInput
                    id="nombrePages"
                    v-model.number="state.nombrePages"
                    type="number"
                    min="1"
                    :disabled="submitting"
                    class="w-full input-touch"
                    placeholder="Ex: 250"
                  />
                </div>
              </div>

              <!-- Page 3 : Description, Image -->
              <div class="flex-[0_0_33.333%] overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Description et couverture (optionnel).
                </p>
                <div class="form-field">
                  <label
                    for="description"
                    class="label-mobile"
                  >
                    <UIcon
                      name="i-ion-document-text-outline"
                      class="w-4 h-4 shrink-0"
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

                <div class="form-field">
                  <label class="label-mobile">
                    <UIcon
                      name="i-ion-image-outline"
                      class="w-4 h-4 shrink-0"
                    />
                    Couverture du livre
                  </label>
                  <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Indiquez une URL ou téléchargez une image :
                  </p>
                  <UInput
                    id="imageUrl"
                    v-model="state.coverUrl"
                    type="url"
                    :disabled="submitting"
                    class="w-full mb-3 input-touch"
                    placeholder="https://..."
                  />
                  <UFileUpload
                    v-model="coverImageFile"
                    color="neutral"
                    highlight
                    label="Déposez votre image ici"
                    description="JPG, PNG ou WebP (max. 2 Mo)"
                    class="w-full min-h-32"
                    :disabled="submitting"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="submitError"
            class="px-4 pb-2 shrink-0"
          >
            <div class="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p class="text-sm text-red-600 dark:text-red-400">
                {{ submitError }}
              </p>
            </div>
          </div>

          <!-- Footer : Précédent / Suivant / Ajouter -->
          <div
            class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
          >
            <div class="flex gap-3">
              <UButton
                v-if="manualFormStep > 1"
                type="button"
                color="neutral"
                variant="outline"
                size="lg"
                class="min-h-[48px] sm:min-h-0"
                :disabled="submitting"
                @click="manualFormStep--"
              >
                Précédent
              </UButton>
              <UButton
                v-if="manualFormStep < 3"
                type="button"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :disabled="submitting"
                @click="manualFormStep++"
              >
                Suivant
              </UButton>
              <UButton
                v-else
                type="submit"
                form="book-form"
                color="primary"
                size="lg"
                block
                class="min-h-[48px] sm:min-h-0"
                :loading="submitting"
              >
                {{ editingBook ? 'Enregistrer' : 'Ajouter' }}
              </UButton>
            </div>
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              block
              class="min-h-[48px]"
              :disabled="submitting"
              @click="closeModal"
            >
              Annuler
            </UButton>
          </div>
        </form>

        <!-- Overlay de chargement (sélection d'un livre) -->
        <div
          v-if="loadingDetails"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-3">
            <UIcon
              name="i-ion-sync"
              class="w-10 h-10 text-primary-500 animate-spin"
            />
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
              Chargement des détails...
            </p>
          </div>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useFamilyStore } from '~/stores/family'
import type { Book } from '~/composables/useAddBookModal'

interface Props {
  modelValue: boolean
  book?: Book | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', addedBook?: { id?: number; documentId?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  book: null
})

const emit = defineEmits<Emits>()

const editingBook = computed(() => props.book !== null && props.book !== undefined)

// Titre contextuel selon l'étape
const stepTitle = computed(() => {
  if (editingBook.value) return 'Modifier le livre'
  if (showPreview.value && previewBook.value) return 'Vérifiez les informations'
  if (showManualForm.value) return 'Saisissez les informations du livre'
  return 'Recherchez un livre'
})

// Indicateur d'étapes pour clarifier le circuit
const stepIndicator = computed(() => {
  const manual = showManualForm.value && !editingBook.value
  const preview = showPreview.value && previewBook.value
  const search = !manual && !preview

  return {
    search: {
      active: search,
      completed: preview || manual
    },
    preview: {
      active: preview,
      completed: false // La confirmation est la dernière étape avant l'ajout
    },
    manual: {
      active: manual
    }
  }
})

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

// Fonction helper pour mettre le focus et afficher le clavier sur mobile
const focusInput = (inputId: string) => {
  requestAnimationFrame(() => {
    setTimeout(() => {
      const inputElement = document.getElementById(inputId)
      if (inputElement) {
        const nativeInput = inputElement.querySelector('input') as HTMLInputElement
        if (nativeInput) {
          // Sur mobile, utiliser click() en plus de focus() pour déclencher le clavier
          nativeInput.click()
          nativeInput.focus({ preventScroll: false })
          // Forcer le scroll vers l'input si nécessaire
          nativeInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 200) // Délai plus long pour s'assurer que le modal est complètement rendu
  })
}

watch(isOpen, async (newValue) => {
  emit('update:modelValue', newValue)
  if (!newValue) {
    resetForm()
    showManualForm.value = false
    showPreview.value = false
    manualFormStep.value = 1
  } else if (newValue && editingBook.value) {
    loadBookData()
    showManualForm.value = true
    showPreview.value = false
    // Mettre le focus sur le champ titre après l'ouverture du modal
    await nextTick()
    focusInput('title')
  } else {
    showManualForm.value = false
    showPreview.value = false
    // Mettre le focus sur le champ de recherche après l'ouverture du modal
    await nextTick()
    focusInput('book-search')
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
const coverImageFile = ref<File | File[] | null>(null)

// Mode d'affichage (recherche, prévisualisation ou formulaire manuel)
const showManualForm = ref(false)
const showPreview = ref(false)
const manualFormStep = ref(1)
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
  coverUrl: '',
  nombrePages: null as number | null
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

    // Succès : fermer le modal et émettre l'événement avec le livre ajouté
    const addedBook = result.data ? { id: result.data.id, documentId: result.data.documentId } : undefined
    resetForm()
    emit('success', addedBook)
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

const goToManualForm = () => {
  state.title = searchQuery.value.trim()
  manualFormStep.value = 1
  showManualForm.value = true
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
  manualFormStep.value = 1
  coverImageFile.value = null
  state.title = ''
  state.author = ''
  state.isbn = ''
  state.year = null
  state.description = ''
  state.coverUrl = ''
  state.nombrePages = null
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
    const familyStore = useFamilyStore()
    const memberStore = useMemberStore()
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const apiUrl = (config.public.apiUrl as string) || 'http://localhost:1337'

    let imageId: number | null = null
    const fileToUpload = Array.isArray(coverImageFile.value)
      ? coverImageFile.value[0]
      : coverImageFile.value
    if (fileToUpload) {
      try {
        const formData = new FormData()
        formData.append('files', fileToUpload)
        const uploadResponse = await $fetch<{ id: number }[]>(`${apiUrl}/api/upload`, {
          method: 'POST',
          headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {},
          body: formData
        })
        if (uploadResponse?.length) {
          imageId = uploadResponse[0].id
        }
      } catch (uploadErr) {
        console.error('Erreur upload image:', uploadErr)
        submitError.value = 'Erreur lors de l\'upload de l\'image'
        submitting.value = false
        return
      }
    }

    const imageToUse = imageId ?? (state.coverUrl?.trim() || null)

    if (editingBook.value && props.book) {
      // Mise à jour - utiliser documentId en priorité (Strapi 5)
      const identifier = props.book.documentId || props.book.id

      const result = await familyStore.updateBook(identifier, {
        titre: state.title.trim(),
        auteur: state.author.trim() || null,
        isbn: state.isbn.trim() || null,
        annee: state.year || null,
        description: state.description.trim() || null,
        image_url: imageToUse,
        image: imageId,
        editeur: props.book.editeur || null,
        nombre_pages: state.nombrePages || null
      })

      if (!result.success) {
        submitError.value = result.error || 'Erreur lors de la mise à jour du livre'
        return
      }
    } else {
      // Création
      const bookData = {
        titre: state.title.trim(),
        auteur: state.author.trim() || undefined,
        isbn: state.isbn.trim() || undefined,
        annee: state.year || undefined,
        description: state.description.trim() || undefined,
        image_url: imageId ? undefined : (state.coverUrl?.trim() || undefined),
        image: imageId ?? undefined,
        nombre_pages: state.nombrePages || undefined
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

      // Succès création : émettre avec le livre ajouté
      const addedBook = result.data ? { id: result.data.id, documentId: result.data.documentId } : undefined
      resetForm()
      emit('success', addedBook)
      isOpen.value = false
      submitting.value = false
      return
    }

    // Mise à jour (pas d'émission de livre)
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

<style scoped>
.form-field :deep(.label-mobile) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: currentColor;
  margin-bottom: 0.375rem;
}
.form-field :deep(.input-touch) {
  width: 100%;
}
@media (max-width: 639px) {
  .form-field :deep(input[type="text"]),
  .form-field :deep(input[type="number"]) {
    min-height: 48px;
    font-size: 16px;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}
</style>
