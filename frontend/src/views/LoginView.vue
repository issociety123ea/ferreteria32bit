<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { WrenchScrewdriverIcon, UserIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''

  if (!form.value.username || !form.value.password) {
    error.value = 'Por favor complete todos los campos'
    return
  }

  loading.value = true

  const result = await authStore.login(form.value)

  loading.value = false

  if (result.success) {
    router.push('/pos')
  } else {
    error.value = result.message
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
    <div class="w-full max-w-md">
      <!-- Logo and title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary-700 rounded-2xl mb-4">
          <WrenchScrewdriverIcon class="w-12 h-12 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-slate-800 mb-2">FERRETERÍA POS</h1>
        <p class="text-slate-600">Sistema de Punto de Venta</p>
      </div>

      <!-- Login card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-2xl font-semibold text-slate-800 mb-6 text-center">Iniciar Sesión</h2>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                v-model="form.username"
                type="text"
                autocomplete="username"
                class="input pl-10"
                placeholder="Ingrese su usuario"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon class="h-5 w-5 text-slate-400" />
              </div>
              <input
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                class="input pl-10"
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Ingresar</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingresando...
            </span>
          </button>
        </form>

        <!-- Helper text -->
        <div class="mt-6 text-center">
          <p class="text-xs text-slate-500">
            Credenciales por defecto:<br>
            <span class="font-mono">admin / admin123</span> o <span class="font-mono">vendedor1 / 1234</span>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-6">
        <p class="text-sm text-slate-600">
          Sistema POS v1.0.0 &copy; 2026
        </p>
      </div>
    </div>
  </div>
</template>
