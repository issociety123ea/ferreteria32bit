<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import AppSidebar from '@/components/AppSidebar.vue'
import AppHeader from '@/components/AppHeader.vue'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div v-if="authStore.isAuthenticated" class="flex h-screen overflow-hidden">
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
