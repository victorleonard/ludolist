<template>
  <div class="space-y-4 sm:space-y-6 py-4 sm:py-6">
    <div v-if="members.length > 0">
      <!-- Statistiques en haut -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <UCard class="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-800 p-3 sm:p-4">
          <div class="flex flex-col items-center text-center">
            <div class="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {{ ratedMembersCount }}
            </div>
            <div class="text-xs sm:text-sm text-primary-700 dark:text-primary-300">
              {{ ratedMembersCount === 1 ? 'Membre a noté' : 'Membres ont noté' }}
            </div>
          </div>
        </UCard>
        <UCard class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 p-3 sm:p-4">
          <div class="flex flex-col items-center text-center">
            <div class="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {{ averageRating > 0 ? averageRating.toFixed(1) : '-' }}
            </div>
            <div class="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">
              Note moyenne
            </div>
          </div>
        </UCard>
      </div>

      <!-- Membres avec notes -->
      <div
        v-if="membersWithRatings.length > 0"
        class="space-y-3 sm:space-y-4 mb-4 sm:mb-6"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2 sm:mb-3 px-1">
          Notes des membres
        </h3>
        <UCard
          v-for="member in membersWithRatings"
          :key="member.id"
          class="bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md p-4 sm:p-5"
        >
          <div class="flex items-start gap-3 sm:gap-4">
            <MemberAvatar
              :member="member"
              size="md"
              class="shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <span class="font-semibold text-gray-900 dark:text-gray-100">{{ member.username }}</span>
                  <div
                    v-if="getMemberRating(member.id) > 0"
                    class="flex items-center gap-2 mt-1"
                  >
                    <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
                      {{ getMemberRating(member.id) }}
                    </span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                      / {{ maxStars }}
                    </span>
                  </div>
                </div>
                <UButton
                  v-if="getMemberRating(member.id) > 0"
                  color="red"
                  variant="ghost"
                  icon="i-ion-trash"
                  size="sm"
                  class="shrink-0"
                  @click="handleDeleteRating(member.id)"
                >
                  <span class="sr-only">Supprimer la note</span>
                </UButton>
              </div>
              <div class="flex items-center gap-3">
                <StarRating
                  :model-value="getMemberRating(member.id)"
                  :max="maxStars"
                  size="lg"
                  @update:model-value="(rating) => setMemberRating(member.id, rating)"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Membres sans notes -->
      <div
        v-if="membersWithoutRatings.length > 0"
        class="space-y-3 sm:space-y-4"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 sm:mb-3 px-1">
          Pas encore noté
        </h3>
        <UCard
          v-for="member in membersWithoutRatings"
          :key="member.id"
          class="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 p-4 sm:p-5"
        >
          <div class="flex items-start gap-3 sm:gap-4">
            <MemberAvatar
              :member="member"
              size="md"
              class="flex-shrink-0 opacity-75"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-3">
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ member.username }}</span>
              </div>
              <div class="flex items-center gap-3">
                <StarRating
                  :model-value="0"
                  :max="maxStars"
                  size="lg"
                  @update:model-value="(rating) => setMemberRating(member.id, rating)"
                />
                <span class="text-xs text-gray-500 dark:text-gray-500 italic">
                  Cliquez pour noter
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Note moyenne détaillée -->
      <UCard
        v-if="averageRating > 0"
        class="mt-4 sm:mt-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-primary-200 dark:border-primary-800 p-4 sm:p-5"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="p-2 sm:p-3 rounded-full bg-primary-100 dark:bg-primary-900/50">
              <UIcon
                name="i-ion-stats-chart"
                class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400"
              />
            </div>
            <div>
              <span class="block text-xs sm:text-sm font-medium text-primary-700 dark:text-primary-300">
                Note moyenne
              </span>
              <span class="block text-xs text-primary-600 dark:text-primary-400">
                Basée sur {{ ratedMembersCount }} {{ ratedMembersCount === 1 ? 'note' : 'notes' }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-3 sm:gap-4">
            <StarRating
              :model-value="averageRating"
              :max="maxStars"
              size="lg"
              readonly
            />
            <div class="text-right">
              <div class="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                {{ averageRating.toFixed(1) }}
              </div>
              <div class="text-xs sm:text-sm text-primary-500 dark:text-primary-500">
                / {{ maxStars }}
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div
      v-else
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-ion-people"
        class="w-16 h-16 mx-auto mb-4 opacity-50"
      />
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Member {
  id: number
  username: string
  birthdate?: string
  avatar?: string
}

interface Props {
  members: Member[]
  getMemberRating: (memberId: number) => number
  setMemberRating: (memberId: number, rating: number) => void
  averageRating: number
  maxStars?: number
  emptyMessage?: string
}

const props = withDefaults(
  defineProps<Props>(),
  {
    maxStars: 5,
    emptyMessage: 'Aucun membre dans la famille',
  },
)

// Séparer les membres avec et sans notes
const membersWithRatings = computed(() => {
  return props.members
    .filter(member => props.getMemberRating(member.id) > 0)
    .sort((a, b) => props.getMemberRating(b.id) - props.getMemberRating(a.id))
})

const membersWithoutRatings = computed(() => {
  return props.members.filter(member => props.getMemberRating(member.id) === 0)
})

const ratedMembersCount = computed(() => {
  return membersWithRatings.value.length
})

// Gestion de la suppression avec confirmation
const handleDeleteRating = (memberId: number) => {
  if (confirm('Voulez-vous vraiment supprimer cette note ?')) {
    props.setMemberRating(memberId, 0)
  }
}
</script>
