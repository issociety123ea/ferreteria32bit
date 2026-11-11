<script setup>
import { ref, onMounted } from 'vue'
import { comprasApi, proveedoresApi, productosApi } from '@/services/api'
import { PlusIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const compras = ref([])
const proveedores = ref([])
const loading = ref(false)
const showModal = ref(false)

const form = ref({
  proveedor_id: null,
  items: [],
  notas: ''
})

const productSearch = ref('')
const productResults = ref([])

const formatCurrency = (value) => `Bs. ${parseFloat(value).toFixed(2)}`
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-BO')

const totalCompra = ref(0)

const calculateTotal = () => {
  totalCompra.value = form.value.items.reduce((sum, item) => {
    return sum + (item.cantidad * item.precio_costo)
  }, 0)
}

const loadCompras = async () => {
  loading.value = true
  try {
    const response = await comprasApi.getAll()
    compras.value = response.data.data.items
  } catch (error) {
    console.error('Error loading purchases:', error)
  } finally {
    loading.value = false
  }
}

const loadProveedores = async () => {
  try {
    const response = await proveedoresApi.getAll()
    proveedores.value = response.data.data
  } catch (error) {
    console.error('Error loading suppliers:', error)
  }
}

const searchProduct = async () => {
  if (!productSearch.value || productSearch.value.length < 2) {
    productResults.value = []
    return
  }

  try {
    const response = await productosApi.search(productSearch.value)
    productResults.value = response.data.data
  } catch (error) {
    console.error('Error searching products:', error)
  }
}

const addProductToForm = (producto) => {
  const existing = form.value.items.find(item => item.producto_id === producto.id)

  if (existing) {
    existing.cantidad++
  } else {
    form.value.items.push({
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      cantidad: 1,
      precio_costo: producto.precio_costo || 0
    })
  }

  productSearch.value = ''
  productResults.value = []
  calculateTotal()
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
  calculateTotal()
}

const openCreateModal = () => {
  form.value = {
    proveedor_id: null,
    items: [],
    notas: ''
  }
  totalCompra.value = 0
  showModal.value = true
}

const saveCompra = async () => {
  if (!form.value.proveedor_id) {
    alert('Debe seleccionar un proveedor')
    return
  }

  if (form.value.items.length === 0) {
    alert('Debe agregar al menos un producto')
    return
  }

  loading.value = true

  try {
    await comprasApi.create(form.value)
    showModal.value = false
    loadCompras()
    alert('Compra registrada exitosamente')
  } catch (error) {
    console.error('Error saving purchase:', error)
    alert(error.response?.data?.message || 'Error al registrar compra')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompras()
  loadProveedores()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Compras</h1>
        <p class="text-slate-600 mt-1">Registro de compras a proveedores</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary flex items-center space-x-2">
        <PlusIcon class="w-5 h-5" />
        <span>Nueva Compra</span>
      </button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Número</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Fecha</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Proveedor</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Total</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="5" class="px-4 py-8 text-center">
                <div class="spinner mx-auto"></div>
              </td>
            </tr>
            <tr v-else-if="compras.length === 0">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">
                No hay compras registradas
              </td>
            </tr>
            <tr v-else v-for="compra in compras" :key="compra.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-mono text-sm">{{ compra.numero_compra }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(compra.fecha) }}</td>
              <td class="px-4 py-3 font-medium text-slate-800">{{ compra.proveedor_nombre }}</td>
              <td class="px-4 py-3 text-right font-semibold">{{ formatCurrency(compra.total_compra) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="badge badge-success">{{ compra.estado }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nueva Compra -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-slate-800 flex items-center">
            <ShoppingBagIcon class="w-7 h-7 mr-2 text-primary-600" />
            Nueva Compra
          </h2>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Proveedor -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Proveedor *</label>
            <select v-model="form.proveedor_id" class="input" required>
              <option :value="null">Seleccione un proveedor</option>
              <option v-for="proveedor in proveedores" :key="proveedor.id" :value="proveedor.id">
                {{ proveedor.nombre }}
              </option>
            </select>
          </div>

          <!-- Buscar productos -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Agregar Productos</label>
            <div class="relative">
              <input
                v-model="productSearch"
                @input="searchProduct"
                type="text"
                class="input"
                placeholder="Buscar producto por nombre o código..."
              />

              <!-- Product dropdown -->
              <div
                v-if="productResults.length > 0"
                class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                <button
                  v-for="producto in productResults"
                  :key="producto.id"
                  @click="addProductToForm(producto)"
                  type="button"
                  class="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-0"
                >
                  <div class="font-medium text-sm">{{ producto.nombre }}</div>
                  <div class="text-xs text-slate-600">{{ producto.codigo_sku_interno }} - Stock: {{ producto.stock_actual }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- Items list -->
          <div v-if="form.items.length > 0" class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">Productos en la compra</label>
            <div
              v-for="(item, index) in form.items"
              :key="index"
              class="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center space-x-3"
            >
              <div class="flex-1">
                <div class="font-medium text-sm">{{ item.producto_nombre }}</div>
              </div>
              <div class="flex items-center space-x-2">
                <input
                  v-model.number="item.cantidad"
                  @input="calculateTotal"
                  type="number"
                  min="0.1"
                  step="0.1"
                  class="w-20 px-2 py-1 text-sm border border-slate-300 rounded"
                  placeholder="Cant."
                />
                <span class="text-xs text-slate-600">x</span>
                <input
                  v-model.number="item.precio_costo"
                  @input="calculateTotal"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-24 px-2 py-1 text-sm border border-slate-300 rounded"
                  placeholder="Costo"
                />
                <button @click="removeItem(index)" class="text-red-500 hover:text-red-700" type="button">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold text-slate-700">Total de Compra:</span>
                <span class="text-2xl font-bold text-primary-700">{{ formatCurrency(totalCompra) }}</span>
              </div>
            </div>
          </div>

          <!-- Notas -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Notas</label>
            <textarea v-model="form.notas" rows="2" class="input" placeholder="Observaciones adicionales..."></textarea>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            <button type="button" @click="showModal = false" class="flex-1 btn btn-secondary">
              Cancelar
            </button>
            <button @click="saveCompra" :disabled="loading" class="flex-1 btn btn-primary disabled:opacity-50">
              Registrar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
