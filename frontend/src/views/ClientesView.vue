<script setup>
import { ref, onMounted } from 'vue'
import { clientesApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { MagnifyingGlassIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const { success, error } = useToast()

const clientes = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create')
const searchQuery = ref('')

const form = ref({
  id: null,
  nombre_razon_social: '',
  nit_ci: '',
  telefono: '',
  direccion: '',
  tipo_cliente: 'NORMAL'
})

const tiposCliente = ['NORMAL', 'FRECUENTE', 'MAYORISTA', 'OBRA']

const loadClientes = async () => {
  loading.value = true
  try {
    const response = await clientesApi.getAll({ search: searchQuery.value })
    clientes.value = response.data.data.items
  } catch (error) {
    console.error('Error loading clients:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = {
    id: null,
    nombre_razon_social: '',
    nit_ci: '',
    telefono: '',
    direccion: '',
    tipo_cliente: 'NORMAL'
  }
  showModal.value = true
}

const openEditModal = (cliente) => {
  modalMode.value = 'edit'
  form.value = { ...cliente }
  showModal.value = true
}

const deleteCliente = async (id) => {
  const confirmResult = await useToast().confirm('¿Estás seguro de que deseas eliminar este cliente?')
  if (!confirmResult) {
    return
  }

  loading.value = true
  try {
    await clientesApi.delete(id)
    success('Cliente eliminado exitosamente')
    loadClientes()
  } catch (err) {
    console.error('Error al eliminar cliente:', err)
    error(err.response?.data?.message || 'Error al eliminar el cliente')
  } finally {
    loading.value = false
  }
}

const saveCliente = async () => {
  if (!form.value.nombre_razon_social) {
    error('El nombre es requerido')
    return
  }

  loading.value = true
  try {
    if (modalMode.value === 'create') {
      await clientesApi.create(form.value)
      success('Cliente creado exitosamente')
    } else {
      await clientesApi.update(form.value.id, form.value)
      success('Cliente actualizado exitosamente')
    }
    showModal.value = false
    loadClientes()
  } catch (err) {
    error(err.response?.data?.message || 'Error al guardar cliente')
  } finally {
    loading.value = false
  }
}

onMounted(loadClientes)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Clientes</h1>
        <p class="text-slate-600 mt-1">Gestión de clientes</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary flex items-center space-x-2">
        <PlusIcon class="w-5 h-5" />
        <span>Nuevo Cliente</span>
      </button>
    </div>

    <div class="card p-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
        </div>
        <input
          v-model="searchQuery"
          @input="loadClientes"
          type="search"
          class="input pl-10"
          placeholder="Buscar por nombre, NIT o teléfono..."
        />
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Nombre / Razón Social</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">NIT / CI</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Teléfono</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tipo</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="5" class="px-4 py-8 text-center">
                <div class="spinner mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="clientes.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                No se encontraron clientes
              </td>
            </tr>
            <tr v-else v-for="cliente in clientes" :key="cliente.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-800">{{ cliente.nombre_razon_social }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ cliente.nit_ci || '-' }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ cliente.telefono || '-' }}</td>
              <td class="px-4 py-3">
                <span class="badge badge-info">{{ cliente.tipo_cliente }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="openEditModal(cliente)" class="text-primary-600 hover:text-primary-800" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteCliente(cliente.id)" class="text-red-600 hover:text-red-800" title="Eliminar">
                    <TrashIcon class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 class="text-2xl font-bold text-slate-800">
            {{ modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveCliente" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nombre / Razón Social *</label>
            <input v-model="form.nombre_razon_social" type="text" class="input" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">NIT / CI</label>
              <input v-model="form.nit_ci" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
              <input v-model="form.telefono" type="text" class="input" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Dirección</label>
            <textarea v-model="form.direccion" rows="2" class="input"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Tipo de Cliente</label>
            <select v-model="form.tipo_cliente" class="input">
              <option v-for="tipo in tiposCliente" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 btn btn-secondary">Cancelar</button>
            <button type="submit" :disabled="loading" class="flex-1 btn btn-primary disabled:opacity-50">
              {{ modalMode === 'create' ? 'Crear Cliente' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
