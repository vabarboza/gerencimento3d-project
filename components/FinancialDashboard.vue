<template>
  <div class="dashboard-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
    <!-- Top Header & Filter Controls -->
    <div class="card" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(139, 92, 246, 0.08)); border-color: rgba(0, 240, 255, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.25rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--brand-emerald), var(--brand-cyan)); display: flex; align-items: center; justify-content: center; color: #040810; font-size: 1.5rem; flex-shrink: 0; box-shadow: 0 0 20px rgba(16, 185, 129, 0.35);">
            📊
          </div>
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span>Dashboard Financeiro & Inteligência de Negócio</span>
              <span class="badge badge-cyan" style="font-size: 0.7rem; font-weight: 700;">BI & Analytics</span>
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Métricas consolidadas de vendas, lucro líquido real, despesas de fabricação e desempenho por canal.
            </p>
          </div>
        </div>

        <!-- Filter & Export Action Buttons -->
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <!-- Period Filter Selector -->
          <div style="display: flex; align-items: center; gap: 0.35rem; background: rgba(0,0,0,0.3); padding: 0.25rem 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.75rem; color: var(--text-dim);">Período:</span>
            <select v-model="selectedPeriod" class="input-control" style="font-size: 0.775rem; height: 32px; padding: 0 0.5rem; width: auto; background: transparent; border: none; color: var(--brand-cyan); font-weight: 700;">
              <option value="all">Todo o Histórico</option>
              <option value="this_month">Este Mês</option>
              <option value="last_30">Últimos 30 Dias</option>
              <option value="last_7">Últimos 7 Dias</option>
            </select>
          </div>

          <!-- Status Filter Selector -->
          <div style="display: flex; align-items: center; gap: 0.35rem; background: rgba(0,0,0,0.3); padding: 0.25rem 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <span style="font-size: 0.75rem; color: var(--text-dim);">Status:</span>
            <select v-model="selectedStatusFilter" class="input-control" style="font-size: 0.775rem; height: 32px; padding: 0 0.5rem; width: auto; background: transparent; border: none; color: var(--text-main); font-weight: 600;">
              <option value="all">Todos os Status</option>
              <option value="concluido_producao">Vendas Reais (Concluído/Produção)</option>
              <option value="concluido">Apenas Concluídos</option>
              <option value="orcamento">Apenas Orçamentos</option>
            </select>
          </div>

          <!-- Export CSV / Excel Button -->
          <button 
            id="btn-export-csv" 
            type="button" 
            class="btn btn-secondary btn-sm" 
            title="Baixar planilha compatível com Excel e Google Sheets"
            @click="exportCsv"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Planilha CSV</span>
          </button>

          <!-- Print PDF Report Button -->
          <button 
            id="btn-print-report" 
            type="button" 
            class="btn btn-primary btn-sm" 
            title="Imprimir relatório executivo consolidado"
            @click="printFinancialReport"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>Relatório PDF</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 5 Top KPI Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem;">
      <!-- Card 1: Faturamento Bruto -->
      <div class="card" style="position: relative; overflow: hidden; border-left: 4px solid var(--brand-cyan);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em;">Faturamento Bruto</span>
          <span style="font-size: 1.25rem;">💰</span>
        </div>
        <div class="font-mono text-gradient-cyan" style="font-size: 1.75rem; font-weight: 800; line-height: 1.1; margin-bottom: 0.35rem;">
          R$ {{ metrics.totalRevenue.toFixed(2) }}
        </div>
        <span style="font-size: 0.725rem; color: var(--text-muted);">
          Total de <strong>{{ metrics.orderCount }}</strong> pedido(s) no filtro
        </span>
      </div>

      <!-- Card 2: Custos de Fabricação -->
      <div class="card" style="position: relative; overflow: hidden; border-left: 4px solid var(--brand-rose);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em;">Custos de Produção</span>
          <span style="font-size: 1.25rem;">📉</span>
        </div>
        <div class="font-mono" style="font-size: 1.75rem; font-weight: 800; color: var(--brand-rose); line-height: 1.1; margin-bottom: 0.35rem;">
          R$ {{ metrics.totalProductionCost.toFixed(2) }}
        </div>
        <span style="font-size: 0.725rem; color: var(--text-muted);">
          Matéria-prima, energia, máquinas & mão de obra
        </span>
      </div>

      <!-- Card 3: Lucro Líquido Real -->
      <div class="card" style="position: relative; overflow: hidden; border-left: 4px solid var(--brand-emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(10, 16, 28, 0.9));">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--brand-emerald); letter-spacing: 0.05em;">Lucro Líquido Real</span>
          <span style="font-size: 1.25rem;">💵</span>
        </div>
        <div class="font-mono text-gradient-emerald" style="font-size: 1.75rem; font-weight: 800; line-height: 1.1; margin-bottom: 0.35rem;">
          R$ {{ metrics.totalNetProfit.toFixed(2) }}
        </div>
        <span style="font-size: 0.725rem; color: var(--brand-emerald); font-weight: 600;">
          Margem líquida real de {{ metrics.averageMarginPercent.toFixed(1) }}%
        </span>
      </div>

      <!-- Card 4: Horas de Máquina & Gramas -->
      <div class="card" style="position: relative; overflow: hidden; border-left: 4px solid #8b5cf6;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em;">Produção / Máquina</span>
          <span style="font-size: 1.25rem;">⏱️</span>
        </div>
        <div class="font-mono" style="font-size: 1.75rem; font-weight: 800; color: #a78bfa; line-height: 1.1; margin-bottom: 0.35rem;">
          {{ metrics.totalPrintHours.toFixed(1) }}h
        </div>
        <span style="font-size: 0.725rem; color: var(--text-muted);">
          Consumo total: <strong>{{ (metrics.totalGrams / 1000).toFixed(2) }} kg</strong> ({{ metrics.totalGrams }}g)
        </span>
      </div>

      <!-- Card 5: Ticket Médio & Estoque Ativo -->
      <div class="card" style="position: relative; overflow: hidden; border-left: 4px solid var(--brand-amber);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-dim); letter-spacing: 0.05em;">Ticket Médio</span>
          <span style="font-size: 1.25rem;">🎯</span>
        </div>
        <div class="font-mono" style="font-size: 1.75rem; font-weight: 800; color: var(--brand-amber); line-height: 1.1; margin-bottom: 0.35rem;">
          R$ {{ metrics.averageTicket.toFixed(2) }}
        </div>
        <span style="font-size: 0.725rem; color: var(--text-muted);">
          Estoque em carretéis: <strong>R$ {{ totalStockValue.toFixed(2) }}</strong>
        </span>
      </div>
    </div>

    <!-- Charts Row: Evolução Financeira & Composição de Custos -->
    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; align-items: stretch;">
      
      <!-- Chart 1: Evolução Financeira Mensal (Faturamento vs. Custo vs. Lucro) -->
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
          <div class="card-title" style="font-size: 0.95rem;">
            <span>📈 Evolução Financeira por Mês</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.725rem;">
            <span style="display: flex; align-items: center; gap: 0.3rem; color: var(--brand-cyan);">
              <span style="width: 8px; height: 8px; border-radius: 2px; background: var(--brand-cyan);"></span> Faturamento
            </span>
            <span style="display: flex; align-items: center; gap: 0.3rem; color: var(--brand-emerald);">
              <span style="width: 8px; height: 8px; border-radius: 2px; background: var(--brand-emerald);"></span> Lucro Líquido
            </span>
          </div>
        </div>

        <div style="padding: 1rem 0; flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
          <!-- SVG Bar Chart -->
          <div v-if="monthlyData.length > 0" style="width: 100%; height: 210px; display: flex; align-items: flex-end; gap: 1.5rem; justify-content: space-around; padding: 0 1rem; border-bottom: 1px solid var(--border-subtle);">
            <div 
              v-for="item in monthlyData" 
              :key="item.month" 
              style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; flex: 1; max-width: 70px; height: 100%; justify-content: flex-end;"
            >
              <!-- Bar Group (Revenue & Profit) -->
              <div style="display: flex; align-items: flex-end; gap: 4px; height: 160px; width: 100%; justify-content: center;">
                <!-- Revenue Bar -->
                <div 
                  :style="{ height: `${Math.max(6, (item.revenue / maxMonthlyRevenue) * 150)}px` }" 
                  style="width: 18px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--brand-cyan), #0284c7); transition: height 0.4s ease; position: relative;"
                  :title="`Faturamento: R$ ${item.revenue.toFixed(2)}`"
                ></div>

                <!-- Profit Bar -->
                <div 
                  :style="{ height: `${Math.max(6, (item.profit / maxMonthlyRevenue) * 150)}px` }" 
                  style="width: 18px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, var(--brand-emerald), #059669); transition: height 0.4s ease; position: relative;"
                  :title="`Lucro Líquido: R$ ${item.profit.toFixed(2)}`"
                ></div>
              </div>

              <!-- Month Label -->
              <span style="font-size: 0.725rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">
                {{ item.label }}
              </span>
            </div>
          </div>

          <div v-else style="text-align: center; color: var(--text-dim); padding: 3rem 1rem;">
            Nenhum dado financeiro registrado no período selecionado.
          </div>
        </div>
      </div>

      <!-- Chart 2: Composição de Custos de Produção -->
      <div class="card" style="display: flex; flex-direction: column;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
          <div class="card-title" style="font-size: 0.95rem;">
            <span>🔬 Onde Está o Custo de Produção?</span>
          </div>
          <span class="badge badge-rose" style="font-size: 0.675rem;">Detalhamento</span>
        </div>

        <div style="padding: 1rem 0; flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 0.85rem;">
          <div v-for="cost in costBreakdownItems" :key="cost.name" style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem;">
              <span style="color: var(--text-main); font-weight: 600; display: flex; align-items: center; gap: 0.4rem;">
                <span>{{ cost.icon }}</span>
                <span>{{ cost.name }}</span>
              </span>
              <span class="font-mono" style="color: var(--text-dim);">
                <strong>R$ {{ cost.amount.toFixed(2) }}</strong> ({{ cost.percent.toFixed(1) }}%)
              </span>
            </div>

            <!-- Progress Bar -->
            <div style="width: 100%; height: 7px; background: rgba(255, 255, 255, 0.06); border-radius: 99px; overflow: hidden;">
              <div 
                :style="{ width: `${cost.percent}%`, background: cost.color }" 
                style="height: 100%; border-radius: 99px; transition: width 0.4s ease;"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Row: Performance por Canal & Consumo de Filamentos -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
      <!-- Chart 3: Desempenho por Canal de Venda -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
          <div class="card-title" style="font-size: 0.95rem;">
            <span>🛒 Vendas por Canal (Marketplace vs. Direto)</span>
          </div>
        </div>

        <div v-if="channelStats.length > 0" style="display: flex; flex-direction: column; gap: 0.75rem; padding-top: 0.75rem;">
          <div 
            v-for="ch in channelStats" 
            :key="ch.channel" 
            style="background: rgba(0, 0, 0, 0.25); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;"
          >
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">
                {{ ch.channel }}
              </div>
              <div style="font-size: 0.725rem; color: var(--text-dim);">
                {{ ch.count }} pedido(s) • Média R$ {{ (ch.revenue / ch.count).toFixed(2) }}/ped
              </div>
            </div>

            <div style="text-align: right;">
              <div class="font-mono" style="font-size: 0.95rem; font-weight: 800; color: var(--brand-emerald);">
                R$ {{ ch.profit.toFixed(2) }} lucro
              </div>
              <div style="font-size: 0.725rem; color: var(--brand-cyan); font-weight: 600;">
                R$ {{ ch.revenue.toFixed(2) }} total
              </div>
            </div>
          </div>
        </div>

        <div v-else style="text-align: center; color: var(--text-dim); padding: 2rem;">
          Nenhum pedido classificado por canal de venda ainda.
        </div>
      </div>

      <!-- Chart 4: Materiais Mais Usados & Alerta de Estoque -->
      <div class="card">
        <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
          <div class="card-title" style="font-size: 0.95rem;">
            <span>🧵 Materiais & Saúde do Estoque</span>
          </div>
          <span v-if="lowStockFilaments.length > 0" class="badge badge-amber" style="font-size: 0.675rem;">
            ⚠️ {{ lowStockFilaments.length }} Carretel(is) Crítico(s)
          </span>
          <span v-else class="badge badge-emerald" style="font-size: 0.675rem;">
            ✓ Estoque Normal
          </span>
        </div>

        <!-- Material Consumption Bars -->
        <div style="padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div v-for="mat in materialStats" :key="mat.material" style="display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.775rem;">
              <span style="font-weight: 700; color: var(--text-main);">{{ mat.material }}</span>
              <span class="font-mono" style="color: var(--brand-cyan);">
                <strong>{{ (mat.grams / 1000).toFixed(2) }} kg</strong> ({{ mat.percent.toFixed(1) }}%)
              </span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.06); border-radius: 99px; overflow: hidden;">
              <div :style="{ width: `${mat.percent}%` }" style="height: 100%; background: linear-gradient(90deg, var(--brand-cyan), var(--brand-blue)); border-radius: 99px;"></div>
            </div>
          </div>

          <!-- Low Stock Warning Box -->
          <div v-if="lowStockFilaments.length > 0" style="margin-top: 0.5rem; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: var(--radius-md); padding: 0.75rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--brand-amber); margin-bottom: 0.25rem;">
              ⚠️ Carretéis com estoque baixo (&lt; 200g):
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
              <span 
                v-for="f in lowStockFilaments" 
                :key="f.id" 
                class="badge badge-amber font-mono" 
                style="font-size: 0.7rem; padding: 0.2rem 0.5rem;"
              >
                {{ f.name }}: {{ f.remainingG }}g restantes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytical Quotes Table with Search & Sort -->
    <div class="card">
      <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
        <div class="card-title">
          <span>📋 Tabela Analítica de Pedidos & Margens</span>
          <span class="badge badge-cyan">{{ filteredQuotes.length }}</span>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="input-control" 
            placeholder="Buscar peça ou cliente..." 
            style="font-size: 0.775rem; height: 32px; width: 220px;"
          />
        </div>
      </div>

      <!-- Table View -->
      <div class="table-container" style="max-height: 420px; overflow-y: auto;">
        <table class="table" style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-dim); text-align: left;">
              <th style="padding: 0.65rem 0.75rem;">Data</th>
              <th style="padding: 0.65rem 0.75rem;">Projeto / Peça</th>
              <th style="padding: 0.65rem 0.75rem;">Cliente</th>
              <th style="padding: 0.65rem 0.75rem;">Status</th>
              <th style="padding: 0.65rem 0.75rem; text-align: right;">Custo Real</th>
              <th style="padding: 0.65rem 0.75rem; text-align: right;">Preço Venda</th>
              <th style="padding: 0.65rem 0.75rem; text-align: right;">Lucro Líquido</th>
              <th style="padding: 0.65rem 0.75rem; text-align: center;">Margem</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="q in paginatedQuotes" 
              :key="q.id" 
              style="border-bottom: 1px solid rgba(255, 255, 255, 0.04);"
            >
              <td style="padding: 0.65rem 0.75rem; color: var(--text-dim);">
                {{ formatDate(q.createdAt) }}
              </td>
              <td style="padding: 0.65rem 0.75rem; font-weight: 700; color: var(--text-main);">
                {{ q.title }}
              </td>
              <td style="padding: 0.65rem 0.75rem; color: var(--text-muted);">
                {{ q.clientName || 'Cliente Particular' }}
              </td>
              <td style="padding: 0.65rem 0.75rem;">
                <span :class="getStatusBadgeClass(q.status)">
                  {{ formatStatus(q.status) }}
                </span>
              </td>
              <td class="font-mono" style="padding: 0.65rem 0.75rem; text-align: right; color: var(--brand-rose);">
                R$ {{ q.breakdown.totalProductionCost.toFixed(2) }}
              </td>
              <td class="font-mono" style="padding: 0.65rem 0.75rem; text-align: right; font-weight: 700; color: #fff;">
                R$ {{ (q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice).toFixed(2) }}
              </td>
              <td class="font-mono text-gradient-emerald" style="padding: 0.65rem 0.75rem; text-align: right; font-weight: 800;">
                R$ {{ (q.selectedPlatformPrice?.profit || q.breakdown.directProfit).toFixed(2) }}
              </td>
              <td class="font-mono" style="padding: 0.65rem 0.75rem; text-align: center; color: var(--brand-emerald); font-weight: 700;">
                {{ q.breakdown.directMarginPercent.toFixed(1) }}%
              </td>
            </tr>

            <tr v-if="paginatedQuotes.length === 0">
              <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
                Nenhum orçamento encontrado com os filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use3DStore } from '~/composables/use3DStore'
import type { SavedQuote } from '~/types'

const store = use3DStore()
const { savedQuotes, filaments, settings } = store

const selectedPeriod = ref('all')
const selectedStatusFilter = ref('concluido_producao')
const searchQuery = ref('')

// Filter quotes by Period, Status & Search Query
const filteredQuotes = computed(() => {
  let list = [...savedQuotes]

  // Period Filter
  const now = new Date()
  if (selectedPeriod.value === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    list = list.filter(q => new Date(q.createdAt) >= startOfMonth)
  } else if (selectedPeriod.value === 'last_30') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    list = list.filter(q => new Date(q.createdAt) >= thirtyDaysAgo)
  } else if (selectedPeriod.value === 'last_7') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    list = list.filter(q => new Date(q.createdAt) >= sevenDaysAgo)
  }

  // Status Filter
  if (selectedStatusFilter.value === 'concluido_producao') {
    list = list.filter(q => q.status === 'concluido' || q.status === 'em_producao' || !q.status)
  } else if (selectedStatusFilter.value === 'concluido') {
    list = list.filter(q => q.status === 'concluido')
  } else if (selectedStatusFilter.value === 'orcamento') {
    list = list.filter(q => q.status === 'orcamento')
  }

  // Search Filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(q => 
      q.title.toLowerCase().includes(query) || 
      (q.clientName && q.clientName.toLowerCase().includes(query))
    )
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const paginatedQuotes = computed(() => {
  return filteredQuotes.value
})

// Top Metrics
const metrics = computed(() => {
  const list = filteredQuotes.value
  const orderCount = list.length
  if (orderCount === 0) {
    return {
      totalRevenue: 0,
      totalProductionCost: 0,
      totalNetProfit: 0,
      averageMarginPercent: 0,
      totalPrintHours: 0,
      totalGrams: 0,
      averageTicket: 0,
      orderCount: 0
    }
  }

  let totalRevenue = 0
  let totalProductionCost = 0
  let totalNetProfit = 0
  let totalPrintHours = 0
  let totalGrams = 0

  list.forEach(q => {
    const salePrice = q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice || 0
    const profit = q.selectedPlatformPrice?.profit || q.breakdown.directProfit || 0
    const cost = q.breakdown.totalProductionCost || 0

    totalRevenue += salePrice
    totalProductionCost += cost
    totalNetProfit += profit
    totalPrintHours += (q.printTimeHours || 0) + ((q.printTimeMinutes || 0) / 60)
    totalGrams += (q.breakdown.totalGrams || 0)
  })

  const averageMarginPercent = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0
  const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0

  return {
    totalRevenue,
    totalProductionCost,
    totalNetProfit,
    averageMarginPercent,
    totalPrintHours,
    totalGrams,
    averageTicket,
    orderCount
  }
})

// Value of spools in active stock
const totalStockValue = computed(() => {
  return filaments.reduce((acc, f) => {
    const fraction = f.spoolWeightG > 0 ? f.remainingG / f.spoolWeightG : 0
    return acc + (f.pricePaid * fraction)
  }, 0)
})

// Low stock filaments (< 200g)
const lowStockFilaments = computed(() => {
  return filaments.filter(f => f.remainingG <= 200)
})

// Cost Breakdown by category
const costBreakdownItems = computed(() => {
  const list = filteredQuotes.value
  let filament = 0
  let energy = 0
  let labor = 0
  let maintenance = 0
  let packagingHardware = 0

  list.forEach(q => {
    filament += q.breakdown.filamentCost || 0
    energy += q.breakdown.energyCost || 0
    labor += q.breakdown.laborCost || 0
    maintenance += (q.breakdown.maintenanceCost || 0) + (q.breakdown.depreciationCost || 0)
    packagingHardware += (q.breakdown.packagingCost || 0) + (q.breakdown.hardwareCost || 0)
  })

  const total = filament + energy + labor + maintenance + packagingHardware || 1

  return [
    { name: 'Matéria-Prima (Filamento)', icon: '🧵', amount: filament, percent: (filament / total) * 100, color: 'var(--brand-cyan)' },
    { name: 'Energia Elétrica (kWh)', icon: '⚡', amount: energy, percent: (energy / total) * 100, color: 'var(--brand-amber)' },
    { name: 'Mão de Obra Técnica', icon: '👷', amount: labor, percent: (labor / total) * 100, color: 'var(--brand-emerald)' },
    { name: 'Depreciação & Manutenção', icon: '🔧', amount: maintenance, percent: (maintenance / total) * 100, color: '#8b5cf6' },
    { name: 'Embalagem & Hardware Extra', icon: '📦', amount: packagingHardware, percent: (packagingHardware / total) * 100, color: '#ec4899' }
  ]
})

// Monthly data grouping for SVG Chart
const monthlyData = computed(() => {
  const list = filteredQuotes.value
  const map: { [key: string]: { month: string, label: string, revenue: number, profit: number } } = {}

  list.forEach(q => {
    const d = new Date(q.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')

    if (!map[key]) {
      map[key] = { month: key, label, revenue: 0, profit: 0 }
    }

    const salePrice = q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice || 0
    const profit = q.selectedPlatformPrice?.profit || q.breakdown.directProfit || 0
    map[key].revenue += salePrice
    map[key].profit += profit
  })

  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
})

const maxMonthlyRevenue = computed(() => {
  const max = Math.max(...monthlyData.value.map(m => m.revenue), 10)
  return max * 1.15
})

// Channel / Marketplace Statistics
const channelStats = computed(() => {
  const list = filteredQuotes.value
  const map: { [key: string]: { channel: string, count: number, revenue: number, profit: number } } = {}

  list.forEach(q => {
    const ch = q.selectedPlatformPrice?.platformName || 'Venda Direta / PIX / WhatsApp'
    if (!map[ch]) {
      map[ch] = { channel: ch, count: 0, revenue: 0, profit: 0 }
    }
    const salePrice = q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice || 0
    const profit = q.selectedPlatformPrice?.profit || q.breakdown.directProfit || 0
    map[ch].count += 1
    map[ch].revenue += salePrice
    map[ch].profit += profit
  })

  return Object.values(map).sort((a, b) => b.revenue - a.revenue)
})

// Material usage breakdown
const materialStats = computed(() => {
  const list = filteredQuotes.value
  const map: { [key: string]: number } = {}
  let totalGrams = 0

  list.forEach(q => {
    q.filaments.forEach(item => {
      const fil = filaments.find(f => f.id === item.filamentId)
      const mat = fil ? fil.material : 'PLA'
      map[mat] = (map[mat] || 0) + item.grams
      totalGrams += item.grams
    })
  })

  if (totalGrams === 0) return []

  return Object.entries(map).map(([material, grams]) => ({
    material,
    grams,
    percent: (grams / totalGrams) * 100
  })).sort((a, b) => b.grams - a.grams)
})

const formatDate = (isoString?: string) => {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR')
}

const formatStatus = (st?: string) => {
  switch (st) {
    case 'concluido': return 'Concluído'
    case 'em_producao': return 'Em Produção'
    case 'cancelado': return 'Cancelado'
    default: return 'Orçamento'
  }
}

const getStatusBadgeClass = (st?: string) => {
  switch (st) {
    case 'concluido': return 'badge badge-emerald'
    case 'em_producao': return 'badge badge-cyan'
    case 'cancelado': return 'badge badge-rose'
    default: return 'badge badge-amber'
  }
}

// Export CSV for Excel
const exportCsv = () => {
  const headers = [
    'ID Pedido',
    'Data',
    'Titulo Projeto',
    'Cliente',
    'Status',
    'Canal de Venda',
    'Peso Total (g)',
    'Horas de Impressao',
    'Custo Filamento (R$)',
    'Custo Energia (R$)',
    'Custo Mao de Obra (R$)',
    'Custo Fabricacao Total (R$)',
    'Preco de Venda (R$)',
    'Lucro Liquido (R$)',
    'Margem Real (%)'
  ]

  const rows = filteredQuotes.value.map(q => {
    const salePrice = (q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice || 0).toFixed(2)
    const profit = (q.selectedPlatformPrice?.profit || q.breakdown.directProfit || 0).toFixed(2)
    const cost = (q.breakdown.totalProductionCost || 0).toFixed(2)
    const channel = q.selectedPlatformPrice?.platformName || 'Venda Direta / PIX / WhatsApp'

    return [
      `"${q.id}"`,
      `"${formatDate(q.createdAt)}"`,
      `"${(q.title || '').replace(/"/g, '""')}"`,
      `"${(q.clientName || 'Cliente Particular').replace(/"/g, '""')}"`,
      `"${formatStatus(q.status)}"`,
      `"${channel.replace(/"/g, '""')}"`,
      q.breakdown.totalGrams || 0,
      q.breakdown.totalPrintHours || 0,
      (q.breakdown.filamentCost || 0).toFixed(2),
      (q.breakdown.energyCost || 0).toFixed(2),
      (q.breakdown.laborCost || 0).toFixed(2),
      cost,
      salePrice,
      profit,
      (q.breakdown.directMarginPercent || 0).toFixed(1)
    ].join(';')
  })

  // BOM UTF-8 for Excel to open accents correctly
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `relatorio_financeiro_print3d_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Print Executive PDF Report
const printFinancialReport = () => {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  const logoHtml = settings.storeLogo
    ? `<img src="${settings.storeLogo}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" alt="Logo" />`
    : ''

  const rowsHtml = filteredQuotes.value.map(q => `
    <tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${formatDate(q.createdAt)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${q.title}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${q.clientName || 'Cliente Particular'}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0;">${formatStatus(q.status)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">R$ ${q.breakdown.totalProductionCost.toFixed(2)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700;">R$ ${(q.selectedPlatformPrice?.price || q.breakdown.recommendedDirectPrice).toFixed(2)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #15803d; font-weight: 700;">R$ ${(q.selectedPlatformPrice?.profit || q.breakdown.directProfit).toFixed(2)}</td>
    </tr>
  `).join('')

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Relatório Financeiro Consolidado</title>
      <style>
        @page { size: A4 landscape; margin: 1.2cm; }
        body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; }
        .kpi-card { border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 8px 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f1f5f9; padding: 6px 8px; text-align: left; border-bottom: 2px solid #cbd5e1; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${logoHtml}
          <div>
            <h2 style="margin: 0; font-size: 16px;">${(settings.storeName || 'STUDIO 3D').toUpperCase()}</h2>
            <div style="font-size: 11px; color: #0284c7; font-weight: 600;">Relatório Financeiro & Desempenho Operacional</div>
          </div>
        </div>
        <div style="text-align: right; font-size: 10px; color: #64748b;">
          <div>Emissão: <strong>${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</strong></div>
          <div>Filtro: <strong>${selectedPeriod.value}</strong></div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Faturamento Bruto</div>
          <div style="font-size: 15px; font-weight: 800; color: #0284c7;">R$ ${metrics.value.totalRevenue.toFixed(2)}</div>
        </div>
        <div class="kpi-card">
          <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Custo de Fabricação</div>
          <div style="font-size: 15px; font-weight: 800; color: #e11d48;">R$ ${metrics.value.totalProductionCost.toFixed(2)}</div>
        </div>
        <div class="kpi-card">
          <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Lucro Líquido Real</div>
          <div style="font-size: 15px; font-weight: 800; color: #16a34a;">R$ ${metrics.value.totalNetProfit.toFixed(2)}</div>
        </div>
        <div class="kpi-card">
          <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Margem Média</div>
          <div style="font-size: 15px; font-weight: 800; color: #16a34a;">${metrics.value.averageMarginPercent.toFixed(1)}%</div>
        </div>
        <div class="kpi-card">
          <div style="color: #64748b; font-size: 9px; text-transform: uppercase;">Horas & Consumo</div>
          <div style="font-size: 15px; font-weight: 800;">${metrics.value.totalPrintHours.toFixed(1)}h (${(metrics.value.totalGrams / 1000).toFixed(2)} kg)</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Projeto</th>
            <th>Cliente</th>
            <th>Status</th>
            <th style="text-align: right;">Custo</th>
            <th style="text-align: right;">Venda</th>
            <th style="text-align: right;">Lucro</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
        Relatório gerado automaticamente por Print3D Pro Hub • Documento de controle interno e gestão.
      </div>
    </body>
    </html>
  `)
  doc.close()

  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe)
    }, 1500)
  }, 300)
}
</script>
