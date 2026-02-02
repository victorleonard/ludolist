<template>
  <div class="space-y-6 py-6">
    <div v-if="members.length > 0">
      <div class="space-y-4">
        <UCard
          v-for="member in members"
          :key="member.id"
          class="bg-white dark:bg-gray-800"
        >
          <div class="flex items-center gap-3 mb-3">
            <MemberAvatar
              :member="member"
              size="md"
            />
            <div class="flex items-center justify-between flex-1">
              <span class="font-medium">{{ member.username }}</span>
              <UButton
                v-if="getMemberRating(member.id) > 0"
                color="red"
                variant="ghost"
                icon="i-lucide-trash-2"
                size="xs"
                @click="setMemberRating(member.id, 0)"
              />
            </div>
          </div>
          <div class="flex justify-center">
            <StarRating
              :model-value="getMemberRating(member.id)"
              :max="maxStars"
              size="lg"
              @update:model-value="(rating) => setMemberRating(member.id, rating)"
            />
          </div>
        </UCard>
      </div>

      <!-- Note moyenne -->
      <UCard
        v-if="averageRating > 0"
        class="mt-4 bg-white dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold text-primary-900 dark:text-primary-100">
            Note moyenne
          </span>
          <div class="flex items-center gap-2">
            <StarRating
              :model-value="averageRating"
              :max="maxStars"
              readonly
            />
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ averageRating.toFixed(1) }} / {{ maxStars }}
            </span>
          </div>
        </div>
      </UCard>
    </div>
    <div
      v-else
      class="text-center py-12 text-gray-500 dark:text-gray-400"
    >
      <UIcon
        name="i-lucide-users"
        class="w-16 h-16 mx-auto mb-4 opacity-50"
      />
      <p>{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

withDefaults(
  defineProps<Props>(),
  {
    maxStars: 5,
    emptyMessage: 'Aucun membre dans la famille',
  },
)
</script>
