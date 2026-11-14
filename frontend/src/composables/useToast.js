/**
 * Sistema de Toasts/Notificaciones Flotantes
 * Reemplaza alert() y confirm() con notificaciones sutiles y no invasivas
 */

import { ref, computed } from 'vue'

const toasts = ref([])
let toastId = 0

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

const TOAST_DURATION = {
  SHORT: 2000,   // 2 segundos
  NORMAL: 3000,  // 3 segundos
  LONG: 5000     // 5 segundos
}

/**
 * Mostrar una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos
 */
const showToast = (message, type = TOAST_TYPES.INFO, duration = TOAST_DURATION.NORMAL) => {
  const id = toastId++

  const toast = {
    id,
    message,
    type,
    visible: true
  }

  toasts.value.push(toast)

  // Auto-cerrar después del tiempo especificado
  setTimeout(() => {
    removeToast(id)
  }, duration)

  return id
}

/**
 * Mostrar toast de éxito
 */
const success = (message, duration = TOAST_DURATION.NORMAL) => {
  return showToast(message, TOAST_TYPES.SUCCESS, duration)
}

/**
 * Mostrar toast de error
 */
const error = (message, duration = TOAST_DURATION.LONG) => {
  return showToast(message, TOAST_TYPES.ERROR, duration)
}

/**
 * Mostrar toast de advertencia
 */
const warning = (message, duration = TOAST_DURATION.NORMAL) => {
  return showToast(message, TOAST_TYPES.WARNING, duration)
}

/**
 * Mostrar toast de información
 */
const info = (message, duration = TOAST_DURATION.NORMAL) => {
  return showToast(message, TOAST_TYPES.INFO, duration)
}

/**
 * Remover un toast específico
 */
const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

/**
 * Remover todos los toasts
 */
const clearAll = () => {
  toasts.value = []
}

/**
 * Mostrar confirmación con callback (reemplaza confirm())
 * Retorna una Promise que resolve con true/false
 */
const confirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const {
      title = 'Confirmación',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar'
    } = options

    // Guardar la resolución en el toast para que el componente pueda usarla
    const id = toastId++

    const toast = {
      id,
      message,
      title,
      type: TOAST_TYPES.WARNING,
      confirmText,
      cancelText,
      visible: true,
      isConfirm: true,
      resolve
    }

    toasts.value.push(toast)
  })
}

export const useToast = () => ({
  toasts: computed(() => toasts.value),
  showToast,
  success,
  error,
  warning,
  info,
  removeToast,
  clearAll,
  confirm,
  TOAST_TYPES,
  TOAST_DURATION
})
