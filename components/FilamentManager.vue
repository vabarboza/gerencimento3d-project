<template>
  <div class="filament-manager-section">
    <!-- Header Controls -->
    <div class="card card-glass" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
            <span class="text-gradient">Estoque & Configuração de Filamentos</span>
          </h2>
          <p class="card-subtitle">
            Cadastre os carretéis adquiridos, preços de compra e fretes. O custo por grama (R$/g) é calculado e sincronizado automaticamente na calculadora de impressões.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="btn-reset-filaments" class="btn btn-secondary btn-sm" @click="confirmReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Padrões de Fábrica
          </button>
          <button id="btn-add-filament-open" class="btn btn-primary btn-sm" @click="openAddModal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Novo Filamento
          </button>
        </div>
      </div>

      <!-- Quick Filter Bar -->
      <div style="display: flex; gap: 1rem; margin-top: 1.25rem; flex-wrap: wrap; align-items: center;">
        <div style="flex: 1; min-width: 240px;" class="input-prefix-box">
          <span class="input-prefix-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input 
            id="input-search-filament"
            v-model="searchQuery" 
            type="text" 
            class="input-control" 
            placeholder="Buscar por nome, marca ou cor..."
          />
        </div>

        <!-- Filter Material Tabs -->
        <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
          <button 
            v-for="mat in materialFilters" 
            :key="mat"
            class="btn btn-sm"
            :class="selectedMaterialFilter === mat ? 'btn-primary' : 'btn-secondary'"
            @click="selectedMaterialFilter = mat"
          >
            {{ mat }}
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Summary Row -->
    <div class="stat-grid">
      <div class="stat-card">
        <span class="stat-label">Total de Carretéis</span>
        <span class="stat-value">{{ filaments.length }}</span>
        <span class="stat-subtext">Disponíveis no catálogo</span>
      </div>

      <div class="stat-card emerald">
        <span class="stat-label">Custo Médio / Grama</span>
        <span class="stat-value font-mono">R$ {{ averageCostPerGram.toFixed(3) }}</span>
        <span class="stat-subtext">~R$ {{ (averageCostPerGram * 1000).toFixed(2) }} por kg</span>
      </div>

      <div class="stat-card amber">
        <span class="stat-label">Estoque Total Estimado</span>
        <span class="stat-value font-mono">{{ (totalRemainingG / 1000).toFixed(2) }} kg</span>
        <span class="stat-subtext">{{ totalRemainingG.toLocaleString() }} gramas restantes</span>
      </div>

      <div class="stat-card purple">
        <span class="stat-label">Patrimônio em Filamentos</span>
        <span class="stat-value font-mono">R$ {{ totalInventoryValue.toFixed(2) }}</span>
        <span class="stat-subtext">Valor de compra estocado</span>
      </div>
    </div>

    <!-- Filaments Grid Cards -->
    <div class="platform-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
      <div 
        v-for="f in filteredFilaments" 
        :key="f.id" 
        class="card"
        style="display: flex; flex-direction: column; justify-content: space-between;"
      >
        <div>
          <!-- Header with Swatch & Material -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span 
                class="filament-swatch" 
                :style="{ backgroundColor: f.color, boxShadow: `0 0 10px ${f.color}66` }"
              ></span>
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 700; line-height: 1.2;">{{ f.name }}</h3>
                <span style="font-size: 0.775rem; color: var(--text-dim);">{{ f.brand }} • {{ f.colorName }}</span>
              </div>
            </div>

            <span class="badge" :class="getMaterialBadgeClass(f.material)">
              {{ f.material }}
            </span>
          </div>

          <!-- Price & Gram Metric Highlights -->
          <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); padding: 0.85rem; border: 1px solid var(--border-subtle); margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem;">
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Custo por Grama</span>
              <span class="font-mono" style="font-size: 1.25rem; font-weight: 800; color: var(--brand-cyan);">
                R$ {{ getFilamentCostPerGram(f).toFixed(4) }}<span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 400;"> /g</span>
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
              <span>Preço Pago: R$ {{ f.pricePaid.toFixed(2) }}</span>
              <span>Frete: +R$ {{ f.shippingCost.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Spool Remaining Progress -->
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.35rem;">
              <span style="color: var(--text-muted);">Restante no Carretel:</span>
              <span class="font-mono" style="font-weight: 600; color: var(--text-main);">
                {{ f.remainingG }}g / {{ f.spoolWeightG }}g ({{ Math.round((f.remainingG / f.spoolWeightG) * 100) }}%)
              </span>
            </div>
            <!-- Progress Bar -->
            <div style="height: 6px; background: #1e293b; border-radius: 4px; overflow: hidden;">
              <div 
                style="height: 100%; transition: width 0.3s; border-radius: 4px;"
                :style="{ 
                  width: `${Math.min(Math.max((f.remainingG / f.spoolWeightG) * 100, 2), 100)}%`,
                  background: f.remainingG < 150 ? 'var(--brand-rose)' : 'linear-gradient(90deg, var(--brand-cyan), var(--brand-blue))'
                }"
              ></div>
            </div>
          </div>

          <!-- Notes or Details -->
          <p v-if="f.notes" style="font-size: 0.78rem; color: var(--text-muted); background: rgba(255, 255, 255, 0.02); padding: 0.5rem 0.65rem; border-radius: var(--radius-sm); margin-bottom: 1rem; border-left: 2px solid var(--border-hover);">
            {{ f.notes }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; margin-top: 0.5rem;">
          <button 
            :id="`btn-edit-filament-${f.id}`"
            class="btn btn-secondary btn-sm" 
            title="Editar filamento" 
            @click="openEditModal(f)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Editar
          </button>
          <button 
            :id="`btn-delete-filament-${f.id}`"
            class="btn btn-danger btn-sm" 
            title="Excluir filamento" 
            @click="handleDelete(f.id, f.name)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredFilaments.length === 0" class="card" style="text-align: center; padding: 3rem 1.5rem;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;">
        <circle cx="12" cy="12" r="9"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <line x1="12" y1="3" x2="12" y2="9"></line>
        <line x1="12" y1="15" x2="12" y2="21"></line>
      </svg>
      <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nenhum filamento encontrado</h3>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.25rem;">
        Tente ajustar sua busca ou adicione um novo filamento para começar a calcular.
      </p>
      <button class="btn btn-primary" @click="openAddModal">Adicionar Filamento</button>
    </div>

    <!-- Modal Form (Add or Edit) -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span>{{ isEditing ? 'Editar Filamento' : 'Cadastrar Novo Filamento' }}</span>
          </div>
          <button class="btn btn-secondary btn-icon btn-sm" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="saveFilamentForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <!-- Name -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" for="modal-f-name">Nome Comercial / Descrição</label>
              <input 
                id="modal-f-name"
                v-model="form.name" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: PLA Branco Puro Super Speed"
              />
            </div>

            <!-- Brand -->
            <div class="form-group">
              <label class="form-label" for="modal-f-brand">Marca / Fabricante</label>
              <input 
                id="modal-f-brand"
                v-model="form.brand" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: Voolt3D, PrintaLot, 3D Fila..."
              />
            </div>

            <!-- Material -->
            <div class="form-group">
              <label class="form-label" for="modal-f-mat">Material</label>
              <select id="modal-f-mat" v-model="form.material" class="input-control" required>
                <option value="PLA">PLA (Poliácido Láctico)</option>
                <option value="PLA Silk">PLA Silk (Metálico/Brilhante)</option>
                <option value="PETG">PETG (Resistência e UV)</option>
                <option value="ABS">ABS (Térmico e Mecânico)</option>
                <option value="TPU">TPU (Flexível / Emborrachado)</option>
                <option value="ASA">ASA (Ultra resistente UV)</option>
                <option value="Nylon">Nylon (Engrenagens e Alta Carga)</option>
                <option value="Resina">Resina UV SLA</option>
                <option value="Outro">Outro Insumo</option>
              </select>
            </div>

            <!-- Color Name -->
            <div class="form-group">
              <label class="form-label" for="modal-f-colorname">Nome da Cor</label>
              <input 
                id="modal-f-colorname"
                v-model="form.colorName" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: Branco Neve, Vermelho Cereja..."
              />
            </div>

            <!-- Color Swatch Picker -->
            <div class="form-group">
              <label class="form-label" for="modal-f-color">Tom Visual (Cor)</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input 
                  id="modal-f-color"
                  v-model="form.color" 
                  type="color" 
                  style="width: 44px; height: 38px; border: none; background: transparent; cursor: pointer; border-radius: 6px;"
                />
                <input 
                  v-model="form.color" 
                  type="text" 
                  class="input-control font-mono" 
                  style="text-transform: uppercase;"
                />
              </div>
            </div>

            <!-- Spool Weight (grams) -->
            <div class="form-group">
              <label class="form-label" for="modal-f-weight">Peso Total do Carretel (g)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-f-weight"
                  v-model.number="form.spoolWeightG" 
                  type="number" 
                  class="input-control font-mono" 
                  min="50" 
                  step="50" 
                  required
                />
                <span class="input-prefix-tag">gramas</span>
              </div>
            </div>

            <!-- Remaining grams -->
            <div class="form-group">
              <label class="form-label" for="modal-f-remaining">Estoque Restante (g)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-f-remaining"
                  v-model.number="form.remainingG" 
                  type="number" 
                  class="input-control font-mono" 
                  min="0" 
                  :max="form.spoolWeightG" 
                  required
                />
                <span class="input-prefix-tag">gramas</span>
              </div>
            </div>

            <!-- Price Paid -->
            <div class="form-group">
              <label class="form-label" for="modal-f-price">Preço Pago no Carretel</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-f-price"
                  v-model.number="form.pricePaid" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.01" 
                  min="0" 
                  required
                />
              </div>
            </div>

            <!-- Shipping Cost -->
            <div class="form-group">
              <label class="form-label" for="modal-f-shipping">Frete Rateado (R$)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-f-shipping"
                  v-model.number="form.shippingCost" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.01" 
                  min="0"
                />
              </div>
            </div>

            <!-- Computed Preview -->
            <div style="grid-column: span 2; background: rgba(0, 240, 255, 0.05); border: 1px dashed rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Resultado Calculado:</span>
                <div style="font-size: 0.85rem; color: var(--text-main);">
                  Custo total carretel: <strong>R$ {{ ((Number(form.pricePaid) || 0) + (Number(form.shippingCost) || 0)).toFixed(2) }}</strong>
                </div>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--brand-cyan); font-weight: 700;">Custo por Grama</span>
                <div class="font-mono" style="font-size: 1.35rem; font-weight: 800; color: var(--brand-cyan);">
                  R$ {{ formPreviewCostPerGram.toFixed(4) }} /g
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" for="modal-f-notes">Anotações / Temperaturas de Impressão</label>
              <textarea 
                id="modal-f-notes"
                v-model="form.notes" 
                rows="2" 
                class="input-control" 
                placeholder="Ex: Bico 215°C, Mesa 60°C, Fluxo 0.98, Retração 0.8mm..."
              ></textarea>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button id="modal-f-submit" type="submit" class="btn btn-primary">
              {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Filamento' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Filament } from '~/types'
import { use3DStore } from '~/composables/use3DStore'

const { 
  filaments, 
  getFilamentCostPerGram, 
  addFilament, 
  updateFilament, 
  deleteFilament, 
  resetFilamentsToDefault 
} = use3DStore()

const searchQuery = ref('')
const selectedMaterialFilter = ref('Todos')
const materialFilters = ['Todos', 'PLA', 'PETG', 'ABS', 'TPU', 'PLA Silk']

// Modal state
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const defaultForm: Omit<Filament, 'id'> = {
  name: '',
  brand: '',
  material: 'PLA',
  color: '#ffffff',
  colorName: 'Branco',
  diameter: 1.75,
  spoolWeightG: 1000,
  pricePaid: 110.00,
  shippingCost: 0.00,
  remainingG: 1000,
  density: 1.24,
  notes: ''
}

const form = reactive<Omit<Filament, 'id'>>({ ...defaultForm })

const formPreviewCostPerGram = computed(() => {
  const total = (Number(form.pricePaid) || 0) + (Number(form.shippingCost) || 0)
  const weight = Number(form.spoolWeightG) || 1000
  return weight > 0 ? total / weight : 0
})

// Metrics
const averageCostPerGram = computed(() => {
  if (filaments.length === 0) return 0
  const sum = filaments.reduce((acc, f) => acc + getFilamentCostPerGram(f), 0)
  return sum / filaments.length
})

const totalRemainingG = computed(() => {
  return filaments.reduce((acc, f) => acc + (Number(f.remainingG) || 0), 0)
})

const totalInventoryValue = computed(() => {
  return filaments.reduce((acc, f) => {
    const costPerG = getFilamentCostPerGram(f)
    return acc + (costPerG * (Number(f.remainingG) || 0))
  }, 0)
})

// Filtered list
const filteredFilaments = computed(() => {
  return filaments.filter(f => {
    const matchesSearch = searchQuery.value === '' || 
      f.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.brand.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.colorName.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesMat = selectedMaterialFilter.value === 'Todos' || 
      f.material === selectedMaterialFilter.value

    return matchesSearch && matchesMat
  })
})

const getMaterialBadgeClass = (mat: string) => {
  switch (mat) {
    case 'PLA': return 'badge-cyan'
    case 'PLA Silk': return 'badge-amber'
    case 'PETG': return 'badge-emerald'
    case 'ABS': return 'badge-rose'
    case 'TPU': return 'badge-cyan'
    default: return 'badge-cyan'
  }
}

const openAddModal = () => {
  isEditing.value = false
  editingId.value = ''
  Object.assign(form, defaultForm)
  isModalOpen.value = true
}

const openEditModal = (f: Filament) => {
  isEditing.value = true
  editingId.value = f.id
  Object.assign(form, {
    name: f.name,
    brand: f.brand,
    material: f.material,
    color: f.color,
    colorName: f.colorName,
    diameter: f.diameter,
    spoolWeightG: f.spoolWeightG,
    pricePaid: f.pricePaid,
    shippingCost: f.shippingCost,
    remainingG: f.remainingG,
    density: f.density,
    notes: f.notes || ''
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveFilamentForm = () => {
  if (isEditing.value && editingId.value) {
    updateFilament(editingId.value, { ...form })
  } else {
    addFilament({ ...form })
  }
  closeModal()
}

const handleDelete = (id: string, name: string) => {
  if (confirm(`Tem certeza que deseja excluir o filamento "${name}"?`)) {
    deleteFilament(id)
  }
}

const confirmReset = () => {
  if (confirm('Deseja restaurar a lista padrão de filamentos? Todas as alterações manuais serão resetadas.')) {
    resetFilamentsToDefault()
  }
}
</script>
