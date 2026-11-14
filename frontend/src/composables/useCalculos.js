/**
 * Composable para Cálculos Matemáticos Precisos
 * Evita errores de punto flotante en cálculos monetarios
 * Compatible con Node.js v12
 */

/**
 * Realizar suma con precisión decimal
 */
const suma = (a, b) => {
  const decimales = 2
  const factor = Math.pow(10, decimales)
  return Math.round((parseFloat(a) * factor + parseFloat(b) * factor)) / factor
}

/**
 * Realizar resta con precisión decimal
 */
const resta = (a, b) => {
  const decimales = 2
  const factor = Math.pow(10, decimales)
  return Math.round((parseFloat(a) * factor - parseFloat(b) * factor)) / factor
}

/**
 * Realizar multiplicación con precisión decimal
 */
const multiplicacion = (a, b) => {
  const decimales = 2
  const factor = Math.pow(10, decimales)
  return Math.round((parseFloat(a) * parseFloat(b) * factor)) / factor
}

/**
 * Realizar división con precisión decimal
 */
const division = (a, b) => {
  if (parseFloat(b) === 0) {
    throw new Error('División por cero no permitida')
  }
  const decimales = 2
  const factor = Math.pow(10, decimales)
  return Math.round((parseFloat(a) / parseFloat(b) * factor)) / factor
}

/**
 * Calcular subtotal de un item (cantidad × precio unitario)
 */
const calcularSubtotalItem = (cantidad, precioUnitario) => {
  return multiplicacion(cantidad, precioUnitario)
}

/**
 * Calcular subtotal del carrito (suma de todos los items)
 */
const calcularSubtotalCarrito = (items) => {
  let total = 0
  for (const item of items) {
    const subtotal = multiplicacion(item.cantidad, item.precio_unitario)
    total = suma(total, subtotal)
  }
  return total
}

/**
 * Calcular total con descuento
 */
const calcularTotalConDescuento = (subtotal, descuento = 0) => {
  return resta(subtotal, descuento)
}

/**
 * Calcular vuelto/cambio
 */
const calcularVuelto = (montoRecibido, total) => {
  const vuelto = resta(montoRecibido, total)
  return Math.max(0, vuelto) // No puede ser negativo
}

/**
 * Calcular costo total del carrito
 */
const calcularCostoTotalCarrito = (items) => {
  let costoTotal = 0
  for (const item of items) {
    const costoItem = multiplicacion(item.cantidad, item.costo_unitario)
    costoTotal = suma(costoTotal, costoItem)
  }
  return costoTotal
}

/**
 * Calcular ganancia neta
 */
const calcularGananciaNeta = (total, costoTotal) => {
  return resta(total, costoTotal)
}

/**
 * Calcular margen de ganancia (%)
 */
const calcularMargen = (precioVenta, precioCosto) => {
  if (parseFloat(precioCosto) === 0) {
    return 0
  }
  const margen = division(
    resta(precioVenta, precioCosto),
    precioCosto
  )
  return Math.round(margen * 100 * 100) / 100 // Redondear a 2 decimales
}

/**
 * Validar que los cálculos sean consistentes
 * Retorna un objeto con el análisis
 */
const validarCálculos = (cartItems, subtotal, descuento, total, costoTotal) => {
  const analisis = {
    esValido: true,
    errores: [],
    advertencias: []
  }

  // Recalcular subtotal desde los items
  const subtotalCalculado = calcularSubtotalCarrito(cartItems)
  if (Math.abs(subtotalCalculado - parseFloat(subtotal)) > 0.01) {
    analisis.errores.push(
      `Inconsistencia en subtotal. Calculado: ${subtotalCalculado}, Actual: ${subtotal}`
    )
    analisis.esValido = false
  }

  // Recalcular total desde subtotal y descuento
  const totalCalculado = calcularTotalConDescuento(subtotalCalculado, descuento)
  if (Math.abs(totalCalculado - parseFloat(total)) > 0.01) {
    analisis.errores.push(
      `Inconsistencia en total. Calculado: ${totalCalculado}, Actual: ${total}`
    )
    analisis.esValido = false
  }

  // Recalcular costo total
  const costoCalculado = calcularCostoTotalCarrito(cartItems)
  if (Math.abs(costoCalculado - parseFloat(costoTotal)) > 0.01) {
    analisis.errores.push(
      `Inconsistencia en costo total. Calculado: ${costoCalculado}, Actual: ${costoTotal}`
    )
    analisis.esValido = false
  }

  return analisis
}

/**
 * Formatear número como moneda
 */
const formatearMoneda = (valor, divisor = 'Bs.', decimales = 2) => {
  const num = parseFloat(valor)
  return `${divisor} ${num.toFixed(decimales)}`
}

export const useCalculos = () => ({
  suma,
  resta,
  multiplicacion,
  division,
  calcularSubtotalItem,
  calcularSubtotalCarrito,
  calcularTotalConDescuento,
  calcularVuelto,
  calcularCostoTotalCarrito,
  calcularGananciaNeta,
  calcularMargen,
  validarCálculos,
  formatearMoneda
})
