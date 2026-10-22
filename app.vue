<template>
  <div class="app-wrapper">
    <!-- SCREEN 1: PRE-MAIN AUTHENTICATION SCREEN (When user is not logged in and not guest) -->
    <AuthScreen 
      v-if="!currentUser && !isGuestMode" 
      @logged-in="handleLoggedIn"
      @continue-as-guest="isGuestMode = true"
    />

    <!-- SCREEN 2: MAIN MANAGEMENT HUB (When user is logged in OR guest mode) -->
    <div v-else style="display: flex; flex-direction: column; min-height: 100vh;">
      <!-- Main Top Navigation -->
      <AppHeader 
        :current-tab="currentTab"
        :filament-count="filaments.length"
        :platform-count="platforms.length"
        :quote-count="savedQuotes.length"
        :current-user="currentUser"
        :is-firebase-configured="isFirebaseConfigured"
        :is-syncing="isSyncing"
        @change-tab="handleTabChange"
        @new-job="handleNewJob"
        @open-auth="isGuestMode = false"
        @logout="handleLogout"
      />

      <!-- Guest banner if exploring in guest mode -->
      <div v-if="!currentUser && isGuestMode" style="background: rgba(245, 158, 11, 0.12); border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding: 0.6rem 1.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--brand-amber); flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span>⚠️ <strong>Modo Local Offline:</strong> Seus dados estão salvos apenas neste navegador.</span>
        </div>
        <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.65rem; font-size: 0.75rem; border-color: rgba(245, 158, 11, 0.4); color: var(--brand-amber);" @click="isGuestMode = false">
          Entrar ou Criar Conta para Salvar na Nuvem →
        </button>
      </div>

      <!-- Main Content Body -->
      <main class="container-custom" style="padding-top: 1.5rem; padding-bottom: 4rem; flex: 1;">
        <!-- Tab 1: Calculator & Marketplace Simulator (Default & Core Workspace) -->
        <div v-show="currentTab === 'calculator'">
          <PrintJobCalculator 
            @save-quote="handleSaveCurrentQuote"
            @view-proposal="openCurrentProposal"
          />

          <!-- Integrated Platform Sales Fee Simulator directly below the calculator -->
          <PlatformSimulator />
        </div>

        <!-- Tab 2: Filament Inventory & Pricing Manager -->
        <div v-if="currentTab === 'filaments'">
          <FilamentManager />
        </div>

        <!-- Tab 3: Marketplace Platform Fees Configuration -->
        <div v-if="currentTab === 'platforms'">
          <PlatformFeeManager />
        </div>

        <!-- Tab 4: 3D Printers & Global Operating Costs -->
        <div v-if="currentTab === 'printers'">
          <PrinterSettingsManager />
        </div>

        <!-- Tab 5: Store Profile & PIX Settings -->
        <div v-if="currentTab === 'store'">
          <StoreSettingsManager />
        </div>

        <!-- Tab 5: Saved Quotes History -->
        <div v-if="currentTab === 'quotes'">
          <SavedQuotesManager 
            @switch-to-calc="currentTab = 'calculator'"
            @view-quote-proposal="openSavedQuoteProposal"
            @quote-loaded="onQuoteLoaded"
          />
        </div>
      </main>

      <!-- Client Quotation / Proposal Modal -->
      <ClientProposalModal 
        :is-open="isProposalOpen"
        :job-title="proposalData.jobTitle"
        :client-name="proposalData.clientName"
        :material-list="proposalData.materialList"
        :total-grams="proposalData.totalGrams"
        :print-hours="proposalData.printHours"
        :final-price="proposalData.finalPrice"
        :notes="proposalData.notes"
        @close="isProposalOpen = false"
      />

      <!-- Footer -->
      <footer style="border-top: 1px solid var(--border-subtle); padding: 1.5rem 0; background: rgba(9, 13, 22, 0.9);">
        <div class="container-custom" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: var(--text-dim);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-weight: 700; color: var(--text-muted);">Print3D Pro Hub</span>
            <span>•</span>
            <span>Gerenciamento 3D, Filamentos & Marketplaces Brasil</span>
          </div>
          <div>
            {{ currentUser ? `Conectado como ${currentUser.email} • Dados na Nuvem (Firestore)` : 'Modo Convidado Offline' }}
          </div>
        </div>
      </footer>
    </div>

    <!-- Toast Alerts -->
    <div v-if="toasts.length > 0" class="toast-container">
      <div v-for="t in toasts" :key="t.id" class="toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>{{ t.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { use3DStore } from '~/composables/use3DStore'
import { useFirebase } from '~/composables/useFirebase'
import type { SavedQuote } from '~/types'

const currentTab = ref('calculator')
const isGuestMode = ref(false)

const store = use3DStore()
const { 
  filaments, 
  platforms, 
  savedQuotes, 
  activeJob, 
  jobCostBreakdown, 
  initStore, 
  saveCurrentQuote,
  loadUserSpecificData,
  resetToGuestData 
} = store

const firebaseService = useFirebase()
const { 
  currentUser, 
  isFirebaseConfigured, 
  isSyncing, 
  initFirebase, 
  logout 
} = firebaseService

// Toast notification system
interface ToastItem {
  id: number
  message: string
}
const toasts = reactive<ToastItem[]>([])

const showToast = (message: string) => {
  const id = Date.now()
  toasts.push({ id, message })
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }, 3500)
}

// Proposal Modal State
const isProposalOpen = ref(false)
const proposalData = reactive({
  jobTitle: '',
  clientName: '',
  materialList: '',
  totalGrams: 0,
  printHours: 0,
  finalPrice: 0,
  notes: ''
})

onMounted(() => {
  initStore()
  initFirebase()
})

// React when user logs in or out
watch(currentUser, async (newUser, oldUser) => {
  if (newUser && newUser.uid) {
    isGuestMode.value = false
    await loadUserSpecificData(newUser.uid)
    showToast(`Bem-vindo, ${newUser.displayName || newUser.email}! Dados sincronizados com a nuvem.`)
  } else if (oldUser && !newUser) {
    resetToGuestData()
    isGuestMode.value = false
    showToast('Você saiu da sua conta.')
  }
})

const handleLoggedIn = () => {
  isGuestMode.value = false
}

const handleLogout = async () => {
  if (confirm('Deseja realmente sair da sua conta?')) {
    await logout()
    isGuestMode.value = false
  }
}

const handleTabChange = (tab: string) => {
  currentTab.value = tab
}

const handleNewJob = () => {
  activeJob.title = 'Novo Projeto 3D'
  activeJob.clientName = ''
  activeJob.printTimeHours = 3
  activeJob.printTimeMinutes = 0
  activeJob.prepTimeMinutes = 15
  activeJob.packagingCost = 3.50
  activeJob.hardwareCost = 0.00
  activeJob.notes = ''
  currentTab.value = 'calculator'
  showToast('Novo cálculo iniciado na calculadora!')
}

const handleSaveCurrentQuote = () => {
  saveCurrentQuote()
  showToast('Orçamento salvo com sucesso!')
}

const openCurrentProposal = () => {
  const materials = activeJob.filaments.map(item => {
    const f = filaments.find(fil => fil.id === item.filamentId)
    return f ? `${f.name} (${f.material})` : 'Filamento 3D'
  }).join(', ')

  proposalData.jobTitle = activeJob.title
  proposalData.clientName = activeJob.clientName || 'Cliente Particular'
  proposalData.materialList = materials || 'PLA Premium'
  proposalData.totalGrams = jobCostBreakdown.value.totalGrams
  proposalData.printHours = jobCostBreakdown.value.totalPrintHours
  proposalData.finalPrice = jobCostBreakdown.value.recommendedDirectPrice
  proposalData.notes = activeJob.notes || ''
  isProposalOpen.value = true
}

const openSavedQuoteProposal = (q: SavedQuote) => {
  const materials = q.filaments.map(item => {
    const f = filaments.find(fil => fil.id === item.filamentId)
    return f ? `${f.name} (${f.material})` : 'Filamento 3D'
  }).join(', ')

  proposalData.jobTitle = q.title
  proposalData.clientName = q.clientName || 'Cliente Particular'
  proposalData.materialList = materials || 'PLA Premium'
  proposalData.totalGrams = q.breakdown.totalGrams
  proposalData.printHours = q.breakdown.totalPrintHours
  proposalData.finalPrice = q.breakdown.recommendedDirectPrice
  proposalData.notes = q.notes || ''
  isProposalOpen.value = true
}

const onQuoteLoaded = () => {
  currentTab.value = 'calculator'
  showToast('Orçamento carregado com sucesso na calculadora!')
}
</script>
