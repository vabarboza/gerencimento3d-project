<template>
  <div class="calculator-container">
    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 1.5rem; align-items: start;">
      <!-- Left Column: Inputs Form -->
      <div class="card card-glass">
        <div class="card-header">
          <div class="card-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Dados da Impressão 3D</span>
          </div>
          <span class="badge badge-cyan">Orçamento Ativo</span>
        </div>

        <form @submit.prevent>
          <!-- G-code / 3MF Drag & Drop Zone -->
          <div 
            id="slicer-drop-zone"
            class="slicer-drop-zone"
            :class="{ 'is-dragging': isDragging, 'has-file': lastParsedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="triggerFileInput"
          >
            <input 
              ref="fileInputRef" 
              type="file" 
              accept=".gcode,.3mf,.zip" 
              style="display: none;" 
              @change="handleFileInputChange"
            />
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <div class="slicer-upload-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div>
                  <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-main);">
                    {{ isParsingFile ? 'Lendo metadados do fatiador...' : lastParsedFile ? `Arquivo Carregado: ${lastParsedFile.fileName}` : 'Importar Arquivo G-code ou .3MF' }}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">
                    {{ lastParsedFile ? `⚡ Detectado: ${lastParsedFile.slicer} • ${lastParsedFile.totalGrams}g • ${lastParsedFile.printTimeHours}h ${lastParsedFile.printTimeMinutes}m` : 'Arraste seu arquivo (Bambu, Orca, Prusa, Cura) para preenchimento automático' }}
                  </div>
                </div>
              </div>

              <button type="button" class="btn btn-secondary btn-sm" style="font-size: 0.75rem; pointer-events: none;">
                {{ lastParsedFile ? 'Substituir' : 'Selecionar Arquivo' }}
              </button>
            </div>
          </div>

          <!-- Job Title & Client -->
          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-title">Nome da Peça / Projeto</label>
              <input 
                id="job-title"
                v-model="activeJob.title" 
                type="text" 
                class="input-control" 
                placeholder="Ex: Luminária Articulada Lua"
              />
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-client">Cliente (Opcional)</label>
              <input 
                id="job-client"
                v-model="activeJob.clientName" 
                type="text" 
                class="input-control" 
                placeholder="Ex: Ana Clara ou Shopee"
              />
            </div>
          </div>

          <!-- Printer Selector -->
          <div class="form-group">
            <div class="form-label">
              <label for="job-printer">Impressora 3D Utilizada</label>
              <span v-if="selectedPrinter" style="font-size: 0.75rem; color: var(--brand-cyan); font-family: var(--font-mono);">
                {{ selectedPrinter.powerWatts }}W • Depreciação: R$ {{ ((selectedPrinter.purchaseCost || 0) / Math.max(selectedPrinter.lifespanHours || 3000, 1)).toFixed(2) }}/h
              </span>
            </div>
            <select id="job-printer" v-model="activeJob.printerId" class="input-control">
              <option v-for="pr in printers" :key="pr.id" :value="pr.id">
                {{ pr.name }} ({{ pr.brand }} - {{ pr.model }} • {{ pr.powerWatts }}W)
              </option>
            </select>
          </div>

          <!-- Filaments Section (Multimaterial / AMS support) -->
          <div style="margin-bottom: 1.25rem; background: rgba(0, 0, 0, 0.2); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <label class="form-label" style="margin-bottom: 0;">
                <span style="font-weight: 700; color: var(--text-main);">Filamento(s) & Peso Gasto</span>
                <span style="font-size: 0.725rem; color: var(--text-dim);">(Suporta multimaterial/AMS)</span>
              </label>

              <button 
                id="btn-add-filament-job"
                type="button" 
                class="btn btn-secondary btn-sm" 
                style="font-size: 0.75rem; padding: 0.25rem 0.6rem;"
                @click="addFilamentRow"
              >
                + Adicionar Outra Cor / Material
              </button>
            </div>

            <!-- Filament Rows -->
            <div v-for="(fItem, index) in activeJob.filaments" :key="index" style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 0.65rem;">
              <div style="flex: 1.5;">
                <select v-model="fItem.filamentId" class="input-control">
                  <option v-for="fil in filaments" :key="fil.id" :value="fil.id">
                    {{ fil.name }} ({{ fil.material }} - R$ {{ getFilamentCostPerGram(fil).toFixed(3) }}/g)
                  </option>
                </select>
              </div>

              <div style="flex: 1;" class="input-prefix-box">
                <input 
                  :id="`job-filament-grams-${index}`"
                  v-model.number="fItem.grams" 
                  type="number" 
                  class="input-control font-mono" 
                  min="1" 
                  step="1" 
                  placeholder="Gramas"
                />
                <span class="input-prefix-tag">g</span>
              </div>

              <!-- Color Dot preview -->
              <span 
                class="filament-swatch" 
                :style="{ backgroundColor: getFilamentColor(fItem.filamentId) }"
                title="Cor do filamento"
              ></span>

              <!-- Remove button (if more than 1) -->
              <button 
                v-if="activeJob.filaments.length > 1" 
                type="button" 
                class="btn btn-danger btn-icon btn-sm" 
                style="width: 32px; height: 32px;"
                @click="removeFilamentRow(index)"
              >
                ✕
              </button>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.775rem; color: var(--text-muted); padding-top: 0.35rem;">
              <span>Total de filamento: <strong class="font-mono text-gradient">{{ jobCostBreakdown.totalGrams }}g</strong></span>
              <span>Custo total filamento: <strong class="font-mono text-gradient-cyan">R$ {{ jobCostBreakdown.filamentCost.toFixed(2) }}</strong></span>
            </div>
          </div>

          <!-- Low Stock Warning Alert if any filament doesn't have enough grams -->
          <div v-if="stockWarnings.length > 0" id="alert-low-stock-job" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.825rem; color: var(--brand-amber); display: flex; align-items: flex-start; gap: 0.65rem;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px;">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              <strong style="color: #fff;">Atenção ao estoque de carretéis:</strong>
              <div v-for="(warn, idx) in stockWarnings" :key="idx" style="margin-top: 0.25rem; font-size: 0.8rem;">
                • O carretel <strong>{{ warn.filamentName }}</strong> possui apenas <strong>{{ warn.availableG }}g</strong> restantes (faltam {{ warn.missingG }}g para esta peça).
              </div>
            </div>
          </div>

          <!-- Times: Print Time & Prep Time -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <!-- Print Time -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-time-hours">Tempo de Impressão na Máquina</label>
              <div style="display: flex; gap: 0.5rem;">
                <div class="input-prefix-box" style="flex: 1;">
                  <input 
                    id="job-time-hours"
                    v-model.number="activeJob.printTimeHours" 
                    type="number" 
                    class="input-control font-mono" 
                    min="0" 
                    step="1"
                  />
                  <span class="input-prefix-tag">h</span>
                </div>
                <div class="input-prefix-box" style="flex: 1;">
                  <input 
                    id="job-time-minutes"
                    v-model.number="activeJob.printTimeMinutes" 
                    type="number" 
                    class="input-control font-mono" 
                    min="0" 
                    max="59" 
                    step="5"
                  />
                  <span class="input-prefix-tag">min</span>
                </div>
              </div>
            </div>

            <!-- Prep & Post-processing Time -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-prep-minutes">
                <span>Trabalho Manual (Pós-processo)</span>
              </label>
              <div class="input-prefix-box">
                <input 
                  id="job-prep-minutes"
                  v-model.number="activeJob.prepTimeMinutes" 
                  type="number" 
                  class="input-control font-mono" 
                  min="0" 
                  step="5"
                />
                <span class="input-prefix-tag">minutos</span>
              </div>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Fatiar, arrancar suportes, lixar, embalar</span>
            </div>
          </div>

          <!-- Packaging & Extras -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-packaging">Embalagem (Caixa, Plástico)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="job-packaging"
                  v-model.number="activeJob.packagingCost" 
                  type="number" 
                  class="input-control font-mono" 
                  min="0" 
                  step="0.5"
                />
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="job-hardware">Insumos Extras (Ímãs, Parafusos)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="job-hardware"
                  v-model.number="activeJob.hardwareCost" 
                  type="number" 
                  class="input-control font-mono" 
                  min="0" 
                  step="0.5"
                />
              </div>
            </div>
          </div>

          <!-- Failure Margin & Profit Sliders -->
          <div style="background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-md); padding: 1rem; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.25rem;">
            <!-- Failure Slider -->
            <div class="form-group" style="margin-bottom: 0;">
              <div class="form-label">
                <span>Margem de Risco / Falha da Peça</span>
                <span class="font-mono text-gradient-amber" style="font-weight: 700;">{{ currentFailureRate }}%</span>
              </div>
              <input 
                id="job-slider-failure"
                v-model.number="activeJob.customFailureRate" 
                type="range" 
                class="range-input" 
                min="0" 
                max="25" 
                step="1"
              />
            </div>

            <!-- Profit Margin Slider -->
            <div class="form-group" style="margin-bottom: 0;">
              <div class="form-label">
                <span>Margem de Lucro Alvo Desejada (Markup)</span>
                <span class="font-mono text-gradient-emerald" style="font-weight: 800; font-size: 1.05rem;">{{ currentProfitMargin }}%</span>
              </div>
              <input 
                id="job-slider-profit"
                v-model.number="activeJob.customProfitMargin" 
                type="range" 
                class="range-input" 
                min="10" 
                max="250" 
                step="5"
              />
              <span style="font-size: 0.725rem; color: var(--text-dim);">
                O simulador garantirá que você receba líquido exatamente este percentual de lucro sobre o custo de produção, mesmo pagando as taxas das plataformas.
              </span>
            </div>
          </div>

          <!-- Project Notes -->
          <div class="form-group">
            <label class="form-label" for="job-notes">Observações do Orçamento</label>
            <textarea 
              id="job-notes"
              v-model="activeJob.notes" 
              rows="2" 
              class="input-control" 
              placeholder="Ex: Altura de camada 0.20mm, 3 perímetros, 15% preenchimento gyroid..."
            ></textarea>
          </div>
        </form>
      </div>

      <!-- Right Column: Live Cost Breakdown & Pricing Summary -->
      <div style="display: flex; flex-direction: column; gap: 1.25rem; position: sticky; top: 5rem;">
        <!-- Detailed Production Cost Breakdown Card -->
        <div class="card card-glass" style="border: 1px solid rgba(0, 240, 255, 0.25); box-shadow: 0 0 25px rgba(0, 240, 255, 0.08);">
          <div class="card-header">
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>Composição Detalhada de Custo</span>
            </div>
            <span class="badge badge-cyan">{{ (jobCostBreakdown.totalPrintHours).toFixed(1) }}h máquina</span>
          </div>

          <!-- Detailed Cost Items -->
          <div class="fee-breakdown-list">
            <div class="fee-item">
              <span>🧵 Filamento ({{ jobCostBreakdown.totalGrams }}g)</span>
              <span class="font-mono" style="font-weight: 600; color: var(--text-main);">R$ {{ jobCostBreakdown.filamentCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>⚡ Energia Elétrica</span>
              <span class="font-mono">R$ {{ jobCostBreakdown.energyCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>🖨️ Depreciação da Impressora</span>
              <span class="font-mono">R$ {{ jobCostBreakdown.depreciationCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>🔧 Manutenção & Bico / Nozzle</span>
              <span class="font-mono">R$ {{ jobCostBreakdown.maintenanceCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>⏱️ Mão de Obra Técnica ({{ activeJob.prepTimeMinutes }} min)</span>
              <span class="font-mono">R$ {{ jobCostBreakdown.laborCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>📦 Embalagem & Insumos Extras</span>
              <span class="font-mono">R$ {{ (jobCostBreakdown.packagingCost + jobCostBreakdown.hardwareCost).toFixed(2) }}</span>
            </div>

            <div class="fee-item">
              <span>⚠️ Margem de Risco / Falha ({{ currentFailureRate }}%)</span>
              <span class="font-mono" style="color: var(--brand-amber);">R$ {{ jobCostBreakdown.failureRiskCost.toFixed(2) }}</span>
            </div>

            <div class="fee-item total" style="font-size: 0.95rem;">
              <span style="font-weight: 700; color: var(--text-main);">Custo Base de Fabricação</span>
              <span class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: var(--brand-rose);">
                R$ {{ jobCostBreakdown.totalProductionCost.toFixed(2) }}
              </span>
            </div>
          </div>

          <!-- Direct Sale Recommendation Box -->
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-md); padding: 1.15rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem;">
              <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--brand-emerald); font-weight: 700;">
                Preço Direto Sugerido (PIX / Dinheiro)
              </span>
              <span class="badge badge-emerald">+{{ currentProfitMargin }}% Lucro</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div class="font-mono" style="font-size: 2rem; font-weight: 800; color: var(--brand-emerald); line-height: 1;">
                R$ {{ jobCostBreakdown.recommendedDirectPrice.toFixed(2) }}
              </div>
              <div style="text-align: right; font-size: 0.825rem; color: var(--text-muted);">
                Lucro Líquido: <strong class="font-mono" style="color: var(--brand-emerald);">R$ {{ jobCostBreakdown.directProfit.toFixed(2) }}</strong>
              </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.35rem;">
              Preço para venda direta ao cliente sem descontos de plataformas de marketplace.
            </div>
          </div>

          <!-- Save Quote & Export Buttons -->
          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button 
              id="btn-save-quote"
              class="btn btn-primary" 
              style="flex: 1;"
              @click="$emit('save-quote')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Salvar Orçamento</span>
            </button>

            <button 
              id="btn-view-proposal"
              class="btn btn-secondary" 
              @click="$emit('view-proposal')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Ver Proposta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use3DStore } from '~/composables/use3DStore'
import { parseSlicerFile, type ParsedGcodeResult } from '~/utils/gcodeParser'

defineEmits<{
  (e: 'save-quote'): void
  (e: 'view-proposal'): void
}>()

const { 
  activeJob, 
  printers, 
  filaments, 
  settings, 
  jobCostBreakdown, 
  getFilamentCostPerGram,
  checkStockAvailability
} = use3DStore()

// Slicer File (G-code / .3MF) drag & drop parser state
const isDragging = ref(false)
const isParsingFile = ref(false)
const lastParsedFile = ref<ParsedGcodeResult | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const processFile = async (file: File) => {
  if (!file) return
  isParsingFile.value = true
  try {
    const result = await parseSlicerFile(file)
    lastParsedFile.value = result

    // 1. Title Auto-detection
    const cleanName = file.name
      .replace(/\.(gcode|3mf|zip)$/i, '')
      .replace(/[_-]/g, ' ')
      .trim()
    if (!activeJob.title || activeJob.title === 'Novo Projeto 3D') {
      activeJob.title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
    }

    // 2. Printing Time
    activeJob.printTimeHours = result.printTimeHours
    activeJob.printTimeMinutes = result.printTimeMinutes

    // 3. Filaments weight & multi-color AMS support
    if (result.filamentsGrams && result.filamentsGrams.length > 0) {
      result.filamentsGrams.forEach((grams, idx) => {
        if (idx < activeJob.filaments.length) {
          activeJob.filaments[idx].grams = grams
        } else {
          // If piece has more spools than rows, append row using available filaments
          const fil = filaments[idx % filaments.length] || filaments[0]
          if (fil) {
            activeJob.filaments.push({
              filamentId: fil.id,
              grams: grams
            })
          }
        }
      })
      // If active job had more rows than slicer used, trim excess
      if (activeJob.filaments.length > result.filamentsGrams.length) {
        activeJob.filaments.splice(result.filamentsGrams.length)
      }
    } else if (result.totalGrams > 0) {
      if (activeJob.filaments.length > 0) {
        activeJob.filaments[0].grams = result.totalGrams
      }
    }
  } catch (err) {
    console.error('Erro ao ler arquivo do fatiador:', err)
  } finally {
    isParsingFile.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleFileInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    processFile(target.files[0])
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0])
  }
}

// Low Stock Warnings for current job
const stockWarnings = computed(() => {
  if (typeof checkStockAvailability === 'function') {
    return checkStockAvailability(activeJob.filaments)
  }
  return []
})

const selectedPrinter = computed(() => {
  return printers.find(p => p.id === activeJob.printerId) || printers[0]
})

const currentFailureRate = computed(() => {
  return activeJob.customFailureRate !== undefined 
    ? activeJob.customFailureRate 
    : settings.defaultFailureRate
})

const currentProfitMargin = computed(() => {
  return activeJob.customProfitMargin !== undefined 
    ? activeJob.customProfitMargin 
    : settings.defaultProfitMargin
})

const getFilamentColor = (id: string) => {
  const f = filaments.find(fil => fil.id === id)
  return f ? f.color : '#ffffff'
}

const addFilamentRow = () => {
  const defaultFil = filaments[0]
  if (defaultFil) {
    activeJob.filaments.push({
      filamentId: defaultFil.id,
      grams: 30
    })
  }
}

const removeFilamentRow = (index: number) => {
  if (activeJob.filaments.length > 1) {
    activeJob.filaments.splice(index, 1)
  }
}
</script>
