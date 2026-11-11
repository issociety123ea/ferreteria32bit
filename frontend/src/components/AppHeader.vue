<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const getRoleBadgeClass = () => {
  switch (authStore.userRole) {
    case 'ROOT':
      return 'bg-purple-100 text-purple-800'
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800'
    case 'VENDEDOR':
      return 'bg-emerald-100 text-emerald-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
    <!-- Page title or breadcrumb -->
    <div class="text-xl font-semibold text-slate-800">
      {{ $route.name }}
    </div>

    <!-- User info and actions -->
    <div class="flex items-center space-x-4">
      <!-- Current date -->
      <div class="text-sm text-slate-600">
        {{ new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </div>

      <!-- User dropdown -->
      <div class="relative">
        <button
          @click="showUserMenu = !showUserMenu"
          class="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <UserCircleIcon class="w-8 h-8 text-slate-600" />
          <div class="text-left">
            <div class="text-sm font-medium text-slate-800">{{ authStore.fullName }}</div>
            <div :class="['text-xs px-2 py-0.5 rounded-full inline-block', getRoleBadgeClass()]">
              {{ authStore.userRole }}
            </div>
          </div>
        </button>

        <!-- Dropdown menu -->
        <div
          v-if="showUserMenu"
          @click="showUserMenu = false"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50"
        >
          <button
            @click="logout"
            class="w-full flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
