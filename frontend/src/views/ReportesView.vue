<script setup>
import { ref, onMounted } from 'vue'
import { reportesApi } from '@/services/api'
import {
  BanknotesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const loading = ref(false)
const resumen = ref(null)
const stockBajo = ref([])
const productosMasVendidos = ref([])
const corteCaja = ref(null)

const fechaHoy = ref(new Date().toISOString().slice(0, 10))

const formatCurrency = (value) => `Bs. ${parseFloat(value || 0).toFixed(2)}`

const loadResumen = async () => {
  loading.value = true
  try {
    const response = await reportesApi.resumenGeneral({ fecha: fechaHoy.value })
    resumen.value = response.data.data
  } catch (error) {
    console.error('Error loading summary:', error)
  } finally {
    loading.value = false
  }
}

const loadStockBajo = async () => {
  try {
    const response = await reportesApi.stockBajo()
    stockBajo.value = response.data.data.productos
  } catch (error) {
    console.error('Error loading low stock:', error)
  }
}

const loadProductosMasVendidos = async () => {
  try {
    const response = await reportesApi.productosMasVendidos({ limit: 10 })
    productosMasVendidos.value = response.data.data
  } catch (error) {
    console.error('Error loading top products:', error)
  }
}

const loadCorteCaja = async () => {
  try {
    const response = await reportesApi.corteCaja({ fecha: fechaHoy.value })
    corteCaja.value = response.data.data
  } catch (error) {
    console.error('Error loading cash register cut:', error)
  }
}

onMounted(() => {
  loadResumen()
  loadStockBajo()
  loadProductosMasVendidos()
  loadCorteCaja()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-slate-800">Reportes</h1>
      <p class="text-slate-600 mt-1">Panel de análisis y estadísticas</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Summary cards -->
    <div v-else-if="resumen" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Ventas del día -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <ShoppingCartIcon class="w-7 h-7 text-emerald-600" />
          </div>
          <span class="text-sm font-medium text-slate-600">Hoy</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">
          {{ formatCurrency(resumen.ventas_hoy.total) }}
        </div>
        <div class="text-sm text-slate-600">
          {{ resumen.ventas_hoy.cantidad }} ventas
        </div>
        <div class="mt-2 text-sm font-medium text-emerald-600">
          Ganancia: {{ formatCurrency(resumen.ventas_hoy.ganancia) }}
        </div>
      </div>

      <!-- Ventas del mes -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ChartBarIcon class="w-7 h-7 text-blue-600" />
          </div>
          <span class="text-sm font-medium text-slate-600">Este Mes</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">
          {{ formatCurrency(resumen.ventas_mes.total) }}
        </div>
        <div class="text-sm text-slate-600">
          {{ resumen.ventas_mes.cantidad }} ventas
        </div>
        <div class="mt-2 text-sm font-medium text-blue-600">
          Ganancia: {{ formatCurrency(resumen.ventas_mes.ganancia) }}
        </div>
      </div>

      <!-- Inventario -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon class="w-7 h-7 text-purple-600" />
          </div>
          <span class="text-sm font-medium text-slate-600">Inventario</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">
          {{ resumen.inventario.total_productos }}
        </div>
        <div class="text-sm text-slate-600">
          productos activos
        </div>
        <div class="mt-2 text-sm font-medium text-purple-600">
          Valor: {{ formatCurrency(resumen.inventario.valor_costo) }}
        </div>
      </div>

      <!-- Alertas de stock -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <ExclamationTriangleIcon class="w-7 h-7 text-amber-600" />
          </div>
          <span class="text-sm font-medium text-slate-600">Alertas</span>
        </div>
        <div class="text-2xl font-bold text-slate-800 mb-1">
          {{ resumen.inventario.productos_stock_bajo }}
        </div>
        <div class="text-sm text-slate-600">
          productos con stock bajo
        </div>
      </div>
    </div>

    <!-- Corte de Caja -->
    <div v-if="corteCaja" class="card p-6">
      <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <BanknotesIcon class="w-6 h-6 mr-2 text-emerald-600" />
        Corte de Caja - {{ new Date(fechaHoy).toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </h2>

      <!-- CORRECCIÓN: Mostrar separación clara entre efectivo real y fiados -->
      <div class="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-blue-900 mb-3 text-sm uppercase tracking-wide">💰 Dinero Físico en Caja (Real)</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-3 border border-emerald-300">
            <div class="text-xs text-emerald-700 mb-1">Efectivo (Ventas)</div>
            <div class="text-xl font-bold text-emerald-700">{{ formatCurrency(corteCaja.resumen.total_efectivo) }}</div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-purple-300">
            <div class="text-xs text-purple-700 mb-1">QR (Ventas)</div>
            <div class="text-xl font-bold text-purple-700">{{ formatCurrency(corteCaja.resumen.total_qr) }}</div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-blue-300">
            <div class="text-xs text-blue-700 mb-1">Abonos de Fiados</div>
            <div class="text-xl font-bold text-blue-700">{{ formatCurrency(corteCaja.resumen.total_abonos_creditos) }}</div>
            <div class="text-xs text-blue-600 mt-1">{{ corteCaja.resumen.cantidad_abonos || 0 }} pagos</div>
          </div>
        </div>
        <div class="mt-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
          <div class="text-sm font-medium mb-1">TOTAL EFECTIVO EN CAJA</div>
          <div class="text-3xl font-bold">{{ formatCurrency(corteCaja.resumen.dinero_fisico_total) }}</div>
        </div>
      </div>

      <!-- Ventas Fiadas del Día (Informativo) -->
      <div class="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 class="font-semibold text-orange-900 mb-3 text-sm uppercase tracking-wide">📋 Ventas al Fiado / Crédito (Hoy)</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-lg p-3 border border-orange-300">
            <div class="text-xs text-orange-700 mb-1">Total Fiado del Día</div>
            <div class="text-xl font-bold text-orange-700">{{ formatCurrency(corteCaja.resumen.total_fiado) }}</div>
            <div class="text-xs text-orange-600 mt-1">{{ corteCaja.resumen.cantidad_ventas_fiadas || 0 }} ventas</div>
          </div>
          <div class="bg-white rounded-lg p-3 border border-slate-300">
            <div class="text-xs text-slate-700 mb-1">Ventas al Contado</div>
            <div class="text-xl font-bold text-slate-700">{{ formatCurrency(corteCaja.resumen.ventas_contado) }}</div>
            <div class="text-xs text-slate-600 mt-1">{{ corteCaja.resumen.cantidad_ventas_total - (corteCaja.resumen.cantidad_ventas_fiadas || 0) }} ventas</div>
          </div>
        </div>
        <div class="mt-3 text-xs text-orange-700 italic">
          ⚠️ Las ventas fiadas NO están en caja — son cuentas por cobrar
        </div>
      </div>

      <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-slate-600 mb-1">Total Ventas Registradas</div>
            <div class="text-xl font-bold text-slate-800">{{ formatCurrency(corteCaja.resumen.total_ventas_registradas) }}</div>
          </div>
          <div>
            <div class="text-sm text-slate-600 mb-1">Ganancia Neta</div>
            <div class="text-xl font-bold text-emerald-600">{{ formatCurrency(corteCaja.resumen.ganancia_neta) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top productos -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Productos Más Vendidos</h2>
        <div class="space-y-3">
          <div
            v-for="(producto, index) in productosMasVendidos.slice(0, 10)"
            :key="producto.id"
            class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-700">
                {{ index + 1 }}
              </div>
              <div>
                <div class="font-medium text-sm text-slate-800">{{ producto.nombre }}</div>
                <div class="text-xs text-slate-600">{{ producto.codigo_sku_interno }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-sm text-primary-700">{{ producto.unidades_vendidas }} {{ producto.unidad_medida }}</div>
              <div class="text-xs text-slate-600">{{ formatCurrency(producto.total_vendido) }}</div>
            </div>
          </div>

          <div v-if="productosMasVendidos.length === 0" class="text-center py-8 text-slate-500">
            No hay datos de ventas
          </div>
        </div>
      </div>

      <!-- Stock bajo -->
      <div class="card p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <ExclamationTriangleIcon class="w-6 h-6 mr-2 text-amber-600" />
          Productos con Stock Bajo
        </h2>
        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            v-for="producto in stockBajo"
            :key="producto.id"
            class="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div>
              <div class="font-medium text-sm text-slate-800">{{ producto.nombre }}</div>
              <div class="text-xs text-slate-600">{{ producto.codigo_sku_interno }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm">
                <span class="font-bold text-amber-700">{{ producto.stock_actual }}</span>
                <span class="text-slate-600"> / {{ producto.stock_minimo }} {{ producto.unidad_medida }}</span>
              </div>
              <div class="text-xs text-slate-600">
                Reponer: {{ producto.cantidad_requerida }} ({{ formatCurrency(producto.costo_reposicion) }})
              </div>
            </div>
          </div>

          <div v-if="stockBajo.length === 0" class="text-center py-8 text-slate-500">
            <div class="text-emerald-600 mb-2">✓</div>
            <div>Todos los productos tienen stock adecuado</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
