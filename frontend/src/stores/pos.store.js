import { defineStore } from 'pinia'
import { productosApi, ventasApi, clientesApi } from '@/services/api'

// CORRECCIÓN TOL-01: Helpers para persistencia en localStorage
const CART_STORAGE_KEY = 'ferreteria_pos_cart'
const CLIENT_STORAGE_KEY = 'ferreteria_pos_client'

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

export const usePosStore = defineStore('pos', {
  state: () => ({
    cart: loadFromLocalStorage(CART_STORAGE_KEY) || [],
    selectedClient: loadFromLocalStorage(CLIENT_STORAGE_KEY) || null,
    searchQuery: '',
    searchResults: [],
    productosFrequentes: [],
    isSearching: false,
    isLoadingFrequentes: false
  }),

  getters: {
    cartTotal: (state) => {
      // CORRECCIÓN FER-03/04: Usar redondeo preciso para evitar descuadres de centavos
      return state.cart.reduce((total, item) => {
        const subtotal = Math.round(item.precio_unitario * item.cantidad * 100) / 100
        return Math.round((total + subtotal) * 100) / 100
      }, 0)
    },

    cartItemCount: (state) => {
      return state.cart.reduce((count, item) => count + item.cantidad, 0)
    },

    cartForApi: (state) => {
      return state.cart.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      }))
    }
  },

  actions: {
    async loadProductosFrequentes() {
      this.isLoadingFrequentes = true
      try {
        const response = await productosApi.getFrecuentes(12)
        this.productosFrequentes = response.data.data
      } catch (error) {
        console.error('Error loading frequent products:', error)
      } finally {
        this.isLoadingFrequentes = false
      }
    },

    addToCart(producto) {
      const existingItem = this.cart.find(item => item.id === producto.id)

      if (existingItem) {
        const newQuantity = existingItem.cantidad + 1
        if (newQuantity > producto.stock_actual) {
          return { success: false, message: 'Stock insuficiente' }
        }
        existingItem.cantidad = newQuantity
      } else {
        if (producto.stock_actual < 1) {
          return { success: false, message: 'Producto sin stock' }
        }

        this.cart.push({
          id: producto.id,
          codigo: producto.codigo_sku_interno,
          nombre: producto.nombre,
          imagen_url: producto.imagen_url,
          unidad_medida: producto.unidad_medida,
          permite_decimales: producto.permite_decimales,
          cantidad: 1,
          precio_unitario: producto.precio_venta,
          stock_disponible: producto.stock_actual
        })
      }

      // CORRECCIÓN: Persistir carrito en localStorage
      saveToLocalStorage(CART_STORAGE_KEY, this.cart)

      return { success: true }
    },

    removeFromCart(index) {
      this.cart.splice(index, 1)
      saveToLocalStorage(CART_STORAGE_KEY, this.cart)
    },

    updateQuantity(index, cantidad) {
      const item = this.cart[index]

      if (!item) return { success: false, message: 'Item no encontrado' }

      if (!item.permite_decimales && cantidad % 1 !== 0) {
        return { success: false, message: 'Este producto no permite cantidades decimales' }
      }

      if (cantidad > item.stock_disponible) {
        return { success: false, message: `Stock insuficiente. Disponible: ${item.stock_disponible}` }
      }

      if (cantidad <= 0) {
        this.removeFromCart(index)
      } else {
        item.cantidad = cantidad
        saveToLocalStorage(CART_STORAGE_KEY, this.cart)
      }

      return { success: true }
    },

    clearCart() {
      this.cart = []
      this.selectedClient = null
      clearLocalStorage(CART_STORAGE_KEY)
      clearLocalStorage(CLIENT_STORAGE_KEY)
    },

    setClient(client) {
      this.selectedClient = client
      saveToLocalStorage(CLIENT_STORAGE_KEY, client)
    },

    async searchProducts(query) {
      if (!query || query.length < 1) {
        this.searchResults = []
        return
      }

      this.isSearching = true
      this.searchQuery = query

      try {
        const response = await productosApi.search(query)
        this.searchResults = response.data.data
      } catch (error) {
        console.error('Error searching products:', error)
        this.searchResults = []
      } finally {
        this.isSearching = false
      }
    },

    async searchClients(query) {
      try {
        const response = await clientesApi.search(query)
        return response.data.data
      } catch (error) {
        console.error('Error searching clients:', error)
        return []
      }
    },

    async processVenta(paymentData) {
      try {
        const ventaData = {
          cliente_id: this.selectedClient?.id || 1,
          items: this.cartForApi,
          metodo_pago: paymentData.metodo_pago,
          monto_efectivo: paymentData.monto_efectivo || 0,
          monto_qr: paymentData.monto_qr || 0,
          monto_credito: paymentData.monto_credito || 0,
          notas: paymentData.notas || null
        }

        const response = await ventasApi.create(ventaData)

        if (response.data.success) {
          const venta = response.data.data
          this.clearCart()
          // Reload frequent products after sale
          this.loadProductosFrequentes()
          return { success: true, venta }
        }

        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al procesar la venta'
        }
      }
    }
  }
})
