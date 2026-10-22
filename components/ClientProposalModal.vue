<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content card" style="max-width: 720px; background: #0b1120; border: 1px solid rgba(0, 240, 255, 0.3);">
      <!-- Modal Header -->
      <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <div class="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Proposta Comercial de Impressão 3D</span>
        </div>
        <button class="btn btn-secondary btn-icon btn-sm" @click="$emit('close')">✕</button>
      </div>

      <!-- Printable Area -->
      <div id="proposal-printable-card" style="padding: 1.5rem; background: #070a12; border-radius: var(--radius-lg); border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 1.5rem;">
        <!-- Brand Header inside proposal -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 1rem;">
          <div>
            <div style="font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;">
              STUDIO 3D • PROPOSTA
            </div>
            <div style="font-size: 0.8rem; color: var(--brand-cyan); font-weight: 600;">
              Manufatura Aditiva & Prototipagem de Alta Precisão
            </div>
          </div>

          <div style="text-align: right; font-size: 0.8rem; color: var(--text-dim);">
            <div>Data: <strong>{{ formattedDate }}</strong></div>
            <div>Validade: <strong>10 dias</strong></div>
          </div>
        </div>

        <!-- Client & Job Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(255, 255, 255, 0.02); padding: 1rem; border-radius: var(--radius-md);">
          <div>
            <span style="font-size: 0.725rem; color: var(--text-dim); text-transform: uppercase;">Cliente:</span>
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--text-main);">
              {{ clientName || 'Cliente Particular' }}
            </div>
          </div>

          <div>
            <span style="font-size: 0.725rem; color: var(--text-dim); text-transform: uppercase;">Projeto / Peça:</span>
            <div style="font-weight: 700; font-size: 1.05rem; color: var(--brand-cyan);">
              {{ jobTitle }}
            </div>
          </div>
        </div>

        <!-- Technical Specifications -->
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 700;">
            Especificações Técnicas de Fabricação
          </h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <div style="background: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.04);">
              <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Material(is)</span>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                {{ materialList }}
              </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.04);">
              <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Peso Estimado</span>
              <div class="font-mono" style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                {{ totalGrams }} gramas
              </div>
            </div>

            <div style="background: rgba(0, 0, 0, 0.3); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.04);">
              <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">Prazo Médio</span>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">
                {{ printHours <= 5 ? '1 a 2 dias úteis' : '2 a 4 dias úteis' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Notes if any -->
        <div v-if="notes" style="margin-bottom: 1.5rem; font-size: 0.825rem; color: var(--text-muted); background: rgba(0, 240, 255, 0.03); border-left: 3px solid var(--brand-cyan); padding: 0.75rem;">
          <strong>Detalhes & Acabamento:</strong> {{ notes }}
        </div>

        <!-- Investment Pricing Options -->
        <div style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(16, 185, 129, 0.08)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.8rem; color: var(--brand-emerald); text-transform: uppercase; font-weight: 700;">
              Investimento Total
            </div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">
              Inclui matéria-prima de primeira linha, inspeção de qualidade e acabamento.
            </div>
          </div>

          <div style="text-align: right;">
            <div class="font-mono" style="font-size: 2.2rem; font-weight: 800; color: #fff; line-height: 1;">
              R$ {{ finalPrice.toFixed(2) }}
            </div>
            <span style="font-size: 0.75rem; color: var(--brand-emerald); font-weight: 600;">
              À vista via PIX ou em até 3x no cartão
            </span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <div style="font-size: 0.8rem; color: var(--text-dim);">
          Ideal para enviar no WhatsApp ou gerar orçamento em PDF.
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-copy-proposal-text" class="btn btn-secondary" @click="copyWhatsAppProposal">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copied ? 'Texto Copiado!' : 'Copiar p/ WhatsApp' }}
          </button>

          <button id="btn-print-proposal" class="btn btn-primary" @click="handlePrint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  jobTitle: string
  clientName?: string
  materialList: string
  totalGrams: number
  printHours: number
  finalPrice: number
  notes?: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR')
})

const copyWhatsAppProposal = () => {
  const text = [
    `*PROPOSTA DE IMPRESSÃO 3D* 🖨️✨`,
    `Olá ${props.clientName ? props.clientName : ''}! Segue a estimativa para o seu projeto:`,
    ``,
    `📌 *Projeto:* ${props.jobTitle}`,
    `🧵 *Material:* ${props.materialList}`,
    `⚖️ *Peso Estimado:* ${props.totalGrams}g`,
    `⏱️ *Prazo de Produção:* ${props.printHours <= 5 ? '1 a 2 dias úteis' : '2 a 4 dias úteis'}`,
    props.notes ? `📝 *Observações:* ${props.notes}` : '',
    ``,
    `💰 *Valor Total:* R$ ${props.finalPrice.toFixed(2)}`,
    `Pagamento via PIX ou Cartão. Proposta válida por 10 dias.`,
    ``,
    `Ficamos à disposição para iniciar a impressão! 🚀`
  ].filter(Boolean).join('\n')

  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => copied.value = false, 2500)
  })
}

const handlePrint = () => {
  window.print()
}
</script>
