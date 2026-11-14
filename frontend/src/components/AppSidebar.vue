<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  CreditCardIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const collapsed = ref(false)

const menuItems = [
  {
    name: 'POS',
    icon: ShoppingCartIcon,
    route: '/pos',
    roles: ['VENDEDOR', 'ADMIN', 'ROOT']
  },
  {
    name: 'Mi Historial',
    icon: ClipboardDocumentListIcon,
    route: '/mi-historial',
    roles: ['VENDEDOR', 'ADMIN', 'ROOT']
  },
  {
    name: 'Inventario',
    icon: CubeIcon,
    route: '/inventario',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Clientes',
    icon: UsersIcon,
    route: '/clientes',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Proveedores',
    icon: BuildingStorefrontIcon,
    route: '/proveedores',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Compras',
    icon: ShoppingBagIcon,
    route: '/compras',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Fiados / Al Anote',
    icon: CreditCardIcon,
    route: '/fiados',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Reportes',
    icon: ChartBarIcon,
    route: '/reportes',
    roles: ['ADMIN', 'ROOT']
  },
  {
    name: 'Usuarios',
    icon: UserGroupIcon,
    route: '/usuarios',
    roles: ['ROOT']
  }
]

const visibleMenuItems = menuItems.filter(item =>
  item.roles.includes(authStore.userRole)
)

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}
</script>

<template>
  <aside
    :class="[
      'bg-slate-800 text-white transition-all duration-300 flex flex-col',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Brand -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-slate-700">
      <div v-if="!collapsed" class="flex items-center space-x-2">
        <WrenchScrewdriverIcon class="w-6 h-6 text-emerald-400" />
        <span class="font-bold text-lg">FERRETERÍA</span>
      </div>
      <WrenchScrewdriverIcon v-else class="w-6 h-6 text-emerald-400 mx-auto" />
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-4">
      <router-link
        v-for="item in visibleMenuItems"
        :key="item.route"
        :to="item.route"
        class="flex items-center px-4 py-3 transition-colors hover:bg-slate-700"
        active-class="bg-slate-700 border-l-4 border-emerald-400"
      >
        <component :is="item.icon" class="w-6 h-6 flex-shrink-0" />
        <span v-if="!collapsed" class="ml-3 font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Collapse toggle -->
    <button
      @click="toggleSidebar"
      class="h-12 flex items-center justify-center border-t border-slate-700 hover:bg-slate-700 transition-colors"
    >
      <ChevronLeftIcon v-if="!collapsed" class="w-5 h-5" />
      <ChevronRightIcon v-else class="w-5 h-5" />
    </button>
  </aside>
</template>
