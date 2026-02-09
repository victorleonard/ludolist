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
            <span
              :class="renewalBadgeClasses(subscription.renewal_date)"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium"
              :title="`Prochaine échéance : ${daysUntilRenewalLabel(subscription.renewal_date)}`"
            >
              J-{{ daysUntilRenewal(subscription.renewal_date) }}
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

/** Nombre de jours jusqu'à la prochaine échéance (jour du mois répété chaque mois). */
function daysUntilRenewal(dateString: string): number {
  const date = new Date(dateString)
  const dayOfMonth = date.getDate()
  if (Number.isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (next.getTime() < now.getTime()) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
  }
  const diffMs = next.getTime() - now.getTime()
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

/** Classes du badge J-X selon la proximité de l'échéance. */
function renewalBadgeClasses(dateString: string): string {
  const days = daysUntilRenewal(dateString)
  if (days <= 2) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  }
  if (days <= 7) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  }
  return 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
}

/** Label pour le tooltip : date de la prochaine échéance. */
function daysUntilRenewalLabel(dateString: string): string {
  const date = new Date(dateString)
  const dayOfMonth = date.getDate()
  if (Number.isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) return ''
  const now = new Date()
  let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (next.getTime() < now.getTime()) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
  }
  return next.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function handleCardClick() {
  emit('click', props.subscription)
}
</script>
