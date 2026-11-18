<script setup>
import { ref, onMounted, computed } from 'vue'
import { productosApi, categoriasApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const { success, error } = useToast()

const productos = ref([])
const categorias = ref([])
const loading = ref(false)
const showModal = ref(false)
const modalMode = ref('create')

const searchQuery = ref('')
const selectedCategoria = ref('')
const stockFilter = ref('all')

const currentPage = ref(1)
const totalPages = ref(1)
const limit = 20

const form = ref({
  id: null,
  codigo_sku_interno: '',
  nombre: '',
  descripcion: '',
  imagen_url: '',
  imagen_file: null,
  categoria_id: null,
  unidad_medida: 'Pieza',
  permite_decimales: false,
  stock_actual: 0,
  stock_minimo: 0,
  precio_costo: 0,
  precio_venta: 0
})

const unidadesMedida = ['Pieza', 'Kg', 'Metro', 'Caja', 'Litro', 'Paquete']

const formatCurrency = (value) => `Bs. ${parseFloat(value).toFixed(2)}`

const getStockStatus = (producto) => {
  if (producto.stock_actual <= 0) return { text: 'Sin stock', class: 'badge-danger' }
  if (producto.stock_actual <= producto.stock_minimo) return { text: 'Stock bajo', class: 'badge-warning' }
  return { text: 'Disponible', class: 'badge-success' }
}

const filteredProductos = computed(() => {
  let filtered = productos.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.codigo_sku_interno.toLowerCase().includes(q)
    )
  }

  if (selectedCategoria.value) {
    filtered = filtered.filter(p => p.categoria_id === parseInt(selectedCategoria.value))
  }

  if (stockFilter.value === 'low') {
    filtered = filtered.filter(p => p.stock_actual <= p.stock_minimo && p.stock_actual > 0)
  } else if (stockFilter.value === 'out') {
    filtered = filtered.filter(p => p.stock_actual <= 0)
  }

  return filtered
})

const loadProductos = async () => {
  loading.value = true
  try {
    const response = await productosApi.getAll({ page: currentPage.value, limit })
    productos.value = response.data.data.items
    totalPages.value = response.data.data.pagination.totalPages
  } catch (err) {
    console.error('Error loading products:', err)
    error('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const loadCategorias = async () => {
  try {
    const response = await categoriasApi.getAll()
    categorias.value = response.data.data
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const handleImageFile = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.imagen_file = file
    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.imagen_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = {
    id: null,
    codigo_sku_interno: '',
    nombre: '',
    descripcion: '',
    imagen_url: '',
    imagen_file: null,
    categoria_id: null,
    unidad_medida: 'Pieza',
    permite_decimales: false,
    stock_actual: 0,
    stock_minimo: 0,
    precio_costo: 0,
    precio_venta: 0
  }
  showModal.value = true
}

const openEditModal = (producto) => {
  modalMode.value = 'edit'
  form.value = {
    id: producto.id,
    codigo_sku_interno: producto.codigo_sku_interno,
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    imagen_url: producto.imagen_url || '',
    imagen_file: null,
    categoria_id: producto.categoria_id,
    unidad_medida: producto.unidad_medida,
    permite_decimales: producto.permite_decimales === 1,
    stock_actual: producto.stock_actual,
    stock_minimo: producto.stock_minimo,
    precio_costo: producto.precio_costo,
    precio_venta: producto.precio_venta
  }
  showModal.value = true
}

const deleteProducto = async (id) => {
  const confirmResult = await useToast().confirm('¿Estás seguro de que deseas eliminar este producto?')
  if (!confirmResult) {
    return
  }

  loading.value = true
  try {
    await productosApi.delete(id)
    success('Producto eliminado exitosamente')
    await loadProductos()
  } catch (err) {
    console.error('Error al eliminar producto:', err)
    error(err.response?.data?.message || 'Error al eliminar el producto')
  } finally {
    loading.value = false
  }
}

const saveProducto = async () => {
  if (!form.value.codigo_sku_interno || !form.value.nombre || !form.value.precio_venta) {
    error('Complete los campos requeridos: Código, Nombre y Precio de Venta')
    return
  }

  loading.value = true

  try {
    // Crear FormData para enviar con archivo
    const formData = new FormData()
    formData.append('codigo_sku_interno', form.value.codigo_sku_interno)
    formData.append('nombre', form.value.nombre)
    formData.append('descripcion', form.value.descripcion || '')
    formData.append('categoria_id', form.value.categoria_id || '')
    formData.append('unidad_medida', form.value.unidad_medida)
    formData.append('permite_decimales', form.value.permite_decimales ? '1' : '0')
    formData.append('stock_actual', form.value.stock_actual)
    formData.append('stock_minimo', form.value.stock_minimo)
    formData.append('precio_costo', form.value.precio_costo)
    formData.append('precio_venta', form.value.precio_venta)

    // Si hay archivo de imagen, agregarlo
    if (form.value.imagen_file) {
      formData.append('imagen', form.value.imagen_file)
    } else if (form.value.imagen_url && !form.value.imagen_url.startsWith('data:')) {
      formData.append('imagen_url', form.value.imagen_url)
    }

    if (modalMode.value === 'create') {
      await productosApi.create(formData)
    } else {
      await productosApi.update(form.value.id, formData)
    }

    showModal.value = false
    await loadProductos()
    success('Producto guardado exitosamente')
  } catch (err) {
    console.error('Error saving product:', err)
    error(err.response?.data?.message || 'Error al guardar producto')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProductos()
  loadCategorias()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Inventario</h1>
        <p class="text-slate-600 mt-1">Gestión de productos y stock</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary flex items-center space-x-2">
        <PlusIcon class="w-5 h-5" />
        <span>Nuevo Producto</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-slate-400" />
            </div>
            <input
              v-model="searchQuery"
              type="search"
              class="input pl-10"
              placeholder="Buscar por nombre o código..."
            />
          </div>
        </div>

        <!-- Category filter -->
        <div>
          <select v-model="selectedCategoria" class="input">
            <option value="">Todas las categorías</option>
            <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
              {{ cat.nombre }}
            </option>
          </select>
        </div>

        <!-- Stock filter -->
        <div>
          <select v-model="stockFilter" class="input">
            <option value="all">Todo el stock</option>
            <option value="low">Stock bajo</option>
            <option value="out">Sin stock</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Código</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Producto</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Categoría</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Stock</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Mínimo</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Unidad</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">P. Costo</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">P. Venta</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Margen</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Estado</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="11" class="px-4 py-8 text-center">
                <div class="spinner mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="filteredProductos.length === 0">
              <td colspan="11" class="px-4 py-8 text-center text-slate-500">
                No se encontraron productos
              </td>
            </tr>
            <tr v-else v-for="producto in filteredProductos" :key="producto.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-sm font-mono">{{ producto.codigo_sku_interno }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800">{{ producto.nombre }}</div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ producto.categoria_nombre || '-' }}</td>
              <td class="px-4 py-3 text-center font-semibold">{{ producto.stock_actual }}</td>
              <td class="px-4 py-3 text-center text-sm text-slate-600">{{ producto.stock_minimo }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ producto.unidad_medida }}</td>
              <td class="px-4 py-3 text-right text-sm">{{ formatCurrency(producto.precio_costo) }}</td>
              <td class="px-4 py-3 text-right font-semibold">{{ formatCurrency(producto.precio_venta) }}</td>
              <td class="px-4 py-3 text-right text-sm">
                <span class="text-emerald-600 font-medium">{{ producto.margen_ganancia?.toFixed(1) }}%</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="['badge', getStockStatus(producto).class]">
                  {{ getStockStatus(producto).text }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button @click="openEditModal(producto)" class="text-primary-600 hover:text-primary-800" title="Editar">
                    <PencilIcon class="w-5 h-5" />
                  </button>
                  <button @click="deleteProducto(producto.id)" class="text-red-600 hover:text-red-800" title="Eliminar">
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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-800">
            {{ modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto' }}
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveProducto" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Código SKU *</label>
              <input v-model="form.codigo_sku_interno" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
              <select v-model="form.categoria_id" class="input">
                <option :value="null">Sin categoría</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
            <input v-model="form.nombre" type="text" class="input" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <textarea v-model="form.descripcion" rows="2" class="input"></textarea>
          </div>

          <!-- Imagen del producto -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Imagen del Producto</label>
            <div class="flex items-center space-x-4">
              <div v-if="form.imagen_url" class="flex-shrink-0">
                <img :src="form.imagen_url" alt="Preview" class="w-24 h-24 object-cover rounded-lg border border-slate-200" />
              </div>
              <div v-else class="flex-shrink-0 w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  @change="handleImageFile"
                  class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p class="mt-1 text-xs text-slate-500">O ingrese una URL de imagen</p>
                <input
                  v-model="form.imagen_url"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  class="input mt-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Unidad de Medida</label>
              <select v-model="form.unidad_medida" class="input">
                <option v-for="unidad in unidadesMedida" :key="unidad" :value="unidad">
                  {{ unidad }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Stock Mínimo</label>
              <input v-model.number="form.stock_minimo" type="number" step="0.01" class="input" />
            </div>
            <div class="flex items-end">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input v-model="form.permite_decimales" type="checkbox" class="w-5 h-5 text-primary-600 rounded" />
                <span class="text-sm font-medium text-slate-700">Permite decimales</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Stock Actual</label>
              <input v-model.number="form.stock_actual" type="number" step="0.01" class="input" />
              <p v-if="modalMode === 'edit'" class="mt-1 text-xs text-amber-600">
                Cambiar el stock registra un ajuste de inventario en el kardex.
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Precio de Costo (Bs.)</label>
              <input v-model.number="form.precio_costo" type="number" step="0.01" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Precio de Venta (Bs.) *</label>
              <input v-model.number="form.precio_venta" type="number" step="0.01" class="input" required />
            </div>
          </div>

          <div class="flex space-x-3 pt-4">
            <button type="button" @click="showModal = false" class="flex-1 btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="loading" class="flex-1 btn btn-primary disabled:opacity-50">
              {{ modalMode === 'create' ? 'Crear Producto' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
