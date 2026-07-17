export default defineNuxtPlugin(() => {
  // S'assurer qu'on est côté client
  if (import.meta.server || !import.meta.client) {
    return
  }

  // Fonction pour trouver et déplacer le focus vers le drawer
  const moveFocusToDrawer = () => {
    // Chercher les drawers ouverts (UDrawer de Nuxt UI)
    const drawers = document.querySelectorAll('[role="dialog"], [data-headlessui-state="open"]')
    
    drawers.forEach((drawer) => {
      const autofocusInput = drawer.querySelector(
        '[data-drawer-autofocus]:not([disabled])'
      ) as HTMLInputElement | HTMLTextAreaElement | null

      if (autofocusInput) {
        autofocusInput.click()
        autofocusInput.focus({ preventScroll: false })
        return
      }

      // Trouver le premier élément focusable dans le drawer
      const focusableSelector = 'button:not([disabled]), [href]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      const focusableElements = drawer.querySelectorAll(focusableSelector)
      
      if (focusableElements.length > 0) {
        const firstFocusable = focusableElements[0] as HTMLElement
        // Vérifier si l'élément actuellement focusé est dans un élément avec aria-hidden
        const activeElement = document.activeElement as HTMLElement
        if (activeElement) {
          const hasAriaHidden = activeElement.closest('[aria-hidden="true"]')
          if (hasAriaHidden) {
            // Déplacer le focus vers le premier élément focusable du drawer
            firstFocusable.focus()
          }
        }
      }
    })
  }

  // Observer les changements d'attributs aria-hidden pour détecter l'ouverture des drawers
  const observer = new MutationObserver(() => {
    // Utiliser requestAnimationFrame pour éviter les appels trop fréquents
    requestAnimationFrame(() => {
      moveFocusToDrawer()
    })
  })

  // Observer les changements dans le body
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['aria-hidden'],
    childList: true,
    subtree: true
  })

  // Écouter aussi les événements de clic sur les boutons qui ouvrent les drawers
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // Si on clique sur un bouton qui pourrait ouvrir un drawer
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      setTimeout(() => {
        moveFocusToDrawer()
      }, 150)
    }
  }, true)
})
