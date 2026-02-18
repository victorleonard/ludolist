<template>
  <UContainer class="px-4 sm:px-6 lg:px-8 max-w-2xl pb-24">
    <div class="mt-4 sm:mt-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Tirage au sort
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choisissez au moins 2 participants, puis lancez la roue pour tirer au hasard.
      </p>

      <!-- Onglets comme détail livre -->
      <div class="mb-4">
        <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 w-full gap-1">
          <button
            :class="[
              'flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
              activeTab === 'tirage'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
            @click="setActiveTab('tirage')"
          >
            <div class="flex items-center justify-center gap-2">
              <UIcon
                name="i-ion-shuffle"
                class="w-5 h-5 sm:w-4 sm:h-4"
              />
              <span>Tirage</span>
            </div>
          </button>
          <button
            :class="[
              'flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 min-h-[48px] sm:min-h-0',
              activeTab === 'historique'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            ]"
            @click="setActiveTab('historique')"
          >
            <div class="flex items-center justify-center gap-2">
              <UIcon
                name="i-ion-time"
                class="w-5 h-5 sm:w-4 sm:h-4"
              />
              <span>Historique</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Onglet Tirage -->
      <div
        v-show="activeTab === 'tirage'"
        class="space-y-6"
      >
        <!-- Participants -->
        <UCard>
          <template #header>
            <span class="font-semibold">Participants</span>
          </template>
          <div
            v-if="!familyMembers.length"
            class="text-sm text-gray-500 dark:text-gray-400 py-4"
          >
            Aucun membre dans la famille. Rejoignez une famille pour utiliser le tirage.
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <label
              v-for="member in familyMembers"
              :key="member.id"
              class="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <input
                v-model="selectedIds"
                type="checkbox"
                :value="member.id"
                class="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500"
              >
              <MemberAvatar
                :member="member"
                size="sm"
              />
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ member.username }}</span>
            </label>
          </div>
        </UCard>

        <!-- Contexte optionnel -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contexte (optionnel)
          </label>
          <UInput
            v-model="label"
            placeholder="Ex : Qui fait la vaisselle ?"
            class="w-full"
          />
        </div>

        <!-- Zone roue / résultat -->
        <div class="flex flex-col items-center gap-6">
          <template v-if="phase === 'idle'">
            <UButton
              :disabled="!canLaunch"
              size="lg"
              class="min-w-[200px]"
              @click="launch"
            >
              Lancer le tirage
            </UButton>
            <p
              v-if="selectedCount > 0 && selectedCount < 2"
              class="text-sm text-amber-600 dark:text-amber-400"
            >
              Sélectionnez au moins 2 participants.
            </p>
          </template>

          <template v-if="phase === 'spinning' || phase === 'result'">
            <div
              v-if="phase === 'result' && winner"
              class="flex items-center justify-center gap-2 mb-3 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700"
              role="status"
              aria-live="polite"
            >
              <MemberAvatar
                :member="winner"
                size="sm"
                show-ring
              />
              <span class="font-semibold text-primary-700 dark:text-primary-300">
                C'est {{ winner.username }}
              </span>
              <span
                v-if="label"
                class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]"
                :title="label"
              >
                — {{ label }}
              </span>
            </div>
            <ClientOnly>
              <TirageRoue
                ref="roueRef"
                :members="selectedMembers"
                @result="onResult"
              />
            </ClientOnly>
            <UButton
              v-if="phase === 'result'"
              size="lg"
              class="min-w-[200px] mt-4"
              @click="launch"
            >
              Rejouer
            </UButton>
          </template>
        </div>
      </div>

      <!-- Onglet Historique -->
      <div
        v-show="activeTab === 'historique'"
        class="py-2"
      >
        <div
          v-if="historyLoading"
          class="flex justify-center py-8"
        >
          <UIcon
            name="i-ion-refresh-circle"
            class="w-8 h-8 animate-spin text-primary-500"
          />
        </div>
        <div
          v-else-if="!history.length"
          class="rounded-xl bg-gray-100 dark:bg-gray-800/60 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          Aucun tirage enregistré.
        </div>
        <ul
          v-else
          class="space-y-2"
        >
          <li
            v-for="item in history"
            :key="item.documentId ?? item.id"
            class="flex items-center gap-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 px-4 py-3"
          >
            <MemberAvatar
              :member="item.winner"
              size="sm"
            />
            <div class="min-w-0 flex-1">
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ item.winner?.username ?? '?' }}</span>
              <span
                v-if="item.label"
                class="text-gray-500 dark:text-gray-400 text-sm ml-2"
              >— {{ item.label }}</span>
            </div>
            <time
              :datetime="item.drawn_at"
              class="text-xs text-gray-500 dark:text-gray-400 shrink-0"
            >
              {{ formatDate(item.drawn_at) }}
            </time>
          </li>
        </ul>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Member } from '~/stores/family'
import type TirageRoue from '~/components/TirageRoue.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const { familyMembers } = storeToRefs(familyStore)

const activeTab = ref<'tirage' | 'historique'>(
  route.query.tab === 'historique' ? 'historique' : 'tirage'
)

watch(() => route.query.tab, (tab) => {
  activeTab.value = tab === 'historique' ? 'historique' : 'tirage'
})

function setActiveTab(tab: 'tirage' | 'historique') {
  activeTab.value = tab
  router.replace({ path: route.path, query: tab === 'historique' ? { tab: 'historique' } : {} })
}

watch(activeTab, (tab) => {
  if (tab === 'historique') fetchHistory()
})

const selectedIds = ref<number[]>([])
const label = ref('')
const phase = ref<'idle' | 'spinning' | 'result'>('idle')
const winner = ref<Member | null>(null)
const roueRef = ref<InstanceType<typeof TirageRoue> | null>(null)

const history = ref<Array<{
  documentId?: string
  id?: number
  drawn_at: string
  label?: string | null
  winner: { id?: number; documentId?: string; username?: string }
}>>([])
const historyLoading = ref(false)

const selectedCount = computed(() => selectedIds.value.length)
const selectedMembers = computed(() =>
  familyMembers.value.filter((m) => selectedIds.value.includes(m.id))
)
const canLaunch = computed(() => selectedCount.value >= 2)

function formatDate(iso: string) {
  const d = new Date(iso)
  const dateStr = d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const timeStr = d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${dateStr} · ${timeStr}`
}

async function fetchHistory() {
  historyLoading.value = true
  try {
    const res = await $fetch<{ data: typeof history.value }>(
      `${config.public.apiUrl}/api/random-pick-results/family`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    history.value = Array.isArray(res?.data) ? res.data : []
  } catch (e) {
    console.error('Failed to fetch random pick history:', e)
    history.value = []
  } finally {
    historyLoading.value = false
  }
}

async function saveResult(w: Member) {
  const winnerDocId = w.documentId ?? String(w.id)
  const participantDocumentIds = selectedMembers.value
    .map((m) => m.documentId ?? String(m.id))
    .filter(Boolean)
  try {
    await $fetch(`${config.public.apiUrl}/api/random-pick-results/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: {
        winnerDocumentId: winnerDocId,
        label: label.value || undefined,
        participantDocumentIds
      }
    })
    await fetchHistory()
  } catch (e) {
    console.error('Failed to save random pick result:', e)
    toast.add({
      title: 'Erreur',
      description: 'Impossible d’enregistrer le tirage.',
      color: 'red'
    })
  }
}

function launch() {
  if (!canLaunch.value || selectedMembers.value.length < 2) return
  phase.value = 'spinning'
  winner.value = null
  nextTick(() => {
    requestAnimationFrame(() => {
      roueRef.value?.run()
    })
  })
}

function onResult(w: Member) {
  phase.value = 'result'
  winner.value = w
  saveResult(w)
}

onMounted(() => {
  fetchHistory()
})
</script>
