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
          name="i-ion-alert-circle"
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
        class="space-y-4 sm:space-y-6"
      >
        <!-- Titre -->
        <h1 class="text-xl sm:text-2xl font-bold break-words min-w-0 mb-3 sm:mb-4">
          {{ jeu.titre }}
        </h1>

        <!-- Navigation par segments -->
        <div class="mb-2 sm:mb-4">
          <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 sm:p-1.5 w-full gap-1">
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'detail'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'detail'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-information-circle"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Détail</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'notes'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'notes'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-star"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Notes</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'parties'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'parties'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-game-controller"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Parties</span>
              </div>
            </button>
            <button
              :class="[
                'flex-1 px-2 sm:px-4 py-3 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
                activeTab === 'podium'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              ]"
              @click="activeTab = 'podium'"
            >
              <div class="flex flex-col items-center justify-center gap-1 sm:gap-1.5 sm:flex-row">
                <UIcon
                  name="i-ion-trophy"
                  class="w-5 h-5 sm:w-4 sm:h-4"
                />
                <span class="text-[10px] sm:text-xs leading-tight">Podium</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Contenu des sections -->
        <div class="w-full">
          <!-- Section Détail -->
          <div
            v-show="activeTab === 'detail'"
            class="space-y-4 sm:space-y-6 py-2 sm:py-6"
          >
            <!-- Card avec image et infos synthétiques -->
            <UCard class="bg-white dark:bg-gray-800 overflow-hidden">
              <div class="flex flex-col md:flex-row md:gap-6">
                <!-- Image du jeu -->
                <div class="w-full md:w-1/3 md:max-w-xs md:flex-shrink-0">
                  <div class="w-full aspect-square md:aspect-auto md:h-auto max-h-[400px] md:max-h-none flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg overflow-hidden">
                    <img
                      v-if="jeu && jeu.image"
                      :src="jeu.image"
                      :alt="jeu.titre || 'Image du jeu'"
                      class="w-full h-full object-contain p-2 sm:p-4 md:p-6"
                    >
                    <div
                      v-else
                      class="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8"
                    >
                      <UIcon
                        name="i-ion-game-controller"
                        class="w-20 h-20 sm:w-24 sm:h-24 mb-3 opacity-50"
                      />
                      <span class="text-sm text-center font-medium">Aucune image</span>
                    </div>
                  </div>
                </div>

                <!-- Informations du jeu -->
                <div class="space-y-3 mt-3 md:mt-0 md:flex-1 md:flex md:flex-col md:justify-between">
                  <div class="space-y-3">
                    <div class="flex flex-wrap gap-2 sm:gap-3">
                      <UBadge
                        color="neutral"
                        variant="subtle"
                        size="md"
                        class="px-3 py-1.5 text-gray-800 dark:text-gray-200"
                      >
                        <div class="flex items-center gap-1.5">
                          <UIcon
                            name="i-ion-person"
                            class="w-4 h-4"
                          />
                          <span>{{ jeu.age_min }}{{ jeu.age_max ? `-${jeu.age_max}` : '+' }} ans</span>
                        </div>
                      </UBadge>
                      <UBadge
                        v-for="tag in jeu.tags"
                        :key="tag"
                        :color="tag.includes('joueurs') ? 'info' : tag.includes('min') ? 'warning' : 'primary'"
                        variant="subtle"
                        size="md"
                        class="px-3 py-1.5"
                        :class="tag.includes('joueurs') ? 'text-blue-800 dark:text-blue-200' : tag.includes('min') ? 'text-orange-800 dark:text-orange-200' : 'text-primary-800 dark:text-primary-200'"
                      >
                        <div class="flex items-center gap-1.5">
                          <UIcon
                            v-if="tag.includes('joueurs')"
                            name="i-ion-people"
                            class="w-4 h-4"
                          />
                          <UIcon
                            v-else-if="tag.includes('min')"
                            name="i-ion-time"
                            class="w-4 h-4"
                          />
                          <UIcon
                            v-else
                            name="i-ion-information-circle"
                            class="w-4 h-4"
                          />
                          <span>{{ tag }}</span>
                        </div>
                      </UBadge>
                    </div>

                    <!-- Propriétaire -->
                    <div class="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <UIcon
                        name="i-ion-person-circle"
                        class="w-4 h-4 text-gray-500"
                      />
                      <span class="font-medium">Propriétaire :</span>
                      <span v-if="jeu?.owner">{{ jeu.owner.username }}</span>
                      <span
                        v-else
                        class="text-gray-400 italic"
                      >
                        Non défini
                      </span>
                      <UButton
                        v-if="!memberStore.isMemberConnected"
                        color="primary"
                        variant="ghost"
                        size="xs"
                        icon="i-ion-swap-horizontal"
                        @click="openChangeOwnerModal"
                      >
                        Changer
                      </UButton>
                    </div>
                  </div>

                  <!-- Bouton Modifier en bas -->
                  <div class="pt-4 md:pt-6">
                    <UButton
                      color="primary"
                      variant="outline"
                      icon="i-ion-create-outline"
                      size="md"
                      class="w-full min-h-[44px] sm:min-h-0 md:w-auto md:min-w-[200px]"
                      @click="openEditModal"
                    >
                      Modifier les détails
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Section Notes -->
          <div
            v-show="activeTab === 'notes'"
            class="py-2 sm:py-6"
          >
            <MemberRatingsTab
              :members="familyMembers"
              :get-member-rating="getMemberRating"
              :set-member-rating="setMemberRating"
              :average-rating="averageRating"
              :max-stars="10"
            />
          </div>

          <!-- Section Parties -->
          <div
            v-show="activeTab === 'parties'"
            class="space-y-3 sm:space-y-4 py-2 sm:py-6"
          >
            <!-- Liste des parties -->
            <GameSessions
              v-if="gameId"
              :game-id="gameId"
            />
          </div>

          <!-- Section Podium -->
          <div
            v-show="activeTab === 'podium'"
            class="space-y-4 sm:space-y-6 py-2 sm:py-6"
          >
            <!-- Podium des top 3 -->
            <UCard
              v-if="top3Winners.length > 0"
              class="bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-yellow-900/20 mb-6 overflow-hidden min-h-[350px] flex flex-col relative"
            >
              <!-- Effets de confettis décoratifs -->
              <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60" />
                <div class="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-pulse opacity-60" style="animation-delay: 0.5s;" />
                <div class="absolute bottom-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style="animation-delay: 1s;" />
                <div class="absolute bottom-10 right-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" style="animation-delay: 1.5s;" />
              </div>

              <div class="flex items-end justify-center gap-3 px-4 pt-6 pb-4 mt-auto relative z-10">
                <!-- 2ème place -->
                <div
                  v-if="top3Winners[1]"
                  class="flex flex-col items-center flex-1 max-w-[120px]"
                >
                  <div
                    class="mb-3 relative"
                    style="min-height: 80px;"
                  >
                    <Transition
                      name="slide-up"
                      appear
                    >
                      <div
                        v-if="showSecond"
                        class="relative"
                      >
                        <div class="absolute -inset-2 bg-gradient-to-br from-slate-300 to-slate-500 rounded-full blur-md opacity-50 animate-pulse" />
                        <MemberAvatar
                          :member="top3Winners[1].member"
                          size="xl"
                          class="relative z-10 ring-4 ring-slate-300 dark:ring-slate-600"
                        />
                      </div>
                    </Transition>
                  </div>
                  <div
                    class="w-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700 dark:via-slate-600 dark:to-slate-500 rounded-t-lg p-3 text-center relative shadow-lg border-2 border-slate-400 dark:border-slate-500"
                    style="height: 90px;"
                  >
                    <div class="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <span class="text-3xl animate-bounce" style="animation-duration: 2s;">🥈</span>
                    </div>
                    <Transition
                      name="fade"
                      appear
                    >
                      <div
                        v-if="showSecond"
                        class="flex flex-col items-center justify-center h-full pt-2"
                      >
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">2ème</span>
                        <span class="text-xs font-bold text-slate-900 dark:text-slate-50 truncate w-full">
                          {{ top3Winners[1].member.username }}
                        </span>
                        <span class="text-xs text-slate-700 dark:text-slate-200 mt-1 font-semibold">
                          {{ top3Winners[1].wins }} {{ top3Winners[1].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- 1ère place -->
                <div
                  v-if="top3Winners[0]"
                  class="flex flex-col items-center flex-1 max-w-[140px]"
                >
                  <div
                    class="mb-3 relative"
                    style="min-height: 100px;"
                  >
                    <Transition
                      name="slide-up"
                      appear
                    >
                      <div
                        v-if="showFirst"
                        class="relative"
                      >
                        <!-- Effet de couronne/auréole -->
                        <div class="absolute -inset-3 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-full blur-lg opacity-70 animate-pulse" />
                        <div class="absolute -inset-1 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full opacity-50" />
                        <MemberAvatar
                          :member="top3Winners[0].member"
                          size="2xl"
                          class="relative z-10 ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-2xl"
                        />
                        <!-- Étoiles autour du gagnant -->
                        <div class="absolute -top-2 -left-2 text-yellow-400 animate-ping" style="animation-duration: 2s;">
                          <UIcon name="i-ion-star" class="w-4 h-4" />
                        </div>
                        <div class="absolute -top-2 -right-2 text-yellow-400 animate-ping" style="animation-duration: 2.5s; animation-delay: 0.5s;">
                          <UIcon name="i-ion-star" class="w-4 h-4" />
                        </div>
                        <div class="absolute -bottom-2 -left-2 text-yellow-400 animate-ping" style="animation-duration: 2.2s; animation-delay: 1s;">
                          <UIcon name="i-ion-star" class="w-4 h-4" />
                        </div>
                        <div class="absolute -bottom-2 -right-2 text-yellow-400 animate-ping" style="animation-duration: 2.3s; animation-delay: 1.5s;">
                          <UIcon name="i-ion-star" class="w-4 h-4" />
                        </div>
                      </div>
                    </Transition>
                  </div>
                  <div
                    class="w-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-800 rounded-t-lg p-4 text-center border-4 border-yellow-400 dark:border-yellow-500 relative shadow-2xl"
                    style="height: 120px;"
                  >
                    <!-- Effet de brillance animé -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-t-lg" />
                    <div class="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <UIcon
                        name="i-ion-trophy"
                        class="w-8 h-8 text-yellow-600 dark:text-yellow-300 animate-bounce"
                        style="animation-duration: 2s; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"
                      />
                    </div>
                    <Transition
                      name="fade"
                      appear
                    >
                      <div
                        v-if="showFirst"
                        class="flex flex-col items-center justify-center h-full pt-2 relative z-10"
                      >
                        <span class="text-sm font-bold text-yellow-900 dark:text-yellow-50 mb-1 drop-shadow-sm">1er</span>
                        <span class="text-base font-bold text-yellow-950 dark:text-yellow-50 truncate w-full drop-shadow-sm">
                          {{ top3Winners[0].member.username }}
                        </span>
                        <span class="text-xs text-yellow-800 dark:text-yellow-100 mt-1 font-semibold drop-shadow-sm">
                          {{ top3Winners[0].wins }} {{ top3Winners[0].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- 3ème place -->
                <div
                  v-if="top3Winners[2]"
                  class="flex flex-col items-center flex-1 max-w-[120px]"
                >
                  <div
                    class="mb-3 relative"
                    style="min-height: 80px;"
                  >
                    <Transition
                      name="slide-up"
                      appear
                    >
                      <div
                        v-if="showThird"
                        class="relative"
                      >
                        <div class="absolute -inset-2 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full blur-md opacity-50 animate-pulse" />
                        <MemberAvatar
                          :member="top3Winners[2].member"
                          size="xl"
                          class="relative z-10 ring-4 ring-amber-400 dark:ring-amber-600"
                        />
                      </div>
                    </Transition>
                  </div>
                  <div
                    class="w-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 dark:from-amber-700 dark:via-amber-800 dark:to-amber-900 rounded-t-lg p-3 text-center relative shadow-lg border-2 border-amber-400 dark:border-amber-600"
                    style="height: 80px;"
                  >
                    <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span class="text-3xl animate-bounce" style="animation-duration: 2.2s;">🥉</span>
                    </div>
                    <Transition
                      name="fade"
                      appear
                    >
                      <div
                        v-if="showThird"
                        class="flex flex-col items-center justify-center h-full pt-2"
                      >
                        <span class="text-xs font-bold text-amber-900 dark:text-amber-50 mb-0.5">3ème</span>
                        <span class="text-sm font-bold text-amber-950 dark:text-amber-50 truncate w-full leading-tight">
                          {{ top3Winners[2].member.username }}
                        </span>
                        <span class="text-xs text-amber-800 dark:text-amber-100 mt-0.5 font-semibold">
                          {{ top3Winners[2].wins }} {{ top3Winners[2].wins > 1 ? 'victoires' : 'victoire' }}
                        </span>
                      </div>
                    </Transition>
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
                name="i-ion-trophy"
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
        </div>
      </div>
    </div>

    <!-- Modal de modification -->
    <AddGameModal
      v-model="isModalOpen"
      :game="jeu"
      @success="handleGameUpdated"
    />

    <!-- Modal pour changer le propriétaire -->
    <UModal
      :open="isChangeOwnerModalOpen"
      :ui="{ width: 'max-w-md' }"
      @update:open="(value) => { isChangeOwnerModalOpen = value }"
    >
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Changer le propriétaire
              </h3>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ion-close"
                size="sm"
                @click="isChangeOwnerModalOpen = false"
              />
            </div>
          </template>
          <div class="space-y-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez le nouveau propriétaire de ce jeu :
            </p>

            <div class="space-y-2">
              <!-- Option Famille (pas de propriétaire) -->
              <button
                type="button"
                class="w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:border-primary-500 focus:border-primary-500 focus:outline-none"
                :class="selectedNewOwnerId === null ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
                @click="selectedNewOwnerId = null"
              >
                <div class="rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 w-10 h-10 shrink-0">
                  <UIcon
                    name="i-ion-people"
                    class="w-5 h-5 text-gray-600 dark:text-gray-300"
                  />
                </div>
                <span class="font-medium">Famille</span>
                <UIcon
                  v-if="selectedNewOwnerId === null"
                  name="i-ion-checkmark-circle"
                  class="w-5 h-5 text-primary-500 ml-auto"
                />
              </button>

              <!-- Membres individuels -->
              <button
                v-for="member in familyStore.familyMembers"
                :key="member.id"
                type="button"
                class="w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:border-primary-500 focus:border-primary-500 focus:outline-none"
                :class="selectedNewOwnerId === member.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'"
                @click="selectedNewOwnerId = member.id"
              >
                <MemberAvatar
                  :member="member"
                  size="sm"
                />
                <span class="font-medium">{{ member.username }}</span>
                <UIcon
                  v-if="selectedNewOwnerId === member.id"
                  name="i-ion-checkmark-circle"
                  class="w-5 h-5 text-primary-500 ml-auto"
                />
              </button>
            </div>

            <p
              v-if="changeOwnerError"
              class="text-sm text-red-600 dark:text-red-400"
            >
              {{ changeOwnerError }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="isChangeOwnerModalOpen = false"
              >
                Annuler
              </UButton>
              <UButton
                color="primary"
                :loading="changingOwner"
                :disabled="selectedNewOwnerId === jeu?.owner?.id || (selectedNewOwnerId === null && !jeu?.owner)"
                @click="changeOwner"
              >
                Changer le propriétaire
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
import { useFamilyStore, type Rating } from '~/stores/family'
import { useMemberStore } from '~/stores/member'
import GameSessions from '~/components/GameSessions.vue'
import MemberAvatar from '~/components/MemberAvatar.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const familyStore = useFamilyStore()
const memberStore = useMemberStore()

const isModalOpen = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const top3Winners = ref<Array<{ member: { id: number, username: string }, wins: number }>>([])
const activeTab = ref<'detail' | 'notes' | 'parties' | 'podium'>('detail')

// États pour l'animation du podium
const showThird = ref(false)
const showSecond = ref(false)
const showFirst = ref(false)

// Récupérer l'identifiant depuis la route (peut être documentId ou id)
const gameIdentifier = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

// Trouver le jeu dans le store par documentId en priorité, sinon par id
const jeu = computed(() => {
  if (!gameIdentifier.value) return null
  // Chercher d'abord par documentId (string)
  const gameByDocumentId = familyStore.transformedGames.find(g => g.documentId === gameIdentifier.value)
  if (gameByDocumentId) return gameByDocumentId
  // Fallback sur id numérique si documentId ne correspond pas
  const numericId = parseInt(gameIdentifier.value, 10)
  if (!isNaN(numericId)) {
    return familyStore.transformedGames.find(g => g.id === numericId)
  }
  return null
})

// Récupérer l'id numérique du jeu pour les appels API (fallback sur documentId si pas d'id)
const gameId = computed(() => {
  return jeu.value?.id || null
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
      // Si l'onglet podium est actif, démarrer l'animation
      if (activeTab.value === 'podium' && top3Winners.value.length > 0) {
        await nextTick()
        startPodiumAnimation()
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement du jeu:', err)
    error.value = 'Erreur lors du chargement du jeu'
  } finally {
    loading.value = false
  }
})

// Recharger les top 3 gagnants quand le jeu change
watch(jeu, () => {
  if (jeu.value && gameId.value) {
    loadTop3Winners()
  }
})

// Fonction pour démarrer l'animation du podium
const startPodiumAnimation = () => {
  // Réinitialiser les états
  showThird.value = false
  showSecond.value = false
  showFirst.value = false

  // Attendre un peu pour que le podium vide soit visible
  setTimeout(() => {
    // Animer le 3ème
    if (top3Winners.value[2]) {
      showThird.value = true
    }

    // Animer le 2ème après un délai
    setTimeout(() => {
      if (top3Winners.value[1]) {
        showSecond.value = true
      }

      // Animer le 1er après un autre délai
      setTimeout(() => {
        if (top3Winners.value[0]) {
          showFirst.value = true
        }
      }, 1200)
    }, 1200)
  }, 800)
}

// Watcher pour déclencher l'animation quand on change d'onglet vers podium
watch(activeTab, (newTab) => {
  if (newTab === 'podium' && top3Winners.value.length > 0) {
    startPodiumAnimation()
  }
})

// Watcher pour déclencher l'animation quand les données changent
watch(top3Winners, (newWinners) => {
  if (activeTab.value === 'podium' && newWinners.length > 0) {
    startPodiumAnimation()
  }
}, { deep: true })

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

// Changement de propriétaire
const isChangeOwnerModalOpen = ref(false)
const selectedNewOwnerId = ref<number | null>(null)
const changingOwner = ref(false)
const changeOwnerError = ref<string | null>(null)

const openChangeOwnerModal = () => {
  selectedNewOwnerId.value = jeu.value?.owner?.id || null
  changeOwnerError.value = null
  isChangeOwnerModalOpen.value = true
}

const changeOwner = async () => {
  if (!jeu.value) return

  changingOwner.value = true
  changeOwnerError.value = null

  try {
    // Utiliser documentId en priorité pour les jeux
    const gameIdentifier = jeu.value.documentId || jeu.value.id
    if (!gameIdentifier) {
      changeOwnerError.value = 'Impossible de déterminer l\'identifiant du jeu'
      return
    }
    const result = await familyStore.changeGameOwner(
      gameIdentifier,
      selectedNewOwnerId.value
    )

    if (result.success) {
      // Recharger la famille pour mettre à jour le jeu avec le nouveau propriétaire
      await familyStore.fetchFamily()
      // Attendre un tick pour que le computed se mette à jour
      await nextTick()
      // Vérifier que le jeu a bien été mis à jour
      if (jeu.value) {
        // Le jeu a été mis à jour, fermer le modal
        isChangeOwnerModalOpen.value = false
        selectedNewOwnerId.value = null
      } else {
        // Le jeu n'a pas été trouvé après le rechargement
        changeOwnerError.value = 'Le jeu n\'a pas pu être rechargé. Veuillez rafraîchir la page.'
      }
    } else {
      changeOwnerError.value = result.error || 'Erreur lors du changement de propriétaire'
    }
  } catch (err) {
    changeOwnerError.value = err instanceof Error ? err.message : 'Erreur lors du changement de propriétaire'
  } finally {
    changingOwner.value = false
  }
}
</script>

<style scoped>
/* Animation slide-up pour les avatars */
.slide-up-enter-active {
  transition: all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(50px) scale(0.8) rotate(-5deg);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1) rotate(0deg);
}

/* Animation fade pour les informations */
.fade-enter-active {
  transition: opacity 1.5s ease-out;
}

.fade-enter-from {
  opacity: 0;
}

.fade-enter-to {
  opacity: 1;
}

/* Animation de brillance pour le podium */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s infinite;
}
</style>
