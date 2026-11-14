<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Mi Historial de Ventas</h1>
        <p class="text-slate-600 mt-1">Revisa tus ventas del día</p>
      </div>
      <div class="flex items-center space-x-3">
        <input
          v-model="selectedDate"
          type="date"
          class="input"
          @change="loadHistorial"
        />
        <button @click="loadHistorial" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Resumen del día -->
    <div v-if="resumen" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div class="text-sm opacity-90 mb-1">Total Ventas</div>
        <div class="text-3xl font-bold">{{ resumen.cantidad_ventas || 0 }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div class="text-sm opacity-90 mb-1">Total Cobrado</div>
        <div class="text-3xl font-bold">{{ formatCurrency(resumen.total_vendido || 0) }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div class="text-sm opacity-90 mb-1">Efectivo</div>
        <div class="text-2xl font-bold">{{ formatCurrency(resumen.total_efectivo || 0) }}</div>
      </div>
      <div class="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div class="text-sm opacity-90 mb-1">Tarjeta + QR</div>
        <div class="text-2xl font-bold">{{ formatCurrency((resumen.total_tarjeta || 0) + (resumen.total_qr || 0)) }}</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="spinner"></div>
    </div>

    <!-- Lista de ventas -->
    <div v-else-if="ventas.length > 0" class="card">
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Nº Venta</th>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Método Pago</th>
              <th>Subtotal</th>
              <th>Descuento</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="venta in ventas" :key="venta.id">
              <td class="font-mono font-semibold text-primary-700">{{ venta.numero_venta }}</td>
              <td>{{ formatTime(venta.fecha) }}</td>
              <td>{{ venta.cliente_nombre || 'Público General' }}</td>
              <td>
                <span :class="['badge', getPaymentBadge(venta.metodo_pago)]">
                  {{ venta.metodo_pago }}
                </span>
              </td>
              <td>{{ formatCurrency(venta.subtotal) }}</td>
              <td>{{ venta.descuento > 0 ? formatCurrency(venta.descuento) : '-' }}</td>
              <td class="font-bold text-emerald-700">{{ formatCurrency(venta.total) }}</td>
              <td>
                <button
                  @click="verDetalle(venta)"
                  class="btn btn-sm btn-secondary"
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="card p-12 text-center">
      <svg class="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">No hay ventas</h3>
      <p class="text-slate-500">No se registraron ventas en esta fecha</p>
    </div>

    <!-- Modal Detalle de Venta -->
    <div
      v-if="showDetalleModal && selectedVenta"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showDetalleModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <!-- Header del modal -->
        <div class="sticky top-0 bg-primary-700 text-white p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold">{{ selectedVenta.numero_venta }}</h2>
              <p class="text-primary-100 text-sm mt-1">{{ formatDateTime(selectedVenta.fecha) }}</p>
            </div>
            <button @click="showDetalleModal = false" class="text-white hover:bg-primary-600 p-2 rounded-lg">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contenido del modal -->
        <div class="p-6">
          <!-- Info del cliente -->
          <div class="bg-slate-50 rounded-lg p-4 mb-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-slate-600">Cliente</div>
                <div class="font-semibold">{{ selectedVenta.cliente_nombre || 'Público General' }}</div>
              </div>
              <div>
                <div class="text-sm text-slate-600">Método de Pago</div>
                <div class="font-semibold">{{ selectedVenta.metodo_pago }}</div>
              </div>
            </div>
          </div>

          <!-- Productos vendidos -->
          <div class="mb-6">
            <h3 class="font-semibold text-lg text-slate-800 mb-3">Productos</h3>
            <div class="space-y-3">
              <div
                v-for="item in detalleItems"
                :key="item.id"
                class="bg-slate-50 rounded-lg p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-slate-800">{{ item.nombre_producto }}</h4>
                    <p class="text-sm text-slate-600">SKU: {{ item.codigo_producto }}</p>
                  </div>
                  <div class="text-right">
                    <div class="font-bold text-primary-700">{{ formatCurrency(item.total) }}</div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-2 text-sm">
                  <span class="text-slate-600">{{ item.cantidad }} x {{ formatCurrency(item.precio_unitario) }}</span>
                  <span v-if="item.descuento > 0" class="text-orange-600">Desc: {{ formatCurrency(item.descuento) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="border-t-2 border-slate-200 pt-4 space-y-2">
            <div class="flex justify-between text-slate-700">
              <span>Subtotal:</span>
              <span class="font-semibold">{{ formatCurrency(selectedVenta.subtotal) }}</span>
            </div>
            <div v-if="selectedVenta.descuento > 0" class="flex justify-between text-orange-600">
              <span>Descuento:</span>
              <span class="font-semibold">-{{ formatCurrency(selectedVenta.descuento) }}</span>
            </div>
            <div class="flex justify-between text-2xl font-bold text-emerald-700">
              <span>TOTAL:</span>
              <span>{{ formatCurrency(selectedVenta.total) }}</span>
            </div>
          </div>

          <!-- Botón reimprimir -->
          <div class="mt-6 flex gap-3">
            <button
              @click="reimprimirRecibo(selectedVenta)"
              class="flex-1 btn btn-primary py-3"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
              Reimprimir Recibo
            </button>
            <button
              v-if="selectedVenta.estado === 'COMPLETADA'"
              @click="anularVenta(selectedVenta)"
              class="flex-1 btn btn-danger py-3"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Anular Venta
            </button>
            <div v-else class="flex-1 btn btn-secondary py-3 opacity-50 cursor-not-allowed">
              Venta {{ selectedVenta.estado }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { ventasApi } from '@/services/api'

const authStore = useAuthStore()

const loading = ref(false)
const ventas = ref([])
const resumen = ref(null)
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const showDetalleModal = ref(false)
const selectedVenta = ref(null)
const detalleItems = ref([])

const formatCurrency = (value) => `Bs. ${parseFloat(value || 0).toFixed(2)}`

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('es-BO', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

const getPaymentBadge = (method) => {
  const badges = {
    'EFECTIVO': 'badge-success',
    'CREDITO': 'badge-warning',
    'QR': 'badge-primary'
  }
  return badges[method] || 'badge-secondary'
}

const loadHistorial = async () => {
  loading.value = true
  try {
    const response = await ventasApi.getMiHistorial({ fecha: selectedDate.value })
    ventas.value = response.data.data.ventas
    resumen.value = response.data.data.resumen
  } catch (error) {
    console.error('Error loading historial:', error)
    alert('Error al cargar el historial')
  } finally {
    loading.value = false
  }
}

const verDetalle = async (venta) => {
  try {
    const response = await ventasApi.getById(venta.id)
    selectedVenta.value = response.data.data
    detalleItems.value = response.data.data.detalles || []
    showDetalleModal.value = true
  } catch (error) {
    console.error('Error loading detalle:', error)
    alert('Error al cargar el detalle de la venta')
  }
}

const reimprimirRecibo = (venta) => {
  const printWindow = window.open('', '_blank', 'width=300,height=600')

  const clienteNombre = venta.cliente_nombre || 'Público General'
  const clienteNit = venta.cliente_nit || 'S/N'
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
        <div class="info-row"><span>Fecha:</span><span>${formatDateTime(venta.fecha)}</span></div>
        <div class="info-row"><span>Cliente:</span><span>${clienteNombre}</span></div>
        <div class="info-row"><span>NIT/CI:</span><span>${clienteNit}</span></div>
        <div class="info-row"><span>Vendedor:</span><span>${vendedor}</span></div>
      </div>

      <div class="divider"></div>

      <div class="items">
        ${detalleItems.value.map(item => `
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
      </div>

      <div class="footer">
        <p>¡Gracias por su compra!</p>
        <p>Este documento no es válido como factura</p>
        <p style="margin-top: 8px; font-weight: bold;">*** REIMPRESIÓN ***</p>
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

  printWindow.document.write(receiptHTML)
  printWindow.document.close()
}

const anularVenta = async (venta) => {
  if (!confirm(`¿Estás seguro de que deseas ANULAR la venta ${venta.numero_venta}?\n\nEsta acción:\n- Devolvería el stock de los productos\n- Anularía cualquier crédito asociado\n- Se registraría en auditoría`)) {
    return
  }

  const razon = prompt('Motivo de la anulación:', 'Error en venta')
  if (!razon) return

  try {
    await ventasApi.anular(venta.id, { razon })
    alert(`✓ Venta ${venta.numero_venta} anulada exitosamente`)
    showDetalleModal.value = false
    await loadHistorial()
  } catch (error) {
    console.error('Error al anular venta:', error)
    alert(error.response?.data?.message || 'Error al anular la venta')
  }
}

onMounted(() => {
  loadHistorial()
})
</script>
