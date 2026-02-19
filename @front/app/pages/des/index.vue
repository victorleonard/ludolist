<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-2xl pb-24">
    <div class="mt-4 sm:mt-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Lancer les dés
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Choisissez le nombre de dés, puis lancez.
      </p>

      <UCard class="mb-6">
        <template #header>
          <span class="font-semibold">Nombre de dés</span>
        </template>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="n in 6"
            :key="n"
            :class="[
              'w-11 h-11 rounded-lg font-semibold transition-all',
              numberOfDice === n
                ? 'bg-primary-500 text-white dark:bg-primary-400 dark:text-gray-900'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
            @click="numberOfDice = n"
          >
            {{ n }}
          </button>
        </div>
      </UCard>

      <UCard>
        <div class="flex flex-col items-center gap-6 py-4">
          <!-- Dés (chaque dé dans un wrapper pour anime) -->
          <div
            ref="diceContainerRef"
            class="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            <div
              v-for="(val, i) in diceValues"
              :key="i"
              class="dice-item inline-flex origin-center"
            >
              <De2D
                :value="val"
                :size="diceSize"
              />
            </div>
          </div>

          <UButton
            size="lg"
            class="min-w-[200px]"
            :loading="isRolling"
            @click="roll"
          >
            Lancer
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import anime from 'animejs'
import { ref, computed, watch, nextTick } from 'vue'

const numberOfDice = ref(2)
const diceValues = ref<number[]>([1, 1])
const isRolling = ref(false)
const diceContainerRef = ref<HTMLElement | null>(null)

let rollIntervalId: ReturnType<typeof setInterval> | null = null
let animationInstance: ReturnType<typeof anime> | null = null

const diceSize = computed(() => {
  const n = numberOfDice.value
  if (n <= 2) return 88
  if (n <= 4) return 72
  return 60
})

function randomDice(): number {
  return Math.floor(Math.random() * 6) + 1
}

function roll() {
  const n = numberOfDice.value
  if (n < 1) return

  animationInstance?.pause()
  if (rollIntervalId) {
    clearInterval(rollIntervalId)
    rollIntervalId = null
  }

  isRolling.value = true
  const finalValues = Array.from({ length: n }, randomDice)

  // Cycle des faces pendant l'animation (effet "roulement")
  diceValues.value = Array.from({ length: n }, randomDice)
  rollIntervalId = setInterval(() => {
    diceValues.value = Array.from({ length: n }, randomDice)
  }, 140)

  nextTick(() => {
    const targets = diceContainerRef.value?.querySelectorAll('.dice-item') ?? []
    if (targets.length === 0) {
      finishRoll(finalValues)
      return
    }
    animationInstance = anime({
      targets: Array.from(targets),
      scale: [1, 1.04, 1],
      duration: 1400,
      delay: anime.stagger(100, { start: 0 }),
      easing: 'easeOutCubic',
      complete: () => {
        finishRoll(finalValues)
      }
    })
  })
}

function finishRoll(finalValues: number[]) {
  if (rollIntervalId) {
    clearInterval(rollIntervalId)
    rollIntervalId = null
  }
  diceValues.value = finalValues
  isRolling.value = false
  animationInstance = null
}

watch(numberOfDice, (n) => {
  const current = diceValues.value.length
  if (n > current) {
    diceValues.value = [...diceValues.value, ...Array.from({ length: n - current }, randomDice)]
  } else if (n < current) {
    diceValues.value = diceValues.value.slice(0, n)
  }
}, { immediate: true })
</script>
