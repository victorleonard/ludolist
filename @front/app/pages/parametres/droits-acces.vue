<template>
  <div class="min-h-screen pb-24">
    <div v-if="!accessGranted" class="flex items-center justify-center min-h-[60vh]">
      <UIcon name="i-ion-sync" class="w-8 h-8 animate-spin text-gray-400" />
    </div>
    <UContainer v-else class="px-4 sm:px-6 lg:px-8 max-w-2xl">
      <div class="pt-6 pb-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <UIcon name="i-ion-chevron-back" class="w-4 h-4" />
          Retour
        </NuxtLink>

        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Droits d'accès par page
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-8">
          Choisissez quels membres peuvent accéder à chaque section (hors Accueil). Laissez toutes les cases cochées pour un accès complet.
        </p>

        <!-- Droits par page -->
        <section class="mb-8">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Accès par page
          </h2>
          <div class="space-y-6">
            <div
              v-for="page in pagesToManage"
              :key="page.id"
              class="rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div class="flex items-center gap-4 px-5 py-4 bg-gray-200/60 dark:bg-gray-700/40">
                <div
                  class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0"
                >
                  <UIcon :name="page.icon" class="w-7 h-7 text-primary-600 dark:text-primary-400" />
                </div>
                <span class="font-semibold text-lg text-gray-900 dark:text-gray-100">{{ page.label }}</span>
              </div>
              <div class="px-4 py-3 space-y-1">
                <label
                  v-for="member in familyMembers"
                  :key="member.id"
                  :class="[
                    'flex items-center gap-4 py-3 px-2 min-h-[52px] rounded-lg touch-manipulation',
                    isCurrentMember(member.id)
                      ? 'cursor-not-allowed opacity-80'
                      : 'cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-700/40'
                  ]"
                >
                  <input
                    :checked="hasPageAccess(page.id, member.id)"
                    type="checkbox"
                    :disabled="isCurrentMember(member.id)"
                    class="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500 shrink-0 disabled:opacity-70"
                    @change="onPageAccessChange(page.id, member.id, $event)"
                  >
                  <span class="text-base font-medium text-gray-700 dark:text-gray-300">
                    {{ member.username }}
                    <span v-if="isCurrentMember(member.id)" class="text-xs text-gray-500 dark:text-gray-400 ml-1">(vous)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <UButton
            class="mt-4 w-full"
            :loading="savingAccess"
            @click="savePageAccess"
          >
            Enregistrer les droits d'accès
          </UButton>
        </section>

        <!-- Administrateurs (visible uniquement pour le compte utilisateur) -->
        <section v-if="isUserOwner" class="mb-8">
          <h2 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
            Administrateurs
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Les administrateurs peuvent gérer les droits d'accès depuis cette page (en se connectant en tant que membre).
          </p>
          <div class="space-y-1 rounded-xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
            <label
              v-for="member in familyMembers"
              :key="member.id"
              class="flex items-center gap-4 py-3 px-2 min-h-[52px] rounded-lg cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-700/40 touch-manipulation"
            >
              <input
                v-model="localAdminByMemberId[member.id]"
                type="checkbox"
                class="w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-2 focus:ring-primary-500 shrink-0"
                @change="onAdminChangeFromEvent(member.id, $event)"
              >
              <span class="text-base font-medium text-gray-700 dark:text-gray-300">{{ member.username }}</span>
            </label>
          </div>
        </section>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ALL_NAV_ITEMS } from '~/stores/bottomNav'
import type { Member } from '~/stores/family'

definePageMeta({
  layout: 'default',
  middleware: 'droits-acces'
})

const toast = useToast()
const familyStore = useFamilyStore()
const authStore = useAuthStore()
const memberStore = useMemberStore()

const { family, familyMembers } = storeToRefs(familyStore)
const { isAuthenticated } = storeToRefs(authStore)
const { currentMember, isMemberConnected } = storeToRefs(memberStore)

const pagesToManage = ALL_NAV_ITEMS.filter((p) => p.id !== 'home')

const canManage = computed(() => {
  if (!isAuthenticated.value) return false
  if (!isMemberConnected.value) return true
  const m = familyMembers.value.find((x) => x.id === currentMember.value?.id)
  return m?.is_admin === true
})

const isUserOwner = computed(() => isAuthenticated.value && !isMemberConnected.value)

const accessGranted = ref(false)
const localPageAccess = ref<Record<string, number[]>>({})
const localAdminByMemberId = ref<Record<number, boolean>>({})
const savingAccess = ref(false)

function buildLocalPageAccess() {
  const pa = family.value?.page_access ?? {}
  const out: Record<string, number[]> = {}
  const memberIds = familyMembers.value.map((m: Member) => m.id)
  for (const page of pagesToManage) {
    const ids = pa[page.id]
    if (ids && Array.isArray(ids) && ids.length > 0) {
      out[page.id] = [...ids]
    } else {
      out[page.id] = [...memberIds]
    }
  }
  localPageAccess.value = out
}

function isCurrentMember(memberId: number): boolean {
  return isMemberConnected.value === true && currentMember.value?.id === memberId
}

function hasPageAccess(pageId: string, memberId: number): boolean {
  const arr = localPageAccess.value[pageId]
  if (!arr) return true
  return arr.includes(memberId)
}

function togglePageAccess(pageId: string, memberId: number, checked: boolean) {
  const arr = localPageAccess.value[pageId] ?? []
  if (checked) {
    if (!arr.includes(memberId)) localPageAccess.value[pageId] = [...arr, memberId]
  } else {
    localPageAccess.value[pageId] = arr.filter((id) => id !== memberId)
  }
}

function buildLocalAdmin() {
  const out: Record<number, boolean> = {}
  for (const m of familyMembers.value) {
    out[m.id] = m.is_admin === true
  }
  localAdminByMemberId.value = out
}

onMounted(async () => {
  if (!family.value?.members?.length) {
    await familyStore.fetchFamily()
  }
  if (!canManage.value) {
    navigateTo('/')
    return
  }
  accessGranted.value = true
  buildLocalPageAccess()
  buildLocalAdmin()
})

watch([family, familyMembers], () => {
  buildLocalPageAccess()
  buildLocalAdmin()
}, { deep: true })

watch(
  () => [currentMember.value?.id, familyMembers.value, isMemberConnected.value],
  () => {
    if (!accessGranted.value) return
    if (!canManage.value) {
      navigateTo('/')
    }
  },
  { deep: true }
)

async function savePageAccess() {
  savingAccess.value = true
  try {
    const result = await familyStore.updatePageAccess(localPageAccess.value)
    if (result.success) {
      toast.add({
        title: 'Enregistré',
        description: 'Les droits d\'accès ont été mis à jour.',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Erreur',
        description: result.error || 'Impossible d\'enregistrer les droits.',
        color: 'error'
      })
    }
  } catch {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de l\'enregistrement.',
      color: 'error'
    })
  } finally {
    savingAccess.value = false
  }
}

function onPageAccessChange(pageId: string, memberId: number, e: Event) {
  if (isCurrentMember(memberId)) return
  const target = e?.target as HTMLInputElement | null
  togglePageAccess(pageId, memberId, !!target?.checked)
}

async function onAdminChange(memberId: number, is_admin: boolean) {
  localAdminByMemberId.value[memberId] = is_admin
  const result = await familyStore.setMemberAdmin(memberId, is_admin)
  if (result.success) {
    toast.add({
      title: 'Enregistré',
      description: is_admin ? 'Membre défini comme administrateur.' : 'Statut administrateur retiré.',
      color: 'success'
    })
  } else {
    localAdminByMemberId.value[memberId] = !is_admin
    toast.add({
      title: 'Erreur',
      description: result.error || 'Impossible de modifier le statut.',
      color: 'error'
    })
  }
}

function onAdminChangeFromEvent(memberId: number, e: Event) {
  const target = e?.target as HTMLInputElement | null
  onAdminChange(memberId, !!target?.checked)
}
</script>
