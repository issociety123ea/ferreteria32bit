<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { proveedoresApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const { success, error } = useToast()

const proveedores = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')

const formData = ref({
  nombre: '',
  razon_social: '',
  nit: '',
  telefono: '',
  email: '',
  direccion: '',
  contacto_nombre: ''
})

const resetForm = () => {
  formData.value = {
    nombre: '',
    razon_social: '',
    nit: '',
    telefono: '',
    email: '',
    direccion: '',
    contacto_nombre: ''
  }
  editingId.value = null
}

const loadProveedores = async () => {
  loading.value = true
  try {
    const response = await proveedoresApi.getAll()
    proveedores.value = response.data.data
  } catch (err) {
    console.error('Error al cargar proveedores:', err)
    error('Error al cargar proveedores')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const openEditModal = async (proveedor) => {
  try {
    const response = await proveedoresApi.getById(proveedor.id)
    formData.value = { ...response.data.data }
    editingId.value = proveedor.id
    showModal.value = true
  } catch (err) {
    console.error('Error al cargar proveedor:', err)
    error('Error al cargar los datos del proveedor')
  }
}

const saveProveedor = async () => {
  if (!formData.value.nombre.trim()) {
    error('El nombre del proveedor es requerido')
    return
  }

  try {
    if (editingId.value) {
      await proveedoresApi.update(editingId.value, formData.value)
      success('Proveedor actualizado exitosamente')
    } else {
      await proveedoresApi.create(formData.value)
      success('Proveedor creado exitosamente')
    }
    showModal.value = false
    await loadProveedores()
  } catch (err) {
    console.error('Error al guardar proveedor:', err)
    error(err.response?.data?.message || 'Error al guardar el proveedor')
  }
}

const deleteProveedor = async (id) => {
  const confirmResult = await useToast().confirm('¿Estás seguro de que deseas eliminar este proveedor?')
  if (!confirmResult) {
    return
  }

  try {
    // Usar update con activo: false para soft delete
    await proveedoresApi.update(id, { activo: false })
    success('Proveedor eliminado exitosamente')
    await loadProveedores()
  } catch (err) {
    console.error('Error al eliminar proveedor:', err)
    error('Error al eliminar el proveedor')
  }
}

const filteredProveedores = computed(() => {
  if (!searchQuery.value) return proveedores.value
  const query = searchQuery.value.toLowerCase()
  return proveedores.value.filter(p =>
    p.nombre.toLowerCase().includes(query) ||
    p.nit?.toLowerCase().includes(query) ||
    p.telefono?.includes(query)
  )
})

onMounted(() => {
  loadProveedores()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Proveedores</h1>
        <p class="text-slate-600 mt-1">Gestión de proveedores y contactos</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary flex items-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Nuevo Proveedor</span>
      </button>
    </div>

    <!-- Search bar -->
    <div class="card p-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nombre, NIT o teléfono..."
        class="input w-full"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Proveedores table -->
    <div v-else-if="filteredProveedores.length > 0" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Razón Social</th>
              <th>NIT</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proveedor in filteredProveedores" :key="proveedor.id">
              <td class="font-semibold text-slate-800">{{ proveedor.nombre }}</td>
              <td class="text-slate-600">{{ proveedor.razon_social || '-' }}</td>
              <td class="text-slate-600">{{ proveedor.nit || '-' }}</td>
              <td class="text-slate-600">{{ proveedor.telefono || '-' }}</td>
              <td class="text-slate-600">{{ proveedor.email || '-' }}</td>
              <td class="text-slate-600">{{ proveedor.contacto_nombre || '-' }}</td>
              <td>
                <div class="flex items-center space-x-2">
                  <button
                    @click="openEditModal(proveedor)"
                    class="btn btn-sm btn-secondary"
                    title="Editar"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteProveedor(proveedor.id)"
                    class="btn btn-sm btn-danger"
                    title="Eliminar"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card p-12 text-center">
      <div class="text-slate-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">No hay proveedores</h3>
      <p class="text-slate-500 mb-6">Comienza agregando un nuevo proveedor</p>
      <button @click="openCreateModal" class="btn btn-primary">
        Crear Proveedor
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <!-- Header -->
        <div class="bg-primary-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 class="text-2xl font-bold">
            {{ editingId ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
          </h2>
          <button
            @click="showModal = false"
            class="text-white hover:bg-primary-600 p-2 rounded-lg"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                v-model="formData.nombre"
                type="text"
                class="input w-full"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Razón Social
              </label>
              <input
                v-model="formData.razon_social"
                type="text"
                class="input w-full"
                placeholder="Razón social"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                NIT
              </label>
              <input
                v-model="formData.nit"
                type="text"
                class="input w-full"
                placeholder="NIT"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                v-model="formData.telefono"
                type="text"
                class="input w-full"
                placeholder="Teléfono"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                v-model="formData.email"
                type="email"
                class="input w-full"
                placeholder="Email"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Contacto (Nombre)
              </label>
              <input
                v-model="formData.contacto_nombre"
                type="text"
                class="input w-full"
                placeholder="Nombre del contacto"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">
                Dirección
              </label>
              <textarea
                v-model="formData.direccion"
                class="input w-full"
                placeholder="Dirección completa"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 px-6 py-4 rounded-b-2xl flex items-center justify-end space-x-3">
          <button
            @click="showModal = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            @click="saveProveedor"
            class="btn btn-primary flex items-center space-x-2"
          >
            <CheckIcon class="w-5 h-5" />
            <span>{{ editingId ? 'Guardar Cambios' : 'Crear Proveedor' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
