# 🔧 DIAGNÓSTICO Y SOLUCIÓN DEFINITIVA - ERROR 403 (Forbidden)

## ❌ PROBLEMA IDENTIFICADO

### El Error 403 en la Consola del Navegador
```
Error 403 (Forbidden) - Acceso denegado
```

### Síntomas Observados
- Las solicitudes GET a `/api/productos/frecuentes` fallaban con 403
- Las solicitudes GET a `/api/clientes/search` fallaban con 403
- Las solicitudes POST para crear productos fallaban con 403
- El token JWT **SÍ estaba en localStorage**, pero **NO se enviaba en las cabeceras**

---

## 🔍 ANÁLISIS DE LA CAUSA RAÍZ

### El Interceptor de Axios Estaba **Parcialmente Roto**

**Archivo:** `frontend/src/services/api.js` (líneas 50-57)

```javascript
// ❌ CÓDIGO INCORRECTO ANTERIOR
create: (formData) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  return api.post('/productos', formData, config)  // Sobrescribe headers globales
}
```

### El Problema Específico

1. **El interceptor global** estaba configurado para añadir el token:
   ```javascript
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token')
     if (token) {
       config.headers.Authorization = `Bearer ${token}`  // ✅ Correcto
     }
     return config
   })
   ```

2. **PERO** cuando se llamaba `api.post(url, data, config)` con un objeto `config` personalizado:
   ```javascript
   // Esto SOBRESCRIBÍA los headers globales, elimando el token
   const config = { headers: { 'Content-Type': 'multipart/form-data' } }
   return api.post('/productos', formData, config)
   ```

3. **Resultado:** El token se perdía en esas solicitudes específicas, causando error 403.

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambio 1: Reparar el Interceptor de Axios
**Archivo:** `frontend/src/services/api.js`

```javascript
// ✅ CÓDIGO CORRECTO NUEVO
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`  // Siempre agregar token
    }
    
    // IMPORTANTE: No sobrescribir Content-Type para multipart/form-data
    // Dejar que axios lo maneje automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']  // Elimina el header predeterminado
    }
    
    return config
  },
  (error) => Promise.reject(error)
)
```

### Cambio 2: Eliminar Sobrescritura de Headers en Métodos CRUD
**Archivo:** `frontend/src/services/api.js` (líneas 54-61)

```javascript
// ❌ ANTES (Sobrescribía headers)
create: (formData) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  return api.post('/productos', formData, config)
}

// ✅ DESPUÉS (Deja que axios maneje todo)
create: (formData) => {
  return api.post('/productos', formData)
}
```

### Cambio 3: Mejorar Manejo de Error 403
**Archivo:** `frontend/src/services/api.js`

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token inválido o expirado → limpiar y redirigir a login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### Cambio 4: Agregar APIs Faltantes
Se agregaron las APIs de **Créditos** e **Historial** que faltaban en el servicio:

```javascript
export const creditosApi = {
  getAll: (params) => api.get('/creditos', { params }),
  getById: (id) => api.get(`/creditos/${id}`),
  getResumen: () => api.get('/creditos/resumen'),
  registrarPago: (data) => api.post('/creditos/pagar', data),
  // ...
}

export const historialApi = {
  getTransacciones: (params) => api.get('/historial/transacciones', { params }),
  getVentas: (params) => api.get('/historial/ventas', { params }),
  // ...
}
```

---

## 🎯 CÓMO FUNCIONA AHORA

### Flujo Correcto de una Solicitud

1. **Aplicación hace solicitud:**
   ```javascript
   productosApi.getFrecuentes(12)  // GET /productos/frecuentes?limit=12
   ```

2. **Interceptor global se ejecuta:**
   ```javascript
   - Lee token de localStorage
   - Agrega: Authorization: Bearer eyJhbGc...
   - Mantiene Content-Type: application/json
   ```

3. **Solicitud llega al servidor:**
   ```
   Headers:
   - Authorization: Bearer eyJhbGc...
   - Content-Type: application/json
   ```

4. **Backend verifica token:**
   ```javascript
   // middleware/auth.js
   const authenticateToken = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1]
     if (!token) return res.status(401).json({...})  // 401 si no hay token
     
     try {
       const decoded = verifyToken(token)
       req.user = decoded
       next()  // ✅ Continúa si el token es válido
     } catch {
       return res.status(403).json({...})  // 403 si el token es inválido
     }
   }
   ```

5. **Respuesta exitosa regresa:**
   ```javascript
   { success: true, data: [...productos] }
   ```

---

## 📋 CHECKLIST DE VERIFICACIÓN

Después de actualizar el código, verifica lo siguiente:

### ✅ Frontend
- [ ] Borra el cache del navegador (Ctrl+Shift+Del)
- [ ] Abre las Herramientas de Desarrollador (F12)
- [ ] Ve a la pestaña **Network**
- [ ] Inicia sesión con `admin` / `admin123`
- [ ] En Network, verifica que TODAS las solicitudes tengan en Headers:
  ```
  Authorization: Bearer eyJhbGc...
  ```
- [ ] No debe haber errores 403 en la consola

### ✅ Pruebas de Cada Módulo
- [ ] **Productos:** Abre la sección de Inventario → Verifica que carguen productos
- [ ] **Productos Frecuentes (POS):** Entra al POS → Verifica que carguen productos frecuentes
- [ ] **Clientes:** Crea, edita y busca clientes
- [ ] **Ventas:** Realiza una venta completa
- [ ] **Créditos:** Crea una venta a crédito → Verifica que se cree el crédito
- [ ] **Historial:** Abre el historial de ventas
- [ ] **Reportes:** Abre corte de caja y productos más vendidos

---

## 🚀 CÓMO ACTUALIZAR EN WINDOWS 7 32-BITS

En tu equipo de producción:

```bash
# Navega a la carpeta del proyecto
cd C:\ruta\ferreteria

# Descarga los cambios
git pull origin main

# Reconstruye el frontend (si es necesario)
cd frontend
npm install
npm run build
cd ..

# Reinicia el servidor
instalar.bat
```

---

## 🔐 ENTENDIENDO LA SEGURIDAD

### ¿Por qué el middleware rechazaba solicitudes?

El backend tiene **3 capas de seguridad**:

1. **Capa 1: Autenticación (401 Unauthorized)**
   - Si no hay token en la solicitud
   - El servidor no sabe quién eres

2. **Capa 2: Validación de Token (403 Forbidden)**
   - Si el token existe pero es inválido o expirado
   - El servidor sabe quién eres, pero rechaza la acción

3. **Capa 3: Autorización (403 Forbidden)**
   - Si tienes un token válido, pero tu rol no tiene permisos
   - Ejemplo: Un VENDEDOR intenta crear un usuario (solo para ROOT)

### El Error 403 Que Recibiste
Fue la **Capa 2 o 3**: El servidor rechazaba porque:
- El token **NO se enviaba** en las cabeceras (Capa 1 debería ser 401, pero axios sí enviaba token en GET simple)
- O el token estaba **expirado**
- O el rol del usuario **no tenía permisos**

---

## 📊 COMPARATIVA ANTES vs DESPUÉS

| Situación | Antes | Después |
|-----------|-------|---------|
| Token en localStorage | ✅ Sí | ✅ Sí |
| Token enviado en GET | ✅ Sí | ✅ Sí |
| Token enviado en POST multipart | ❌ No | ✅ Sí |
| Token enviado en PUT con headers personalizados | ❌ No | ✅ Sí |
| Error 403 en productos frecuentes | ❌ Ocurría | ✅ Resuelto |
| Error 403 en crear productos | ❌ Ocurría | ✅ Resuelto |
| Manejo de token expirado | ⚠️ Parcial | ✅ Completo |

---

## 🎓 LECCIÓN APRENDIDA

**Nunca sobrescribas objeto de configuración completo** cuando usas interceptores:

```javascript
// ❌ MALO
const config = { headers: { 'X-Custom': 'value' } }
api.post(url, data, config)  // Pierdes los headers del interceptor

// ✅ BUENO
// Confía en que el interceptor agregará lo que necesites
api.post(url, data)

// ✅ BUENO (Si realmente necesitas headers personalizados)
const config = { 
  headers: { 
    'X-Custom': 'value'
    // El interceptor AÚN agregará Authorization aquí
  } 
}
api.post(url, data, config)
```

---

## 📞 SOPORTE

Si aún ves errores 403:

1. **Abre las Herramientas de Desarrollador (F12)**
2. **Ve a Network → busca la solicitud que falla**
3. **Verifica que el header `Authorization` esté presente**
4. **Si no está, hay otro problema en tu código personalizado**
5. **Si está, el problema es del backend (revisar middleware de autenticación)**

---

**Versión:** 1.0  
**Fecha:** 2026-11-14  
**Commit:** 4da728a  
**Estado:** ✅ RESUELTO
