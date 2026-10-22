<template>
  <div class="platform-simulator-container" style="margin-top: 2rem;">
    <!-- Simulator Section Header -->
    <div class="card card-glass" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
            <span class="badge badge-emerald">Simulador Inteligente</span>
            <span style="font-size: 0.8rem; color: var(--text-dim);">Fórmula Reversa de Markup & Dedução</span>
          </div>
          <h2 style="font-size: 1.4rem; font-weight: 800;">
            <span class="text-gradient">Simulador de Vendas em Marketplaces & Canais</span>
          </h2>
          <p class="card-subtitle">
            Veja exatamente quanto cobrar no Mercado Livre, Shopee, Elo7 e outros para garantir seu lucro líquido, ou teste qualquer preço de venda e descubra o que realmente sobra na sua conta.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button id="btn-sync-all-recommended" class="btn btn-secondary btn-sm" @click="resetAllToRecommended">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            Restaurar Preços Sugeridos
          </button>
          <button id="btn-copy-prices-summary" class="btn btn-primary btn-sm" @click="copyPricesSummary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copied ? 'Copiado!' : 'Copiar Tabela de Preços' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Comparative Quick Ranking Table -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header">
        <div class="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Comparativo Rápido de Preços & Lucro Líquido</span>
        </div>
        <span style="font-size: 0.8rem; color: var(--text-dim);">Custo de Fabricação Base: <strong class="font-mono text-gradient-rose">R$ {{ jobCostBreakdown.totalProductionCost.toFixed(2) }}</strong></span>
      </div>

      <div class="table-responsive">
        <table class="table-custom">
          <thead>
            <tr>
              <th>Plataforma / Canal</th>
              <th>Preço Sugerido (Alvo)</th>
              <th>Preço Simulado</th>
              <th>Total de Taxas</th>
              <th>% Taxas Efetivas</th>
              <th>Você Recebe Líquido</th>
              <th>Lucro no Bolso</th>
              <th>Margem Líquida</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sim in sortedSimulations" :key="sim.platformId">
              <td>
                <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                  <span class="platform-indicator" :style="{ backgroundColor: sim.badgeColor }"></span>
                  <span>{{ sim.platformName }}</span>
                </div>
              </td>

              <td>
                <span class="font-mono" style="font-weight: 700; color: var(--brand-cyan);">
                  R$ {{ sim.recommendedPrice.toFixed(2) }}
                </span>
              </td>

              <td>
                <div class="input-prefix-box" style="max-width: 130px; height: 34px;">
                  <span class="input-prefix-tag" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">R$</span>
                  <input 
                    :id="`table-price-input-${sim.platformId}`"
                    type="number" 
                    class="input-control font-mono" 
                    style="padding: 0.2rem 0.4rem; font-size: 0.85rem;" 
                    step="0.5" 
                    min="0"
                    :value="manualSalePrice[sim.platformId] !== undefined ? manualSalePrice[sim.platformId] : Number(sim.recommendedPrice.toFixed(2))"
                    @input="handlePriceInputChange(sim.platformId, ($event.target as HTMLInputElement).value)"
                  />
                </div>
              </td>

              <td>
                <span class="font-mono" style="color: var(--brand-rose); font-weight: 600;">
                  - R$ {{ sim.totalFees.toFixed(2) }}
                </span>
              </td>

              <td>
                <span class="font-mono" style="color: var(--text-muted);">
                  {{ sim.salePriceToSimulate > 0 ? ((sim.totalFees / sim.salePriceToSimulate) * 100).toFixed(1) : '0.0' }}%
                </span>
              </td>

              <td>
                <span class="font-mono" style="font-weight: 700; color: var(--text-main);">
                  R$ {{ sim.netRevenue.toFixed(2) }}
                </span>
              </td>

              <td>
                <span class="font-mono" style="font-weight: 800; font-size: 1rem;" :style="{ color: sim.netProfit > 0 ? 'var(--brand-emerald)' : 'var(--brand-rose)' }">
                  R$ {{ sim.netProfit.toFixed(2) }}
                </span>
              </td>

              <td>
                <span class="font-mono" style="font-weight: 700;" :style="{ color: sim.netProfitMarginPercent >= 30 ? 'var(--brand-emerald)' : sim.netProfitMarginPercent > 0 ? 'var(--brand-amber)' : 'var(--brand-rose)' }">
                  {{ sim.netProfitMarginPercent.toFixed(1) }}%
                </span>
              </td>

              <td>
                <span 
                  class="badge" 
                  :class="sim.netProfit >= jobCostBreakdown.directProfit * 0.95 ? 'badge-emerald' : sim.netProfit > 0 ? 'badge-amber' : 'badge-rose'"
                >
                  {{ sim.netProfit >= jobCostBreakdown.directProfit * 0.95 ? 'Ideal' : sim.netProfit > 0 ? 'Moderado' : 'Prejuízo' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detailed Simulation Cards Grid -->
    <div class="platform-grid">
      <div 
        v-for="sim in platformSimulations" 
        :key="sim.platformId" 
        class="platform-card"
        :style="{ borderTop: `4px solid ${sim.badgeColor || 'var(--brand-cyan)'}` }"
      >
        <!-- Card Header -->
        <div class="platform-card-header">
          <div class="platform-logo-title">
            <span class="platform-indicator" :style="{ backgroundColor: sim.badgeColor }"></span>
            <span>{{ sim.platformName }}</span>
          </div>

          <span 
            class="badge" 
            :class="sim.netProfit >= jobCostBreakdown.directProfit * 0.95 ? 'badge-emerald' : sim.netProfit > 0 ? 'badge-amber' : 'badge-rose'"
          >
            {{ sim.netProfit >= jobCostBreakdown.directProfit * 0.95 ? 'Lucro Alvo' : sim.netProfit > 0 ? 'Lucro Abaixo' : 'Prejuízo' }}
          </span>
        </div>

        <!-- Recommended Selling Price vs Custom Simulation -->
        <div class="price-display-box">
          <div>
            <div style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">
              Preço Sugerido (Alvo)
            </div>
            <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--brand-cyan);">
              R$ {{ sim.recommendedPrice.toFixed(2) }}
            </div>
          </div>

          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            style="font-size: 0.725rem; padding: 0.25rem 0.5rem;"
            title="Usar o preço sugerido nesta simulação"
            @click="applyRecommendedPrice(sim.platformId, sim.recommendedPrice)"
          >
            Usar Sugerido
          </button>
        </div>

        <!-- Custom Price Simulation Input -->
        <div class="form-group">
          <label class="form-label" :for="`input-sim-price-${sim.platformId}`">
            <span>Simular Preço de Venda do Anúncio</span>
            <span class="font-mono" style="color: var(--brand-cyan); font-weight: 700;">R$ {{ sim.salePriceToSimulate.toFixed(2) }}</span>
          </label>
          <div class="input-prefix-box">
            <span class="input-prefix-tag">R$</span>
            <input 
              :id="`input-sim-price-${sim.platformId}`"
              type="number" 
              class="input-control font-mono" 
              step="0.5" 
              min="1"
              :value="manualSalePrice[sim.platformId] !== undefined ? manualSalePrice[sim.platformId] : Number(sim.recommendedPrice.toFixed(2))"
              @input="handlePriceInputChange(sim.platformId, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Breakdown List -->
        <div class="fee-breakdown-list">
          <div class="fee-item">
            <span>Comissão da Plataforma</span>
            <span class="font-mono">- R$ {{ sim.commissionAmount.toFixed(2) }}</span>
          </div>

          <div v-if="sim.fixedFeeAmount > 0" class="fee-item">
            <span>Taxa Fixa por Item</span>
            <span class="font-mono">- R$ {{ sim.fixedFeeAmount.toFixed(2) }}</span>
          </div>

          <div v-if="sim.shippingSubsidyAmount > 0" class="fee-item">
            <span>Coparticipação Frete Grátis</span>
            <span class="font-mono" style="color: var(--brand-amber);">- R$ {{ sim.shippingSubsidyAmount.toFixed(2) }}</span>
          </div>

          <div class="fee-item">
            <span>Imposto de Nota ({{ settings.taxRatePercent }}%)</span>
            <span class="font-mono">- R$ {{ sim.taxAmount.toFixed(2) }}</span>
          </div>

          <div class="fee-item total">
            <span>Total de Descontos ({{ sim.salePriceToSimulate > 0 ? ((sim.totalFees / sim.salePriceToSimulate) * 100).toFixed(1) : 0 }}%)</span>
            <span class="font-mono" style="color: var(--brand-rose); font-weight: 700;">- R$ {{ sim.totalFees.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Net Revenue & Net Profit Box -->
        <div class="profit-summary-box" :style="{ backgroundColor: sim.netProfit > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)', borderColor: sim.netProfit > 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)' }">
          <div>
            <div style="font-size: 0.725rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">
              Lucro Líquido Real
            </div>
            <div class="font-mono" style="font-size: 1.4rem; font-weight: 800; line-height: 1.1;" :style="{ color: sim.netProfit > 0 ? 'var(--brand-emerald)' : 'var(--brand-rose)' }">
              R$ {{ sim.netProfit.toFixed(2) }}
            </div>
            <div style="font-size: 0.725rem; color: var(--text-dim); margin-top: 0.2rem;">
              Entra na conta: <strong class="font-mono" style="color: var(--text-main);">R$ {{ sim.netRevenue.toFixed(2) }}</strong>
            </div>
          </div>

          <div style="text-align: right;">
            <span class="badge" :class="sim.netProfitMarginPercent >= 25 ? 'badge-emerald' : sim.netProfitMarginPercent > 0 ? 'badge-amber' : 'badge-rose'">
              {{ sim.netProfitMarginPercent.toFixed(1) }}% Margem
            </span>
            <div style="font-size: 0.725rem; color: var(--text-dim); margin-top: 0.35rem;">
              sobre o valor anunciado
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use3DStore } from '~/composables/use3DStore'

const { 
  platformSimulations, 
  manualSalePrice, 
  jobCostBreakdown, 
  settings, 
  activeJob 
} = use3DStore()

const copied = ref(false)

const handlePriceInputChange = (platformId: string, val: string) => {
  const num = parseFloat(val)
  if (!isNaN(num)) {
    manualSalePrice[platformId] = num
  }
}

const applyRecommendedPrice = (platformId: string, recPrice: number) => {
  manualSalePrice[platformId] = parseFloat(recPrice.toFixed(2))
}

const resetAllToRecommended = () => {
  platformSimulations.value.forEach(sim => {
    manualSalePrice[sim.platformId] = parseFloat(sim.recommendedPrice.toFixed(2))
  })
}

const sortedSimulations = computed(() => {
  return [...platformSimulations.value].sort((a, b) => b.netProfit - a.netProfit)
})

const copyPricesSummary = () => {
  const lines = [
    `📦 ORÇAMENTO 3D: ${activeJob.title}`,
    `Custo Base de Fabricação: R$ ${jobCostBreakdown.value.totalProductionCost.toFixed(2)}`,
    `Venda Direta Sugerida (PIX): R$ ${jobCostBreakdown.value.recommendedDirectPrice.toFixed(2)}`,
    '',
    '--- PREÇOS RECOMENDADOS POR PLATAFORMA ---'
  ]

  platformSimulations.value.forEach(sim => {
    lines.push(`• ${sim.platformName}: R$ ${sim.recommendedPrice.toFixed(2)} (Lucro Liq: R$ ${sim.netProfit.toFixed(2)})`)
  })

  lines.push('')
  lines.push(`Calculado pelo Print3D Pro em ${new Date().toLocaleDateString('pt-BR')}`)

  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  })
}
</script>
