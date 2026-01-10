<template>
  <UContainer>
    <div>
      <div class="mt-12">
        <div class="mb-8">
          <div class="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Catégorie :
              </span>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="categorie in categories"
                  :key="categorie"
                  :variant="filtreCategorie === categorie ? 'solid' : 'outline'"
                  :color="filtreCategorie === categorie ? 'primary' : 'neutral'"
                  size="sm"
                  @click="filtreCategorie = filtreCategorie === categorie ? null : categorie"
                >
                  {{ categorie }}
                </UButton>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Durée :
              </span>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="duree in durees"
                  :key="duree.label"
                  :variant="filtreDuree === duree.value ? 'solid' : 'outline'"
                  :color="filtreDuree === duree.value ? 'primary' : 'neutral'"
                  size="sm"
                  @click="filtreDuree = filtreDuree === duree.value ? null : duree.value"
                >
                  {{ duree.label }}
                </UButton>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Âge :
              </span>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="age in ages"
                  :key="age.label"
                  :variant="filtreAge === age.value ? 'solid' : 'outline'"
                  :color="filtreAge === age.value ? 'primary' : 'neutral'"
                  size="sm"
                  @click="filtreAge = filtreAge === age.value ? null : age.value"
                >
                  {{ age.label }}
                </UButton>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="jeu in jeuxFiltres"
            :key="jeu.titre"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold">
                  {{ jeu.titre }}
                </h2>
                <UBadge
                  color="primary"
                  variant="solid"
                >
                  {{ jeu.age }}+ ans
                </UBadge>
              </div>
            </template>

            <div class="flex flex-col gap-4">
              <img
                :src="jeu.image"
                :alt="jeu.titre"
                class="w-full h-48 rounded-lg object-cover"
              >
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                {{ jeu.description }}
              </p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="tag in jeu.tags"
                  :key="tag"
                  color="primary"
                  variant="subtle"
                >
                  {{ tag }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { recherche } = useRecherche()

const jeux = [
  {
    titre: 'Catan',
    description: 'Catan est un jeu de stratégie où les joueurs colonisent une île en construisant des routes, des colonies et des villes.',
    image: 'https://images.unsplash.com/photo-1667118398887-63cb59112b57?q=80&w=1031&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    tags: ['Stratégie', '2-4 joueurs', '60 min'],
    categorie: 'Stratégie',
    duree: 60,
    age: 10
  },
  {
    titre: 'Les Aventuriers du Rail',
    description: 'Parcourez l\'Europe en train et connectez les villes pour remporter la victoire dans ce classique des jeux de société.',
    image: 'https://images.unsplash.com/photo-1606166183089-1c18e13b0c0e?w=400&h=400&fit=crop',
    tags: ['Famille', '2-5 joueurs', '45 min'],
    categorie: 'Famille',
    duree: 45,
    age: 8
  },
  {
    titre: '7 Wonders',
    description: 'Construisez une merveille du monde antique en développant votre civilisation et en gérant vos ressources.',
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
    tags: ['Stratégie', '3-7 joueurs', '30 min'],
    categorie: 'Stratégie',
    duree: 30,
    age: 10
  },
  {
    titre: 'Pandemic',
    description: 'Coopérez avec vos partenaires pour sauver le monde de quatre maladies mortelles qui se propagent rapidement.',
    image: 'https://images.unsplash.com/photo-1606166183089-1c18e13b0c0e?w=400&h=400&fit=crop',
    tags: ['Coopératif', '2-4 joueurs', '45 min'],
    categorie: 'Coopératif',
    duree: 45,
    age: 13
  },
  {
    titre: 'Wingspan',
    description: 'Observez et attirez les plus beaux oiseaux dans votre réserve naturelle dans ce jeu magnifiquement illustré.',
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400&h=400&fit=crop',
    tags: ['Famille', '1-5 joueurs', '60 min'],
    categorie: 'Famille',
    duree: 60,
    age: 10
  },
  {
    titre: 'Azul',
    description: 'Créez la plus belle façade de palais en plaçant stratégiquement des tuiles colorées dans ce jeu abstrait élégant.',
    image: 'https://images.unsplash.com/photo-1667118398887-63cb59112b57?q=80&w=400&h=400&fit=crop',
    tags: ['Abstrait', '2-4 joueurs', '30 min'],
    categorie: 'Abstrait',
    duree: 30,
    age: 8
  }
]

const categories = ['Stratégie', 'Famille', 'Coopératif', 'Abstrait']

const durees = [
  { label: '< 30 min', value: 'court' },
  { label: '30-60 min', value: 'moyen' },
  { label: '> 60 min', value: 'long' }
]

const ages = [
  { label: '8+ ans', value: 8 },
  { label: '10+ ans', value: 10 },
  { label: '13+ ans', value: 13 }
]

const filtreCategorie = ref<string | null>(null)
const filtreDuree = ref<string | null>(null)
const filtreAge = ref<number | null>(null)

const jeuxFiltres = computed(() => {
  let result = jeux

  if (recherche.value.trim()) {
    const termeRecherche = recherche.value.toLowerCase().trim()
    result = result.filter((jeu) => {
      const titreMatch = jeu.titre.toLowerCase().includes(termeRecherche)
      const descriptionMatch = jeu.description.toLowerCase().includes(termeRecherche)
      return titreMatch || descriptionMatch
    })
  }

  if (filtreCategorie.value) {
    result = result.filter(jeu => jeu.categorie === filtreCategorie.value)
  }

  if (filtreDuree.value) {
    result = result.filter((jeu) => {
      if (filtreDuree.value === 'court') {
        return jeu.duree < 30
      }
      if (filtreDuree.value === 'moyen') {
        return jeu.duree >= 30 && jeu.duree <= 60
      }
      if (filtreDuree.value === 'long') {
        return jeu.duree > 60
      }
      return true
    })
  }

  if (filtreAge.value) {
    result = result.filter(jeu => jeu.age <= filtreAge.value!)
  }

  return result
})
</script>
