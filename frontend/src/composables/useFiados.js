/**
 * Composable para Gestión de Fiados / Créditos
 * Lógica correcta: El fiado SOLO se registra si hay pago parcial
 * Compatible con Node.js v12
 */

import { ref, computed } from 'vue'

/**
 * Determinar si una venta debe registrarse como fiada
 *
 * REGLA CRÍTICA:
 * - Si montoRecibido >= total → NO es fiado (pago completo)
 * - Si montoRecibido < total → SÍ es fiado (pago parcial)
 * - Si montoRecibido === 0 → SÍ es fiado (sin pago inicial)
 */
const debeRegistrarseComoFiado = (montoRecibido, total) => {
  const monto = parseFloat(montoRecibido) || 0
  const tot = parseFloat(total) || 0

  return monto < tot
}

/**
 * Calcular saldo pendiente
 */
const calcularSaldoPendiente = (total, montoRecibido) => {
  const tot = parseFloat(total) || 0
  const monto = parseFloat(montoRecibido) || 0

  return Math.max(0, tot - monto)
}

/**
 * Calcular vuelto (solo si hay pago completo o superior)
 */
const calcularVuelto = (montoRecibido, total) => {
  const monto = parseFloat(montoRecibido) || 0
  const tot = parseFloat(total) || 0

  return Math.max(0, monto - tot)
}

/**
 * Validar datos de fiado
 */
const validarFiado = (fiado) => {
  const errores = []

  if (!fiado.cliente_id) {
    errores.push('Cliente es requerido')
  }

  if (!fiado.venta_id) {
    errores.push('Venta es requerida')
  }

  const montoTotal = parseFloat(fiado.monto_total) || 0
  if (montoTotal <= 0) {
    errores.push('Monto debe ser mayor a 0')
  }

  const saldoPendiente = parseFloat(fiado.saldo_pendiente) || 0
  if (saldoPendiente < 0) {
    errores.push('Saldo pendiente no puede ser negativo')
  }

  if (saldoPendiente > montoTotal) {
    errores.push('Saldo pendiente no puede superar el monto total')
  }

  if (fiado.fecha_vencimiento) {
    const vencimiento = new Date(fiado.fecha_vencimiento)
    const hoy = new Date()
    if (vencimiento < hoy) {
      errores.push('Fecha de vencimiento debe ser posterior a hoy')
    }
  }

  return errores
}

/**
 * Preparar objeto de fiado para guardar
 */
const prepararFiado = (venta, montoRecibido, clienteId, diasVencimiento = 30) => {
  const esFilado = debeRegistrarseComoFiado(montoRecibido, venta.total)

  if (!esFilado) {
    return null // No es fiado, es pago completo
  }

  const saldoPendiente = calcularSaldoPendiente(venta.total, montoRecibido)

  // Calcular fecha de vencimiento
  const fechaVencimiento = new Date()
  fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento)

  return {
    venta_id: venta.id,
    cliente_id: clienteId,
    monto_total: parseFloat(venta.total),
    saldo_pendiente: saldoPendiente,
    estado: 'PENDIENTE',
    fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
    notas: `Pago parcial: ${parseFloat(montoRecibido).toFixed(2)} Bs. Saldo: ${saldoPendiente.toFixed(2)} Bs.`
  }
}

/**
 * Calcular estado del fiado
 */
const calcularEstadoFiado = (fiado) => {
  const hoy = new Date()
  const vencimiento = new Date(fiado.fecha_vencimiento)

  if (parseFloat(fiado.saldo_pendiente) === 0) {
    return 'PAGADO'
  }

  if (vencimiento < hoy) {
    return 'VENCIDO'
  }

  return fiado.estado || 'PENDIENTE'
}

/**
 * Validar pago de fiado
 */
const validarPagoFiado = (montoPagado, saldoPendiente) => {
  const errores = []

  const monto = parseFloat(montoPagado) || 0
  const saldo = parseFloat(saldoPendiente) || 0

  if (monto <= 0) {
    errores.push('El monto a pagar debe ser mayor a 0')
  }

  if (monto > saldo) {
    errores.push(`El monto no puede superar el saldo pendiente (Bs. ${saldo.toFixed(2)})`)
  }

  return errores
}

/**
 * Calcular nuevo saldo después del pago
 */
const calcularNuevoSaldo = (saldoPendiente, montoPagado) => {
  const saldo = parseFloat(saldoPendiente) || 0
  const monto = parseFloat(montoPagado) || 0

  const nuevoSaldo = saldo - monto
  return Math.max(0, nuevoSaldo)
}

/**
 * Obtener resumen de créditos de un cliente
 */
const resumenCreditosCliente = (creditos) => {
  const resumen = {
    total_creditos: 0,
    total_pendiente: 0,
    total_pagado: 0,
    creditos_vencidos: 0,
    creditos_proximos_vencer: 0,
    deuda_total: 0
  }

  const hoy = new Date()
  const proximosDias = new Date()
  proximosDias.setDate(proximosDias.getDate() + 7)

  for (const credito of creditos) {
    resumen.total_creditos++
    resumen.deuda_total += parseFloat(credito.monto_total) || 0

    const saldoPendiente = parseFloat(credito.saldo_pendiente) || 0
    resumen.total_pendiente += saldoPendiente

    if (saldoPendiente === 0) {
      resumen.total_pagado += parseFloat(credito.monto_total) || 0
    }

    const vencimiento = new Date(credito.fecha_vencimiento)
    if (vencimiento < hoy && saldoPendiente > 0) {
      resumen.creditos_vencidos++
    }

    if (vencimiento <= proximosDias && vencimiento >= hoy && saldoPendiente > 0) {
      resumen.creditos_proximos_vencer++
    }
  }

  return resumen
}

/**
 * Validar lógica completa de pago en venta
 * Retorna: { registrarFiado: boolean, saldoPendiente: number, vuelto: number }
 */
const validarLogicaPagoVenta = (total, montoRecibido, metodoPago = 'EFECTIVO') => {
  const tot = parseFloat(total) || 0
  const monto = parseFloat(montoRecibido) || 0

  const resultado = {
    esValido: true,
    errores: [],
    registrarFiado: false,
    saldoPendiente: 0,
    vuelto: 0
  }

  // Validar monto recibido
  if (monto < 0) {
    resultado.errores.push('El monto no puede ser negativo')
    resultado.esValido = false
  }

  // Validar que el monto sea suficiente
  if (monto < tot) {
    // Es fiado
    resultado.registrarFiado = true
    resultado.saldoPendiente = tot - monto
    resultado.vuelto = 0
  } else {
    // Pago completo o superior
    resultado.registrarFiado = false
    resultado.saldoPendiente = 0
    resultado.vuelto = monto - tot

    // En QR, el vuelto debe ser exacto o 0
    if (metodoPago === 'QR' && resultado.vuelto > 0.01) {
      resultado.errores.push('En pagos QR solo se aceptan montos exactos')
      resultado.esValido = false
    }
  }

  return resultado
}

export const useFiados = () => ({
  debeRegistrarseComoFiado,
  calcularSaldoPendiente,
  calcularVuelto,
  validarFiado,
  prepararFiado,
  calcularEstadoFiado,
  validarPagoFiado,
  calcularNuevoSaldo,
  resumenCreditosCliente,
  validarLogicaPagoVenta
})
