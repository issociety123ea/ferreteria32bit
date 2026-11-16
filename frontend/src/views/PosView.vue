<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePosStore } from '@/stores/pos.store'
import { useAuthStore } from '@/stores/auth.store'
import { clientesApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  PrinterIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const { success, error, warning } = useToast()

const posStore = usePosStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const clientSearch = ref('')
const clientResults = ref([])
const showClientDropdown = ref(false)
const showNewClientModal = ref(false)

const paymentMethod = ref('EFECTIVO')
const montoRecibido = ref(0)
const showPaymentModal = ref(false)
const processingPayment = ref(false)

const newClientForm = ref({
  nombre_razon_social: '',
  nit_ci: '',
  telefono: '',
  email: '',
  direccion: ''
})

let searchTimeout = null

const formatCurrency = (value) => {
  return `Bs. ${parseFloat(value).toFixed(2)}`
}

const cartTotal = computed(() => posStore.cartTotal)
const cartItems = computed(() => posStore.cart)
const selectedClient = computed(() => posStore.selectedClient)
const productosFrequentes = computed(() => posStore.productosFrequentes)
const isLoadingFrequentes = computed(() => posStore.isLoadingFrequentes)

// Mostrar productos frecuentes si no hay búsqueda activa
const displayedProducts = computed(() => {
  if (searchQuery.value && searchResults.value.length > 0) {
    return searchResults.value
  }
  if (!searchQuery.value && productosFrequentes.value.length > 0) {
    return productosFrequentes.value
  }
  return []
})

const cambio = computed(() => {
  const total = cartTotal.value
  if (paymentMethod.value === 'EFECTIVO') {
    return Math.max(0, montoRecibido.value - total)
  }
  return 0
})

const handleSearch = () => {
  clearTimeout(searchTimeout)

  if (!searchQuery.value || searchQuery.value.length < 1) {
    searchResults.value = []
    return
  }

  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    await posStore.searchProducts(searchQuery.value)
    searchResults.value = posStore.searchResults
    isSearching.value = false
  }, 300)
}

const addProductToCart = (producto) => {
  const result = posStore.addToCart(producto)
  if (!result.success) {
    error(result.message)
  } else {
    searchQuery.value = ''
    searchResults.value = []
  }
}

const updateItemQuantity = (index, value) => {
  const cantidad = parseFloat(value)
  if (isNaN(cantidad) || cantidad < 0) return

  const result = posStore.updateQuantity(index, cantidad)
  if (!result.success) {
    error(result.message)
  }
}

const removeItem = async (index) => {
  const result = await useToast().confirm('¿Eliminar este producto del carrito?')
  if (result) {
    posStore.removeFromCart(index)
  }
}

const handleClientSearch = async () => {
  if (!clientSearch.value || clientSearch.value.length < 2) {
    clientResults.value = []
    return
  }

  try {
    const response = await clientesApi.search(clientSearch.value)
    clientResults.value = response.data.data
    showClientDropdown.value = true
  } catch (error) {
    console.error('Error searching clients:', error)
  }
}

const selectClient = (client) => {
  posStore.setClient(client)
  clientSearch.value = client.nombre_razon_social
  showClientDropdown.value = false
}

const clearClient = () => {
  posStore.setClient(null)
  clientSearch.value = ''
}

const openNewClientModal = () => {
  newClientForm.value = {
    nombre_razon_social: '',
    nit_ci: '',
    telefono: '',
    email: '',
    direccion: ''
  }
  showNewClientModal.value = true
}

const saveNewClient = async () => {
  if (!newClientForm.value.nombre_razon_social) {
    error('El nombre del cliente es requerido')
    return
  }

  try {
    const response = await clientesApi.create(newClientForm.value)
    if (response.data.success) {
      const client = response.data.data
      posStore.setClient(client)
      clientSearch.value = client.nombre_razon_social
      showNewClientModal.value = false
      success('Cliente agregado exitosamente')
    }
  } catch (err) {
    error(err.response?.data?.message || 'Error al crear cliente')
  }
}

const openPaymentModal = () => {
  if (cartItems.value.length === 0) {
    error('El carrito está vacío')
    return
  }

  montoRecibido.value = cartTotal.value
  showPaymentModal.value = true
}

const printReceipt = (venta, detalles) => {
  const printWindow = window.open('', '_blank', 'width=300,height=600')

  const clienteNombre = selectedClient.value?.nombre_razon_social || 'Público General'
  const clienteNit = selectedClient.value?.nit_ci || 'S/N'
  const vendedor = authStore.user?.nombre || 'Vendedor'

  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Recibo - ${venta.numero_venta}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          width: 80mm;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          padding: 5mm;
          background: white;
        }
        .header { text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
        .header h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
        .header p { font-size: 10px; line-height: 1.3; }
        .info { margin-bottom: 10px; font-size: 10px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        .items { margin-bottom: 10px; }
        .item { margin-bottom: 6px; }
        .item-name { font-weight: bold; margin-bottom: 2px; }
        .item-details { display: flex; justify-content: space-between; font-size: 10px; }
        .totals { border-top: 1px solid #000; padding-top: 8px; margin-top: 8px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
        .total-row.main { font-size: 14px; font-weight: bold; margin-top: 6px; }
        .payment { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #000; }
        .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; font-size: 9px; }
        @media print {
          body { padding: 2mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FERRETERÍA</h1>
        <p>Sistema de Punto de Venta</p>
        <p>La Paz - Bolivia</p>
      </div>

      <div class="info">
        <div class="info-row"><span>Nº Venta:</span><strong>${venta.numero_venta}</strong></div>
        <div class="info-row"><span>Fecha:</span><span>${new Date(venta.fecha).toLocaleString('es-BO')}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${clienteNombre}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${clienteNit}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${vendedor}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${detalles.map(item => `
          <div class="item">
            <div class="item-name">${item.nombre_producto}</div>
            <div class="item-details">
              <span>${item.cantidad} x ${formatCurrency(item.precio_unitario)}</span>
              <strong>${formatCurrency(item.total)}</strong>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="totals">
        <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(venta.subtotal)}</span></div>
        ${venta.descuento > 0 ? `<div class="total-row"><span>Descuento:</span><span>-${formatCurrency(venta.descuento)}</span></div>` : ''}
        <div class="total-row main"><span>TOTAL:</span><span>${formatCurrency(venta.total)}</span></div>
      </div>

      <div class="payment">
        <div class="info-row"><span>Método de pago:</span><strong>${venta.metodo_pago}</strong></div>
        ${venta.metodo_pago === 'EFECTIVO' && montoRecibido.value > 0 ? `
          <div class="info-row"><span>Recibido:</span><span>${formatCurrency(montoRecibido.value)}</span></div>
          <div class="info-row"><span>Cambio:</span><span>${formatCurrency(cambio.value)}</span></div>
        ` : ''}
      </div>

      <div class="footer">
        <p>¡Gracias por su compra!</p>
        <p>Este documento no es válido como factura</p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 250);
        }
      <\/script>
    </body>
    </html>
  `

  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
  }
}

const processPayment = async () => {
  if (paymentMethod.value === 'EFECTIVO' && montoRecibido.value < cartTotal.value) {
    error('El monto recibido es insuficiente')
    return
  }

  if (paymentMethod.value === 'CREDITO' && !selectedClient.value) {
    error('Debe seleccionar un cliente para ventas al fiado')
    return
  }

  // CORRECCIÓN: Protección contra doble clic
  if (processingPayment.value) {
    return // Ya se está procesando, ignorar clics adicionales
  }

  processingPayment.value = true

  const paymentData = {
    metodo_pago: paymentMethod.value,
    monto_efectivo: paymentMethod.value === 'EFECTIVO' ? cartTotal.value : (paymentMethod.value === 'CREDITO' ? montoRecibido.value : 0),
    monto_qr: paymentMethod.value === 'QR' ? cartTotal.value : 0,
    monto_credito: paymentMethod.value === 'CREDITO' ? Math.max(0, cartTotal.value - montoRecibido.value) : 0
  }

  try {
    const result = await posStore.processVenta(paymentData)

    if (result.success) {
      showPaymentModal.value = false

      // IMPRIMIR RECIBO AUTOMÁTICAMENTE
      printReceipt(result.venta, result.venta.detalles || cartItems.value)

      success(`Venta ${result.venta.numero_venta} completada exitosamente!`)

      // Reset form
      searchQuery.value = ''
      searchResults.value = []
      clientSearch.value = ''
      montoRecibido.value = 0
      paymentMethod.value = 'EFECTIVO'
    } else {
      error(result.message)
    }
  } catch (err) {
    error(err?.message || 'Error al procesar la venta')
  } finally {
    processingPayment.value = false
  }
}

const cancelPayment = () => {
  showPaymentModal.value = false
  montoRecibido.value = 0
}

onMounted(async () => {
  // Cargar productos frecuentes al iniciar
  await posStore.loadProductosFrequentes()

  const searchInput = document.querySelector('input[type="search"]')
  if (searchInput) searchInput.focus()
})
</script>

<template>
  <div class="h-full flex space-x-6">
    <!-- LEFT PANEL - Product Search -->
    <div class="flex-1 flex flex-col">
      <!-- Search bar -->
      <div class="card p-4 mb-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-6 w-6 text-slate-400" />
          </div>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="search"
            class="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
            placeholder="Buscar producto por nombre o SKU..."
            autofocus
          />
        </div>
      </div>

      <!-- Search results / Productos frecuentes -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="isSearching || isLoadingFrequentes" class="flex items-center justify-center py-12">
          <div class="spinner"></div>
        </div>

        <div v-else-if="displayedProducts.length > 0">
          <div v-if="!searchQuery" class="mb-4 px-2">
            <h3 class="text-lg font-semibold text-slate-700 flex items-center">
              <ShoppingCartIcon class="w-5 h-5 mr-2 text-primary-600" />
              Productos Más Vendidos
            </h3>
            <p class="text-sm text-slate-500">Haga clic en un producto para agregarlo al carrito</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              v-for="producto in displayedProducts"
              :key="producto.id"
              @click="addProductToCart(producto)"
              class="card p-4 text-left hover:shadow-md transition-all hover:border-primary-300 relative"
            >
              <!-- Imagen del producto -->
              <div v-if="producto.imagen_url" class="mb-3">
                <img
                  :src="producto.imagen_url"
                  :alt="producto.nombre"
                  class="w-full h-32 object-cover rounded-lg"
                  @error="(e) => e.target.style.display = 'none'"
                />
              </div>
              <div v-else class="mb-3 bg-slate-100 rounded-lg h-32 flex items-center justify-center">
                <svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
              </div>

              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-800 mb-1 line-clamp-2">{{ producto.nombre }}</h3>
                  <p class="text-xs text-slate-600">SKU: {{ producto.codigo_sku_interno }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between mt-2">
                <div class="text-right">
                  <div class="text-xl font-bold text-primary-700">{{ formatCurrency(producto.precio_venta) }}</div>
                  <div class="text-xs text-slate-500">{{ producto.unidad_medida }}</div>
                </div>
                <span
                  :class="[
                    'badge',
                    producto.stock_actual <= 0 ? 'badge-danger' :
                    producto.stock_actual <= producto.stock_minimo ? 'badge-warning' :
                    'badge-success'
                  ]"
                >
                  {{ producto.stock_actual }} {{ producto.unidad_medida }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div v-else-if="searchQuery" class="text-center py-12 text-slate-500">
          <MagnifyingGlassIcon class="w-16 h-16 mx-auto mb-3 text-slate-300" />
          <p>No se encontraron productos</p>
        </div>

        <div v-else class="text-center py-12 text-slate-400">
          <ShoppingCartIcon class="w-20 h-20 mx-auto mb-4 text-slate-300" />
          <p class="text-lg">Cargando productos...</p>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL - Cart / Ticket -->
    <div class="w-96 flex flex-col bg-white rounded-xl shadow-lg border border-slate-200">
      <!-- Cart header -->
      <div class="bg-primary-700 text-white p-4 rounded-t-xl">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold flex items-center">
            <ShoppingCartIcon class="w-6 h-6 mr-2" />
            Ticket de Venta
          </h2>
          <span class="badge bg-white text-primary-700 font-bold">
            {{ cartItems.length }} items
          </span>
        </div>
      </div>

      <!-- Client selection -->
      <div class="p-4 border-b border-slate-200 bg-slate-50">
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-slate-700">Cliente</label>
          <button
            @click="openNewClientModal"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            <PlusIcon class="w-4 h-4 mr-1" />
            Nuevo
          </button>
        </div>
        <div v-if="!selectedClient" class="relative">
          <input
            v-model="clientSearch"
            @input="handleClientSearch"
            @focus="showClientDropdown = true"
            type="text"
            class="input text-sm"
            placeholder="Buscar cliente... (opcional)"
          />

          <!-- Client dropdown -->
          <div
            v-if="showClientDropdown && clientResults.length > 0"
            class="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <button
              v-for="client in clientResults"
              :key="client.id"
              @click="selectClient(client)"
              class="w-full text-left px-3 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-0"
            >
              <div class="font-medium text-sm">{{ client.nombre_razon_social }}</div>
              <div class="text-xs text-slate-600">{{ client.nit_ci || 'Sin NIT' }}</div>
            </button>
          </div>
        </div>

        <div v-else class="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-primary-200">
          <div class="flex items-center space-x-2">
            <UserIcon class="w-5 h-5 text-primary-600" />
            <div>
              <div class="font-medium text-sm">{{ selectedClient.nombre_razon_social }}</div>
              <div class="text-xs text-slate-600">{{ selectedClient.nit_ci || 'Sin NIT' }}</div>
            </div>
          </div>
          <button @click="clearClient" class="text-slate-400 hover:text-red-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Cart items -->
      <div class="flex-1 overflow-y-auto p-4 space-y-2">
        <div v-if="cartItems.length === 0" class="text-center py-8 text-slate-400">
          <p>El carrito está vacío</p>
        </div>

        <div
          v-for="(item, index) in cartItems"
          :key="index"
          class="bg-slate-50 rounded-lg p-3 border border-slate-200"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 pr-2">
              <h4 class="font-medium text-sm text-slate-800 leading-tight">{{ item.nombre }}</h4>
              <p class="text-xs text-slate-500">{{ item.codigo }}</p>
            </div>
            <button @click="removeItem(index)" class="text-red-500 hover:text-red-700">
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <input
                :value="item.cantidad"
                @input="(e) => updateItemQuantity(index, e.target.value)"
                :step="item.permite_decimales ? '0.1' : '1'"
                type="number"
                min="0.1"
                class="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <span class="text-xs text-slate-600">{{ item.unidad_medida }}</span>
            </div>

            <div class="text-right">
              <div class="text-sm font-bold text-primary-700">
                {{ formatCurrency(item.precio_unitario * item.cantidad) }}
              </div>
              <div class="text-xs text-slate-500">
                {{ formatCurrency(item.precio_unitario) }} c/u
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart total -->
      <div class="border-t-2 border-slate-200 p-4 space-y-2">
        <div class="flex items-center justify-between text-2xl font-bold">
          <span class="text-slate-700">TOTAL:</span>
          <span class="text-primary-700">{{ formatCurrency(cartTotal) }}</span>
        </div>
      </div>

      <!-- Checkout button -->
      <div class="p-4 bg-slate-50 rounded-b-xl">
        <button
          @click="openPaymentModal"
          :disabled="cartItems.length === 0"
          class="w-full btn btn-success py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center justify-center">
            <BanknotesIcon class="w-6 h-6 mr-2" />
            COBRAR
          </span>
        </button>
      </div>
    </div>

    <!-- Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="cancelPayment"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Procesar Pago</h2>

        <!-- Total -->
        <div class="bg-slate-100 rounded-xl p-4 mb-6">
          <div class="text-sm text-slate-600 mb-1">Total a Pagar</div>
          <div class="text-3xl font-bold text-primary-700">{{ formatCurrency(cartTotal) }}</div>
        </div>

        <!-- Payment method -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-3">Método de Pago</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="paymentMethod = 'EFECTIVO'"
              :class="[
                'py-3 rounded-lg border-2 font-medium transition-all',
                paymentMethod === 'EFECTIVO'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 hover:border-slate-400'
              ]"
            >
              <BanknotesIcon class="w-6 h-6 mx-auto mb-1" />
              <div class="text-xs">Efectivo</div>
            </button>
            <button
              @click="paymentMethod = 'QR'"
              :class="[
                'py-3 rounded-lg border-2 font-medium transition-all',
                paymentMethod === 'QR'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-slate-300 hover:border-slate-400'
              ]"
            >
              <QrCodeIcon class="w-6 h-6 mx-auto mb-1" />
              <div class="text-xs">QR</div>
            </button>
            <button
              @click="paymentMethod = 'CREDITO'"
              :class="[
                'py-3 rounded-lg border-2 font-medium transition-all',
                paymentMethod === 'CREDITO'
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-slate-300 hover:border-slate-400'
              ]"
            >
              <CreditCardIcon class="w-6 h-6 mx-auto mb-1" />
              <div class="text-xs">Fiado</div>
            </button>
          </div>
        </div>

        <!-- Amount received (only for cash) -->
        <div v-if="paymentMethod === 'EFECTIVO'" class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-2">Monto Recibido</label>
          <input
            v-model.number="montoRecibido"
            type="number"
            step="0.01"
            class="input text-lg font-semibold"
          />

          <!-- Change -->
          <div v-if="montoRecibido >= cartTotal" class="mt-3 bg-emerald-50 rounded-lg p-3">
            <div class="text-sm text-emerald-700 mb-1">Cambio</div>
            <div class="text-2xl font-bold text-emerald-700">{{ formatCurrency(cambio) }}</div>
          </div>
        </div>

        <!-- Saldo pendiente (only for credit/fiado) -->
        <div v-if="paymentMethod === 'CREDITO'" class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-2">¿Cuánto abona ahora?</label>
          <input
            v-model.number="montoRecibido"
            type="number"
            step="0.01"
            :max="cartTotal"
            class="input text-lg font-semibold"
            placeholder="0.00"
          />
          <div class="mt-3 bg-orange-50 rounded-lg p-3">
            <div class="text-sm text-orange-700 mb-1">Saldo pendiente</div>
            <div class="text-2xl font-bold text-orange-700">{{ formatCurrency(Math.max(0, cartTotal - montoRecibido)) }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3">
          <button
            @click="cancelPayment"
            :disabled="processingPayment"
            class="flex-1 btn btn-secondary py-3 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="processPayment"
            :disabled="processingPayment"
            class="flex-1 btn btn-success py-3 disabled:opacity-50"
          >
            <span v-if="!processingPayment">Confirmar</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Cliente -->
    <div
      v-if="showNewClientModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showNewClientModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 class="text-2xl font-bold text-slate-800 mb-6">Agregar Cliente Rápido</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social *</label>
            <input
              v-model="newClientForm.nombre_razon_social"
              type="text"
              class="input"
              placeholder="Ej: Juan Pérez"
              autofocus
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">NIT / CI</label>
            <input
              v-model="newClientForm.nit_ci"
              type="text"
              class="input"
              placeholder="Ej: 1234567"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
            <input
              v-model="newClientForm.telefono"
              type="text"
              class="input"
              placeholder="Ej: 70123456"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              v-model="newClientForm.direccion"
              type="text"
              class="input"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button
            @click="showNewClientModal = false"
            class="flex-1 btn btn-secondary py-3"
          >
            Cancelar
          </button>
          <button
            @click="saveNewClient"
            class="flex-1 btn btn-primary py-3"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
