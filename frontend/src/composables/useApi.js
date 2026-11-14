/**
 * Servicio API mejorado con manejo de errores
 * Integra validaciones y notificaciones automáticamente
 * Compatible con Node.js v12
 */

import { useToast } from '@/composables/useToast'
import { useValidation } from '@/composables/useValidation'

const { success, error, warning } = useToast()
const { getErrorMessages } = useValidation()

/**
 * Wrapper de fetch con manejo automático de errores y notificaciones
 */
const apiCall = async (method, url, data = null, options = {}) => {
  const {
    showSuccess = true,
    showError = true,
    successMessage = null,
    errorMessage = null,
    timeout = 30000
  } = options

  try {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data)
    }

    // Agregar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    config.signal = controller.signal

    const response = await fetch(url, config)
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      const message = errorMessage || errorData.message || `Error ${response.status}`

      if (showError) {
        error(message)
      }

      return {
        success: false,
        message: message,
        status: response.status
      }
    }

    const responseData = await response.json()

    if (showSuccess && responseData.success) {
      const msg = successMessage || responseData.message || 'Operación completada'
      success(msg)
    }

    return responseData
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutMsg = `Timeout - La solicitud tardó más de ${timeout}ms`
      if (showError) {
        error(timeoutMsg)
      }
      return { success: false, message: timeoutMsg }
    }

    const message = errorMessage || err.message || 'Error en la conexión'
    if (showError) {
      error(message)
    }

    return { success: false, message: message }
  }
}

/**
 * GET request
 */
const get = (url, options = {}) => {
  return apiCall('GET', url, null, options)
}

/**
 * POST request
 */
const post = (url, data, options = {}) => {
  return apiCall('POST', url, data, options)
}

/**
 * PUT request
 */
const put = (url, data, options = {}) => {
  return apiCall('PUT', url, data, options)
}

/**
 * PATCH request
 */
const patch = (url, data, options = {}) => {
  return apiCall('PATCH', url, data, options)
}

/**
 * DELETE request
 */
const deleteFetch = (url, options = {}) => {
  return apiCall('DELETE', url, null, options)
}

export const useApi = () => ({
  get,
  post,
  put,
  patch,
  delete: deleteFetch,
  apiCall
})
