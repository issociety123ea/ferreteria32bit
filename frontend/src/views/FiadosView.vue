<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { creditosApi, clientesApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const { success, error } = useToast()

const creditos = ref([])
const clientes = ref([])
const loading = ref(false)
const showModal = ref(false)
const showPagoModal = ref(false)
const editingId = ref(null)
const searchQuery = ref('')

// CORRECCIÓN 4: Pestañas Pendientes / Pagados
const activeTab = ref('PENDIENTE') // 'PENDIENTE' por defecto, 'PAGADO' como historial

const formData = ref({
  cliente_id: null,
  monto_total: 0,
  fecha_vencimiento: ''
})

const pagoData = ref({
  credito_id: null,
  monto_pagado: 0,
  metodo_pago: 'EFECTIVO',
  monto_efectivo: 0,
  monto_qr: 0,
  notas: ''
})

const formatCurrency = (value) => `Bs. ${parseFloat(value || 0).toFixed(2)}`
// CORRECCIÓN 1: Usar zona horaria Bolivia
const formatDate = (date) => new Date(date).toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' })

const resetForm = () => {
  formData.value = {
    cliente_id: null,
    monto_total: 0,
    fecha_vencimiento: ''
  }
  editingId.value = null
}

const resetPagoForm = () => {
  pagoData.value = {
    credito_id: null,
    monto_pagado: 0,
    metodo_pago: 'EFECTIVO',
    monto_efectivo: 0,
    monto_qr: 0,
    notas: ''
  }
}

const loadCreditos = async () => {
  loading.value = true
  try {
    // CORRECCIÓN 4: Cargar según pestaña activa (PENDIENTE por defecto, PAGADO como historial)
    const estado = activeTab.value === 'PENDIENTE' ? 'PENDIENTE' : 'PAGADO'
    const response = await creditosApi.getAll({ estado })
    creditos.value = response.data.data.items || []
  } catch (err) {
    console.error('Error al cargar créditos:', err)
    error('Error al cargar créditos')
  } finally {
    loading.value = false
  }
}

// CORRECCIÓN 4: Cambiar de pestaña y recargar
const switchTab = async (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  searchQuery.value = ''
  await loadCreditos()
}

const loadClientes = async () => {
  try {
    const response = await clientesApi.getAll()
    clientes.value = response.data.data.items || []
  } catch (error) {
    console.error('Error al cargar clientes:', error)
  }
}

const openCreateModal = () => {
  resetForm()
  showModal.value = true
}

const openPagoModal = (credito) => {
  resetPagoForm()
  pagoData.value.credito_id = credito.id
  pagoData.value.monto_pagado = credito.saldo_pendiente
  showPagoModal.value = true
}

const saveCredito = async () => {
  if (!formData.value.cliente_id) {
    error('Debes seleccionar un cliente')
    return
  }
  if (formData.value.monto_total <= 0) {
    error('El monto debe ser mayor a 0')
    return
  }

  try {
    // Nota: Esta función es para demostración. Los créditos se crean automáticamente
    // al hacer una venta con método CREDITO
    success('Los créditos se crean automáticamente al realizar una venta con método "A Fiar"')
    showModal.value = false
  } catch (err) {
    console.error('Error al guardar crédito:', err)
    error('Error al guardar el crédito')
  }
}

const registrarPago = async () => {
  if (!pagoData.value.monto_pagado || pagoData.value.monto_pagado <= 0) {
    error('El monto pagado debe ser mayor a 0')
    return
  }

  try {
    await creditosApi.registrarPago(pagoData.value)
    success('Pago registrado exitosamente')
    showPagoModal.value = false
    await loadCreditos()
  } catch (err) {
    console.error('Error al registrar pago:', err)
    error(err.response?.data?.message || 'Error al registrar el pago')
  }
}

const cancelarCredito = async (id) => {
  const result = await useToast().confirm('¿Estás seguro de que deseas cancelar este crédito? (Solo puede hacerse sin pagos registrados)')
  if (!result) {
    return
  }

  try {
    await creditosApi.cancelarCredito(id, { motivo: 'Cancelado por el usuario' })
    success('Crédito cancelado exitosamente')
    await loadCreditos()
  } catch (err) {
    console.error('Error al cancelar crédito:', err)
    error(err.response?.data?.message || 'Error al cancelar el crédito')
  }
}

const filteredCreditos = computed(() => {
  if (!searchQuery.value) return creditos.value
  const query = searchQuery.value.toLowerCase()
  return creditos.value.filter(c =>
    c.cliente_nombre?.toLowerCase().includes(query) ||
    c.numero_venta?.toLowerCase().includes(query)
  )
})

const getTotalPendiente = computed(() => {
  return creditos.value.reduce((sum, c) => sum + (c.saldo_pendiente || 0), 0)
})

onMounted(async () => {
  await loadClientes()
  await loadCreditos()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Fiados / Al Anote</h1>
        <p class="text-slate-600 mt-1">Gestión de créditos y deudas de clientes</p>
      </div>
      <button
        @click="openCreateModal"
        class="btn btn-primary flex items-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Nuevo Fiado</span>
      </button>
    </div>

    <!-- Resumen de Deudas -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90 mb-1">Total Pendiente</div>
            <div class="text-3xl font-bold">{{ formatCurrency(getTotalPendiente) }}</div>
          </div>
          <CurrencyDollarIcon class="w-12 h-12 opacity-50" />
        </div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90 mb-1">Créditos Activos</div>
            <div class="text-3xl font-bold">{{ creditos.length }}</div>
          </div>
          <CalendarIcon class="w-12 h-12 opacity-50" />
        </div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-slate-500 to-slate-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90 mb-1">Clientes con Deuda</div>
            <div class="text-3xl font-bold">
              {{ new Set(creditos.map(c => c.cliente_id)).size }}
            </div>
          </div>
          <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM12 14a8 8 0 00-8 8v2h16v-2a8 8 0 00-8-8z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Search bar -->
    <div class="card p-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por cliente o número de venta..."
        class="input w-full"
      />
    </div>

    <!-- CORRECCIÓN 4: Pestañas Pendientes / Pagados -->
    <div class="flex space-x-2">
      <button
        @click="switchTab('PENDIENTE')"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2',
          activeTab === 'PENDIENTE'
            ? 'bg-orange-500 text-white shadow-lg'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <span>Pendientes</span>
        <span
          :class="[
            'px-2 py-0.5 rounded-full text-xs',
            activeTab === 'PENDIENTE' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-700'
          ]"
        >
          {{ activeTab === 'PENDIENTE' ? creditos.length : '' }}
        </span>
      </button>
      <button
        @click="switchTab('PAGADO')"
        :class="[
          'px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2',
          activeTab === 'PAGADO'
            ? 'bg-emerald-500 text-white shadow-lg'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        ]"
      >
        <span>Pagados (Historial)</span>
        <span
          :class="[
            'px-2 py-0.5 rounded-full text-xs',
            activeTab === 'PAGADO' ? 'bg-white text-emerald-600' : 'bg-emerald-100 text-emerald-700'
          ]"
        >
          {{ activeTab === 'PAGADO' ? creditos.length : '' }}
        </span>
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Créditos table -->
    <div v-else-if="filteredCreditos.length > 0" class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Venta</th>
              <th>Monto Total</th>
              <th>Saldo Pendiente</th>
              <th>Pagado</th>
              <th>Fecha Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="credito in filteredCreditos" :key="credito.id">
              <td class="font-semibold text-slate-800">{{ credito.cliente_nombre }}</td>
              <td class="font-mono text-slate-600">{{ credito.numero_venta }}</td>
              <td class="font-bold text-emerald-700">{{ formatCurrency(credito.monto_total) }}</td>
              <td class="font-bold text-orange-700">{{ formatCurrency(credito.saldo_pendiente) }}</td>
              <td class="text-slate-600">{{ formatCurrency(credito.monto_total - credito.saldo_pendiente) }}</td>
              <td class="text-slate-600">
                {{ credito.fecha_vencimiento ? formatDate(credito.fecha_vencimiento) : '-' }}
              </td>
              <td>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    credito.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-700' :
                    credito.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ credito.estado }}
                </span>
              </td>
              <td>
                <div class="flex items-center space-x-2">
                  <button
                    v-if="credito.estado !== 'PAGADO'"
                    @click="openPagoModal(credito)"
                    class="btn btn-sm btn-primary"
                    title="Registrar pago"
                  >
                    <CurrencyDollarIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="activeTab === 'PENDIENTE' && credito.estado !== 'PAGADO'"
                    @click="cancelarCredito(credito.id)"
                    class="btn btn-sm btn-danger"
                    title="Cancelar crédito"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                  <span v-if="credito.estado === 'PAGADO'" class="text-xs text-emerald-600 italic">Deuda saldada</span>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">
        {{ activeTab === 'PENDIENTE' ? 'No hay créditos pendientes' : 'No hay créditos pagados' }}
      </h3>
      <p class="text-slate-500">
        {{ activeTab === 'PENDIENTE'
          ? 'Todos los créditos están pagados o cancelados'
          : 'Aún no se ha pagado ningún crédito completamente' }}
      </p>
    </div>

    <!-- Modal Nuevo Fiado (informativo) -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="bg-primary-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 class="text-2xl font-bold">Registrar Fiado</h2>
          <button
            @click="showModal = false"
            class="text-white hover:bg-primary-600 p-2 rounded-lg"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-900 text-sm">
              ℹ️ Los fiados se crean automáticamente al realizar una venta con el método de pago <strong>"A Fiar / Crédito"</strong> en el módulo POS.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Ver deuda de cliente:
            </label>
            <select class="input w-full">
              <option value="">Selecciona un cliente...</option>
              <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
                {{ cliente.nombre_razon_social }}
              </option>
            </select>
          </div>
        </div>

        <div class="bg-slate-50 px-6 py-4 rounded-b-2xl flex items-center justify-end">
          <button
            @click="showModal = false"
            class="btn btn-primary"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Registrar Pago -->
    <div
      v-if="showPagoModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showPagoModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="bg-emerald-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 class="text-2xl font-bold">Registrar Pago</h2>
          <button
            @click="showPagoModal = false"
            class="text-white hover:bg-emerald-600 p-2 rounded-lg"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Monto Pagado *
            </label>
            <input
              v-model.number="pagoData.monto_pagado"
              type="number"
              step="0.01"
              class="input w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Método de Pago
            </label>
            <select v-model="pagoData.metodo_pago" class="input w-full">
              <option value="EFECTIVO">Efectivo</option>
              <option value="QR">QR</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </div>

          <div v-if="pagoData.metodo_pago === 'MIXTO' || pagoData.metodo_pago === 'EFECTIVO'">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Monto Efectivo
            </label>
            <input
              v-model.number="pagoData.monto_efectivo"
              type="number"
              step="0.01"
              class="input w-full"
              placeholder="0.00"
            />
          </div>

          <div v-if="pagoData.metodo_pago === 'MIXTO' || pagoData.metodo_pago === 'QR'">
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Monto QR
            </label>
            <input
              v-model.number="pagoData.monto_qr"
              type="number"
              step="0.01"
              class="input w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Notas
            </label>
            <textarea
              v-model="pagoData.notas"
              class="input w-full"
              placeholder="Notas adicionales..."
              rows="2"
            ></textarea>
          </div>
        </div>

        <div class="bg-slate-50 px-6 py-4 rounded-b-2xl flex items-center justify-end space-x-3">
          <button
            @click="showPagoModal = false"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            @click="registrarPago"
            class="btn btn-primary flex items-center space-x-2"
          >
            <CheckIcon class="w-5 h-5" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
