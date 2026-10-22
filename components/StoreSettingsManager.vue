<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    <!-- Top Banner / Intro -->
    <div class="card" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(139, 92, 246, 0.08)); border-color: rgba(0, 240, 255, 0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--brand-cyan), var(--brand-blue)); display: flex; align-items: center; justify-content: center; color: #040810; font-size: 1.5rem; flex-shrink: 0; box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);">
            🏪
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>Dados da Minha Loja & Configuração PIX</span>
              <span class="badge badge-cyan" style="font-size: 0.7rem; font-weight: 700;">Área Comercial</span>
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">
              Personalize o nome da sua empresa, logotipo quadrado 1:1, contatos e chave PIX que serão impressos nas propostas e orçamentos em PDF.
            </p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.4rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; color: var(--brand-emerald);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style="font-weight: 600;">Salvo automaticamente na nuvem & local</span>
        </div>
      </div>
    </div>

    <!-- Main Content 2-Column Grid -->
    <div style="display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 1.5rem; align-items: start;">
      
      <!-- Left Column: Store Branding & PIX Form -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- SECTION 1: Identidade da Loja & Logotipo -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Identidade Visual & Logotipo (1:1)</span>
            </div>
          </div>

          <!-- Logo Uploader 1:1 Standard -->
          <div style="margin-bottom: 1.25rem; background: rgba(0, 0, 0, 0.25); border: 1px dashed rgba(255, 255, 255, 0.12); border-radius: var(--radius-md); padding: 1.25rem;">
            <label class="form-label" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700;">Logotipo da Empresa / Estúdio</span>
              <span style="font-size: 0.725rem; color: var(--brand-cyan); font-weight: 600;">Padrão 1:1 Quadrado (PNG/JPG)</span>
            </label>

            <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
              <!-- 1:1 Image Preview Box -->
              <div 
                style="width: 100px; height: 100px; border-radius: var(--radius-md); background: #070c18; border: 2px dashed rgba(0, 240, 255, 0.35); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);"
              >
                <img 
                  v-if="settings.storeLogo" 
                  :src="settings.storeLogo" 
                  alt="Logotipo da Loja" 
                  style="width: 100%; height: 100%; object-fit: cover; display: block;"
                />
                <div v-else style="text-align: center; color: var(--text-dim); padding: 0.5rem;">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 0.25rem; opacity: 0.6;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span style="font-size: 0.68rem; display: block; line-height: 1.1;">Sem Logo (1:1)</span>
                </div>
              </div>

              <!-- Upload Actions & Instructions -->
              <div style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <label class="btn btn-primary btn-sm" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>{{ settings.storeLogo ? 'Trocar Imagem' : 'Carregar Imagem' }}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style="display: none;" 
                      @change="handleFileUpload" 
                    />
                  </label>

                  <button 
                    v-if="settings.storeLogo" 
                    type="button" 
                    class="btn btn-secondary btn-sm" 
                    style="color: var(--brand-rose); border-color: rgba(244, 63, 94, 0.4);"
                    @click="removeLogo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Remover</span>
                  </button>
                </div>

                <span style="font-size: 0.725rem; color: var(--text-dim); line-height: 1.35;">
                  A imagem é automaticamente recortada e otimizada na proporção <strong>quadrada 1:1</strong> em Base64 (256x256 px) para ser impressa com perfeição no cabeçalho do PDF.
                </span>
              </div>
            </div>
          </div>

          <!-- Basic Info Fields -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <!-- Nome da Loja -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="store-name">Nome da Loja / Estúdio 3D *</label>
              <input 
                id="store-name"
                v-model="settings.storeName" 
                type="text" 
                class="input-control" 
                placeholder="Ex: STUDIO 3D CRIATIVO"
                @input="saveChanges"
              />
              <span style="font-size: 0.725rem; color: var(--text-dim);">Aparece em destaque no topo da proposta.</span>
            </div>

            <!-- Subtítulo / Ramo -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="store-sub">Subtítulo / Especialidade</label>
              <input 
                id="store-sub"
                v-model="settings.storeSubtitle" 
                type="text" 
                class="input-control" 
                placeholder="Ex: Manufatura Aditiva & Prototipagem"
                @input="saveChanges"
              />
              <span style="font-size: 0.725rem; color: var(--text-dim);">Frase de impacto logo abaixo do nome.</span>
            </div>
          </div>

          <!-- Documento (CNPJ / CPF) -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="store-doc">Documento da Empresa (CNPJ ou CPF)</label>
            <input 
              id="store-doc"
              v-model="settings.storeDocument" 
              type="text" 
              class="input-control font-mono" 
              placeholder="Ex: 12.345.678/0001-90 ou 123.456.789-00"
              @input="saveChanges"
            />
            <span style="font-size: 0.725rem; color: var(--text-dim);">Opcional. Traz maior autoridade e confiança fiscal ao cliente.</span>
          </div>
        </div>

        <!-- SECTION 2: Contatos Comerciais -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-emerald)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Canais de Atendimento & Localização</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <!-- WhatsApp / Telefone -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="store-phone">WhatsApp / Telefone</label>
              <input 
                id="store-phone"
                v-model="settings.storePhone" 
                type="text" 
                class="input-control" 
                placeholder="Ex: (11) 98765-4321"
                @input="saveChanges"
              />
            </div>

            <!-- Email -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="store-email">E-mail Comercial</label>
              <input 
                id="store-email"
                v-model="settings.storeEmail" 
                type="email" 
                class="input-control" 
                placeholder="Ex: contato@sualoja3d.com.br"
                @input="saveChanges"
              />
            </div>
          </div>

          <!-- Endereço / Cidade -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="store-addr">Cidade / Estado / Endereço</label>
            <input 
              id="store-addr"
              v-model="settings.storeAddress" 
              type="text" 
              class="input-control" 
              placeholder="Ex: São Paulo - SP ou Rua das Impressoras, 100"
              @input="saveChanges"
            />
          </div>
        </div>

        <!-- SECTION 3: Configurações de Pagamento PIX (Área Própria) -->
        <div class="card" style="border-color: rgba(0, 240, 255, 0.3);">
          <div class="card-header">
            <div class="card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Configurações Oficiais de Pagamento PIX</span>
            </div>
            <span class="badge badge-cyan" style="font-size: 0.7rem;">BACEN EMV</span>
          </div>

          <div style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Estes dados são utilizados para gerar dinamicamente o QR Code e o código Pix Copia e Cola nas propostas de clientes e no fechamento de vendas.
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; margin-bottom: 1rem;">
            <!-- Tipo de Chave PIX -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="sett-pix-type">Tipo de Chave PIX</label>
              <select 
                id="sett-pix-type"
                v-model="settings.pixKeyType" 
                class="input-control"
                @change="saveChanges"
              >
                <option value="cpf">📄 CPF (11 dígitos)</option>
                <option value="cnpj">🏢 CNPJ (14 dígitos)</option>
                <option value="phone">📱 Celular (+55 DDD...)</option>
                <option value="email">✉️ E-mail</option>
                <option value="random">🔑 Chave Aleatória (EVP)</option>
              </select>
            </div>

            <!-- Chave PIX -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="sett-pix-key">Chave PIX Cadastrada no Banco</label>
              <input 
                id="sett-pix-key"
                v-model="settings.pixKey" 
                type="text" 
                class="input-control font-mono" 
                :placeholder="getPixKeyPlaceholder(settings.pixKeyType)"
                @input="saveChanges"
              />
            </div>
          </div>

          <div style="font-size: 0.725rem; color: var(--brand-cyan); margin-top: -0.5rem; margin-bottom: 1rem;">
            ℹ️ {{ getPixKeyHelper(settings.pixKeyType) }}
          </div>

          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 1rem;">
            <!-- Nome do Beneficiário -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="sett-pix-name">Nome do Titular da Conta / Razão Social</label>
              <input 
                id="sett-pix-name"
                v-model="settings.pixBeneficiaryName" 
                type="text" 
                class="input-control" 
                placeholder="Ex: PRINT3D STUDIO LTDA"
                @input="saveChanges"
              />
              <span style="font-size: 0.725rem; color: var(--text-dim);">Aparece na confirmação bancária do cliente.</span>
            </div>

            <!-- Cidade -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" for="sett-pix-city">Cidade da Conta</label>
              <input 
                id="sett-pix-city"
                v-model="settings.pixBeneficiaryCity" 
                type="text" 
                class="input-control" 
                placeholder="Ex: SAO PAULO"
                @input="saveChanges"
              />
              <span style="font-size: 0.725rem; color: var(--text-dim);">Sem acentuação, máx 15 letras.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Live Mockup & QR Code Live Verification -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 1.5rem;">
        
        <!-- Live Proposal Header Mockup Card -->
        <div class="card" style="border: 1px solid rgba(0, 240, 255, 0.4); background: #070c18;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
            <div class="card-title" style="font-size: 0.9rem;">
              <span>👁️ Prévia do Cabeçalho da Proposta (PDF & Tela)</span>
            </div>
            <span class="badge badge-emerald" style="font-size: 0.675rem;">Tempo Real</span>
          </div>

          <!-- Mockup View Sheet -->
          <div style="background: #ffffff; color: #0f172a; padding: 1.25rem; border-radius: var(--radius-md); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 0.75rem; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0;">
                <!-- 1:1 Logo rendering in Mockup -->
                <div 
                  v-if="settings.storeLogo" 
                  style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e1; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
                >
                  <img :src="settings.storeLogo" style="width: 100%; height: 100%; object-fit: cover; display: block;" alt="Logo" />
                </div>
                <div v-else style="width: 50px; height: 50px; border-radius: 8px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: #64748b; flex-shrink: 0;">
                  🖨️
                </div>

                <div style="min-width: 0;">
                  <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ (settings.storeName || 'STUDIO 3D').toUpperCase() }} • PROPOSTA COMERCIAL
                  </div>
                  <div style="font-size: 0.72rem; color: #0284c7; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ settings.storeSubtitle || 'Manufatura Aditiva & Prototipagem de Alta Precisão' }}
                  </div>
                  <div v-if="contactLine" style="font-size: 0.65rem; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    {{ contactLine }}
                  </div>
                </div>
              </div>

              <div style="text-align: right; font-size: 0.68rem; color: #64748b; flex-shrink: 0; line-height: 1.3;">
                <div>Data: <strong>{{ todayDate }}</strong></div>
                <div>Validade: <strong>10 dias</strong></div>
              </div>
            </div>

            <!-- Mini Spec preview -->
            <div style="margin-top: 0.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: #f8fafc; padding: 0.5rem 0.65rem; border-radius: 6px; font-size: 0.72rem; border: 1px solid #e2e8f0;">
              <div>
                <span style="color: #64748b; text-transform: uppercase; font-size: 0.62rem; font-weight: 700; display: block;">Cliente</span>
                <strong>Exemplo de Cliente</strong>
              </div>
              <div>
                <span style="color: #64748b; text-transform: uppercase; font-size: 0.62rem; font-weight: 700; display: block;">Projeto</span>
                <strong style="color: #0284c7;">Suporte Articulado 3D</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Live PIX Verification Box -->
        <div class="card" style="background: rgba(15, 23, 42, 0.7);">
          <div class="card-header" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem;">
            <div class="card-title" style="font-size: 0.9rem;">
              <span>⚡ Teste de Escaneamento PIX</span>
            </div>
            <span class="badge badge-cyan" style="font-size: 0.675rem;">QR Code Ativo</span>
          </div>

          <div style="display: flex; gap: 1rem; align-items: center;">
            <!-- Live QR Code -->
            <div style="width: 120px; height: 120px; background: #fff; padding: 0.4rem; border-radius: var(--radius-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);">
              <img 
                v-if="testQrCode" 
                :src="testQrCode" 
                alt="QR Code PIX Teste" 
                style="width: 100%; height: 100%; object-fit: contain; display: block;" 
              />
              <span v-else style="font-size: 0.7rem; color: #475569; text-align: center;">Gerando...</span>
            </div>

            <!-- Live Info -->
            <div style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 0.35rem; min-width: 0;">
              <div>
                <span style="color: var(--text-dim);">Chave:</span> 
                <strong class="font-mono" style="color: var(--brand-cyan); word-break: break-all;">{{ settings.pixKey || 'Não configurada' }}</strong>
              </div>
              <div>
                <span style="color: var(--text-dim);">Favorecido:</span> 
                <strong style="color: var(--text-main);">{{ settings.pixBeneficiaryName || 'PRINT3D STUDIO' }}</strong>
              </div>
              <div>
                <span style="color: var(--text-dim);">Cidade:</span> 
                <strong style="color: var(--text-main);">{{ settings.pixBeneficiaryCity || 'SAO PAULO' }}</strong>
              </div>
              <div style="font-size: 0.7rem; color: var(--brand-emerald); margin-top: 0.25rem;">
                ✓ Pode ser testado com qualquer leitor de QR Code bancário.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { use3DStore } from '~/composables/use3DStore'
import { generatePixPayload, generatePixQrCodeDataUrl } from '~/utils/pixGenerator'

const store = use3DStore()
const { settings, saveSettings } = store

const todayDate = computed(() => new Date().toLocaleDateString('pt-BR'))

const contactLine = computed(() => {
  const parts: string[] = []
  if (settings.storeDocument) parts.push(`Doc: ${settings.storeDocument}`)
  if (settings.storePhone) parts.push(`Tel: ${settings.storePhone}`)
  if (settings.storeEmail) parts.push(settings.storeEmail)
  if (settings.storeAddress) parts.push(settings.storeAddress)
  return parts.join(' • ')
})

const saveChanges = () => {
  saveSettings()
}

// 1:1 Image Processor using HTML5 Canvas
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).')
    return
  }

  const reader = new FileReader()
  reader.onload = (readerEvent) => {
    const dataUrl = readerEvent.target?.result as string
    if (!dataUrl) return

    const img = new Image()
    img.onload = () => {
      // Standardize to square 1:1 canvas (256x256 px)
      const targetSize = 256
      const canvas = document.createElement('canvas')
      canvas.width = targetSize
      canvas.height = targetSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Center and crop to square 1:1 without distortion
      const minDimension = Math.min(img.width, img.height)
      const sourceX = (img.width - minDimension) / 2
      const sourceY = (img.height - minDimension) / 2

      ctx.clearRect(0, 0, targetSize, targetSize)
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        minDimension,
        minDimension,
        0,
        0,
        targetSize,
        targetSize
      )

      // Export high-quality PNG Base64
      const croppedBase64 = canvas.toDataURL('image/png', 0.95)
      settings.storeLogo = croppedBase64
      saveSettings()
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)

  // Reset input value so same file can be re-selected if desired
  target.value = ''
}

const removeLogo = () => {
  settings.storeLogo = ''
  saveSettings()
}

// Live PIX QR Code generation
const testQrCode = ref('')

const updateTestQrCode = async () => {
  const payload = generatePixPayload({
    pixKey: settings.pixKey || 'financeiro@print3d.com',
    pixKeyType: settings.pixKeyType || 'email',
    beneficiaryName: settings.pixBeneficiaryName || 'PRINT3D STUDIO',
    beneficiaryCity: settings.pixBeneficiaryCity || 'SAO PAULO',
    amount: 10.00,
    description: 'TESTE PIX'
  })

  if (payload) {
    testQrCode.value = await generatePixQrCodeDataUrl(payload)
  }
}

watch(
  () => [settings.pixKey, settings.pixKeyType, settings.pixBeneficiaryName, settings.pixBeneficiaryCity],
  () => {
    updateTestQrCode()
  },
  { immediate: true }
)

const getPixKeyPlaceholder = (type?: string) => {
  switch (type) {
    case 'cpf': return 'Ex: 123.456.789-00 ou 12345678900'
    case 'cnpj': return 'Ex: 12.345.678/0001-90'
    case 'phone': return 'Ex: (11) 98765-4321 ou 11987654321'
    case 'email': return 'Ex: financeiro@suaempresa.com.br'
    case 'random': return 'Ex: 123e4567-e89b-12d3-a456-426614174000'
    default: return 'Digite sua Chave PIX'
  }
}

const getPixKeyHelper = (type?: string) => {
  switch (type) {
    case 'cpf': return 'O sistema limpa pontos e traços para atender a norma do Banco Central.'
    case 'cnpj': return 'O sistema limpa barras, pontos e traços automaticamente.'
    case 'phone': return 'O sistema insere o prefixo internacional (+55) automaticamente.'
    case 'email': return 'Certifique-se de que o e-mail cadastrado no seu banco está correto.'
    case 'random': return 'Chave aleatória gerada pelo seu banco (código UUID de 36 caracteres).'
    default: return ''
  }
}

onMounted(() => {
  updateTestQrCode()
})
</script>
