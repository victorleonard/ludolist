<template>
  <div
    :class="[
      showRing ? 'rounded-full p-px ring-1.5 ring-primary-500 dark:ring-primary-400' : 'contents',
      props.class
    ]"
  >
    <div
      :class="[
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0',
        sizeClasses[size],
        colorClasses.bg
      ]"
    >
      <span :class="sizeTextClasses[size]">
        {{ initial }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** Membre avec id (pour couleur stable) et username */
export interface MemberLike {
  id?: number
  username: string
}

const props = withDefaults(
  defineProps<{
    /** Membre : au minimum username ; id optionnel pour une couleur stable */
    member: MemberLike
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    /** Afficher un anneau coloré autour (ex: header) */
    showRing?: boolean
    class?: string
  }>(),
  {
    size: 'md',
    showRing: false
  }
)

/** Palette de couleurs solides (même ordre partout pour cohérence) */
const AVATAR_COLORS = [
  { bg: 'bg-primary-500 dark:bg-primary-600' },
  { bg: 'bg-sky-500 dark:bg-sky-600' },
  { bg: 'bg-emerald-500 dark:bg-emerald-600' },
  { bg: 'bg-amber-500 dark:bg-amber-600' },
  { bg: 'bg-red-500 dark:bg-red-600' },
  { bg: 'bg-violet-500 dark:bg-violet-600' },
  { bg: 'bg-pink-500 dark:bg-pink-600' },
  { bg: 'bg-indigo-500 dark:bg-indigo-600' }
] as const

function getColorIndex(identifier: number | string): number {
  if (typeof identifier === 'number') {
    return Math.abs(identifier) % AVATAR_COLORS.length
  }
  let hash = 0
  const str = String(identifier)
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % AVATAR_COLORS.length
}

const initial = computed(() => {
  const name = props.member?.username ?? ''
  return (name.charAt(0) || '?').toUpperCase()
})

const colorClasses = computed(() => {
  const id = props.member?.id ?? props.member?.username ?? 0
  const index = getColorIndex(id)
  return AVATAR_COLORS[index]
})

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24'
}

const sizeTextClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-lg',
  '2xl': 'text-2xl'
}
</script>
