<template>
  <div class="platform-fee-manager-section">
    <!-- Header with Explanation & Action -->
    <div class="card card-glass" style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; gap: 0.6rem;">
            <span class="text-gradient">Configuração de Taxas dos Marketplaces</span>
          </h2>
          <p class="card-subtitle">
            Configure as comissões percentuais, taxas fixas por item, subsídios de frete grátis obrigatório e taxas de processamento financeiro de cada canal de venda.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <button id="btn-reset-platforms" class="btn btn-secondary btn-sm" @click="confirmReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
            Restaurar Regras Padrão
          </button>
          <button id="btn-add-platform-open" class="btn btn-primary btn-sm" @click="openAddModal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nova Plataforma
          </button>
        </div>
      </div>

      <!-- Marketplace Rules Notice Banner -->
      <div style="margin-top: 1.25rem; background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: 0.85rem 1rem; display: flex; align-items: flex-start; gap: 0.75rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div style="font-size: 0.825rem; color: var(--text-muted); line-height: 1.45;">
          <strong style="color: var(--brand-cyan);">Como o simulador calcula o preço reverso:</strong> Quando você define a sua margem de lucro alvo na calculadora, o sistema calcula exatamente por quanto você deve anunciar em cada plataforma para que, após deduzir comissão, taxa fixa, coparticipação de frete e impostos de nota, sobre exatamente o lucro líquido desejado no seu bolso!
        </div>
      </div>
    </div>

    <!-- Platform Cards List -->
    <div class="platform-grid">
      <div 
        v-for="p in platforms" 
        :key="p.id" 
        class="card"
        :style="{ borderLeft: `4px solid ${p.badgeColor || 'var(--brand-cyan)'}` }"
        style="display: flex; flex-direction: column; justify-content: space-between;"
      >
        <div>
          <!-- Header: Name, Category and Status Toggle -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span 
                class="platform-indicator" 
                :style="{ backgroundColor: p.badgeColor, color: p.badgeColor }"
              ></span>
              <div>
                <h3 style="font-size: 1.1rem; font-weight: 700; line-height: 1.2;">{{ p.name }}</h3>
                <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); font-weight: 600;">
                  {{ p.category === 'marketplace' ? 'Marketplace' : p.category === 'direct' ? 'Canal Próprio' : 'E-commerce' }}
                </span>
              </div>
            </div>

            <!-- Enable/Disable Switch -->
            <label style="display: inline-flex; align-items: center; cursor: pointer; gap: 0.4rem;" :title="p.enabled ? 'Ativo no simulador' : 'Inativo no simulador'">
              <input 
                :id="`toggle-platform-${p.id}`"
                v-model="p.enabled" 
                type="checkbox" 
                style="display: none;" 
                @change="handleToggle(p)"
              />
              <span 
                style="width: 38px; height: 20px; border-radius: 20px; display: inline-block; position: relative; transition: background-color 0.2s;"
                :style="{ background: p.enabled ? 'var(--brand-emerald)' : '#334155' }"
              >
                <span 
                  style="width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 3px; transition: left 0.2s;"
                  :style="{ left: p.enabled ? '21px' : '3px' }"
                ></span>
              </span>
              <span style="font-size: 0.75rem; font-weight: 600;" :style="{ color: p.enabled ? 'var(--brand-emerald)' : 'var(--text-dim)' }">
                {{ p.enabled ? 'Ativo' : 'Pausado' }}
              </span>
            </label>
          </div>

          <!-- Description -->
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; min-height: 38px;">
            {{ p.description || 'Sem descrição cadastrada.' }}
          </p>

          <!-- Rates Grid -->
          <div style="background: rgba(0, 0, 0, 0.25); border-radius: var(--radius-md); padding: 0.85rem; border: 1px solid var(--border-subtle); display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div>
              <span style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase;">Comissão Canal</span>
              <div class="font-mono" style="font-size: 1.15rem; font-weight: 800; color: var(--brand-cyan);">
                {{ p.commissionPercent }}%
              </div>
            </div>

            <div>
              <span style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase;">Taxa Fixa / Item</span>
              <div class="font-mono" style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">
                R$ {{ (p.fixedFee || 0).toFixed(2) }}
              </div>
            </div>

            <div>
              <span style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase;">Teto Taxa Fixa</span>
              <div class="font-mono" style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">
                {{ p.fixedFeeThreshold < 99999 && p.fixedFeeThreshold > 0 ? `< R$ ${p.fixedFeeThreshold.toFixed(2)}` : 'Sempre aplica' }}
              </div>
            </div>

            <div>
              <span style="font-size: 0.725rem; color: var(--text-muted); text-transform: uppercase;">Frete Coparticipado</span>
              <div class="font-mono" style="font-size: 0.875rem; color: var(--brand-amber); font-weight: 600;">
                {{ p.freeShippingCost > 0 ? `R$ ${p.freeShippingCost.toFixed(2)} (>= R$${p.freeShippingThreshold})` : 'Isento' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem;">
          <button 
            :id="`btn-edit-platform-${p.id}`"
            class="btn btn-secondary btn-sm" 
            title="Editar taxas da plataforma" 
            @click="openEditModal(p)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Editar Taxas
          </button>
          <button 
            :id="`btn-delete-platform-${p.id}`"
            class="btn btn-danger btn-sm" 
            title="Excluir plataforma" 
            @click="handleDelete(p.id, p.name)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form (Add or Edit) -->
    <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            </svg>
            <span>{{ isEditing ? 'Editar Taxas da Plataforma' : 'Cadastrar Nova Plataforma' }}</span>
          </div>
          <button class="btn btn-secondary btn-icon btn-sm" @click="closeModal">✕</button>
        </div>

        <form @submit.prevent="savePlatformForm">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <!-- Name -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" for="modal-p-name">Nome da Plataforma / Canal</label>
              <input 
                id="modal-p-name"
                v-model="form.name" 
                type="text" 
                class="input-control" 
                required 
                placeholder="Ex: Mercado Livre Clássico, TikTok Shop, Shopee..."
              />
            </div>

            <!-- Category -->
            <div class="form-group">
              <label class="form-label" for="modal-p-category">Tipo de Canal</label>
              <select id="modal-p-category" v-model="form.category" class="input-control" required>
                <option value="marketplace">Marketplace Oficial</option>
                <option value="direct">Venda Direta (PIX / WhatsApp)</option>
                <option value="ecommerce">E-commerce / Loja Própria</option>
              </select>
            </div>

            <!-- Color Badge -->
            <div class="form-group">
              <label class="form-label" for="modal-p-color">Cor de Destaque da Marca</label>
              <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input 
                  id="modal-p-color"
                  v-model="form.badgeColor" 
                  type="color" 
                  style="width: 44px; height: 38px; border: none; background: transparent; cursor: pointer; border-radius: 6px;"
                />
                <input 
                  v-model="form.badgeColor" 
                  type="text" 
                  class="input-control font-mono" 
                  style="text-transform: uppercase;"
                />
              </div>
            </div>

            <!-- Commission Percent -->
            <div class="form-group">
              <label class="form-label" for="modal-p-commission">Comissão da Plataforma (%)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-p-commission"
                  v-model.number="form.commissionPercent" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  required
                />
                <span class="input-prefix-tag">%</span>
              </div>
            </div>

            <!-- Fixed Fee -->
            <div class="form-group">
              <label class="form-label" for="modal-p-fixedfee">Taxa Fixa por Item Vendido (R$)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-p-fixedfee"
                  v-model.number="form.fixedFee" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.01" 
                  min="0" 
                  required
                />
              </div>
            </div>

            <!-- Fixed Fee Threshold -->
            <div class="form-group">
              <label class="form-label" for="modal-p-threshold">
                Cobrar Taxa Fixa se Preço for menor que
              </label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-p-threshold"
                  v-model.number="form.fixedFeeThreshold" 
                  type="number" 
                  class="input-control font-mono" 
                  step="1" 
                  min="0"
                />
              </div>
              <span style="font-size: 0.725rem; color: var(--text-dim);">No Mercado Livre é R$ 79. Se sempre cobrar (ex: Shopee), digite 99999.</span>
            </div>

            <!-- Payment processing % -->
            <div class="form-group">
              <label class="form-label" for="modal-p-payrate">Taxa Financeira / Gateway Cartão (%)</label>
              <div class="input-prefix-box">
                <input 
                  id="modal-p-payrate"
                  v-model.number="form.paymentProcessingPercent" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.1" 
                  min="0" 
                  max="30"
                />
                <span class="input-prefix-tag">%</span>
              </div>
            </div>

            <!-- Free shipping subsidy cost -->
            <div class="form-group">
              <label class="form-label" for="modal-p-shippingcost">Custo Médio de Frete Subsidiado</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-p-shippingcost"
                  v-model.number="form.freeShippingCost" 
                  type="number" 
                  class="input-control font-mono" 
                  step="0.5" 
                  min="0"
                />
              </div>
            </div>

            <!-- Free shipping threshold -->
            <div class="form-group">
              <label class="form-label" for="modal-p-shippingthresh">Obrigatório acima de (R$)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">R$</span>
                <input 
                  id="modal-p-shippingthresh"
                  v-model.number="form.freeShippingThreshold" 
                  type="number" 
                  class="input-control font-mono" 
                  step="1" 
                  min="0"
                />
              </div>
            </div>

            <!-- Description -->
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" for="modal-p-desc">Regras / Notas Explicativas</label>
              <textarea 
                id="modal-p-desc"
                v-model="form.description" 
                rows="2" 
                class="input-control" 
                placeholder="Ex: Anúncio com parcelamento sem juros, comissão de 18.5%, frete grátis..."
              ></textarea>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
            <button id="modal-p-submit" type="submit" class="btn btn-primary">
              {{ isEditing ? 'Salvar Alterações' : 'Cadastrar Plataforma' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { PlatformFeeConfig } from '~/types'
import { use3DStore } from '~/composables/use3DStore'

const { 
  platforms, 
  addPlatform, 
  updatePlatform, 
  deletePlatform, 
  resetPlatformsToDefault 
} = use3DStore()

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref('')

const defaultForm: Omit<PlatformFeeConfig, 'id'> = {
  name: '',
  category: 'marketplace',
  badgeColor: '#00F0FF',
  commissionPercent: 14.0,
  fixedFee: 5.00,
  fixedFeeThreshold: 79.00,
  freeShippingCost: 0.00,
  freeShippingThreshold: 99999.00,
  paymentProcessingPercent: 0.0,
  enabled: true,
  description: ''
}

const form = reactive<Omit<PlatformFeeConfig, 'id'>>({ ...defaultForm })

const openAddModal = () => {
  isEditing.value = false
  editingId.value = ''
  Object.assign(form, defaultForm)
  isModalOpen.value = true
}

const openEditModal = (p: PlatformFeeConfig) => {
  isEditing.value = true
  editingId.value = p.id
  Object.assign(form, {
    name: p.name,
    category: p.category,
    badgeColor: p.badgeColor,
    commissionPercent: p.commissionPercent,
    fixedFee: p.fixedFee,
    fixedFeeThreshold: p.fixedFeeThreshold,
    freeShippingCost: p.freeShippingCost,
    freeShippingThreshold: p.freeShippingThreshold,
    paymentProcessingPercent: p.paymentProcessingPercent,
    enabled: p.enabled,
    description: p.description || ''
  })
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const savePlatformForm = () => {
  if (isEditing.value && editingId.value) {
    updatePlatform(editingId.value, { ...form })
  } else {
    addPlatform({ ...form })
  }
  closeModal()
}

const handleToggle = (p: PlatformFeeConfig) => {
  updatePlatform(p.id, { enabled: p.enabled })
}

const handleDelete = (id: string, name: string) => {
  if (platforms.length <= 1) {
    alert('Você deve manter pelo menos uma plataforma ativa.')
    return
  }
  if (confirm(`Tem certeza que deseja excluir a plataforma "${name}"?`)) {
    deletePlatform(id)
  }
}

const confirmReset = () => {
  if (confirm('Deseja restaurar as taxas padrão do Mercado Livre, Shopee, Elo7 e outros? Suas alterações manuais serão resetadas.')) {
    resetPlatformsToDefault()
  }
}
</script>
