import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    redirect: '/pos'
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => import('@/views/PosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/mi-historial',
    name: 'MiHistorial',
    component: () => import('@/views/MiHistorialView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: () => import('@/views/InventoryView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: () => import('@/views/ClientesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: () => import('@/views/ProveedoresView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/compras',
    name: 'Compras',
    component: () => import('@/views/ComprasView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/fiados',
    name: 'Fiados',
    component: () => import('@/views/FiadosView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: () => import('@/views/ReportesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UsuariosView.vue'),
    meta: { requiresAuth: true, requiresRoot: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Public routes
  if (to.meta.public) {
    if (authStore.isAuthenticated) {
      return next('/pos')
    }
    return next()
  }

  // Protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Admin routes
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/pos')
  }

  // Root routes
  if (to.meta.requiresRoot && !authStore.isRoot) {
    return next('/pos')
  }

  next()
})

export default router
