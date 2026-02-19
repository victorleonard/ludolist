<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 100 100"
    class="inline-block select-none"
    aria-hidden="true"
  >
    <!-- Face du dé (carré arrondi type dé classique) -->
    <rect
      x="4"
      y="4"
      width="92"
      height="92"
      rx="12"
      ry="12"
      class="fill-white dark:fill-gray-100 stroke-gray-300 dark:stroke-gray-500"
      stroke-width="2"
    />
    <!-- Points (pips) : positions dans une grille 3x3 -->
    <circle
      v-for="(pip, i) in pips"
      :key="i"
      :cx="pip.cx"
      :cy="pip.cy"
      r="8"
      class="fill-gray-800 dark:fill-gray-900"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Valeur du dé (1 à 6) */
    value: number
    size?: number
  }>(),
  { size: 72 }
)

// Grille 3x3 : centres à 20, 50, 80
const PIPS_GRID = [
  { x: 20, y: 20 }, // 0,0
  { x: 50, y: 20 }, // 1,0
  { x: 80, y: 20 }, // 2,0
  { x: 20, y: 50 }, // 0,1
  { x: 50, y: 50 }, // 1,1
  { x: 80, y: 50 }, // 2,1
  { x: 20, y: 80 }, // 0,2
  { x: 50, y: 80 }, // 1,2
  { x: 80, y: 80 }  // 2,2
]

// Positions des points pour chaque face (indices dans PIPS_GRID)
const FACE_PIPS: number[][] = [
  [],                           // 0 (invalide)
  [4],                          // 1 : centre (1,1) -> index 4
  [0, 8],                       // 2 : (0,0) et (2,2)
  [0, 4, 8],                    // 3
  [0, 2, 6, 8],                 // 4 : quatre coins
  [0, 2, 4, 6, 8],             // 5
  [0, 2, 3, 5, 6, 8]           // 6 : deux colonnes (0,1,2 et 2,1,0) -> 0,2,3,5,6,8
]

const pips = computed(() => {
  const v = Math.max(1, Math.min(6, Math.floor(props.value)))
  const indices = FACE_PIPS[v] ?? []
  return indices.map(i => ({ cx: PIPS_GRID[i].x, cy: PIPS_GRID[i].y }))
})
</script>
