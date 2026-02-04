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
        class="space-y-2 sm:space-y-3 mb-3 sm:mb-4"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5 sm:mb-2 px-1">
          Notes des membres
        </h3>
        <UCard
          v-for="member in membersWithRatings"
          :key="member.id"
          :data-member-id="member.id"
          class="bg-white dark:bg-gray-800 transition-all duration-200 hover:shadow-md p-3 sm:p-4 overflow-x-visible"
        >
          <div class="flex items-start gap-2 sm:gap-3">
            <MemberAvatar
              :member="member"
              size="md"
              class="shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-900 dark:text-gray-100">{{ member.username }}</span>
              </div>
              <div class="w-full" @click="handleRatingAreaClick">
                <RatingDisplay10
                  v-if="maxStars === 10"
                  :ref="(el) => setRatingRef(member.id, el)"
                  :model-value="getMemberRating(member.id)"
                  @update:model-value="(rating) => setMemberRating(member.id, rating)"
                />
                <StarRating
                  v-else
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
        class="space-y-2 sm:space-y-3"
      >
        <h3 class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 sm:mb-2 px-1">
          Pas encore noté
        </h3>
        <UCard
          v-for="member in membersWithoutRatings"
          :key="member.id"
          :data-member-id="member.id"
          class="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-900 p-3 sm:p-4 overflow-x-visible"
        >
          <div class="flex items-start gap-2 sm:gap-3">
            <MemberAvatar
              :member="member"
              size="md"
              class="shrink-0 opacity-75"
            />
            <div class="flex-1 min-w-0">
              <div class="mb-1">
                <span class="font-medium text-gray-600 dark:text-gray-400">{{ member.username }}</span>
              </div>
              <div class="w-full">
                <RatingDisplay10
                  v-if="maxStars === 10"
                  :model-value="0"
                  @update:model-value="(rating) => setMemberRating(member.id, rating)"
                />
                <div v-else class="flex items-center gap-2">
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
          </div>
        </UCard>
      </div>

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
import { computed, ref } from 'vue'

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

// Références aux composants RatingDisplay10
const ratingRefs = ref<Record<number, { openDrawer: () => void } | null>>({})

const setRatingRef = (memberId: number, el: any) => {
  if (el) {
    ratingRefs.value[memberId] = el
  } else {
    delete ratingRefs.value[memberId]
  }
}

// Gestion du clic sur la zone de notation pour ouvrir le drawer
const handleRatingAreaClick = (event: MouseEvent) => {
  // Ne pas ouvrir si on clique directement sur un bouton
  const target = event.target as HTMLElement
  if (target.closest('button')) {
    return
  }
  
  // Trouver le membre correspondant en remontant dans le DOM
  const card = target.closest('[data-member-id]') as HTMLElement
  if (!card) return
  
  const memberId = parseInt(card.getAttribute('data-member-id') || '0', 10)
  if (!memberId) return
  
  // Ouvrir le drawer uniquement sur mobile et si maxStars === 10
  if (props.maxStars === 10 && typeof window !== 'undefined' && window.innerWidth < 640) {
    const ratingRef = ratingRefs.value[memberId]
    if (ratingRef && typeof ratingRef.openDrawer === 'function') {
      ratingRef.openDrawer()
    }
  }
}

// Gestion de la suppression avec confirmation
const handleDeleteRating = (memberId: number) => {
  if (confirm('Voulez-vous vraiment supprimer cette note ?')) {
    props.setMemberRating(memberId, 0)
  }
}
</script>
