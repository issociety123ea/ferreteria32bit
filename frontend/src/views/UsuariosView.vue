<script setup>
import { ref, onMounted } from 'vue'
import { usuariosApi } from '@/services/api'
import { PlusIcon, PencilIcon, XMarkIcon, UserIcon } from '@heroicons/vue/24/outline'

const usuarios = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create')

const form = ref({
  id: null,
  nombre: '',
  username: '',
  password: '',
  rol: 'VENDEDOR',
  activo: true
})

const roles = ['VENDEDOR', 'ADMIN', 'ROOT']

const getRoleBadgeClass = (rol) => {
  switch (rol) {
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

const loadUsuarios = async () => {
  loading.value = true
  try {
    const response = await usuariosApi.getAll()
    usuarios.value = response.data.data
  } catch (error) {
    console.error('Error loading users:', error)
    alert('Error al cargar usuarios')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = {
    id: null,
    nombre: '',
    username: '',
    password: '',
    rol: 'VENDEDOR',
    activo: true
  }
  showModal.value = true
}

const openEditModal = (usuario) => {
  modalMode.value = 'edit'
  form.value = {
    id: usuario.id,
    nombre: usuario.nombre,
    username: usuario.username,
    password: '',
    rol: usuario.rol,
    activo: usuario.activo === 1
  }
  showModal.value = true
}

const saveUsuario = async () => {
  if (!form.value.nombre || !form.value.username) {
    alert('Complete los campos requeridos')
    return
  }

  if (modalMode.value === 'create' && !form.value.password) {
    alert('La contraseña es requerida para nuevos usuarios')
    return
  }

  loading.value = true

  try {
    const data = { ...form.value }
    if (!data.password) delete data.password // Don't send empty password on edit

    if (modalMode.value === 'create') {
      await usuariosApi.create(data)
    } else {
      await usuariosApi.update(data.id, data)
    }

    showModal.value = false
    loadUsuarios()
  } catch (error) {
    console.error('Error saving user:', error)
    alert(error.response?.data?.message || 'Error al guardar usuario')
  } finally {
    loading.value = false
  }
}

const toggleActivo = async (usuario) => {
  if (!confirm(`¿${usuario.activo ? 'Desactivar' : 'Activar'} a ${usuario.nombre}?`)) {
    return
  }

  try {
    await usuariosApi.update(usuario.id, { activo: !usuario.activo })
    loadUsuarios()
  } catch (error) {
    alert(error.response?.data?.message || 'Error al cambiar estado del usuario')
  }
}

onMounted(loadUsuarios)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Usuarios</h1>
        <p class="text-slate-600 mt-1">Gestión de usuarios del sistema</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary flex items-center space-x-2">
        <PlusIcon class="w-5 h-5" />
        <span>Nuevo Usuario</span>
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nombre</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Usuario</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Rol</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Estado</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Fecha Creación</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="6" class="px-4 py-8 text-center">
                <div class="spinner mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="usuarios.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-500">
                No hay usuarios registrados
              </td>
            </tr>
            <tr v-else v-for="usuario in usuarios" :key="usuario.id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon class="w-6 h-6 text-slate-600" />
                  </div>
                  <div class="font-medium text-slate-800">{{ usuario.nombre }}</div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600 font-mono">{{ usuario.username }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', getRoleBadgeClass(usuario.rol)]">
                  {{ usuario.rol }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="toggleActivo(usuario)"
                  :class="[
                    'badge cursor-pointer transition-colors',
                    usuario.activo ? 'badge-success hover:bg-emerald-200' : 'badge-danger hover:bg-red-200'
                  ]"
                >
                  {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="px-4 py-3 text-center text-sm text-slate-600">
                {{ new Date(usuario.creado_at).toLocaleDateString('es-BO') }}
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="openEditModal(usuario)" class="text-primary-600 hover:text-primary-800">
                  <PencilIcon class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 class="text-2xl font-bold text-slate-800">
            {{ modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveUsuario" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nombre Completo *</label>
            <input v-model="form.nombre" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nombre de Usuario *</label>
            <input v-model="form.username" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              Contraseña {{ modalMode === 'edit' ? '(dejar vacío para no cambiar)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              :required="modalMode === 'create'"
              :placeholder="modalMode === 'edit' ? 'Nueva contraseña' : 'Contraseña'"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Rol *</label>
            <select v-model="form.rol" class="input" required>
              <option v-for="rol in roles" :key="rol" :value="rol">{{ rol }}</option>
            </select>
            <p class="text-xs text-slate-500 mt-1">
              VENDEDOR: Solo acceso a POS | ADMIN: Control total | ROOT: Gestión de usuarios
            </p>
          </div>

          <div v-if="modalMode === 'edit'" class="flex items-center space-x-2">
            <input
              v-model="form.activo"
              type="checkbox"
              id="activo"
              class="w-5 h-5 text-primary-600 rounded"
            />
            <label for="activo" class="text-sm font-medium text-slate-700 cursor-pointer">
              Usuario activo
            </label>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="flex-1 btn btn-primary disabled:opacity-50">
              {{ modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
