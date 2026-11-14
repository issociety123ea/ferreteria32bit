/**
 * Middleware de Validación
 * Validadores reutilizables para todas las operaciones
 * Compatible con Node.js v12
 */

/**
 * Validar decimal con lugares específicos
 */
const validateDecimal = (value, places = 2) => {
  const num = parseFloat(value)
  if (isNaN(num)) {
    return { valid: false, message: 'Debe ser un número válido' }
  }

  const regex = new RegExp(`^-?\\d+(\\.\\d{1,${places}})?$`)
  if (!regex.test(String(value))) {
    return { valid: false, message: `Máximo ${places} decimales permitidos` }
  }

  return { valid: true, value: num }
}

/**
 * Validar moneda (no negativo, máximo 2 decimales)
 */
const validateCurrency = (value) => {
  const result = validateDecimal(value, 2)
  if (!result.valid) {
    return result
  }

  if (result.value < 0) {
    return { valid: false, message: 'No puede ser negativo' }
  }

  return { valid: true, value: result.value }
}

/**
 * Validar cantidad (positivo, decimales según configuración)
 */
const validateQuantity = (value, allowDecimals = false) => {
  const result = validateDecimal(value, allowDecimals ? 3 : 0)
  if (!result.valid) {
    return result
  }

  if (result.value <= 0) {
    return { valid: false, message: 'Debe ser mayor a 0' }
  }

  return { valid: true, value: result.value }
}

/**
 * Validar porcentaje (0-100)
 */
const validatePercentage = (value) => {
  const result = validateDecimal(value, 2)
  if (!result.valid) {
    return result
  }

  if (result.value < 0 || result.value > 100) {
    return { valid: false, message: 'Debe estar entre 0 y 100' }
  }

  return { valid: true, value: result.value }
}

/**
 * Validar formato de fecha
 */
const validateDateFormat = (date) => {
  if (!date) {
    return { valid: false, message: 'Fecha es requerida' }
  }

  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return { valid: false, message: 'Formato de fecha inválido' }
  }

  return { valid: true, value: d.toISOString().split('T')[0] }
}

/**
 * Validar número de teléfono
 */
const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { valid: false, message: 'Teléfono es requerido' }
  }

  const cleanPhone = String(phone).replace(/\D/g, '')
  if (cleanPhone.length < 6 || cleanPhone.length > 15) {
    return { valid: false, message: 'Teléfono debe tener entre 6 y 15 dígitos' }
  }

  return { valid: true, value: cleanPhone }
}

/**
 * Validar NIT/CI
 */
const validateNitCi = (nit) => {
  if (!nit) {
    return { valid: false, message: 'NIT/CI es requerido' }
  }

  const cleanNit = String(nit).replace(/\D/g, '')
  if (cleanNit.length < 4 || cleanNit.length > 20) {
    return { valid: false, message: 'NIT/CI debe tener entre 4 y 20 dígitos' }
  }

  return { valid: true, value: cleanNit }
}

/**
 * Validar email
 */
const validateEmail = (email) => {
  if (!email) {
    return { valid: true, value: null }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(String(email))) {
    return { valid: false, message: 'Email no es válido' }
  }

  return { valid: true, value: email.toLowerCase() }
}

/**
 * Validar string requerido
 */
const validateRequired = (value, fieldName = 'Campo') => {
  if (value === null || value === undefined) {
    return { valid: false, message: `${fieldName} es requerido` }
  }

  if (String(value).trim() === '') {
    return { valid: false, message: `${fieldName} no puede estar vacío` }
  }

  return { valid: true, value: String(value).trim() }
}

/**
 * Validar largo mínimo de string
 */
const validateMinLength = (value, minLen, fieldName = 'Campo') => {
  if (!value || String(value).length < minLen) {
    return { valid: false, message: `${fieldName} debe tener al menos ${minLen} caracteres` }
  }

  return { valid: true, value: String(value) }
}

/**
 * Validar carrito de compra
 */
const validateCart = (cart) => {
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return { valid: false, message: 'El carrito está vacío' }
  }

  for (const item of cart) {
    if (!item.producto_id) {
      return { valid: false, message: 'Todos los items deben tener producto_id' }
    }

    const qtyResult = validateQuantity(item.cantidad, item.permite_decimales)
    if (!qtyResult.valid) {
      return { valid: false, message: `${item.nombre}: ${qtyResult.message}` }
    }

    const priceResult = validateCurrency(item.precio_unitario)
    if (!priceResult.valid) {
      return { valid: false, message: `${item.nombre}: Precio unitario ${priceResult.message}` }
    }

    if (item.cantidad > item.stock_actual) {
      return {
        valid: false,
        message: `${item.nombre}: Stock insuficiente (disponible: ${item.stock_actual})`
      }
    }
  }

  return { valid: true }
}

/**
 * Validar método de pago
 */
const validatePaymentMethod = (method) => {
  const validMethods = ['EFECTIVO', 'QR', 'CREDITO', 'MIXTO', 'FIADO']
  if (!validMethods.includes(method)) {
    return {
      valid: false,
      message: `Método de pago inválido. Válidos: ${validMethods.join(', ')}`
    }
  }
  return { valid: true, value: method }
}

/**
 * Validar montos de pago (efectivo + QR + crédito = total)
 */
const validatePaymentAmounts = (montoEfectivo, montoQr, montoCredito, total) => {
  const mE = parseFloat(montoEfectivo) || 0
  const mQ = parseFloat(montoQr) || 0
  const mC = parseFloat(montoCredito) || 0
  const tot = parseFloat(total) || 0

  const suma = Math.round((mE + mQ + mC) * 100) / 100

  if (Math.abs(suma - tot) > 0.01) {
    return {
      valid: false,
      message: `Los montos no coinciden. Suma: ${suma}, Total: ${tot}`
    }
  }

  return { valid: true }
}

/**
 * Redondear a 2 decimales (para cálculos de dinero)
 */
const roundMoney = (value) => {
  return Math.round(parseFloat(value) * 100) / 100
}

module.exports = {
  validateDecimal,
  validateCurrency,
  validateQuantity,
  validatePercentage,
  validateDateFormat,
  validatePhoneNumber,
  validateNitCi,
  validateEmail,
  validateRequired,
  validateMinLength,
  validateCart,
  validatePaymentMethod,
  validatePaymentAmounts,
  roundMoney
}
