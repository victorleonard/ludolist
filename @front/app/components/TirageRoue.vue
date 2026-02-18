<template>
  <div class="flex flex-col items-center gap-4">
    <div class="relative flex items-center justify-center">
      <!-- Pointer at top -->
      <div
        class="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1"
        aria-hidden="true"
      >
        <div
          class="h-0 w-0 border-x-[16px] border-b-[28px] border-x-transparent border-b-primary-500 dark:border-b-primary-400"
          style="border-style: solid;"
        />
      </div>
      <!-- Wheel container -->
      <div
        ref="wheelWrapRef"
        class="relative overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 shadow-xl"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <svg
          ref="wheelRef"
          :width="size"
          :height="size"
          viewBox="0 0 200 200"
          class="block origin-center"
          style="transform-origin: 100px 100px;"
          aria-hidden="true"
        >
          <g>
            <g
              v-for="(member, i) in wheelDisplayOrder"
              :key="`${member.id ?? member.documentId ?? i}-${i}`"
            >
              <path
                :d="segmentPath(i)"
                :fill="segmentColor(i)"
                stroke="rgba(255,255,255,0.3)"
                stroke-width="1"
              />
              <text
                :transform="segmentTextTransform(i)"
                text-anchor="middle"
                dominant-baseline="middle"
                class="fill-white font-bold stroke-gray-800/50 stroke-[0.5px]"
                style="pointer-events: none; font-size: 22px;"
              >
                {{ getDisplayInitial(member) }}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import anime from 'animejs'
import { nextTick, ref } from 'vue'

export interface TirageMember {
  id?: number
  documentId?: string
  username: string
}

const props = withDefaults(
  defineProps<{
    members: TirageMember[]
  }>(),
  {}
)

const emit = defineEmits<{
  result: [TirageMember]
}>()

const size = 200
const wheelRef = ref<SVGSVGElement | null>(null)
const wheelWrapRef = ref<HTMLElement | null>(null)

/** Order of members on the wheel (shuffled at each run so the winner segment is unpredictable) */
const wheelDisplayOrder = ref<TirageMember[]>([])

// Même ordre que MemberAvatar (primary, sky, emerald, amber, red, violet, pink, indigo)
const WHEEL_COLORS = [
  '#0ea5e9', // primary/sky
  '#38bdf8', // sky-400
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1' // indigo
]

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function segmentPath(index: number): string {
  const n = wheelDisplayOrder.value.length
  if (n === 0) return ''
  const angleStep = (2 * Math.PI) / n
  const start = -Math.PI / 2 + index * angleStep
  const end = start + angleStep
  const r = 98
  const x1 = 100 + r * Math.cos(start)
  const y1 = 100 + r * Math.sin(start)
  const x2 = 100 + r * Math.cos(end)
  const y2 = 100 + r * Math.sin(end)
  // large-arc-flag = 1 when arc > 180° so each segment is drawn correctly
  const largeArc = angleStep > Math.PI ? 1 : 0
  return `M 100 100 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

/** Exact same logic as MemberAvatar so wheel colors match avatar colors */
function getMemberColorIndex(member: TirageMember): number {
  const id = member.id ?? member.username ?? 0
  if (typeof id === 'number') {
    return Math.abs(id) % WHEEL_COLORS.length
  }
  let hash = 0
  const str = String(id)
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % WHEEL_COLORS.length
}

/** First letter for display only (avoid special chars / HTML) */
function getDisplayInitial(member: TirageMember): string {
  const name = (member.username || '').trim()
  const c = name.charAt(0)
  if (/[A-Za-zÀ-ÿ]/.test(c)) return c.toUpperCase()
  return '?'
}

function segmentColor(index: number): string {
  const order = wheelDisplayOrder.value
  if (index >= order.length) return WHEEL_COLORS[0]
  const member = order[index]
  return WHEEL_COLORS[getMemberColorIndex(member)]
}

function segmentTextTransform(index: number): string {
  const n = wheelDisplayOrder.value.length
  if (n === 0) return ''
  const angleStep = (360 / n) * (Math.PI / 180)
  const midAngle = -Math.PI / 2 + (index + 0.5) * angleStep
  const r = 62
  const x = 100 + r * Math.cos(midAngle)
  const y = 100 + r * Math.sin(midAngle)
  const deg = ((index + 0.5) * (360 / n)) % 360
  return `translate(${x}, ${y}) rotate(${deg})`
}

function sameMember(a: TirageMember, b: TirageMember): boolean {
  if (a.id != null && b.id != null && a.id === b.id) return true
  if (a.documentId != null && b.documentId != null && a.documentId === b.documentId) return true
  return a.username === b.username
}

let animationInstance: ReturnType<typeof anime> | null = null

function runWheel() {
  const n = props.members.length
  if (n < 2) return

  // 1) Pick the winner first (from the original list)
  const winnerIndex = Math.floor(Math.random() * n)
  const winner = props.members[winnerIndex]

  // 2) Shuffle the order of segments so the winner's position/color is unpredictable
  const shuffled = shuffleArray(props.members)
  wheelDisplayOrder.value = shuffled

  const winnerSegmentIndex = shuffled.findIndex(m => sameMember(m, winner))
  if (winnerSegmentIndex === -1) {
    emit('result', winner)
    return
  }

  const anglePerSegment = 360 / n
  // Centre du segment gagnant (en degrés) : segment 0 commence en haut (-90°), sens horaire
  const segmentCenterAngle = (winnerSegmentIndex + 0.5) * anglePerSegment
  const fullTurns = 5 + Math.floor(Math.random() * 2)
  // Rotation horaire pour amener le centre du segment gagnant sous le pointeur (en haut)
  const finalRotation = fullTurns * 360 + segmentCenterAngle

  const el = wheelRef.value
  if (!el) {
    emit('result', winner)
    return
  }

  animationInstance?.pause()
  el.style.transformOrigin = '100px 100px'
  el.style.transform = 'rotate(0deg)'

  // Wait for Vue to render the new segment order before animating
  nextTick(() => {
    requestAnimationFrame(() => {
      // Rotation négative = sens inverse : le segment gagnant doit finir sous le pointeur (en haut)
      animationInstance = anime({
        targets: el,
        rotate: -finalRotation,
        duration: 4000,
        easing: 'easeOutCubic',
        complete: () => {
          emit('result', winner)
        }
      })
    })
  })
}

defineExpose({
  run: runWheel
})
</script>
