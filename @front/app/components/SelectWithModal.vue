<template>
  <div class="contents">
  <!-- Mobile : champ cliquable qui ouvre une modale avec les choix -->
  <template v-if="isMobile">
    <button
      :id="id"
      type="button"
      :disabled="disabled"
      :class="[
        'w-full flex items-center justify-between gap-2 rounded-lg border px-3 text-left transition-colors',
        sizeClasses[size],
        disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : 'cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
        error ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700',
        props.class
      ]"
      @click="openModal"
    >
      <span :class="selectedLabel ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'">
        {{ selectedLabel || placeholder }}
      </span>
      <UIcon
        name="i-ion-chevron-down"
        class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
      />
    </button>

    <UModal
      :open="modalOpen"
      :fullscreen="true"
      @update:open="(v) => { modalOpen = v }"
    >
      <template #content>
        <div class="flex flex-col h-full max-h-[85vh] bg-white dark:bg-gray-900">
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ modalTitle || placeholder }}
            </h3>
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ion-close"
              size="sm"
              aria-label="Fermer"
              @click="modalOpen = false"
            />
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            <button
              v-for="item in items"
              :key="getItemValue(item)"
              type="button"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors min-h-[48px]',
                isSelected(item)
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]"
              @click="selectItem(item)"
            >
              <span class="font-medium">{{ getItemLabel(item) }}</span>
              <UIcon
                v-if="isSelected(item)"
                name="i-ion-checkmark"
                class="w-5 h-5 ml-auto text-primary-600 dark:text-primary-400 shrink-0"
              />
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </template>

  <!-- Desktop : menu déroulant classique -->
  <USelect
    v-else
    :id="id"
    :model-value="modelValue"
    :items="items"
    :option-attribute="optionAttribute"
    :value-attribute="valueAttribute"
    :placeholder="placeholder"
    :disabled="disabled"
    :size="size"
    :class="props.class"
    :error="error"
    @update:model-value="emit('update:modelValue', $event)"
  />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    items: Array<Record<string, unknown>>
    optionAttribute?: string
    valueAttribute?: string
    placeholder?: string
    disabled?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg'
    id?: string
    error?: boolean
    class?: string
    modalTitle?: string
  }>(),
  {
    optionAttribute: 'label',
    valueAttribute: 'value',
    placeholder: 'Choisir...',
    disabled: false,
    size: 'md',
    modalTitle: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const modalOpen = ref(false)

const sizeClasses: Record<string, string> = {
  xs: 'h-8 text-sm',
  sm: 'h-9 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base'
}

function getItemLabel(item: Record<string, unknown>): string {
  const key = props.optionAttribute
  const val = key ? item[key] : item.label
  return val != null ? String(val) : ''
}

function getItemValue(item: Record<string, unknown>): string | number | null {
  const key = props.valueAttribute
  const val = key ? item[key] : item.value
  return val !== undefined ? (val as string | number) : null
}

function isSelected(item: Record<string, unknown>): boolean {
  const itemVal = getItemValue(item)
  const current = props.modelValue
  if (itemVal === null && (current === null || current === undefined)) return true
  if (itemVal === null || current === null || current === undefined) return false
  return String(itemVal) === String(current) || itemVal === current
}

function selectItem(item: Record<string, unknown>) {
  const val = getItemValue(item)
  emit('update:modelValue', val)
  modalOpen.value = false
}

function openModal() {
  if (!props.disabled) modalOpen.value = true
}

const selectedLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return ''
  const item = props.items.find((i) => {
    const v = props.valueAttribute ? i[props.valueAttribute] : i.value
    return v === props.modelValue || String(v) === String(props.modelValue)
  })
  return item ? getItemLabel(item) : ''
})
</script>
