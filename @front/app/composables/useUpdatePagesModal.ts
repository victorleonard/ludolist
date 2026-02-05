import { ref, computed } from 'vue'

interface UpdatePagesModalState {
  isOpen: boolean
  bookId: string | number | null
  currentPages: number | null
  totalPages: number | null
}

const state = ref<UpdatePagesModalState>({
  isOpen: false,
  bookId: null,
  currentPages: null,
  totalPages: null
})

export function useUpdatePagesModal() {
  const openModal = (bookId: string | number, currentPages: number | null, totalPages: number | null) => {
    state.value = {
      isOpen: true,
      bookId,
      currentPages,
      totalPages
    }
  }

  const closeModal = () => {
    state.value = {
      isOpen: false,
      bookId: null,
      currentPages: null,
      totalPages: null
    }
  }

  return {
    isOpen: computed(() => state.value.isOpen),
    bookId: computed(() => state.value.bookId),
    currentPages: computed(() => state.value.currentPages),
    totalPages: computed(() => state.value.totalPages),
    openModal,
    closeModal
  }
}
