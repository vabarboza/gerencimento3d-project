<template>
  <div class="saved-quotes-section">
    <!-- Header -->
    <div class="card card-glass" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
            <span class="text-gradient">Orçamentos & Histórico de Projetos</span>
          </h2>
          <p class="card-subtitle">
            Consulte seus orçamentos salvos anteriormente, recarregue os parâmetros na calculadora a qualquer momento ou gere propostas para clientes.
          </p>
        </div>

        <div style="flex: 1; max-width: 300px; min-width: 200px;" class="input-prefix-box">
          <span class="input-prefix-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input 
            id="input-search-quotes"
            v-model="searchQuery" 
            type="text" 
            class="input-control" 
            placeholder="Buscar por peça ou cliente..."
          />
        </div>
      </div>
    </div>

    <!-- Quotes Grid -->
    <div v-if="filteredQuotes.length > 0" class="platform-grid">
      <div 
        v-for="q in filteredQuotes" 
        :key="q.id" 
        class="card"
        style="display: flex; flex-direction: column; justify-content: space-between;"
      >
        <div>
          <!-- Header: Title, Client and Date -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 700; line-height: 1.2;">{{ q.title }}</h3>
              <span style="font-size: 0.78rem; color: var(--text-dim);">
                {{ q.clientName ? `Cliente: ${q.clientName}` : 'Cliente Particular' }} • {{ formatDate(q.createdAt) }}
              </span>
            </div>

            <span class="badge badge-cyan font-mono">
              {{ (q.printTimeHours + (q.printTimeMinutes / 60)).toFixed(1) }}h
            </span>
          </div>

          <!-- Price & Profit Box -->
          <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); padding: 0.85rem; border: 1px solid var(--border-subtle); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase;">Custo Fabricação</span>
              <div class="font-mono" style="font-size: 1.05rem; font-weight: 700; color: var(--brand-rose);">
                R$ {{ q.breakdown.totalProductionCost.toFixed(2) }}
              </div>
            </div>

            <div style="text-align: right;">
              <span style="font-size: 0.725rem; color: var(--brand-emerald); text-transform: uppercase; font-weight: 700;">Preço Sugerido</span>
              <div class="font-mono" style="font-size: 1.3rem; font-weight: 800; color: var(--brand-emerald);">
                R$ {{ q.breakdown.recommendedDirectPrice.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.775rem; color: var(--text-muted); margin-bottom: 1rem;">
            <div style="background: rgba(255, 255, 255, 0.02); padding: 0.5rem; border-radius: var(--radius-sm);">
              <span>Peso Total:</span>
              <div class="font-mono" style="font-weight: 700; color: var(--text-main);">{{ q.breakdown.totalGrams }}g</div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.02); padding: 0.5rem; border-radius: var(--radius-sm);">
              <span>Lucro Bruto:</span>
              <div class="font-mono" style="font-weight: 700; color: var(--brand-emerald);">R$ {{ q.breakdown.directProfit.toFixed(2) }}</div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.02); padding: 0.5rem; border-radius: var(--radius-sm);">
              <span>Margem:</span>
              <div class="font-mono" style="font-weight: 700; color: var(--brand-cyan);">{{ q.breakdown.directMarginPercent.toFixed(0) }}%</div>
            </div>
          </div>

          <p v-if="q.notes" style="font-size: 0.775rem; color: var(--text-dim); margin-bottom: 0.85rem; font-style: italic;">
            "{{ q.notes }}"
          </p>
        </div>

        <!-- Card Footer Actions -->
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem;">
          <button 
            :id="`btn-load-quote-${q.id}`"
            class="btn btn-primary btn-sm" 
            title="Carregar de volta na calculadora"
            @click="handleLoadQuote(q)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Carregar
          </button>

          <button 
            :id="`btn-proposal-quote-${q.id}`"
            class="btn btn-secondary btn-sm" 
            title="Ver proposta comercial"
            @click="$emit('view-quote-proposal', q)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Proposta
          </button>

          <button 
            :id="`btn-delete-quote-${q.id}`"
            class="btn btn-danger btn-sm" 
            title="Excluir orçamento"
            @click="handleDelete(q.id, q.title)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card" style="text-align: center; padding: 3rem 1.5rem;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Nenhum orçamento salvo ainda</h3>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.25rem;">
        Ao preencher os dados de impressão na calculadora, clique em "Salvar Orçamento" para armazenar seus projetos aqui.
      </p>
      <button class="btn btn-primary" @click="$emit('switch-to-calc')">Ir para a Calculadora</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SavedQuote } from '~/types'
import { use3DStore } from '~/composables/use3DStore'

const emit = defineEmits<{
  (e: 'switch-to-calc'): void
  (e: 'view-quote-proposal', quote: SavedQuote): void
  (e: 'quote-loaded'): void
}>()

const { savedQuotes, deleteQuote, loadQuoteIntoActive } = use3DStore()

const searchQuery = ref('')

const filteredQuotes = computed(() => {
  if (!searchQuery.value) return savedQuotes
  const q = searchQuery.value.toLowerCase()
  return savedQuotes.filter(item => 
    item.title.toLowerCase().includes(q) || 
    (item.clientName && item.clientName.toLowerCase().includes(q))
  )
})

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

const handleLoadQuote = (quote: SavedQuote) => {
  loadQuoteIntoActive(quote)
  emit('quote-loaded')
}

const handleDelete = (id: string, title: string) => {
  if (confirm(`Excluir orçamento "${title}"?`)) {
    deleteQuote(id)
  }
}
</script>
