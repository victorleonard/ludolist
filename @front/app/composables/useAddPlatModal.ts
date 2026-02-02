import { computed } from 'vue'
import type { TransformedDish } from '~/stores/family'

export const useAddPlatModal = () => {
  const isOpen = useState('add-plat-modal', () => false)
  const selectedDish = useState<TransformedDish | null>('add-plat-modal-dish', () => null)

  const openModal = (dish?: TransformedDish) => {
    selectedDish.value = dish || null
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
    selectedDish.value = null
  }

  return {
    isOpen: computed(() => isOpen.value),
    selectedDish: computed(() => selectedDish.value),
    openModal,
    closeModal,
  }
}
