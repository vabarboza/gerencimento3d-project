<template>
  <header class="navbar-header">
    <div class="container-custom nav-container">
      <!-- Brand Logo -->
      <a href="#" class="logo-brand" @click.prevent="$emit('change-tab', 'calculator')">
        <div class="logo-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <div>
          <div style="line-height: 1.1;">
            <span class="text-gradient">Print3D</span> <span style="font-weight: 400; color: #94a3b8;">Pro</span>
          </div>
          <span style="font-size: 0.68rem; font-weight: 600; color: var(--brand-cyan); letter-spacing: 0.08em; text-transform: uppercase;">
            Gerenciador & Simulador de Vendas
          </span>
        </div>
      </a>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs" role="tablist">
        <button 
          id="tab-calculator"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'calculator' }" 
          @click="$emit('change-tab', 'calculator')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"></rect>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="16" y1="14" x2="16" y2="18"></line>
            <path d="M16 10h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M8 14h.01"></path>
            <path d="M12 18h.01"></path>
            <path d="M8 18h.01"></path>
          </svg>
          <span>Calculadora & Simulador</span>
        </button>

        <button 
          id="tab-dashboard"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'dashboard' }" 
          @click="$emit('change-tab', 'dashboard')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Dashboard & BI</span>
        </button>

        <button 
          id="tab-filaments"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'filaments' }" 
          @click="$emit('change-tab', 'filaments')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="12" y1="3" x2="12" y2="9"></line>
            <line x1="12" y1="15" x2="12" y2="21"></line>
          </svg>
          <span>Filamentos ({{ filamentCount }})</span>
        </button>

        <button 
          id="tab-platforms"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'platforms' }" 
          @click="$emit('change-tab', 'platforms')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span>Taxas Plataformas ({{ platformCount }})</span>
        </button>

        <button 
          id="tab-printers"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'printers' }" 
          @click="$emit('change-tab', 'printers')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          <span>Impressoras & Custos</span>
        </button>

        <button 
          id="tab-store"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'store' }" 
          @click="$emit('change-tab', 'store')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Minha Loja & PIX</span>
        </button>

        <button 
          id="tab-quotes"
          type="button" 
          class="nav-tab-btn" 
          :class="{ active: currentTab === 'quotes' }" 
          @click="$emit('change-tab', 'quotes')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Orçamentos Salvos ({{ quoteCount }})</span>
        </button>
      </nav>

      <!-- Right status / quick trigger -->
      <div class="nav-right-actions">
        <!-- New Job Button -->
        <button 
          id="btn-quick-new"
          class="btn btn-secondary btn-sm" 
          title="Limpar formulário e criar novo orçamento"
          @click="$emit('new-job')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Novo Cálculo</span>
        </button>

        <!-- User Authentication & Cloud Status -->
        <div v-if="currentUser" style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border-subtle); padding: 0.25rem 0.5rem; border-radius: var(--radius-md);">
          <!-- Avatar Initial -->
          <div style="width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, var(--brand-cyan), var(--brand-blue)); color: #050b14; font-weight: 800; font-size: 0.75rem; display: flex; align-items: center; justify-content: center;">
            {{ (currentUser.displayName || currentUser.email || 'U')[0].toUpperCase() }}
          </div>

          <div style="line-height: 1.1; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-main);">
              {{ currentUser.displayName }}
            </div>
            <div style="font-size: 0.65rem; color: var(--brand-emerald); display: flex; align-items: center; gap: 0.25rem;">
              <span v-if="isSyncing">Sincronizando...</span>
              <span v-else>☁️ Nuvem Ativa</span>
            </div>
          </div>

          <!-- Logout Button -->
          <button 
            id="btn-header-logout" 
            class="btn btn-secondary btn-sm btn-icon" 
            style="width: 26px; height: 26px;" 
            title="Sair da conta"
            @click="$emit('logout')"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- Logged out trigger -->
        <button 
          v-else 
          id="btn-header-login"
          class="btn btn-secondary btn-sm"
          style="border-color: rgba(0, 240, 255, 0.3);"
          @click="$emit('open-auth')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{{ isFirebaseConfigured ? 'Entrar / Sincronizar' : 'Conectar Firebase' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types'

defineProps<{
  currentTab: string
  filamentCount: number
  platformCount: number
  quoteCount: number
  currentUser: UserProfile | null
  isFirebaseConfigured: boolean
  isSyncing: boolean
}>()

defineEmits<{
  (e: 'change-tab', tab: string): void
  (e: 'new-job'): void
  (e: 'open-auth'): void
  (e: 'logout'): void
}>()
</script>
