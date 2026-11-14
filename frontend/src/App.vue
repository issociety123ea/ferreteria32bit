<script setup>
import { ref, onMounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useToast } from '@/composables/useToast'

const authStore = useAuthStore()
const { error, warning } = useToast()

const isOnline = ref(true)
const isServerHealthy = ref(true)
let healthCheckInterval = null

// Verificar conexión a internet
const checkConnection = () => {
  isOnline.value = navigator.onLine
}

// Verificar salud del servidor
const checkServerHealth = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/health', {
      method: 'GET',
      cache: 'no-cache'
    })
    isServerHealthy.value = response.ok
  } catch (e) {
    isServerHealthy.value = false
  }
}

onMounted(() => {
  // Listeners para cambios de conexión
  window.addEventListener('online', checkConnection)
  window.addEventListener('offline', checkConnection)

  // Verificar salud del servidor cada 30 segundos
  checkServerHealth()
  healthCheckInterval = setInterval(checkServerHealth, 30000)
})

// Mostrar alerta si no hay conexión
watch(isOnline, (newValue) => {
  if (!newValue) {
    warning('Sin conexión a internet - el sistema funcionará en modo offline', 5000)
  }
})

// Mostrar alerta si el servidor no responde
watch(isServerHealthy, (newValue) => {
  if (!newValue) {
    error('El servidor no responde - intente recargar la página', 5000)
  }
})

// Limpiar en desmontaje
const cleanup = () => {
  window.removeEventListener('online', checkConnection)
  window.removeEventListener('offline', checkConnection)
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval)
  }
}

// Cleanup al desmontar
onMounted(() => {
  return cleanup
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Toast Container para notificaciones -->
    <ToastContainer />

    <!-- Indicador de conexión offline -->
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium z-40"
    >
      📡 Sin conexión a internet - Modo offline
    </div>

    <!-- Indicador de servidor no disponible -->
    <div
      v-if="!isServerHealthy && isOnline"
      class="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium z-40"
      :style="{ marginTop: isOnline ? '0' : '32px' }"
    >
      ⚠️ Servidor no disponible - Intente recargar
    </div>

    <div v-if="authStore.isAuthenticated" class="flex h-screen overflow-hidden" :style="{ marginTop: !isOnline || !isServerHealthy ? '32px' : '0' }">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <AppHeader />

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto bg-slate-50 p-6">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- Public routes (login) -->
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>
