import { computed } from 'vue'

export interface Book {
  id: number
  titre: string
  auteur?: string
  description?: string
  isbn?: string
  image?: string
  annee?: number
  editeur?: string
}

export const useAddBookModal = () => {
  const isOpen = useState('add-book-modal', () => false)
  const selectedBook = useState<Book | null>('add-book-modal-book', () => null)

  const openModal = (book?: Book) => {
    selectedBook.value = book || null
    isOpen.value = true
  }

  const closeModal = () => {
    isOpen.value = false
    selectedBook.value = null
  }

  return {
    isOpen: computed(() => isOpen.value),
    selectedBook: computed(() => selectedBook.value),
    openModal,
    closeModal
  }
}
