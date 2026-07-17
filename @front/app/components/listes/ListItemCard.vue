<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200"
    :class="{
      'opacity-60': item.is_checked,
      'hover:shadow-md': true,
    }"
  >
    <div
      class="drag-handle shrink-0 cursor-grab active:cursor-grabbing touch-none p-1 -m-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      aria-label="Déplacer"
    >
      <UIcon
        name="i-ion-reorder-three"
        class="w-5 h-5 block"
      />
    </div>
    <UCheckbox
      :model-value="item.is_checked"
      :disabled="loading"
      class="shrink-0"
      @update:model-value="handleToggle"
    />

    <div
      class="flex-1 min-w-0"
      @click="handleToggle"
    >
      <p
        class="text-base font-medium text-gray-900 dark:text-gray-100"
        :class="{
          'line-through text-gray-500 dark:text-gray-400': item.is_checked,
        }"
      >
        {{ item.name }}
      </p>
      <p
        v-if="item.created_by"
        class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
      >
        Ajouté par {{ item.created_by.username }}
      </p>
      <p
        v-if="item.is_checked && item.checked_by"
        class="text-xs text-gray-500 dark:text-gray-400 mt-0.5"
      >
        Validé par {{ item.checked_by?.username ?? '—' }}
      </p>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-ion-create"
        size="sm"
        :disabled="loading"
        aria-label="Modifier"
        @click="emit('edit', item)"
      />
      <UButton
        variant="ghost"
        color="red"
        icon="i-ion-trash"
        size="sm"
        :disabled="loading"
        :loading="deleting"
        aria-label="Supprimer"
        @click="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMemberStore } from '~/stores/member'
import { useLists, type ListItem } from '~/composables/useLists'

interface Props {
  item: ListItem
}

interface Emits {
  (e: 'updated', item: ListItem): void
  (e: 'deleted', itemId: string): void
  (e: 'edit', item: ListItem): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { toggleListItem, deleteListItem } = useLists()
const { currentMember } = storeToRefs(useMemberStore())
const currentMemberId = computed(() => currentMember.value?.id ?? null)

const loading = ref(false)
const deleting = ref(false)

const handleToggle = async () => {
  if (loading.value || !props.item.documentId) return
  loading.value = true
  try {
    const result = await toggleListItem(props.item.documentId, currentMemberId.value)
    if (result.success && result.data) {
      emit('updated', result.data)
    }
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Supprimer cet élément ?') || !props.item.documentId) return
  deleting.value = true
  try {
    const result = await deleteListItem(props.item.documentId)
    if (result.success) {
      emit('deleted', props.item.documentId)
    }
  } finally {
    deleting.value = false
  }
}
</script>
