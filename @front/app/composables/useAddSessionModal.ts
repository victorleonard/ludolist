import { computed } from 'vue'

export const useAddSessionModal = () => {
  const isOpen = useState('add-session-modal', () => false)

  const openModal = () => {
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
  }

  return {
    isOpen: computed(() => isOpen.value),
    openModal,
    closeModal
  }
}