# 🏪 FERRETERÍA POS - Sistema de Punto de Venta

Sistema completo de Punto de Venta (POS) y Control de Inventarios diseñado específicamente para ferreterías en Bolivia.

## ✅ **COMPATIBLE CON WINDOWS 7 DE 32 BITS**

Este sistema está optimizado para funcionar en **Windows 7 de 32 bits con Node.js 12.22.12**.

---

## 🚀 INSTALACIÓN RÁPIDA EN WINDOWS 7 32-BITS

### 📋 Requisitos Previos

- **Windows 7 de 32 bits**
- **Node.js 12.22.12 (32-bit)** - [Descargar aquí](https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi)

### ⚡ Instalación en 3 Pasos

#### 1️⃣ Descargar el proyecto

**Opción A - Con Git:**
```bash
git clone https://github.com/issociety123ea/ferreteria32bit.git
cd ferreteria32bit
```

**Opción B - Sin Git:**
- Descarga el ZIP desde: https://github.com/issociety123ea/ferreteria32bit/archive/refs/heads/main.zip
- Extrae el contenido en una carpeta

#### 2️⃣ Ejecutar el instalador

Haz **doble clic** en:
```
instalar.bat
```

El instalador automáticamente:
- ✅ Verifica Node.js y NPM
- ✅ Verifica el frontend compilado
- ✅ Crea los directorios necesarios
- ✅ Instala las dependencias del backend
- ✅ Crea la configuración (.env)
- ✅ **INICIA EL SERVIDOR AUTOMÁTICAMENTE**

#### 3️⃣ Acceder al sistema

Una vez que el instalador termine, el servidor se iniciará automáticamente.

**Abre tu navegador en:**
```
http://localhost:3000
```

**Credenciales por defecto:**
- Usuario: `admin` | Contraseña: `admin123` (Administrador)
- Usuario: `vendedor1` | Contraseña: `1234` (Vendedor)

---

## 🎯 Características Principales

### 📦 Gestión de Inventario
- Control completo de productos con SKU
- Categorías personalizables
- Alertas de stock bajo
- Kardex de movimientos
- Imágenes de productos
- Control de unidades de medida

### 💰 Punto de Venta (POS)
- Interfaz rápida e intuitiva
- Búsqueda instantánea de productos
- Productos más vendidos destacados
- Múltiples métodos de pago (Efectivo, Tarjeta, QR)
- Cálculo automático de cambio
- Impresión térmica de recibos (80mm)
- Selección de clientes

### 👥 Gestión de Clientes
- Registro completo de clientes
- Tipos: Normal, Frecuente, Mayorista, Obra
- Historial de compras por cliente
- Productos frecuentes por cliente
- NIT/CI y datos de contacto

### 📊 Reportes y Estadísticas
- Ventas diarias y mensuales
- Corte de caja por turno
- Productos más vendidos
- Stock bajo con costos de reposición
- Ganancia neta en tiempo real
- Dashboards visuales

### 🛒 Gestión de Compras
- Registro de compras a proveedores
- Actualización automática de inventario
- Control de costos
- Historial completo

### 👤 Gestión de Usuarios
- 3 niveles de acceso: ROOT, ADMIN, VENDEDOR
- Control de permisos por rol
- Historial de ventas por vendedor
- Auditoría de acciones

### 🔒 Seguridad
- Autenticación JWT
- Encriptación de contraseñas (bcrypt)
- Rate limiting
- Helmet para protección de headers
- Roles y permisos

---

## 📁 Estructura del Proyecto

```
ferreteria-pos/
├── backend/              # Servidor Node.js + Express
│   ├── config/          # Configuración (DB, Auth)
│   ├── controllers/     # Lógica de negocio
│   ├── middleware/      # Autenticación y validación
│   └── routes/          # Rutas de la API
├── frontend/
│   ├── dist/           # ⭐ Frontend compilado (Vue.js)
│   └── src/            # Código fuente (solo para desarrollo)
├── database/            # Base de datos SQLite
│   └── schema.sql      # Esquema de la BD
├── uploads/             # Imágenes de productos
├── instalar.bat        # 🚀 Instalador automático
├── INICIAR.bat         # Iniciar servidor manualmente
└── package.json        # Dependencias del backend
```

---

## 🔧 Uso Diario

### Iniciar el Sistema

Ejecuta **doble clic** en:
```
INICIAR.bat
```

O desde la terminal:
```bash
npm start
```

### Detener el Sistema

Presiona `CTRL+C` en la ventana del servidor.

---

## 💾 Base de Datos

- **Motor:** SQLite3 (sin servidor, archivo local)
- **Ubicación:** `database/ferreteria.db`
- **Inicialización:** Automática en el primer inicio
- **Backups:** `database/backups/`

### Usuarios por Defecto

El sistema crea automáticamente:

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| admin | admin123 | ROOT | Acceso total |
| vendedor1 | 1234 | VENDEDOR | Solo POS e historial |

---

## 🖨️ Configuración de Impresora Térmica

El sistema genera recibos optimizados para impresoras térmicas de **80mm**.

### Navegadores Recomendados:
- **Google Chrome** (mejor compatibilidad con impresión)
- Mozilla Firefox

### Configuración de Impresión:
1. Abre Chrome/Firefox
2. Al imprimir, selecciona tu impresora térmica
3. Configuración:
   - Tamaño: 80mm (ancho)
   - Sin márgenes
   - Orientación: Vertical

---

## 🐛 Solución de Problemas

### ❌ "Usuario y contraseña son requeridos"

**Causa:** Caché del navegador con versión antigua.

**Solución:**
1. Presiona `CTRL + SHIFT + DELETE`
2. Borra caché y cookies
3. Cierra completamente el navegador
4. Vuelve a abrir `http://localhost:3000`

### ❌ "No se puede conectar al servidor"

**Solución:**
1. Verifica que el servidor esté corriendo (ventana de `INICIAR.bat` abierta)
2. Verifica que la URL sea exactamente: `http://localhost:3000`

### ❌ "Error al instalar dependencias"

**Solución:**
```bash
npm cache clean --force
npm install --production
```

### ❌ "Base de datos bloqueada"

**Solución:**
1. Cierra todas las ventanas del sistema
2. Elimina los archivos: `database/*.db-shm` y `database/*.db-wal`
3. Reinicia el servidor

---

## 📱 Compatibilidad

### Navegadores Compatibles:
- ✅ Google Chrome 90+
- ✅ Mozilla Firefox 88+
- ✅ Microsoft Edge 90+
- ⚠️ Internet Explorer NO soportado

### Sistemas Operativos:
- ✅ Windows 7 de 32 bits (Optimizado)
- ✅ Windows 10/11 de 32/64 bits
- ✅ Windows Server 2012+

---

## 🔄 Actualización del Sistema

Para actualizar a la última versión:

```bash
git pull origin main
npm install --production
```

Luego ejecuta `INICIAR.bat`

---

## 📞 Soporte y Documentación

### Documentación Adicional
- `INSTRUCCIONES_WINDOWS7_32BITS.md` - Guía detallada para Windows 7
- `database/schema.sql` - Estructura completa de la base de datos

### Recursos
- Repositorio: https://github.com/issociety123ea/ferreteria32bit
- Node.js 12.22.12: https://nodejs.org/dist/v12.22.12/

---

## 🛡️ Licencia

MIT License - Libre para uso comercial y personal

---

## 👨‍💻 Desarrollo

### Tecnologías Utilizadas

**Backend:**
- Node.js 12.22.12
- Express 4.17
- SQLite3 5.0
- JWT + bcrypt
- Multer (subida de imágenes)

**Frontend:**
- Vue.js 3.3
- Vue Router 4.2
- Pinia 2.1 (State Management)
- Tailwind CSS 3.4
- Heroicons
- Axios

**Pre-compilado con:**
- Vite 5 (compilado en Node.js 18+, ejecuta en Node.js 12)

---

## 🎉 ¡Sistema Listo!

Tu sistema POS está completamente instalado y listo para usar.

**¡Buenas ventas!** 🚀
