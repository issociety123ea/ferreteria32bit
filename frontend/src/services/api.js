import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  cambiarPassword: (data) => api.post('/auth/cambiar-password', data)
}

// Productos API
export const productosApi = {
  getAll: (params) => api.get('/productos', { params }),
  search: (query) => api.get('/productos/search', { params: { q: query, limit: 20 } }),
  getFrecuentes: (limit = 12) => api.get('/productos/frecuentes', { params: { limit } }),
  getById: (id) => api.get(`/productos/${id}`),
  create: (formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.post('/productos', formData, config)
  },
  update: (id, formData) => {
    const config = { headers: { 'Content-Type': 'multipart/form-data' } }
    return api.put(`/productos/${id}`, formData, config)
  },
  adjustStock: (id, data) => api.post(`/productos/${id}/ajustar-stock`, data)
}

// Ventas API
export const ventasApi = {
  getAll: (params) => api.get('/ventas', { params }),
  getMiHistorial: (params) => api.get('/ventas/mi-historial', { params }),
  getById: (id) => api.get(`/ventas/${id}`),
  create: (data) => api.post('/ventas', data),
  anular: (id, motivo) => api.post(`/ventas/${id}/anular`, { motivo })
}

// Clientes API
export const clientesApi = {
  getAll: (params) => api.get('/clientes', { params }),
  search: (query) => api.get('/clientes/search', { params: { q: query, limit: 20 } }),
  getById: (id) => api.get(`/clientes/${id}`),
  getProductosFrecuentes: (id, limit = 10) => api.get(`/clientes/${id}/productos-frecuentes`, { params: { limit } }),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data)
}

// Categorías API
export const categoriasApi = {
  getAll: () => api.get('/categorias'),
  create: (data) => api.post('/categorias', data),
  update: (id, data) => api.put(`/categorias/${id}`, data)
}

// Compras API
export const comprasApi = {
  getAll: (params) => api.get('/compras', { params }),
  getById: (id) => api.get(`/compras/${id}`),
  create: (data) => api.post('/compras', data)
}

// Proveedores API
export const proveedoresApi = {
  getAll: () => api.get('/proveedores'),
  getById: (id) => api.get(`/proveedores/${id}`),
  create: (data) => api.post('/proveedores', data),
  update: (id, data) => api.put(`/proveedores/${id}`, data)
}

// Reportes API
export const reportesApi = {
  ventasDiarias: (params) => api.get('/reportes/ventas-diarias', { params }),
  corteCaja: (params) => api.get('/reportes/corte-caja', { params }),
  productosMasVendidos: (params) => api.get('/reportes/productos-mas-vendidos', { params }),
  stockBajo: () => api.get('/reportes/stock-bajo'),
  resumenGeneral: (params) => api.get('/reportes/resumen-general', { params })
}

// Usuarios API
export const usuariosApi = {
  getAll: () => api.get('/usuarios'),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`)
}

// Kardex API
export const kardexApi = {
  getAll: (params) => api.get('/kardex', { params }),
  getByProducto: (productoId, params) => api.get(`/kardex/producto/${productoId}`, { params })
}

export default api
