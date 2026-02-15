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
        <!-- Indicateur d'étapes (stepper) - un seul circuit visible -->
        <div class="shrink-0 px-4 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {{ stepTitle }}
          </h2>
          <!-- Parcours formulaire (modification ou saisie manuelle) : 3 étapes -->
          <div
            v-if="showManualForm || editingBook"
            class="flex items-center gap-2"
          >
            <div
              v-for="s in 3"
              :key="s"
              class="flex items-center gap-1.5 flex-1 min-w-0"
            >
              <button
                type="button"
                class="flex items-center gap-1.5 cursor-pointer group"
                :aria-label="`Étape ${s} : ${manualFormStepLabels[s - 1]}`"
                @click="goToStep(s)"
              >
                <span
                  class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors shrink-0"
                  :class="manualFormStep === s
                    ? 'bg-primary-500 text-white'
                    : manualFormStep > s
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'"
                >
                  {{ manualFormStep > s ? '✓' : s }}
                </span>
                <span
                  class="text-sm font-medium hidden sm:inline truncate"
                  :class="manualFormStep === s
                    ? 'text-gray-900 dark:text-gray-100'
                    : manualFormStep > s
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400'"
                >
                  {{ manualFormStepLabels[s - 1] }}
                </span>
              </button>
              <div
                v-if="s < 3"
                class="flex-1 h-0.5 min-w-4 max-w-12 rounded transition-colors shrink-0"
                :class="manualFormStep > s ? 'bg-primary-400 dark:bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'"
              />
            </div>
          </div>
          <!-- Parcours recherche : Recherche → Confirmation -->
          <div
            v-else
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
                    :src="previewBook.cover_url"
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
          </div>
        </div>

        <!-- Footer fixe pour la prévisualisation -->
        <div
          v-if="showPreview && previewBook"
          class="border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:p-4 shrink-0 bg-white dark:bg-gray-900 space-y-2"
          style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));"
        >
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
            class="min-h-[48px]"
            :disabled="submitting"
            @click="closeModal"
          >
            Annuler
          </UButton>
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

          <!-- Proposition de saisie manuelle (uniquement après une recherche) -->
          <div
            v-if="hasSearched"
            class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
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
          </div>

          <!-- Bouton Annuler -->
          <div
            class="mt-4"
            :class="{ 'pt-6 border-t border-gray-200 dark:border-gray-700': !hasSearched }"
          >
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
        </div>

        <!-- Formulaire manuel multi-pages avec slides -->
        <form
          v-else
          id="book-form"
          class="flex flex-col flex-1 min-h-0"
          @submit.prevent="handleSubmit"
        >
          <!-- En-tête : bouton retour uniquement (le stepper est en haut) -->
          <div class="shrink-0 flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
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
                    Couverture
                  </label>
                  <p class="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Recherchez une couverture ou indiquez une URL :
                  </p>

                  <!-- Bouton recherche de couvertures -->
                  <UButton
                    type="button"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    icon="i-ion-search"
                    class="mb-3"
                    :loading="loadingManualCovers"
                    :disabled="submitting || !state.title?.trim()"
                    @click="loadManualCoverSuggestions"
                  >
                    Rechercher des couvertures
                  </UButton>

                  <!-- Propositions de couvertures -->
                  <div
                    v-if="loadingManualCovers"
                    class="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    <UIcon
                      name="i-ion-refresh"
                      class="w-8 h-8 animate-spin mb-2"
                    />
                    <span class="text-sm">Chargement des propositions...</span>
                  </div>
                  <div
                    v-else-if="manualCoverSuggestions.length > 0"
                    class="mb-3"
                  >
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Cliquez sur une image pour l'utiliser.
                    </p>
                    <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                      <button
                        v-for="(item, idx) in manualCoverSuggestions"
                        :key="idx"
                        type="button"
                        class="relative block w-full rounded-lg overflow-hidden border-2 transition-all hover:border-primary-500 focus:border-primary-500 focus:outline-none bg-gray-100 dark:bg-gray-700"
                        :class="state.coverUrl === item.url ? 'border-primary-500 ring-2 ring-primary-300' : 'border-gray-200 dark:border-gray-600'"
                        @click="state.coverUrl = item.url"
                      >
                        <span class="block w-full pt-[150%]" />
                        <img
                          :src="item.displayUrl"
                          :alt="item.label ?? 'Couverture'"
                          class="absolute inset-0 w-full h-full object-cover"
                        >
                      </button>
                    </div>
                  </div>
                  <p
                    v-if="manualCoverError"
                    class="text-xs text-amber-600 dark:text-amber-400 mb-2"
                  >
                    {{ manualCoverError }}
                  </p>

                  <UInput
                    id="imageUrl"
                    v-model="state.coverUrl"
                    type="url"
                    :disabled="submitting"
                    class="w-full input-touch"
                    placeholder="https://... (ou choisir ci-dessus)"
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
                @click="goToNextStep"
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
  (e: 'success', addedBook?: { id?: number, documentId?: string }): void
}

const props = withDefaults(defineProps<Props>(), {
  book: null
})

const emit = defineEmits<Emits>()

const editingBook = computed(() => props.book !== null && props.book !== undefined)

/** Libellés des 3 étapes du formulaire (modification ou saisie manuelle) */
const manualFormStepLabels = ['Infos principales', 'Année et pages', 'Description et image']

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

// Mode d'affichage (recherche, prévisualisation ou formulaire manuel)
const showManualForm = ref(false)
const showPreview = ref(false)
const manualFormStep = ref(1)
const previewBook = ref<BookSearchResult | null>(null)

// Recherche Open Library
const searchQuery = ref('')
const searching = ref(false)
const searchResults = ref<any[]>([])
const searchError = ref<string | null>(null)
const loadingDetails = ref(false)
const hasSearched = ref(false)

// Propositions de couverture pour le formulaire manuel
const manualCoverSuggestions = ref<Array<{ url: string, displayUrl: string, label?: string }>>([])
const loadingManualCovers = ref(false)
const manualCoverError = ref<string | null>(null)

interface GoogleBooksBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
    description?: string
    pageCount?: number
    categories?: string[]
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
      small?: string
      medium?: string
      large?: string
      extraLarge?: string
    }
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    publisher?: string
  }
}

interface BookSearchResult {
  id: string
  title: string
  author_name?: string
  first_publish_year?: number
  isbn?: string
  cover_url: string | null
  publisher?: string
  description?: string
  number_of_pages?: number
  subjects?: string[]
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

// Recherche avec Google Books API
const searchBooks = async () => {
  if (!searchQuery.value.trim()) {
    return
  }

  searching.value = true
  searchError.value = null
  searchResults.value = []
  hasSearched.value = true

  try {
    const response = await $fetch<{ items?: GoogleBooksBook[], totalItems?: number }>(
      `https://www.googleapis.com/books/v1/volumes`,
      {
        params: {
          q: searchQuery.value.trim(),
          maxResults: 20,
          printType: 'books',
          langRestrict: 'fr'
        }
      }
    )

    if (response?.items) {
      // Transformer les résultats Google Books vers notre format
      searchResults.value = response.items.map((item: GoogleBooksBook) => {
        const volumeInfo = item.volumeInfo

        // Extraire l'ISBN (priorité ISBN-13, puis ISBN-10)
        const isbn13 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier
        const isbn10 = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier
        const isbn = isbn13 || isbn10

        // Extraire l'année de publication
        const year = volumeInfo.publishedDate
          ? parseInt(volumeInfo.publishedDate.split('-')[0], 10)
          : undefined

        // Convertir les URLs d'images en HTTPS et améliorer la résolution
        const thumbnail = volumeInfo.imageLinks?.thumbnail
        const coverUrl = thumbnail
          ? thumbnail.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
          : null

        return {
          id: item.id,
          title: volumeInfo.title,
          author_name: volumeInfo.authors?.join(', '),
          first_publish_year: year,
          isbn,
          cover_url: coverUrl,
          publisher: volumeInfo.publisher,
          description: volumeInfo.description,
          number_of_pages: volumeInfo.pageCount,
          subjects: volumeInfo.categories
        }
      })

      if (response.items.length === 0) {
        searchError.value = 'Aucun livre trouvé pour cette recherche.'
      }
    } else {
      searchError.value = 'Erreur lors de la recherche.'
    }
  } catch (err: unknown) {
    console.error('Erreur lors de la recherche Google Books:', err)
    searchError.value = err instanceof Error ? err.message : 'Erreur lors de la recherche'
  } finally {
    searching.value = false
  }
}

const selectBook = async (book: BookSearchResult) => {
  loadingDetails.value = true
  previewBook.value = null

  try {
    // Avec Google Books, on a déjà toutes les informations dans le résultat de recherche
    // Pas besoin d'appel supplémentaire pour les détails
    previewBook.value = book
    showPreview.value = true
  } catch (err) {
    console.error('Erreur lors du chargement des détails:', err)
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
      isbn: previewBook.value.isbn?.trim() || undefined,
      annee: previewBook.value.first_publish_year || undefined,
      description: previewBook.value.description?.trim() || undefined,
      image_url: previewBook.value.cover_url || undefined,
      editeur: previewBook.value.publisher?.trim() || undefined,
      nombre_pages: previewBook.value.number_of_pages || undefined,
      sujets: previewBook.value.subjects || undefined
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
  hasSearched.value = false
  manualCoverSuggestions.value = []
  loadingManualCovers.value = false
  manualCoverError.value = null
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

/** Valide uniquement les champs de l'étape donnée */
function validateStep(step: number): boolean {
  if (step === 1) {
    if (!state.title.trim()) {
      errors.title = 'Le titre est requis'
      return false
    }
    errors.title = ''
  }
  return true
}

/** Vérifie si on peut passer à l'étape cible */
function canGoToStep(target: number): boolean {
  if (target <= manualFormStep.value) return true
  for (let s = manualFormStep.value; s < target; s++) {
    if (!validateStep(s)) return false
  }
  return true
}

function goToNextStep() {
  if (validateStep(manualFormStep.value)) {
    manualFormStep.value++
  }
}

function goToStep(target: number) {
  if (canGoToStep(target)) {
    manualFormStep.value = target
  }
}

// Rechercher une couverture sur Google Books API
async function searchCoverForBook(title: string, author?: string, isbn?: string): Promise<string | null> {
  try {
    let searchQuery = ''

    if (isbn?.trim()) {
      // Recherche par ISBN (le plus précis)
      searchQuery = `isbn:${isbn.trim()}`
    } else if (title?.trim()) {
      // Recherche par titre + auteur
      searchQuery = title.trim()
      if (author?.trim()) {
        searchQuery += ` ${author.trim()}`
      }
    } else {
      return null
    }

    const response = await $fetch<{ items?: GoogleBooksBook[], totalItems?: number }>(
      `https://www.googleapis.com/books/v1/volumes`,
      {
        params: {
          q: searchQuery,
          maxResults: 1,
          printType: 'books',
          langRestrict: 'fr'
        }
      }
    )

    if (response?.items && response.items.length > 0) {
      const volumeInfo = response.items[0].volumeInfo
      const thumbnail = volumeInfo.imageLinks?.thumbnail
      if (thumbnail) {
        return thumbnail.replace('http://', 'https://').replace('zoom=1', 'zoom=2')
      }
    }
  } catch (err) {
    console.error('Erreur lors de la recherche de couverture:', err)
  }
  
  return null
}

/** URL de couverture Google Books (petite = vignette, grande = haute résolution) */
function getManualCoverUrls(imageLinks: GoogleBooksBook['volumeInfo']['imageLinks']): { url: string, displayUrl: string } | null {
  if (!imageLinks) return null
  const toHttps = (u: string) => u.replace('http://', 'https://')
  const large = imageLinks.extraLarge || imageLinks.large || imageLinks.medium
    || (imageLinks.thumbnail ? toHttps(imageLinks.thumbnail.replace('zoom=1', 'zoom=3')) : null)
  const small = imageLinks.smallThumbnail || imageLinks.thumbnail
  if (large && small) {
    return { url: toHttps(large.startsWith('http') ? large : `https:${large}`), displayUrl: toHttps(small.startsWith('http') ? small : `https:${small}`) }
  }
  if (imageLinks.thumbnail) {
    const t = toHttps(imageLinks.thumbnail)
    return { url: t.replace('zoom=1', 'zoom=3'), displayUrl: t }
  }
  return null
}

/** Charge les propositions de couverture pour le formulaire manuel (étape 3) */
async function loadManualCoverSuggestions() {
  const title = state.title?.trim()
  const author = state.author?.trim()
  const isbn = state.isbn?.trim()

  let searchQuery = ''
  if (isbn) {
    searchQuery = `isbn:${isbn}`
  } else if (title) {
    searchQuery = author ? `${title}+inauthor:${author}` : title
  } else {
    manualCoverError.value = 'Saisissez au moins le titre (ou l\'ISBN) pour rechercher des couvertures.'
    return
  }

  loadingManualCovers.value = true
  manualCoverError.value = null
  manualCoverSuggestions.value = []

  try {
    const res = await $fetch<{ items?: GoogleBooksBook[], totalItems?: number }>(
      'https://www.googleapis.com/books/v1/volumes',
      { params: { q: searchQuery, maxResults: 20, printType: 'books' } }
    )
    const items = res?.items ?? []
    const seen = new Set<string>()
    const list: Array<{ url: string, displayUrl: string, label?: string }> = []

    for (const item of items) {
      const urls = getManualCoverUrls(item.volumeInfo?.imageLinks)
      if (!urls || seen.has(urls.url)) continue
      seen.add(urls.url)
      let label: string | undefined
      const pub = item.volumeInfo?.publishedDate
      if (pub) label = `Éd. ${pub.split('-')[0]}`
      list.push({ url: urls.url, displayUrl: urls.displayUrl, label })
    }

    manualCoverSuggestions.value = list
    if (list.length === 0) {
      manualCoverError.value = 'Aucune couverture trouvée pour ce livre.'
    }
  } catch (err) {
    console.error('Erreur chargement couvertures manuelles:', err)
    manualCoverError.value = err instanceof Error ? err.message : 'Erreur lors du chargement des propositions.'
  } finally {
    loadingManualCovers.value = false
  }
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
    const config = useRuntimeConfig()

    let imageToUse = state.coverUrl?.trim() || null

    // Si pas de couverture fournie, rechercher automatiquement sur Google Books
    if (!imageToUse && !editingBook.value) {
      const foundCover = await searchCoverForBook(state.title, state.author, state.isbn)
      if (foundCover) {
        imageToUse = foundCover
      }
    }

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
        image_url: state.coverUrl?.trim() || undefined,
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
