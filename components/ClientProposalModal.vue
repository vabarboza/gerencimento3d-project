<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content card" style="max-width: 760px; background: #0b1120; border: 1px solid rgba(0, 240, 255, 0.3);">
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
              STUDIO 3D • PROPOSTA COMERCIAL
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
        <div style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(16, 185, 129, 0.08)); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
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

        <!-- PIX Payment Section with Live Dynamic QR Code -->
        <div class="pix-proposal-box" style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(0, 240, 255, 0.25); border-radius: var(--radius-md); padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.65rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.2rem;">⚡</span>
              <div>
                <strong style="color: #fff; font-size: 0.95rem;">Pagamento Instantâneo via PIX</strong>
                <div style="font-size: 0.75rem; color: var(--text-dim);">Aponte a câmera do seu banco para o QR Code abaixo</div>
              </div>
            </div>

            <button 
              type="button" 
              class="btn btn-secondary btn-sm no-print" 
              style="font-size: 0.725rem; padding: 0.2rem 0.5rem;"
              @click="isEditingPix = !isEditingPix"
            >
              {{ isEditingPix ? 'Concluir Edição' : '⚙️ Alterar Chave' }}
            </button>
          </div>

          <!-- Quick PIX Key Edit Drawer if toggled -->
          <div v-if="isEditingPix" class="no-print" style="background: rgba(15, 23, 42, 0.95); border: 1px dashed rgba(0, 240, 255, 0.4); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-size: 0.825rem; font-weight: 700; color: var(--brand-cyan);">Personalizar Chave PIX Desta Proposta</span>
              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                style="font-size: 0.7rem; padding: 0.2rem 0.6rem; color: var(--brand-emerald); border-color: rgba(16, 185, 129, 0.4);"
                @click="saveAsDefaultSettings"
              >
                💾 Salvar Como Padrão Global
              </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div>
                <label style="font-size: 0.725rem; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Tipo de Chave:</label>
                <select v-model="currentPixKeyType" class="input-control" style="font-size: 0.8rem; height: 38px;">
                  <option value="cpf">📄 CPF (11 dígitos)</option>
                  <option value="cnpj">🏢 CNPJ (14 dígitos)</option>
                  <option value="phone">📱 Celular (+55...)</option>
                  <option value="email">✉️ E-mail</option>
                  <option value="random">🔑 Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label style="font-size: 0.725rem; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Chave PIX:</label>
                <input v-model="currentPixKey" class="input-control font-mono" style="font-size: 0.8rem; height: 38px;" :placeholder="getPixPlaceholder(currentPixKeyType)" />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.75rem;">
              <div>
                <label style="font-size: 0.725rem; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Nome do Titular / Beneficiário:</label>
                <input v-model="currentBeneficiary" class="input-control" style="font-size: 0.8rem; height: 38px;" placeholder="Nome ou Razão Social" />
              </div>
              <div>
                <label style="font-size: 0.725rem; color: var(--text-dim); display: block; margin-bottom: 0.25rem;">Cidade:</label>
                <input v-model="currentCity" class="input-control" style="font-size: 0.8rem; height: 38px;" placeholder="Ex: SAO PAULO" />
              </div>
            </div>
          </div>

          <!-- QR Code and Copy-Paste Layout -->
          <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
            <!-- QR Code Box -->
            <div class="pix-qrcode-wrapper" style="background: #ffffff; padding: 0.5rem; border-radius: var(--radius-md); box-shadow: 0 0 20px rgba(0, 240, 255, 0.15); display: flex; flex-direction: column; align-items: center; justify-content: center; width: 145px; height: 145px; flex-shrink: 0;">
              <img 
                v-if="qrCodeDataUrl" 
                :src="qrCodeDataUrl" 
                alt="QR Code PIX" 
                style="width: 100%; height: 100%; object-fit: contain; display: block;"
              />
              <div v-else style="font-size: 0.75rem; color: #333; text-align: center;">
                Gerando QR Code...
              </div>
            </div>

            <!-- PIX Data & Actions -->
            <div style="flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 0.65rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                <span style="color: var(--text-dim);">Favorecido:</span>
                <strong style="color: var(--text-main);">{{ currentBeneficiary }}</strong>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                <span style="color: var(--text-dim);">Chave PIX:</span>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span class="badge badge-cyan" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">
                    {{ formatKeyTypeBadge(currentPixKeyType) }}
                  </span>
                  <span class="font-mono" style="color: var(--brand-cyan); font-weight: 600;">{{ currentPixKey }}</span>
                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm no-print" 
                    style="padding: 0.15rem 0.45rem; font-size: 0.675rem;" 
                    @click="copyText(currentPixKey, 'key')"
                  >
                    {{ copiedKey ? 'Copiada!' : 'Copiar' }}
                  </button>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                <span style="color: var(--text-dim);">Valor do PIX:</span>
                <strong class="font-mono text-gradient-emerald" style="font-size: 1.15rem;">R$ {{ finalPrice.toFixed(2) }}</strong>
              </div>

              <!-- Copia e Cola Field -->
              <div style="margin-top: 0.25rem;">
                <div style="font-size: 0.725rem; color: var(--text-dim); margin-bottom: 0.25rem;">Código PIX Copia e Cola:</div>
                <div style="display: flex; gap: 0.4rem;">
                  <input 
                    type="text" 
                    readonly 
                    :value="pixPayload" 
                    class="input-control font-mono" 
                    style="font-size: 0.725rem; height: 32px; background: rgba(0, 0, 0, 0.4); color: #94a3b8; cursor: pointer;"
                    @click="copyText(pixPayload, 'payload')"
                  />
                  <button 
                    id="btn-copy-pix-payload"
                    type="button" 
                    class="btn btn-primary btn-sm no-print" 
                    style="flex-shrink: 0; font-size: 0.75rem; padding: 0 0.75rem;"
                    @click="copyText(pixPayload, 'payload')"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{{ copiedPayload ? 'Copiado!' : 'Copiar Código PIX' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
        <div style="font-size: 0.8rem; color: var(--text-dim);">
          Ideal para enviar no WhatsApp com QR Code ou gerar orçamento impresso/PDF.
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
import { ref, computed, watch } from 'vue'
import { use3DStore } from '~/composables/use3DStore'
import { generatePixPayload, generatePixQrCodeDataUrl, type PixKeyType } from '~/utils/pixGenerator'

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

const store = use3DStore()
const { settings, saveSettings } = store

const copied = ref(false)
const copiedKey = ref(false)
const copiedPayload = ref(false)
const isEditingPix = ref(false)

// Local reactive Pix details
const currentPixKey = ref(settings.pixKey || '')
const currentPixKeyType = ref<PixKeyType>(settings.pixKeyType || 'email')
const currentBeneficiary = ref(settings.pixBeneficiaryName || 'PRINT3D STUDIO')
const currentCity = ref(settings.pixBeneficiaryCity || 'SAO PAULO')

// Always sync when modal opens or settings changes
const syncWithSettings = () => {
  currentPixKey.value = settings.pixKey || ''
  currentPixKeyType.value = (settings.pixKeyType as PixKeyType) || 'email'
  currentBeneficiary.value = settings.pixBeneficiaryName || 'PRINT3D STUDIO'
  currentCity.value = settings.pixBeneficiaryCity || 'SAO PAULO'
}

watch(() => props.isOpen, (open) => {
  if (open) {
    syncWithSettings()
    isEditingPix.value = false
  }
})

watch(() => [settings.pixKey, settings.pixKeyType, settings.pixBeneficiaryName, settings.pixBeneficiaryCity], () => {
  syncWithSettings()
}, { deep: true })

const qrCodeDataUrl = ref('')

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR')
})

const getPixPlaceholder = (type?: string) => {
  switch (type) {
    case 'cpf': return 'Ex: 123.456.789-00'
    case 'cnpj': return 'Ex: 12.345.678/0001-90'
    case 'phone': return 'Ex: (11) 98765-4321'
    case 'email': return 'Ex: financeiro@empresa.com'
    case 'random': return 'Ex: 123e4567-e89b-12d3-a456-426614174000'
    default: return 'Chave PIX'
  }
}

const formatKeyTypeBadge = (type?: string) => {
  switch (type) {
    case 'cpf': return 'CPF'
    case 'cnpj': return 'CNPJ'
    case 'phone': return 'Celular'
    case 'email': return 'E-mail'
    case 'random': return 'Aleatória'
    default: return 'PIX'
  }
}

const saveAsDefaultSettings = () => {
  settings.pixKey = currentPixKey.value
  settings.pixKeyType = currentPixKeyType.value
  settings.pixBeneficiaryName = currentBeneficiary.value
  settings.pixBeneficiaryCity = currentCity.value
  saveSettings()
  alert('Chave PIX e dados salvos como padrão global com sucesso!')
}

// Dynamic PIX payload: recomputed immediately on ANY change
const pixPayload = computed(() => {
  const key = currentPixKey.value || settings.pixKey || 'financeiro@print3d.com'
  const type = currentPixKeyType.value || settings.pixKeyType || 'email'
  const name = currentBeneficiary.value || settings.pixBeneficiaryName || 'PRINT3D STUDIO'
  const city = currentCity.value || settings.pixBeneficiaryCity || 'SAO PAULO'

  return generatePixPayload({
    pixKey: key,
    pixKeyType: type,
    beneficiaryName: name,
    beneficiaryCity: city,
    amount: props.finalPrice,
    description: (props.jobTitle || 'PROJETO 3D').slice(0, 30)
  })
})

// Generate QR Code data URL whenever payload changes or modal opens
const updateQrCode = async () => {
  if (!pixPayload.value) return
  qrCodeDataUrl.value = await generatePixQrCodeDataUrl(pixPayload.value)
}

watch(pixPayload, () => {
  updateQrCode()
}, { immediate: true })

const copyText = (text: string, type: 'key' | 'payload') => {
  navigator.clipboard.writeText(text).then(() => {
    if (type === 'key') {
      copiedKey.value = true
      setTimeout(() => copiedKey.value = false, 2000)
    } else {
      copiedPayload.value = true
      setTimeout(() => copiedPayload.value = false, 2000)
    }
  })
}

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
    ``,
    `⚡ *DADOS PARA PAGAMENTO VIA PIX:*`,
    `• Favorecido: ${currentBeneficiary.value}`,
    `• Chave PIX (${formatKeyTypeBadge(currentPixKeyType.value)}): ${currentPixKey.value}`,
    ``,
    `📋 *PIX Copia e Cola:*`,
    `${pixPayload.value}`,
    ``,
    `Proposta válida por 10 dias. Ficamos à disposição para iniciar a impressão! 🚀`
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

<style scoped>
@media print {
  :global(body) {
    background: #ffffff !important;
    color: #111827 !important;
  }
  .modal-backdrop {
    position: static !important;
    background: transparent !important;
    padding: 0 !important;
  }
  .modal-content {
    background: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
    max-width: 100% !important;
    color: #111827 !important;
    padding: 0 !important;
  }
  .card-header,
  .no-print {
    display: none !important;
  }
  #proposal-printable-card {
    background: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #111827 !important;
  }
  #proposal-printable-card * {
    color: #111827 !important;
    text-shadow: none !important;
  }
  .pix-proposal-box {
    background: #f8fafc !important;
    border: 1px solid #cbd5e1 !important;
  }
  .pix-qrcode-wrapper {
    border: 1px solid #000000 !important;
    box-shadow: none !important;
  }
}
</style>
