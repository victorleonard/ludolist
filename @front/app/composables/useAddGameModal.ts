import { computed } from 'vue'
import type { TransformedGame } from '~/stores/family'

export const useAddGameModal = () => {
  const isOpen = useState('add-game-modal', () => false)
  const selectedGame = useState<TransformedGame | null>('add-game-modal-game', () => null)

  const openModal = (game?: TransformedGame) => {
    selectedGame.value = game || null
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
    selectedGame.value = null
  }

  return {
    isOpen: computed(() => isOpen.value),
    selectedGame: computed(() => selectedGame.value),
    openModal,
    closeModal
  }
}
