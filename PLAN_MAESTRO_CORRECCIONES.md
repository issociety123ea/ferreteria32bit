# 🚀 PLAN INTEGRAL DE CORRECCIONES - SISTEMA POS FERRETERÍA
## Todas las Correcciones Críticas en Orden de Prioridad

**Fecha:** 14 de Noviembre, 2026
**Versión:** 1.0 - Plan Maestro
**Compatibilidad:** Node.js v12.22.12 + Windows 7 32bits

---

## 📊 ESTADO ACTUAL vs OBJETIVO

### ✅ Lo que ya está funcionando:
- ✅ Backend Express + SQLite operacional
- ✅ Frontend Vue3 con Pinia
- ✅ Autenticación JWT
- ✅ Módulo de Ventas básico
- ✅ Gestión de Productos
- ✅ Sistema de Backups mejorado
- ✅ Auditoría de acciones

### ❌ Lo que necesita corrección:
- ❌ Validaciones incompletas en formularios
- ❌ Cálculos con errores de punto flotante
- ❌ Lógica confusa en fiados (permite registrar fiado aunque pague todo)
- ❌ Gestión de precios por proveedor deficiente
- ❌ alert() nativo en lugar de toasts modernos
- ❌ Usuario no se registra claramente en historial
- ❌ Sistema se congela/traba ocasionalmente
- ❌ No hay ejecutable profesional

---

## 🔧 CORRECCIONES DETALLADAS

### CORRECCIÓN 1: VALIDACIONES DE CAMPOS Y CÁLCULOS
**Prioridad:** 🔴 CRÍTICA | **Tiempo:** 2-3 horas | **Impacto:** Alto

#### Problema:
- Campos vacíos aceptados
- Números negativos permitidos
- Cálculos con errores de punto flotante
- Sin validación de cantidad vs stock

#### Solución implementada:
✅ Creado: `frontend/src/composables/useValidation.js`
- ✅ Creado: `backend/middleware/validation.js`

#### Próximos pasos:
1. [ ] Actualizar `backend/controllers/ventas.controller.js` - línea 22-211
   - Validar cart items antes de crear venta
   - Redondear cálculos a 2 decimales
   - Verificar stock suficiente
   - Validar montos de pago

2. [ ] Actualizar `backend/controllers/productos.controller.js`
   - Validar precio_venta > 0
   - Validar precio_costo >= 0
   - Validar margen_ganancia

3. [ ] Actualizar `frontend/src/views/PosView.vue` - línea 92-100
   - Validar cantidad antes de agregar carrito
   - Mostrar errores con composable useValidation
   - Reemplazar alert() con useToast()

4. [ ] Actualizar `frontend/src/stores/pos.store.js`
   - Agregar método `validateCartItem(item)`
   - Agregar método `recalculateCartTotals()`

---

### CORRECCIÓN 2: OPTIMIZACIÓN DEL MÓDULO DE FIADOS/AL ANOTE
**Prioridad:** 🔴 CRÍTICA | **Tiempo:** 3-4 horas | **Impacto:** Muy Alto

#### Problema crítico:
```
ACTUALMENTE (❌ Incorrecto):
- Cliente paga 500 Bs. de una venta de 500 Bs. → Sistema REGISTRA como "fiado"
- Esto es ilógico: si pagó el total, ¿por qué es deuda?

DEBE SER (✅ Correcto):
- Cliente paga 500 Bs. de 500 Bs. → Venta completada, SIN registro de fiado
- Cliente paga 300 Bs. de 500 Bs. → Registro fiado por 200 Bs. pendientes
- Cliente paga 0 Bs. de 500 Bs. → Registro fiado por 500 Bs. pendientes
```

#### Solución implementada:
✅ Creado: `frontend/src/composables/useFiados.js`
- Función `debeRegistrarseComoFiado(montoRecibido, total)` → retorna boolean
- Función `calcularSaldoPendiente(total, montoRecibido)` → retorna número
- Función `validarLogicaPagoVenta()` → valida lógica completa

#### Próximos pasos:
1. [ ] Crear tabla en BD: `creditos_refinanciamientos`
   ```sql
   CREATE TABLE IF NOT EXISTS creditos_refinanciamientos (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       credito_id INTEGER NOT NULL,
       fecha_vencimiento_anterior DATETIME,
       fecha_vencimiento_nueva DATETIME,
       razon TEXT,
       usuario_id INTEGER NOT NULL,
       creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (credito_id) REFERENCES creditos(id),
       FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
   );
   ```

2. [ ] Actualizar `backend/controllers/creditos.controller.js`
   - Agregar: `refinanciarCredito(req, res)` - POST `/api/creditos/:id/refinanciar`
   - Agregar: `updateFechaVencimiento(req, res)` - PATCH `/api/creditos/:id/vencimiento`
   - Agregar: `obtenerAnalisisCliente(req, res)` - GET `/api/creditos/cliente/:id/analisis`

3. [ ] Actualizar `frontend/src/views/FiadosView.vue` - Refactor completo
   - Nueva sección: "Estadísticas por Cliente"
   - Modal para refinanciar crédito vencido
   - Indicador visual de créditos vencidos (badge rojo)
   - Botón para cambiar fecha de vencimiento

4. [ ] Crear componente: `frontend/src/components/ModalRefinanciarCredito.vue`
   - Permitir extender fecha de vencimiento
   - Opción de pago parcial + nueva fecha
   - Resumen antes de confirmar

---

### CORRECCIÓN 3: GESTIÓN DE PRECIOS VARIABLES POR PROVEEDOR
**Prioridad:** 🟠 ALTA | **Tiempo:** 3-4 horas | **Impacto:** Alto

#### Problema:
- Al cambiar precio de un producto de un proveedor, se afecta globalmente
- No hay histórico de cambios de precio
- Imposible gestionar precios diferentes por proveedor

#### Solución:
1. [ ] Crear tabla en BD: `precios_proveedor`
   ```sql
   CREATE TABLE IF NOT EXISTS precios_proveedor (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       producto_id INTEGER NOT NULL,
       proveedor_id INTEGER NOT NULL,
       precio_costo REAL NOT NULL,
       fecha_vigencia DATETIME DEFAULT CURRENT_TIMESTAMP,
       notas TEXT,
       activo INTEGER DEFAULT 1,
       creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (producto_id) REFERENCES productos(id),
       FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
       UNIQUE(producto_id, proveedor_id)
   );
   CREATE INDEX idx_precios_proveedor_producto ON precios_proveedor(producto_id);
   CREATE INDEX idx_precios_proveedor_proveedor ON precios_proveedor(proveedor_id);
   ```

2. [ ] Actualizar `backend/controllers/productos.controller.js`
   - GET `/api/productos/:id/precios-proveedor` - obtener precios
   - POST `/api/productos/:id/precios-proveedor` - crear precio
   - PATCH `/api/productos/:id/precios-proveedor/:proveedor_id` - actualizar
   - DELETE `/api/productos/:id/precios-proveedor/:proveedor_id` - eliminar

3. [ ] Actualizar `frontend/src/views/InventoryView.vue`
   - Nueva pestaña: "Precios por Proveedor"
   - Tabla: Producto | Proveedor | Precio | Margen

4. [ ] Crear componente: `frontend/src/components/ModalPreciosProveedor.vue`

---

### CORRECCIÓN 4: ESTABILIDAD Y FLUIDEZ DEL SISTEMA
**Prioridad:** 🔴 CRÍTICA | **Tiempo:** 2-3 horas | **Impacto:** Muy Alto

#### Problema:
- Sistema se congela/traba ocasionalmente
- Frontend se bloquea durante operaciones largas
- No hay manejo de timeouts

#### Solución:
1. [ ] Optimizar `backend/config/database.js`
   - Habilitar WAL mode para mejor concurrencia
   - Agregar busy timeout de 5000ms
   - Implementar retry logic

2. [ ] Mejorar `backend/middleware/errorHandler.js`
   - Detectar "database is locked"
   - Reintentar automáticamente
   - Logging más detallado

3. [ ] Optimizar `frontend/src/stores/pos.store.js`
   - Agregar debounce en búsqueda (300ms)
   - Cache local de productos frecuentes
   - Detectar pérdida de conexión

4. [ ] Agregar a `frontend/src/App.vue`
   - Indicador de conexión online/offline ✅ (ya implementado)
   - Verificación de salud del servidor cada 30s ✅ (ya implementado)
   - Auto-retry con backoff exponencial

---

### CORRECCIÓN 5: SISTEMA DE NOTIFICACIONES FLOTANTES (TOASTS)
**Prioridad:** 🟠 ALTA | **Tiempo:** 2 horas | **Impacto:** Alto (UX)

#### Problema:
- alert() nativo del navegador es intrusivo
- confirm() es feo y anticuado
- Sin feedback visual de acciones completadas

#### Solución implementada:
✅ Creado: `frontend/src/composables/useToast.js`
✅ Creado: `frontend/src/components/ToastContainer.vue`
✅ Actualizado: `frontend/src/App.vue`

#### Próximos pasos:
1. [ ] Actualizar TODOS los .vue para reemplazar alert() con useToast()
   - [ ] `frontend/src/views/PosView.vue`
   - [ ] `frontend/src/views/FiadosView.vue`
   - [ ] `frontend/src/views/InventoryView.vue`
   - [ ] `frontend/src/views/ClientesView.vue`
   - [ ] `frontend/src/views/ProveedoresView.vue`
   - [ ] `frontend/src/views/UsuariosView.vue`
   - [ ] `frontend/src/views/ComprasView.vue`
   - [ ] `frontend/src/views/ReportesView.vue`

**Ejemplo de reemplazo:**
```javascript
// ❌ ANTES
alert('Producto agregado')

// ✅ DESPUÉS
const { success } = useToast()
success('Producto agregado al carrito')
```

---

### CORRECCIÓN 6: REGISTRO DE USUARIO EN HISTORIAL DE VENTAS
**Prioridad:** 🟠 ALTA | **Tiempo:** 1-2 horas | **Impacto:** Medio

#### Problema:
- Usuario que realizó venta no se muestra claramente
- Imposible saber quién hizo qué venta

#### Solución:
1. [ ] Verificar BD - campo usuario_id ya existe en tabla ventas ✅

2. [ ] Actualizar `backend/controllers/historial.controller.js`
   - Verificar que retorna usuario_nombre en todas las respuestas
   - Crear: `getHistorialPorUsuario(req, res)` - GET `/api/historial/usuario/:usuario_id`
   - Crear: `getResumenVentasUsuario(req, res)` - GET `/api/historial/usuario/:usuario_id/resumen`

3. [ ] Actualizar `backend/routes/historial.routes.js`
   - Registrar nuevas rutas

4. [ ] Actualizar `frontend/src/views/MiHistorialView.vue`
   - Agregar columna "Usuario" si es ADMIN
   - Filtro por usuario (solo ADMIN)

5. [ ] Actualizar `frontend/src/views/ReportesView.vue`
   - Nueva sección: "Desempeño de Vendedores"
   - Tabla: Usuario | Total Ventas | Cantidad | Ticket Promedio

---

### CORRECCIÓN 7: GENERACIÓN DE EJECUTABLE E INSTALADOR PROFESIONAL
**Prioridad:** 🟡 MEDIA | **Tiempo:** 4-5 horas | **Impacto:** Distribución

#### Objetivo:
Generar archivo `.exe` profesional e instalador que:
- No requiere Node.js instalado
- BD SQLite persistente en máquina local
- Acceso directo en Escritorio y Menú Inicio
- Desinstalador limpio

#### Solución:
1. [ ] Crear `BUILD_WINDOWS_INSTALLER.bat`
   - Build frontend
   - Package con pkg
   - Generar NSIS installer

2. [ ] Crear `scripts/build-installer.js`
   - Validar compatibilidad
   - Minificar assets
   - Generar hash de integridad

3. [ ] Crear `installer.nsi` (NSIS Script)
   - Instalador profesional Windows
   - Crear carpeta en Program Files
   - Accesos directos
   - Desinstalación limpia

4. [ ] Actualizar `package.json`
   ```json
   "scripts": {
     "build:exe": "node scripts/build-installer.js",
     "package:nsis": "makensis installer.nsi",
     "release": "npm run build:exe && npm run package:nsis"
   }
   ```

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### **DÍA 1 (Hoy): ESTABILIDAD**
- [ ] 10:00 - 11:30: Corrección 4 (Estabilidad)
- [ ] 11:30 - 13:00: Corrección 1 (Validaciones)
- [ ] 14:00 - 15:30: Testing y verificación

**Objetivo:** Sistema sin crashes, validaciones básicas funcionando

### **DÍA 2: UX Y EXPERIENCIA**
- [ ] 10:00 - 12:00: Corrección 5 (Toasts) - reemplazar alert()
- [ ] 12:00 - 13:30: Corrección 6 (Usuario en historial)
- [ ] 14:00 - 15:30: Testing

**Objetivo:** Interfaz moderna, usuario visible en historial

### **DÍA 3: FUNCIONALIDAD CRÍTICA**
- [ ] 10:00 - 12:30: Corrección 2 (Fiados mejorados)
- [ ] 12:30 - 14:00: Corrección 3 (Precios por proveedor)
- [ ] 14:00 - 16:00: Testing completo

**Objetivo:** Módulos de negocio correctos y robustos

### **DÍA 4: DISTRIBUCIÓN**
- [ ] 10:00 - 14:00: Corrección 7 (Ejecutable e Instalador)
- [ ] 14:00 - 16:00: Testing del instalador
- [ ] 16:00 - 17:00: Documentación final

**Objetivo:** Producto listo para distribución

---

## 🔐 CHECKLIST DE VALIDACIÓN

### Antes de cada commit:
- [ ] `npm run build` (frontend) sin errores
- [ ] `npm start` (backend) inicia sin errores
- [ ] No hay `alert()` ni `confirm()` en el código
- [ ] Todas las validaciones retornan mensajes claros
- [ ] Cálculos se redondean a 2 decimales
- [ ] Transacciones en operaciones críticas
- [ ] Errores registrados en auditoría
- [ ] Tests unitarios pasan

---

## 🎯 MÉTRICAS DE ÉXITO

✅ Validaciones: 100% de formularios validados
✅ Cálculos: 0 errores de punto flotante
✅ Fiados: Lógica correcta (pago < total = fiado)
✅ UX: 0 alert() nativos
✅ Historial: Usuario visible en 100% de transacciones
✅ Estabilidad: 0 crashes en 8 horas de uso
✅ Distribución: EXE funcional en máquina sin Node.js

---

## 📋 ARCHIVOS A CREAR (RESUMEN)

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `frontend/src/composables/useToast.js` | ✅ Hecho | Sistema de toasts |
| `frontend/src/composables/useValidation.js` | ✅ Hecho | Validaciones frontend |
| `frontend/src/composables/useCalculos.js` | ✅ Hecho | Cálculos precisos |
| `frontend/src/composables/useFiados.js` | ✅ Hecho | Lógica de fiados |
| `frontend/src/components/ToastContainer.vue` | ✅ Hecho | Componente toasts |
| `backend/middleware/validation.js` | ✅ Hecho | Validaciones backend |
| `frontend/src/components/ModalRefinanciarCredito.vue` | ⏳ Pendiente | Modal para refinanciar |
| `frontend/src/components/ModalPreciosProveedor.vue` | ⏳ Pendiente | Modal de precios |
| `scripts/build-installer.js` | ⏳ Pendiente | Build script |
| `installer.nsi` | ⏳ Pendiente | Instalador NSIS |
| `BUILD_WINDOWS_INSTALLER.bat` | ⏳ Pendiente | Script batch |

---

## 📋 ARCHIVOS A ACTUALIZAR (RESUMEN)

| Archivo | Prioridad | Cambios | Estado |
|---------|-----------|---------|--------|
| `backend/controllers/ventas.controller.js` | 🔴 | Validaciones + cálculos | ⏳ |
| `backend/controllers/creditos.controller.js` | 🔴 | Fiados + refinanciamiento | ⏳ |
| `backend/controllers/productos.controller.js` | 🟠 | Precios por proveedor | ⏳ |
| `backend/config/database.js` | 🔴 | Optimización | ⏳ |
| `frontend/src/views/PosView.vue` | 🔴 | Validaciones + toasts | ⏳ |
| `frontend/src/views/FiadosView.vue` | 🔴 | Fiados + refinanciamiento | ⏳ |
| `frontend/src/views/InventoryView.vue` | 🟠 | Precios por proveedor | ⏳ |
| `frontend/src/App.vue` | 🔴 | ToastContainer + healthcheck | ✅ |
| `frontend/src/stores/pos.store.js` | 🔴 | Validación + debounce | ⏳ |

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Hoy mismo:**
   - [ ] Revisar composables ya creados
   - [ ] Actualizar `backend/controllers/ventas.controller.js` con validaciones
   - [ ] Reemplazar alert() en `PosView.vue` con useToast()
   - [ ] Commit: "feat: Validaciones, cálculos y toasts implementados"

2. **Mañana:**
   - [ ] Completar corrección 2 (Fiados)
   - [ ] Completar corrección 6 (Historial de usuario)
   - [ ] Commit: "feat: Módulo de fiados mejorado y usuario en historial"

3. **Próximos días:**
   - [ ] Corrección 3 (Precios por proveedor)
   - [ ] Corrección 7 (Ejecutable)

---

**📌 Nota:** Este plan es detallado pero flexible. Si encuentras bloqueadores, ajusta el orden pero mantén las prioridades claras.

**🔒 Compatibilidad garantizada:** Node.js v12.22.12 + Windows 7 32bits en todo el código.

