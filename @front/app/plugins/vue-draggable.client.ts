import draggable from 'vuedraggable'

export default defineNuxtPlugin((nuxtApp) => {
  // Enregistrement global du composant conforme à la doc vuedraggable
  nuxtApp.vueApp.component('draggable', draggable)
})
