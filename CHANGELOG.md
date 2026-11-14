# CHANGELOG - Sistema POS Ferretería

## Versión 2.0.0 - 2026-11-14

### 🎯 SISTEMA COMPLETO DE CRÉDITOS/FIADOS

#### ✅ Implementado completamente:
- **Módulo de Créditos/Fiados** reemplazando el método de pago por tarjeta
- **Tabla `creditos`**: Registro completo de deudas con estados (PENDIENTE, PAGADO, VENCIDO, CANCELADO)
- **Tabla `pagos_creditos`**: Historial de abonos y pagos parciales
- **Triggers automáticos**: Actualización de saldos de clientes al crear créditos o registrar pagos
- **Validación obligatoria**: Las ventas a crédito requieren cliente registrado (no genérico)

#### 📋 Endpoints API de Créditos:
- `GET /api/creditos` - Lista de créditos con filtros (estado, cliente)
- `GET /api/creditos/:id` - Detalle de crédito con historial de pagos
- `GET /api/creditos/resumen` - Resumen de créditos por cliente
- `POST /api/creditos/pagar` - Registrar pago/abono a crédito
- `GET /api/creditos/cliente/:id/pagos` - Historial de pagos del cliente
- `POST /api/creditos/:id/cancelar` - Cancelar crédito (solo sin pagos)

---

### 📊 MÓDULO DE HISTORIAL COMPLETO

#### ✅ Implementado:
- **Historial de Transacciones**: Vista unificada de ventas y compras
- **Historial de Ventas**: Con filtros avanzados y métricas
- **Historial de Auditoría**: Rastreo completo de acciones del sistema
- **Historial de Kardex**: Movimientos de inventario detallados
- **Historial por Cliente**: Compras, créditos y resúmenes

#### 📋 Endpoints API de Historial:
- `GET /api/historial/transacciones` - Historial completo (ventas + compras)
- `GET /api/historial/ventas` - Historial de ventas con totales
- `GET /api/historial/auditoria` - Log de auditoría del sistema
- `GET /api/historial/kardex` - Movimientos de inventario
- `GET /api/historial/cliente/:id` - Historial completo del cliente

#### 🔐 Permisos por Rol:
- **VENDEDOR**: Ve solo sus propias ventas
- **ADMIN/ROOT**: Acceso completo a todo el historial

---

### 🐛 CORRECCIONES CRÍTICAS

#### ✅ Error SQL corregido:
- **Problema**: `SQLITE_ERROR: no such column: monto_tarjeta`
- **Solución**: Actualizada tabla `ventas` eliminando `monto_tarjeta` y agregando `monto_credito`
- **Archivos corregidos**:
  - `backend/controllers/reportes.controller.js`
  - `database/schema.sql`
  - Script de migración automática creado

#### ✅ Error de JOIN corregido:
- **Problema**: `SQLITE_ERROR: no such column: c.nombre`
- **Solución**: Corregido a `c.nombre_razon_social` en todas las consultas de ventas e historial

#### ✅ Error NOT NULL corregido:
- **Problema**: `NOT NULL constraint failed: detalle_ventas.codigo_producto`
- **Solución**: Validación y extracción correcta del `codigo_sku_interno` del producto

#### ✅ Error de middleware corregido:
- **Problema**: `TypeError: Router.use() requires a middleware function`
- **Solución**: Corregidos imports en rutas de créditos e historial (`authenticateToken`, `requireRole`)

---

### 🔧 CRUD COMPLETO VERIFICADO

#### ✅ Productos (`/api/productos`):
- ✅ Crear producto con imagen
- ✅ Leer/Listar con filtros y paginación
- ✅ Actualizar producto
- ✅ Ajustar stock manualmente
- ✅ Búsqueda rápida
- ✅ Productos frecuentes

#### ✅ Clientes (`/api/clientes`):
- ✅ Crear cliente
- ✅ Leer/Listar con paginación
- ✅ Actualizar cliente
- ✅ Búsqueda rápida
- ✅ Historial de compras
- ✅ Productos frecuentes por cliente
- ✅ Control de saldo de crédito

#### ✅ Proveedores (`/api/proveedores`):
- ✅ Crear proveedor
- ✅ Leer/Listar
- ✅ Actualizar proveedor
- ✅ Desactivar (soft delete)

#### ✅ Usuarios (`/api/usuarios`):
- ✅ Crear usuario con roles
- ✅ Leer/Listar
- ✅ Actualizar usuario
- ✅ Desactivar usuario
- ✅ Protección de último usuario ROOT

#### ✅ Ventas (`/api/ventas`):
- ✅ Crear venta con validación de stock
- ✅ Leer/Listar con paginación
- ✅ Detalle de venta con detalles y crédito
- ✅ Anular venta (devuelve stock)
- ✅ Soporte para pagos mixtos
- ✅ Integración automática con créditos

---

### 📁 ESTRUCTURA DE BASE DE DATOS

#### Tablas principales:
- `usuarios` - Control de acceso y roles
- `clientes` - Cartera de clientes con saldos
- `productos` - Inventario con control de stock
- `categorias` - Clasificación de productos
- `proveedores` - Gestión de proveedores
- `ventas` - Registro de ventas
- `detalle_ventas` - Ítems de cada venta
- `creditos` ⭐ NUEVO - Gestión de fiados
- `pagos_creditos` ⭐ NUEVO - Abonos a créditos
- `kardex` - Movimientos de inventario
- `compras_proveedores` - Compras
- `detalle_compras` - Ítems de compras
- `auditoria` - Log de auditoría
- `cortes_caja` - Cierres de caja

#### Vistas optimizadas:
- `v_productos_stock_bajo` - Productos con stock crítico
- `v_ventas_diarias` - Resumen diario de ventas
- `v_productos_mas_vendidos` - Top productos
- `v_historial_clientes` - Resumen de compras por cliente
- `v_creditos_pendientes` ⭐ NUEVO - Créditos activos
- `v_historial_transacciones` ⭐ NUEVO - Transacciones unificadas
- `v_alertas_inventario` ⭐ NUEVO - Alertas de stock

#### Triggers automáticos:
- Actualización de stock en ventas/compras
- Registro automático de kardex
- Actualización de timestamps
- Creación automática de créditos ⭐ NUEVO
- Actualización de saldos al pagar ⭐ NUEVO

---

### 🚀 INSTALACIÓN EN WINDOWS 7 32-BITS

#### Pasos para instalar en producción:

1. **Clonar o actualizar repositorio:**
```bash
cd C:\ruta\ferreteria
git pull origin main
```

2. **Ejecutar instalador automático:**
```bash
instalar.bat
```

El script automáticamente:
- ✅ Verifica Node.js
- ✅ Instala dependencias
- ✅ Ejecuta migración de base de datos
- ✅ Compila frontend
- ✅ Inicia servidor en puerto 3000

3. **Acceder al sistema:**
- URL: `http://localhost:3000`
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **IMPORTANTE**: Cambiar contraseña después del primer acceso.

---

### 📦 MÉTODOS DE PAGO ACTUALIZADOS

#### Métodos disponibles:
- ✅ **EFECTIVO** - Pago en efectivo
- ✅ **QR** - Pago por código QR
- ✅ **CREDITO** ⭐ - Venta a crédito/fiado (requiere cliente registrado)
- ✅ **MIXTO** - Combinación de métodos (efectivo + QR + crédito)

#### ❌ Eliminado:
- ~~TARJETA~~ - Reemplazado por CREDITO

---

### 🔒 SEGURIDAD Y VALIDACIONES

#### Validaciones implementadas:
- ✅ Autenticación JWT en todas las rutas protegidas
- ✅ Autorización por roles (VENDEDOR, ADMIN, ROOT)
- ✅ Validación de stock antes de vender
- ✅ Validación de cliente registrado para créditos
- ✅ Protección contra eliminación de último usuario ROOT
- ✅ Auditoría de todas las operaciones críticas
- ✅ Transacciones SQLite para integridad de datos

---

### 📝 NOTAS TÉCNICAS

#### Tecnologías utilizadas:
- **Backend**: Node.js + Express.js
- **Base de datos**: SQLite3 (local, offline)
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: bcryptjs, helmet, express-rate-limit
- **Compatible con**: Windows 7 32-bits

#### Scripts disponibles:
- `npm start` - Iniciar servidor producción
- `npm run dev` - Iniciar servidor desarrollo (con hot-reload)
- `node scripts/migrate-database.js` - Aplicar migración manualmente

---

### 🎉 RESUMEN DE FUNCIONALIDADES

✅ **Sistema completo de Créditos/Fiados** con pagos parciales  
✅ **Historial completo** de todas las transacciones  
✅ **Todos los errores SQLite corregidos**  
✅ **CRUD completo** en todos los módulos  
✅ **Control de inventario** con kardex automático  
✅ **Gestión de usuarios y permisos** por rol  
✅ **Reportes y dashboards** con métricas en tiempo real  
✅ **Compatible con Windows 7 32-bits**  
✅ **Base de datos local** (offline-first)  

---

**Desarrollado para ferretería - Sistema POS offline**  
**Versión optimizada para Windows 7 32-bits**
