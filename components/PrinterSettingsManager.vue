<template>
  <div class="printer-settings-section">
    <!-- Header -->
    <div class="card card-glass" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
            <span class="text-gradient">Impressoras 3D & Custos Operacionais</span>
          </h2>
          <p class="card-subtitle">
            Configure suas máquinas, consumo elétrico, depreciação, custo da energia por kWh e valor da sua hora técnica.
          </p>
        </div>

        <button id="btn-add-printer-open" class="btn btn-primary btn-sm" @click="openAddPrinterModal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Adicionar Impressora
        </button>
      </div>
    </div>

    <!-- Two Columns: Global Settings & Printers List -->
    <div style="display: grid; grid-template-columns: 1fr 1.6fr; gap: 1.5rem; align-items: start;">
      <!-- Global Costs Column -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-amber)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>Custos Fixos & Parâmetros</span>
          </div>
          <span class="badge badge-amber">Global</span>
        </div>

        <form @submit.prevent="handleSaveSettings">
          <!-- Electricity cost per kWh -->
          <div class="form-group">
            <label class="form-label" for="sett-kwh">
              <span>Energia Elétrica (R$ / kWh)</span>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Consulte sua conta de luz</span>
            </label>
            <div class="input-prefix-box">
              <span class="input-prefix-tag">R$</span>
              <input 
                id="sett-kwh"
                v-model.number="settings.electricityCostPerKwh" 
                type="number" 
                class="input-control font-mono" 
                step="0.01" 
                min="0" 
                required
                @change="handleSaveSettings"
              />
              <span class="input-prefix-tag">/ kWh</span>
            </div>
          </div>

          <!-- Hourly Labor Rate -->
          <div class="form-group">
            <label class="form-label" for="sett-labor">
              <span>Valor da sua Hora Técnica</span>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Fatiamento, suportes e pós</span>
            </label>
            <div class="input-prefix-box">
              <span class="input-prefix-tag">R$</span>
              <input 
                id="sett-labor"
                v-model.number="settings.hourlyLaborRate" 
                type="number" 
                class="input-control font-mono" 
                step="1" 
                min="0" 
                required
                @change="handleSaveSettings"
              />
              <span class="input-prefix-tag">/ hora</span>
            </div>
          </div>

          <!-- Default Failure Rate -->
          <div class="form-group">
            <label class="form-label" for="sett-failure">
              <span>Margem de Falha / Descarte Padrão</span>
              <span class="font-mono text-gradient-amber">{{ settings.defaultFailureRate }}%</span>
            </label>
            <input 
              id="sett-failure"
              v-model.number="settings.defaultFailureRate" 
              type="range" 
              class="range-input" 
              min="0" 
              max="25" 
              step="1" 
              @change="handleSaveSettings"
            />
            <span style="font-size: 0.75rem; color: var(--text-dim);">Cobre peças descoladas, entupimentos e testes de calibração.</span>
          </div>

          <!-- Default Profit Margin -->
          <div class="form-group">
            <label class="form-label" for="sett-profit">
              <span>Margem de Lucro Alvo Padrão (Markup)</span>
              <span class="font-mono text-gradient-emerald">{{ settings.defaultProfitMargin }}%</span>
            </label>
            <input 
              id="sett-profit"
              v-model.number="settings.defaultProfitMargin" 
              type="range" 
              class="range-input" 
              min="10" 
              max="200" 
              step="5" 
              @change="handleSaveSettings"
            />
            <span style="font-size: 0.75rem; color: var(--text-dim);">Adicionada sobre o custo total de fabricação na venda direta.</span>
          </div>

          <!-- Tax Rate (MEI / Simples) -->
          <div class="form-group">
            <label class="form-label" for="sett-tax">
              <span>Imposto sobre Venda / Nota Fiscal</span>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Simples / DAS</span>
            </label>
            <div class="input-prefix-box">
              <input 
                id="sett-tax"
                v-model.number="settings.taxRatePercent" 
                type="number" 
                class="input-control font-mono" 
                step="0.5" 
                min="0" 
                max="30" 
                required
                @change="handleSaveSettings"
              />
              <span class="input-prefix-tag">%</span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-dim);">Para MEI (isento de % por nota) use 0% a 3%. Para Simples Nacional use 4% a 8%.</span>
          </div>

          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 0.75rem; margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--brand-emerald);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Configurações salvas automaticamente no navegador.</span>
          </div>
        </form>
      </div>

      <!-- Printers List Column -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div 
          v-for="p in printers" 
          :key="p.id" 
          class="card"
          style="display: flex; flex-direction: column; justify-content: space-between;"
        >
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 38px; height: 38px; background: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--brand-cyan);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                </div>
                <div>
                  <h3 style="font-size: 1.1rem; font-weight: 700;">{{ p.name }}</h3>
                  <span style="font-size: 0.775rem; color: var(--text-dim);">{{ p.brand }} • Modelo: {{ p.model }}</span>
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <span v-if="p.isDefault" class="badge badge-cyan">Principal</span>
                <button 
                  v-else 
                  class="btn btn-secondary btn-sm" 
                  style="font-size: 0.725rem; padding: 0.2rem 0.5rem;"
                  @click="makeDefaultPrinter(p.id)"
                >
                  Tornar Padrão
                </button>
              </div>
            </div>

            <!-- Printer Metrics Grid -->
            <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); padding: 0.85rem; border: 1px solid var(--border-subtle); display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; margin-bottom: 0.85rem;">
              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Potência</span>
                <div class="font-mono" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                  {{ p.powerWatts }}W
                </div>
              </div>

              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Valor Compra</span>
                <div class="font-mono" style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">
                  R$ {{ p.purchaseCost.toFixed(0) }}
                </div>
              </div>

              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Depreciação/h</span>
                <div class="font-mono" style="font-size: 0.95rem; font-weight: 800; color: var(--brand-amber);">
                  R$ {{ ((p.purchaseCost || 0) / Math.max(p.lifespanHours || 3000, 1)).toFixed(2) }}/h
                </div>
              </div>

              <div>
                <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Manutenção/h</span>
                <div class="font-mono" style="font-size: 0.95rem; font-weight: 800; color: var(--brand-cyan);">
                  R$ {{ (p.maintenancePerHour || 0).toFixed(2) }}/h
                </div>
              </div>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
              <span>Vida útil estimada: <strong>{{ p.lifespanHours.toLocaleString() }} horas</strong> de impressão</span>
              <span>Custo elétrico estimado: <strong>~R$ {{ (((p.powerWatts || 150) / 1000) * (settings.electricityCostPerKwh || 0.92)).toFixed(2) }}/hora</strong></span>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.75rem;">
            <button 
              :id="`btn-edit-printer-${p.id}`"
              class="btn btn-secondary btn-sm" 
              @click="openEditPrinterModal(p)"
            >
              Editar
            </button>
            <button 
              :id="`btn-delete-printer-${p.id}`"
              class="btn btn-danger btn-sm" 
              :disabled="printers.length <= 1"
              @click="handleDeletePrinter(p.id, p.name)"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Printer Form -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span>{{ isEditing ? 'Editar Impressora 3D' : 'Cadastrar Nova Impressora 3D' }}</span>
          </div>
          <button class="btn btn-secondary btn-icon btn-sm" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="savePrinterForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <!-- Name -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" for="modal-pr-name">Nome de Identificação da Máquina</label>
              <input 
                id="modal-pr-name"
                v-model="form.name" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: Bambu Lab P1S Oficina"
              />
            </div>

            <!-- Brand -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-brand">Marca</label>
              <input 
                id="modal-pr-brand"
                v-model="form.brand" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: Bambu Lab, Creality, Elegoo..."
              />
            </div>

            <!-- Model -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-model">Modelo</label>
              <input 
                id="modal-pr-model"
                v-model="form.model" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: P1S, Ender 3 V3, K1 Max..."
              />
            </div>

            <!-- Power Watts -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-power">Consumo Médio (Watts)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-pr-power"
                  v-model.number="form.powerWatts" 
                  type="number" 
                  class="input-control font-mono" 
                  min="50" 
                  max="2000" 
                  step="10" 
                  required
                />
                <span class="input-prefix-tag">Watts</span>
              </div>
            </div>

            <!-- Purchase Cost -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-cost">Valor Pago na Máquina (R$)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-pr-cost"
                  v-model.number="form.purchaseCost" 
                  type="number" 
                  class="input-control font-mono" 
                  min="100" 
                  step="50" 
                  required
                />
              </div>
            </div>

            <!-- Lifespan Hours -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-lifespan">Vida Útil Estimada (Horas)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-pr-lifespan"
                  v-model.number="form.lifespanHours" 
                  type="number" 
                  class="input-control font-mono" 
                  min="500" 
                  step="500" 
                  required
                />
                <span class="input-prefix-tag">horas</span>
              </div>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Padrão de mercado: 3.000 a 5.000 horas de trabalho contínuo.</span>
            </div>

            <!-- Maintenance per hour -->
            <div class="form-group">
              <label class="form-label" for="modal-pr-maint">Manutenção & Bicos (R$/h)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-pr-maint"
                  v-model.number="form.maintenancePerHour" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.1" 
                  min="0" 
                  required
                />
                <span class="input-prefix-tag">/ hora</span>
              </div>
              <span style="font-size: 0.725rem; color: var(--text-dim);">Troca de bico de latão/aço, graxa, correias e álcool isopropílico.</span>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button id="modal-pr-submit" type="submit" class="btn btn-primary">
              {{ isEditing ? 'Salvar Impressora' : 'Cadastrar Impressora' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Printer } from '~/types'
import { use3DStore } from '~/composables/use3DStore'

const { 
  printers, 
  settings, 
  addPrinter, 
  updatePrinter, 
  deletePrinter, 
  saveSettings 
} = use3DStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const defaultForm: Omit<Printer, 'id'> = {
  name: '',
  brand: '',
  model: '',
  powerWatts: 180,
  purchaseCost: 3500.00,
  lifespanHours: 4000,
  maintenancePerHour: 1.50,
  isDefault: false
}

const form = reactive<Omit<Printer, 'id'>>({ ...defaultForm })

const handleSaveSettings = () => {
  saveSettings()
}

const openAddPrinterModal = () => {
  isEditing.value = false
  editingId.value = ''
  Object.assign(form, defaultForm)
  isModalOpen.value = true
}

const openEditPrinterModal = (p: Printer) => {
  isEditing.value = true
  editingId.value = p.id
  Object.assign(form, {
    name: p.name,
    brand: p.brand,
    model: p.model,
    powerWatts: p.powerWatts,
    purchaseCost: p.purchaseCost,
    lifespanHours: p.lifespanHours,
    maintenancePerHour: p.maintenancePerHour,
    isDefault: p.isDefault || false
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const savePrinterForm = () => {
  if (isEditing.value && editingId.value) {
    updatePrinter(editingId.value, { ...form })
  } else {
    addPrinter({ ...form })
  }
  closeModal()
}

const makeDefaultPrinter = (id: string) => {
  printers.forEach(p => {
    updatePrinter(p.id, { isDefault: p.id === id })
  })
}

const handleDeletePrinter = (id: string, name: string) => {
  if (printers.length <= 1) {
    alert('Você deve manter pelo menos uma impressora cadastrada.')
    return
  }
  if (confirm(`Tem certeza que deseja excluir a impressora "${name}"?`)) {
    deletePrinter(id)
  }
}
</script>
