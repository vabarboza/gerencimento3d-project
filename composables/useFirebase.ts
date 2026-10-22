import { ref, reactive, shallowRef } from 'vue'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  type Firestore 
} from 'firebase/firestore'
import type { FirebaseConfig, UserProfile, UserCloudData } from '~/types'

const CONFIG_STORAGE_KEY = 'p3d_firebase_custom_config_v1'

// Module-level singletons so all components share auth state
let firebaseAppInstance: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

const currentUser = ref<UserProfile | null>(null)
const isLoadingAuth = ref(true)
const isFirebaseConfigured = ref(false)
const authError = ref<string | null>(null)
const isSyncing = ref(false)
const lastSyncTime = ref<string | null>(null)

const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyAzx0mMk_4Z0SWFin6ex5eawyOVVwZQVaE",
  authDomain: "gerencimento3d-project.firebaseapp.com",
  projectId: "gerencimento3d-project",
  storageBucket: "gerencimento3d-project.firebasestorage.app",
  messagingSenderId: "647763861999",
  appId: "1:647763861999:web:27e745eb4868dd6401d61a"
}

const firebaseConfig = reactive<FirebaseConfig>({ ...DEFAULT_FIREBASE_CONFIG })

export const useFirebase = () => {
  const initFirebase = () => {
    if (typeof window === 'undefined') return

    // 1. Check runtime config or localStorage
    const runtimeConfig = useRuntimeConfig()
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)

    let activeConfig: FirebaseConfig = {
      apiKey: (runtimeConfig?.public?.firebaseApiKey as string) || DEFAULT_FIREBASE_CONFIG.apiKey,
      authDomain: (runtimeConfig?.public?.firebaseAuthDomain as string) || DEFAULT_FIREBASE_CONFIG.authDomain,
      projectId: (runtimeConfig?.public?.firebaseProjectId as string) || DEFAULT_FIREBASE_CONFIG.projectId,
      storageBucket: (runtimeConfig?.public?.firebaseStorageBucket as string) || DEFAULT_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: (runtimeConfig?.public?.firebaseMessagingSenderId as string) || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: (runtimeConfig?.public?.firebaseAppId as string) || DEFAULT_FIREBASE_CONFIG.appId
    }

    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig)
        if (parsed.apiKey && parsed.projectId) {
          activeConfig = { ...activeConfig, ...parsed }
        }
      } catch (e) {
        console.error('Error parsing stored firebase config', e)
      }
    }

    Object.assign(firebaseConfig, activeConfig)

    // Check if configuration is complete
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      try {
        if (!getApps().length) {
          firebaseAppInstance = initializeApp(firebaseConfig)
        } else {
          firebaseAppInstance = getApps()[0]
        }

        authInstance = getAuth(firebaseAppInstance)
        dbInstance = getFirestore(firebaseAppInstance)
        isFirebaseConfigured.value = true

        // Listen for auth state
        onAuthStateChanged(authInstance, (user: User | null) => {
          isLoadingAuth.value = false
          if (user) {
            currentUser.value = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'Usuário 3D',
              photoURL: user.photoURL,
              isAnonymous: user.isAnonymous
            }
          } else {
            currentUser.value = null
          }
        }, (error) => {
          console.error('Auth state change error:', error)
          isLoadingAuth.value = false
        })
      } catch (err: any) {
        console.error('Firebase initialization error:', err)
        isFirebaseConfigured.value = false
        isLoadingAuth.value = false
      }
    } else {
      isFirebaseConfigured.value = false
      isLoadingAuth.value = false
    }
  }

  // Save new Firebase Config from modal
  const saveFirebaseConfig = (newConfig: FirebaseConfig) => {
    Object.assign(firebaseConfig, newConfig)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(newConfig))
    }
    // Re-initialize
    initFirebase()
  }

  // Clear Firebase Config
  const resetFirebaseConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONFIG_STORAGE_KEY)
    }
    firebaseConfig.apiKey = ''
    firebaseConfig.authDomain = ''
    firebaseConfig.projectId = ''
    firebaseConfig.storageBucket = ''
    firebaseConfig.messagingSenderId = ''
    firebaseConfig.appId = ''
    isFirebaseConfigured.value = false
    currentUser.value = null
  }

  // Login with Email & Password
  const loginWithEmail = async (email: string, pass: string) => {
    authError.value = null
    if (!authInstance) {
      authError.value = 'Firebase ainda não foi configurado.'
      return false
    }

    try {
      isLoadingAuth.value = true
      const credential = await signInWithEmailAndPassword(authInstance, email, pass)
      currentUser.value = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'Usuário',
        photoURL: credential.user.photoURL
      }
      return true
    } catch (err: any) {
      console.error('Login error:', err)
      authError.value = getReadableAuthError(err.code)
      return false
    } finally {
      isLoadingAuth.value = false
    }
  }

  // Register with Email, Password & Name
  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    authError.value = null
    if (!authInstance) {
      authError.value = 'Firebase ainda não foi configurado.'
      return false
    }

    try {
      isLoadingAuth.value = true
      const credential = await createUserWithEmailAndPassword(authInstance, email, pass)
      if (displayName) {
        await updateProfile(credential.user, { displayName })
      }
      currentUser.value = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: displayName || credential.user.email?.split('@')[0] || 'Usuário',
        photoURL: credential.user.photoURL
      }
      return true
    } catch (err: any) {
      console.error('Registration error:', err)
      authError.value = getReadableAuthError(err.code)
      return false
    } finally {
      isLoadingAuth.value = false
    }
  }

  // Login with Google Popup
  const loginWithGoogle = async () => {
    authError.value = null
    if (!authInstance) {
      authError.value = 'Firebase ainda não foi configurado.'
      return false
    }

    try {
      isLoadingAuth.value = true
      const provider = new GoogleAuthProvider()
      const credential = await signInWithPopup(authInstance, provider)
      currentUser.value = {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName,
        photoURL: credential.user.photoURL
      }
      return true
    } catch (err: any) {
      console.error('Google login error:', err)
      authError.value = getReadableAuthError(err.code)
      return false
    } finally {
      isLoadingAuth.value = false
    }
  }

  // Logout
  const logout = async () => {
    authError.value = null
    if (authInstance) {
      try {
        await firebaseSignOut(authInstance)
      } catch (err) {
        console.error('Logout error:', err)
      }
    }
    currentUser.value = null
  }

  // Firestore: Save User 3D Data (Filaments, Printers, Platforms, Settings, Quotes)
  const saveUserCloudData = async (data: UserCloudData): Promise<boolean> => {
    if (!dbInstance || !currentUser.value) return false

    try {
      isSyncing.value = true
      const userDocRef = doc(dbInstance, 'users', currentUser.value.uid)
      
      const payload: UserCloudData = {
        filaments: JSON.parse(JSON.stringify(data.filaments)),
        printers: JSON.parse(JSON.stringify(data.printers)),
        platforms: JSON.parse(JSON.stringify(data.platforms)),
        settings: JSON.parse(JSON.stringify(data.settings)),
        quotes: JSON.parse(JSON.stringify(data.quotes)),
        updatedAt: new Date().toISOString()
      }

      await setDoc(userDocRef, payload, { merge: true })
      lastSyncTime.value = new Date().toLocaleTimeString('pt-BR')
      return true
    } catch (err) {
      console.error('Error saving user data to Firestore:', err)
      return false
    } finally {
      isSyncing.value = false
    }
  }

  // Firestore: Load User 3D Data
  const loadUserCloudData = async (uid: string): Promise<UserCloudData | null> => {
    if (!dbInstance) return null

    try {
      isSyncing.value = true
      const userDocRef = doc(dbInstance, 'users', uid)
      const snap = await getDoc(userDocRef)

      if (snap.exists()) {
        lastSyncTime.value = new Date().toLocaleTimeString('pt-BR')
        return snap.data() as UserCloudData
      }
      return null
    } catch (err) {
      console.error('Error loading user data from Firestore:', err)
      return null
    } finally {
      isSyncing.value = false
    }
  }

  // Friendly error messages in Portuguese
  const getReadableAuthError = (code?: string): string => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Endereço de e-mail inválido.'
      case 'auth/user-disabled':
        return 'Esta conta de usuário foi desativada.'
      case 'auth/user-not-found':
        return 'Nenhum usuário cadastrado com este e-mail.'
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.'
      case 'auth/email-already-in-use':
        return 'Este e-mail já está cadastrado em outra conta.'
      case 'auth/weak-password':
        return 'A senha é muito fraca. Escolha no mínimo 6 caracteres.'
      case 'auth/popup-closed-by-user':
        return 'A janela de autenticação foi fechada antes de concluir o login.'
      case 'auth/operation-not-allowed':
        return 'Provedor de login não ativado no Firebase Console. Ative E-mail/Senha nas configurações do Firebase.'
      case 'auth/unauthorized-domain':
        return `Domínio não autorizado no Firebase. Acesse o Firebase Console > Authentication > Settings (Configurações) > Authorized domains (Domínios autorizados) e adicione o domínio da sua Vercel.`
      case 'auth/popup-blocked':
        return 'O pop-up de login do Google foi bloqueado pelo navegador. Permita pop-ups para este site.'
      case 'auth/cancelled-popup-request':
        return 'Tentativa de login cancelada.'
      default:
        return code 
          ? `Erro ao autenticar (${code}). Verifique suas credenciais ou a configuração do Firebase.`
          : 'Erro ao autenticar. Verifique suas credenciais ou a configuração do Firebase.'
    }
  }

  return {
    currentUser,
    isLoadingAuth,
    isFirebaseConfigured,
    authError,
    firebaseConfig,
    isSyncing,
    lastSyncTime,
    initFirebase,
    saveFirebaseConfig,
    resetFirebaseConfig,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    saveUserCloudData,
    loadUserCloudData
  }
}
