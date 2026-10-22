<template>
  <div class="auth-screen-wrapper">
    <!-- Ambient light glow effects -->
    <div class="auth-ambient-glow-1"></div>
    <div class="auth-ambient-glow-2"></div>

    <div class="container-custom auth-container">
      <!-- Left / Hero Column: Brand & Benefits -->
      <div class="auth-hero-section">
        <!-- Logo Brand -->
        <div class="auth-brand-badge">
          <div class="logo-icon-box" style="width: 48px; height: 48px;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <div style="font-size: 1.6rem; font-weight: 800; line-height: 1;">
              <span class="text-gradient">Print3D</span> <span style="font-weight: 400; color: #94a3b8;">Pro</span>
            </div>
            <span style="font-size: 0.725rem; font-weight: 700; color: var(--brand-cyan); letter-spacing: 0.08em; text-transform: uppercase;">
              Gestão de Impressão 3D & Marketplaces
            </span>
          </div>
        </div>

        <h1 style="font-size: 2.4rem; font-weight: 800; line-height: 1.15; margin-bottom: 1.25rem;">
          Precificação profissional e controle total do seu negócio 3D.
        </h1>

        <p style="font-size: 1.05rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem;">
          Pare de perder dinheiro em taxas ocultas de marketplaces. Calcule o custo real do filamento, energia, depreciação e saiba exatamente quanto cobrar no Mercado Livre, Shopee e vendas diretas.
        </p>

        <!-- Feature Pills -->
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          <div class="auth-benefit-item">
            <div class="benefit-icon-box">🧵</div>
            <div>
              <strong>Calculadora Real de Filamentos</strong>
              <div style="font-size: 0.8rem; color: var(--text-dim);">Custo preciso por grama, controle de estoque do carretel e suporte AMS multicolor.</div>
            </div>
          </div>

          <div class="auth-benefit-item">
            <div class="benefit-icon-box">🏷️</div>
            <div>
              <strong>Simulador Reverso de Marketplaces</strong>
              <div style="font-size: 0.8rem; color: var(--text-dim);">Mercado Livre Clássico/Premium, Shopee, Elo7 e PIX com taxas e frete grátis calculados.</div>
            </div>
          </div>

          <div class="auth-benefit-item">
            <div class="benefit-icon-box">☁️</div>
            <div>
              <strong>Seus Dados Separados e Seguros na Nuvem</strong>
              <div style="font-size: 0.8rem; color: var(--text-dim);">Acesse seus orçamentos e impressoras de qualquer celular, tablet ou computador.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Login / Register Form Card -->
      <div class="auth-card-section">
        <div class="card card-glass auth-glass-card">
          <!-- Mode Tabs (Entrar / Criar Conta) -->
          <div class="auth-tab-nav">
            <button 
              id="btn-tab-login"
              type="button" 
              class="auth-tab-btn" 
              :class="{ active: mode === 'login' }"
              @click="mode = 'login'"
            >
              Acessar Conta
            </button>
            <button 
              id="btn-tab-register"
              type="button" 
              class="auth-tab-btn" 
              :class="{ active: mode === 'register' }"
              @click="mode = 'register'"
            >
              Criar Nova Conta
            </button>
          </div>

          <!-- Error Alert Banner -->
          <div v-if="authError" class="auth-alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ authError }}</span>
          </div>

          <!-- FORM: LOGIN -->
          <form v-if="mode === 'login'" @submit.prevent="handleLogin">
            <div class="form-group">
              <label class="form-label" for="auth-login-email">Seu E-mail</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input 
                  id="auth-login-email"
                  v-model="loginForm.email" 
                  type="email" 
                  class="input-control" 
                  required 
                  placeholder="exemplo@gmail.com"
                  :disabled="isLoadingAuth"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-login-pass">Sua Senha</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  id="auth-login-pass"
                  v-model="loginForm.password" 
                  type="password" 
                  class="input-control" 
                  required 
                  placeholder="••••••••"
                  :disabled="isLoadingAuth"
                />
              </div>
            </div>

            <button 
              id="btn-auth-submit-login" 
              type="submit" 
              class="btn btn-primary" 
              style="width: 100%; padding: 0.85rem; font-size: 1rem; margin-top: 0.5rem;"
              :disabled="isLoadingAuth"
            >
              {{ isLoadingAuth ? 'Entrando...' : 'Entrar no Sistema' }}
            </button>
          </form>

          <!-- FORM: REGISTER -->
          <form v-if="mode === 'register'" @submit.prevent="handleRegister">
            <div class="form-group">
              <label class="form-label" for="auth-reg-name">Nome da sua Oficina ou Perfil</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input 
                  id="auth-reg-name"
                  v-model="registerForm.displayName" 
                  type="text" 
                  class="input-control" 
                  required 
                  placeholder="Ex: Studio 3D Criativo"
                  :disabled="isLoadingAuth"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-reg-email">Seu E-mail</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input 
                  id="auth-reg-email"
                  v-model="registerForm.email" 
                  type="email" 
                  class="input-control" 
                  required 
                  placeholder="seuemail@exemplo.com"
                  :disabled="isLoadingAuth"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="auth-reg-pass">Criar Senha (mínimo 6 dígitos)</label>
              <div class="input-prefix-box">
                <span class="input-prefix-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input 
                  id="auth-reg-pass"
                  v-model="registerForm.password" 
                  type="password" 
                  class="input-control" 
                  required 
                  minlength="6"
                  placeholder="••••••••"
                  :disabled="isLoadingAuth"
                />
              </div>
            </div>

            <button 
              id="btn-auth-submit-register" 
              type="submit" 
              class="btn btn-primary" 
              style="width: 100%; padding: 0.85rem; font-size: 1rem; margin-top: 0.5rem;"
              :disabled="isLoadingAuth"
            >
              {{ isLoadingAuth ? 'Criando Conta...' : 'Cadastrar e Começar' }}
            </button>
          </form>

          <!-- Divider -->
          <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1.5rem 0; color: var(--text-dim); font-size: 0.75rem;">
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
            <span>OU</span>
            <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          </div>

          <!-- Google Login Button -->
          <button 
            id="btn-auth-google"
            type="button" 
            class="btn btn-secondary" 
            style="width: 100%; padding: 0.75rem;"
            :disabled="isLoadingAuth"
            @click="handleGoogleLogin"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continuar com o Google</span>
          </button>

          <!-- Guest Mode Link -->
          <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <button 
              id="btn-guest-mode"
              type="button" 
              class="btn-text-link"
              @click="$emit('continue-as-guest')"
            >
              Testar no modo local offline sem login →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const emit = defineEmits<{
  (e: 'logged-in'): void
  (e: 'continue-as-guest'): void
}>()

const { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  isLoadingAuth, 
  authError 
} = useFirebase()

const mode = ref<'login' | 'register'>('login')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  displayName: '',
  email: '',
  password: ''
})

const handleLogin = async () => {
  const success = await loginWithEmail(loginForm.email, loginForm.password)
  if (success) {
    emit('logged-in')
  }
}

const handleRegister = async () => {
  const success = await registerWithEmail(registerForm.email, registerForm.password, registerForm.displayName)
  if (success) {
    emit('logged-in')
  }
}

const handleGoogleLogin = async () => {
  const success = await loginWithGoogle()
  if (success) {
    emit('logged-in')
  }
}
</script>

<style scoped>
.auth-screen-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 2.5rem 0;
  background: radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.95), #090d16);
}

.auth-ambient-glow-1 {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.auth-ambient-glow-2 {
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.auth-container {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 3.5rem;
  align-items: center;
  position: relative;
  z-index: 2;
}

.auth-brand-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.auth-benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  transition: border-color 0.2s;
}

.auth-benefit-item:hover {
  border-color: var(--border-hover);
}

.benefit-icon-box {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: rgba(0, 240, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.auth-glass-card {
  padding: 2.25rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.25);
  position: relative;
}

.auth-glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--brand-cyan), var(--brand-blue), var(--brand-purple));
}

.auth-tab-nav {
  display: flex;
  background: rgba(0, 0, 0, 0.35);
  border-radius: var(--radius-md);
  padding: 0.35rem;
  border: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
  gap: 0.35rem;
}

.auth-tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.auth-tab-btn.active {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(59, 130, 246, 0.25));
  color: var(--brand-cyan);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.15);
}

.auth-alert-error {
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.35);
  border-radius: var(--radius-md);
  padding: 0.85rem;
  margin-bottom: 1.25rem;
  color: #fb7185;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.btn-text-link {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.825rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.btn-text-link:hover {
  color: var(--brand-cyan);
}

@media (max-width: 900px) {
  .auth-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
