<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200"
    :class="{
      'opacity-60': item.is_checked,
      'hover:shadow-md': !isEditing,
    }"
  >
    <!-- Checkbox -->
    <UCheckbox
      :model-value="item.is_checked"
      :disabled="loading || isEditing"
      class="shrink-0"
      @update:model-value="handleToggle"
    />

    <!-- Nom du produit -->
    <div
      v-if="!isEditing"
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
    </div>

    <!-- Champ d'édition -->
    <div
      v-else
      class="flex-1 min-w-0"
    >
      <UInput
        v-model="editName"
        :disabled="saving"
        class="w-full"
        size="sm"
        @keyup.enter="handleSave"
        @keyup.esc="handleCancel"
      />
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0">
      <UButton
        v-if="!isEditing"
        variant="ghost"
        color="neutral"
        icon="i-ion-create"
        size="sm"
        :disabled="loading"
        aria-label="Modifier"
        @click="startEditing"
      />
      <UButton
        v-if="!isEditing"
        variant="ghost"
        color="red"
        icon="i-ion-trash"
        size="sm"
        :disabled="loading"
        :loading="deleting"
        aria-label="Supprimer"
        @click="handleDelete"
      />
      <div
        v-else
        class="flex items-center gap-1"
      >
        <UButton
          variant="ghost"
          color="green"
          icon="i-ion-checkmark"
          size="sm"
          :disabled="saving || !editName.trim()"
          :loading="saving"
          aria-label="Enregistrer"
          @click="handleSave"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-ion-close"
          size="sm"
          :disabled="saving"
          aria-label="Annuler"
          @click="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useShoppingList, type GroceryItem } from '~/composables/useShoppingList'

interface Props {
  item: GroceryItem
}

interface Emits {
  (e: 'updated', item: GroceryItem): void
  (e: 'deleted', itemId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { toggleGroceryItem, updateGroceryItem, deleteGroceryItem } = useShoppingList()

const isEditing = ref(false)
const editName = ref('')
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)

const startEditing = () => {
  isEditing.value = true
  editName.value = props.item.name
}

const handleCancel = () => {
  isEditing.value = false
  editName.value = ''
}

const handleToggle = async () => {
  if (loading.value || !props.item.documentId) return

  loading.value = true
  try {
    const result = await toggleGroceryItem(props.item.documentId)

    if (result.success && result.data) {
      emit('updated', result.data)
    }
  } catch (error) {
    console.error('Erreur lors du changement d\'état:', error)
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!editName.value.trim() || saving.value || !props.item.documentId) return

  saving.value = true
  try {
    const result = await updateGroceryItem(props.item.documentId, editName.value.trim())

    if (result.success && result.data) {
      emit('updated', result.data)
      isEditing.value = false
      editName.value = ''
    }
  } catch (error) {
    console.error('Erreur lors de la modification:', error)
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?') || !props.item.documentId) {
    return
  }

  deleting.value = true
  try {
    const result = await deleteGroceryItem(props.item.documentId)

    if (result.success) {
      emit('deleted', props.item.documentId)
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    deleting.value = false
  }
}
</script>
