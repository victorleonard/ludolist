<template>
  <div
    class="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden"
    @click="handleCardClick"
  >
    <div class="flex items-center justify-between gap-2 p-3 sm:p-3.5">
      <div class="flex flex-col gap-1 min-w-0 flex-1">
        <h3 class="min-w-0 text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate leading-tight">
          {{ subscription.name }}
        </h3>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-semibold text-primary-600 dark:text-primary-400">
            {{ formatAmount(subscription.amount) }}
          </span>
          <template v-if="subscription.renewal_date">
            <span class="text-gray-300 dark:text-gray-600">·</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatRenewalDate(subscription.renewal_date) }}
            </span>
          </template>
        </div>
      </div>
      <div class="flex items-center justify-end shrink-0">
        <template v-if="subscription.paid_by">
          <span
            class="shrink-0"
            :title="`Paie : ${subscription.paid_by.username}`"
          >
            <MemberAvatar
              :member="subscription.paid_by"
              size="xs"
            />
          </span>
        </template>
        <span
          v-else
          class="text-xs text-gray-400 dark:text-gray-500"
        >
          —
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Subscription } from '~/composables/useSubscriptions'
import MemberAvatar from '~/components/MemberAvatar.vue'

interface Props {
  subscription: Subscription
}

interface Emits {
  (e: 'click', subscription: Subscription): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function formatAmount(amount: Subscription['amount']): string {
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function formatRenewalDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function handleCardClick() {
  emit('click', props.subscription)
}
</script>
