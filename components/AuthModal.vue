<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content card" style="max-width: 480px;">
      <!-- Modal Header -->
      <div class="card-header" style="margin-bottom: 1.25rem;">
        <div class="card-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-cyan)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{{ currentTab === 'login' ? 'Acessar Minha Conta' : 'Criar Nova Conta' }}</span>
        </div>
        <button class="btn btn-secondary btn-icon btn-sm" @click="$emit('close')">✕</button>
      </div>

      <!-- Tab Switcher (Only Login & Register) -->
      <div style="display: flex; background: rgba(0, 0, 0, 0.35); padding: 0.35rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem; gap: 0.25rem;">
        <button 
          type="button" 
          class="btn btn-sm" 
          style="flex: 1;" 
          :class="currentTab === 'login' ? 'btn-primary' : 'btn-secondary'"
          @click="currentTab = 'login'"
        >
          Acessar Conta
        </button>
        <button 
          type="button" 
          class="btn btn-sm" 
          style="flex: 1;" 
          :class="currentTab === 'register' ? 'btn-primary' : 'btn-secondary'"
          @click="currentTab = 'register'"
        >
          Criar Conta
        </button>
      </div>

      <!-- Auth Error Alert -->
      <div v-if="authError" style="background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: var(--radius-md); padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.825rem; color: #fb7185; display: flex; align-items: center; gap: 0.5rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <span>{{ authError }}</span>
      </div>

      <!-- TAB 1: LOGIN -->
      <div v-if="currentTab === 'login'">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="modal-login-email">E-mail</label>
            <input 
              id="modal-login-email" 
              v-model="loginForm.email" 
              type="email" 
              class="input-control" 
              required 
              placeholder="seuemail@exemplo.com"
              :disabled="isLoadingAuth"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="modal-login-pass">Senha</label>
            <input 
              id="modal-login-pass" 
              v-model="loginForm.password" 
              type="password" 
              class="input-control" 
              required 
              placeholder="••••••••"
              :disabled="isLoadingAuth"
            />
          </div>

          <button 
            id="btn-modal-submit-login" 
            type="submit" 
            class="btn btn-primary" 
            style="width: 100%; margin-top: 0.5rem; padding: 0.75rem;"
            :disabled="isLoadingAuth"
          >
            {{ isLoadingAuth ? 'Entrando...' : 'Entrar no Sistema' }}
          </button>
        </form>

        <!-- Google Login Divider -->
        <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; color: var(--text-dim); font-size: 0.75rem;">
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
          <span>OU</span>
          <div style="flex: 1; height: 1px; background: var(--border-subtle);"></div>
        </div>

        <button 
          id="btn-modal-google-login"
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
      </div>

      <!-- TAB 2: REGISTER -->
      <div v-if="currentTab === 'register'">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label" for="modal-reg-name">Nome da sua Oficina ou Perfil</label>
            <input 
              id="modal-reg-name" 
              v-model="registerForm.displayName" 
              type="text" 
              class="input-control" 
              required 
              placeholder="Ex: Studio 3D Criativo"
              :disabled="isLoadingAuth"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="modal-reg-email">E-mail</label>
            <input 
              id="modal-reg-email" 
              v-model="registerForm.email" 
              type="email" 
              class="input-control" 
              required 
              placeholder="seuemail@exemplo.com"
              :disabled="isLoadingAuth"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="modal-reg-pass">Senha (mínimo 6 dígitos)</label>
            <input 
              id="modal-reg-pass" 
              v-model="registerForm.password" 
              type="password" 
              class="input-control" 
              required 
              minlength="6"
              placeholder="••••••••"
              :disabled="isLoadingAuth"
            />
          </div>

          <button 
            id="btn-modal-submit-register" 
            type="submit" 
            class="btn btn-primary" 
            style="width: 100%; margin-top: 0.5rem; padding: 0.75rem;"
            :disabled="isLoadingAuth"
          >
            {{ isLoadingAuth ? 'Criando Conta...' : 'Criar Conta e Sincronizar' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'logged-in'): void
}>()

const { 
  currentUser, 
  isLoadingAuth, 
  authError, 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle 
} = useFirebase()

const currentTab = ref<'login' | 'register'>('login')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  displayName: '',
  email: '',
  password: ''
})

watch(() => props.isOpen, (val) => {
  if (val) {
    currentTab.value = 'login'
  }
})

const handleLogin = async () => {
  const success = await loginWithEmail(loginForm.email, loginForm.password)
  if (success) {
    emit('logged-in')
    emit('close')
  }
}

const handleRegister = async () => {
  const success = await registerWithEmail(registerForm.email, registerForm.password, registerForm.displayName)
  if (success) {
    emit('logged-in')
    emit('close')
  }
}

const handleGoogleLogin = async () => {
  const success = await loginWithGoogle()
  if (success) {
    emit('logged-in')
    emit('close')
  }
}
</script>
