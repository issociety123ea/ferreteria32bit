/**
 * Composable de Validaciones
 * Validaciones estrictas para todo el sistema POS
 * Compatible con Node.js v12
 */

import { ref, computed } from 'vue'

const errors = ref({})

/**
 * Validar campo requerido
 */
const isRequired = (value, fieldName = 'Campo') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} es requerido`
  }
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} no puede estar vacío`
  }
  return null
}

/**
 * Validar número
 */
const isNumber = (value, fieldName = 'Campo') => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`
  }
  return null
}

/**
 * Validar número positivo
 */
const isPositive = (value, fieldName = 'Campo') => {
  const error = isNumber(value, fieldName)
  if (error) return error

  const num = parseFloat(value)
  if (num <= 0) {
    return `${fieldName} debe ser mayor a 0`
  }
  return null
}

/**
 * Validar número no negativo
 */
const isNonNegative = (value, fieldName = 'Campo') => {
  const error = isNumber(value, fieldName)
  if (error) return error

  const num = parseFloat(value)
  if (num < 0) {
    return `${fieldName} no puede ser negativo`
  }
  return null
}

/**
 * Validar longitud mínima
 */
const minLength = (value, minLen, fieldName = 'Campo') => {
  if (String(value).length < minLen) {
    return `${fieldName} debe tener al menos ${minLen} caracteres`
  }
  return null
}

/**
 * Validar longitud máxima
 */
const maxLength = (value, maxLen, fieldName = 'Campo') => {
  if (String(value).length > maxLen) {
    return `${fieldName} no puede exceder ${maxLen} caracteres`
  }
  return null
}

/**
 * Validar email
 */
const isEmail = (value, fieldName = 'Email') => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return `${fieldName} no es válido`
  }
  return null
}

/**
 * Validar teléfono
 */
const isPhone = (value, fieldName = 'Teléfono') => {
  const phoneRegex = /^\d{6,15}$/
  if (!phoneRegex.test(String(value).replace(/\D/g, ''))) {
    return `${fieldName} debe tener entre 6 y 15 dígitos`
  }
  return null
}

/**
 * Validar NITa/CI
 */
const isNitCi = (value, fieldName = 'NIT/CI') => {
  const nitRegex = /^[0-9]{4,20}$/
  if (!nitRegex.test(String(value))) {
    return `${fieldName} debe contener entre 4 y 20 dígitos`
  }
  return null
}

/**
 * Validar cantidad de producto (permite decimales según configuración)
 */
const isValidQuantity = (value, allowDecimals = false, fieldName = 'Cantidad') => {
  const error = isPositive(value, fieldName)
  if (error) return error

  const num = parseFloat(value)
  if (!allowDecimals && !Number.isInteger(num)) {
    return `${fieldName} debe ser un número entero`
  }
  return null
}

/**
 * Validar precio
 */
const isValidPrice = (value, fieldName = 'Precio') => {
  const error = isNonNegative(value, fieldName)
  if (error) return error

  const num = parseFloat(value)
  if (num.toString().split('.')[1] && num.toString().split('.')[1].length > 2) {
    return `${fieldName} no puede tener más de 2 decimales`
  }
  return null
}

/**
 * Validar monto de efectivo (no puede ser negativo)
 */
const isValidMonto = (value, fieldName = 'Monto') => {
  return isNonNegative(value, fieldName)
}

/**
 * Validar que el monto recibido sea suficiente
 */
const isSufficientPayment = (montoRecibido, total, fieldName = 'Monto recibido') => {
  if (parseFloat(montoRecibido) < parseFloat(total)) {
    return `${fieldName} es insuficiente. Total: Bs. ${parseFloat(total).toFixed(2)}`
  }
  return null
}

/**
 * Validar que la fecha sea válida
 */
const isValidDate = (date, fieldName = 'Fecha') => {
  if (!date) {
    return `${fieldName} es requerida`
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return `${fieldName} no es válida`
  }
  return null
}

/**
 * Validar que la fecha de vencimiento sea futura
 */
const isFutureDate = (date, fieldName = 'Fecha de vencimiento') => {
  const error = isValidDate(date, fieldName)
  if (error) return error

  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (d < today) {
    return `${fieldName} debe ser posterior a hoy`
  }
  return null
}

/**
 * Validar objeto de producto
 */
const validateProduct = (product) => {
  const productErrors = {}

  if (isRequired(product.nombre)) {
    productErrors.nombre = isRequired(product.nombre, 'Nombre')
  }

  if (isRequired(product.codigo_sku_interno)) {
    productErrors.codigo = isRequired(product.codigo_sku_interno, 'Código SKU')
  }

  if (product.precio_venta !== undefined && product.precio_venta !== null) {
    if (isValidPrice(product.precio_venta, 'Precio de venta')) {
      productErrors.precioVenta = isValidPrice(product.precio_venta, 'Precio de venta')
    }
  }

  if (product.precio_costo !== undefined && product.precio_costo !== null) {
    if (isValidPrice(product.precio_costo, 'Precio de costo')) {
      productErrors.precioCosto = isValidPrice(product.precio_costo, 'Precio de costo')
    }
  }

  return Object.keys(productErrors).length > 0 ? productErrors : null
}

/**
 * Validar objeto de cliente
 */
const validateClient = (client) => {
  const clientErrors = {}

  if (isRequired(client.nombre_razon_social)) {
    clientErrors.nombre = isRequired(client.nombre_razon_social, 'Nombre o Razón Social')
  }

  if (client.nit_ci && isNitCi(client.nit_ci)) {
    clientErrors.nitCi = isNitCi(client.nit_ci, 'NIT/CI')
  }

  if (client.telefono && isPhone(client.telefono)) {
    clientErrors.telefono = isPhone(client.telefono, 'Teléfono')
  }

  if (client.email && isEmail(client.email)) {
    clientErrors.email = isEmail(client.email, 'Email')
  }

  return Object.keys(clientErrors).length > 0 ? clientErrors : null
}

/**
 * Validar objeto de proveedor
 */
const validateProvider = (provider) => {
  const providerErrors = {}

  if (isRequired(provider.nombre)) {
    providerErrors.nombre = isRequired(provider.nombre, 'Nombre')
  }

  if (provider.nit && isNitCi(provider.nit)) {
    providerErrors.nit = isNitCi(provider.nit, 'NIT')
  }

  if (provider.telefono && isPhone(provider.telefono)) {
    providerErrors.telefono = isPhone(provider.telefono, 'Teléfono')
  }

  if (provider.email && isEmail(provider.email)) {
    providerErrors.email = isEmail(provider.email, 'Email')
  }

  return Object.keys(providerErrors).length > 0 ? providerErrors : null
}

/**
 * Validar carrito de ventas
 */
const validateCart = (cart, total) => {
  if (!cart || cart.length === 0) {
    return 'El carrito está vacío'
  }

  if (parseFloat(total) <= 0) {
    return 'El total de la venta debe ser mayor a 0'
  }

  // Validar que cada item tenga cantidad válida
  for (const item of cart) {
    const qtyError = isValidQuantity(item.cantidad, item.permite_decimales, 'Cantidad')
    if (qtyError) {
      return `${item.nombre}: ${qtyError}`
    }

    if (parseFloat(item.cantidad) > parseFloat(item.stock_actual)) {
      return `${item.nombre}: No hay suficiente stock (disponible: ${item.stock_actual})`
    }
  }

  return null
}

/**
 * Validar pago de venta
 */
const validateSalePayment = (paymentMethod, montoRecibido, total, items) => {
  const errors = []

  // Validar que hay items
  if (!items || items.length === 0) {
    errors.push('No hay productos en la venta')
    return errors
  }

  // Validar monto total válido
  if (parseFloat(total) <= 0) {
    errors.push('El total de la venta debe ser mayor a 0')
    return errors
  }

  // Validar según método de pago
  if (paymentMethod === 'EFECTIVO') {
    const error = isValidMonto(montoRecibido, 'Monto recibido')
    if (error) {
      errors.push(error)
    }

    if (parseFloat(montoRecibido) < parseFloat(total)) {
      errors.push(`Monto insuficiente. Total: Bs. ${parseFloat(total).toFixed(2)}`)
    }
  } else if (paymentMethod === 'QR') {
    // QR siempre asume pago exacto
    if (parseFloat(montoRecibido) < parseFloat(total)) {
      errors.push(`Monto insuficiente. Total: Bs. ${parseFloat(total).toFixed(2)}`)
    }
  } else if (paymentMethod === 'MIXTO') {
    if (parseFloat(montoRecibido) < parseFloat(total)) {
      errors.push(`Monto insuficiente. Total: Bs. ${parseFloat(total).toFixed(2)}`)
    }
  }

  return errors
}

/**
 * Validar pago de crédito
 */
const validateCreditPayment = (montoPagado, saldoPendiente) => {
  const error = isPositive(montoPagado, 'Monto a pagar')
  if (error) return error

  if (parseFloat(montoPagado) > parseFloat(saldoPendiente)) {
    return `El monto a pagar no puede exceder el saldo pendiente (Bs. ${parseFloat(saldoPendiente).toFixed(2)})`
  }

  return null
}

/**
 * Resetear errores
 */
const clearErrors = () => {
  errors.value = {}
}

/**
 * Establecer errores específicos
 */
const setErrors = (fieldErrors) => {
  errors.value = fieldErrors
}

/**
 * Obtener errores formateados como array
 */
const getErrorMessages = () => {
  return Object.values(errors.value).filter(Boolean)
}

export const useValidation = () => ({
  errors: computed(() => errors.value),
  isRequired,
  isNumber,
  isPositive,
  isNonNegative,
  minLength,
  maxLength,
  isEmail,
  isPhone,
  isNitCi,
  isValidQuantity,
  isValidPrice,
  isValidMonto,
  isSufficientPayment,
  isValidDate,
  isFutureDate,
  validateProduct,
  validateClient,
  validateProvider,
  validateCart,
  validateSalePayment,
  validateCreditPayment,
  clearErrors,
  setErrors,
  getErrorMessages
})
