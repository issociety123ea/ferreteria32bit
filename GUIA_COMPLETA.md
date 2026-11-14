# 🎯 GUÍA DE INSTALACIÓN Y USO - FERRETERÍA POS

## 📋 Requisitos Previos

- **Windows 7, 8, 10 o 11** (64 bits recomendado)
- **Navegador web moderno** (Chrome, Edge, Firefox)
- **2 GB de RAM mínimo**
- **500 MB de espacio libre** (sin contar datos)

---

## 🚀 PRIMERA INSTALACIÓN

### Paso 1: Ejecutar Instalador

1. Abre el directorio de la aplicación
2. **Haz doble clic en: `INSTALAR.bat`**
3. La ventana cmd mostrará el progreso
4. **Espera a que termine** (puede tardar 2-3 minutos)
5. Cuando vea el mensaje ✅ completado, presiona Enter

### Paso 2: Crear Atajo en Escritorio

1. Abre el directorio de la aplicación
2. **Haz doble clic en: `CREAR_ATAJO_ESCRITORIO.bat`**
3. Se creará un ícono en tu escritorio llamado "Ferretería POS"

### Paso 3: ¡Listo!

- **Opción A**: Haz doble clic en el ícono de "Ferretería POS" en tu escritorio
- **Opción B**: Abre el directorio y haz doble clic en `INICIAR_SIN_TERMINAL.vbs`

---

## ✅ USO DIARIO

### Para Iniciar la Aplicación

**Simplemente haz doble clic en el ícono "Ferretería POS" en tu escritorio**

- ✅ No necesitas abrir terminal
- ✅ Se inicia automáticamente en tu navegador
- ✅ Crea backup automáticamente
- ✅ Todo listo para usar

### Credenciales de Acceso

**Usuario de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`
- Rol: ROOT (Acceso total)

---

## 📊 FUNCIONALIDADES PRINCIPALES

### 1. POS (Punto de Venta)
- ✅ Buscar productos por nombre o SKU
- ✅ Agregar/remover items del carrito
- ✅ **Métodos de pago:**
  - 💰 **Efectivo** - Pago al contado con cambio automático
  - 📱 **QR** - Pago por código QR
  - 📝 **Fiado** - Registro automático en "Fiados / Al Anote"
- ✅ Impresión automática de recibo

### 2. Fiados / Al Anote
- ✅ Ver todos los créditos pendientes
- ✅ Registrar pagos parciales
- ✅ Cancelar créditos
- ✅ Ver historial de pagos
- ✅ **Los fiados se crean automáticamente al vender en POS**

### 3. Inventario
- ✅ Crear, editar y eliminar productos
- ✅ Gestionar stock
- ✅ Filtrar por categoría
- ✅ Ver productos con stock bajo

### 4. Clientes
- ✅ **CRUD Completo**: Crear, leer, editar, eliminar
- ✅ Búsqueda por nombre, NIT, teléfono
- ✅ Tipos de cliente (Normal, Frecuente, Mayorista, Obra)
- ✅ Historial de compras

### 5. Proveedores
- ✅ **CRUD Completo**: Crear, leer, editar, eliminar
- ✅ Gestión de contactos
- ✅ Datos de proveedores (teléfono, email, dirección)

### 6. Usuarios
- ✅ **CRUD Completo**: Crear, leer, editar, eliminar
- ✅ Roles (Vendedor, Admin, Root)
- ✅ Gestión de permisos

### 7. Reportes
- ✅ Ventas diarias
- ✅ Productos más vendidos
- ✅ Stock bajo
- ✅ Resumen general

---

## 💾 COPIAS DE SEGURIDAD (BACKUPS)

### Automático
- ✅ Se crea **automáticamente cada vez que inicia** la aplicación
- ✅ Respaldo de **base de datos + imágenes**
- ✅ Se guardan en la carpeta `backups\`
- ✅ Se mantienen las **últimas 30 copias**

### Manual
Para crear un backup manualmente:
1. Abre cmd en el directorio de la aplicación
2. Escribe: `node scripts/backup.js --create`
3. Para ver todos los backups: `node scripts/backup.js --list`

### Restaurar desde Backup
1. **Ubicación de backups**: Carpeta `backups\` dentro del directorio de la aplicación
2. **Archivos en el backup**:
   - `ferreteria.db` - Base de datos
   - `uploads/` - Imágenes de productos
   - `backup-info.json` - Información del backup

3. **Para restaurar**:
   - Copiar `ferreteria.db` a la carpeta `database\`
   - Copiar contenido de `uploads/` a la carpeta `uploads\`
   - Reiniciar la aplicación

---

## 🔐 SEGURIDAD

### Roles y Permisos

| Operación | Vendedor | Admin | Root |
|-----------|----------|-------|------|
| POS (Vender) | ✅ | ✅ | ✅ |
| Mi Historial | ✅ | ✅ | ✅ |
| Inventario | ❌ | ✅ | ✅ |
| Clientes | ❌ | ✅ | ✅ |
| Proveedores | ❌ | ✅ | ✅ |
| Compras | ❌ | ✅ | ✅ |
| Fiados | ❌ | ✅ | ✅ |
| Reportes | ❌ | ✅ | ✅ |
| Usuarios | ❌ | ❌ | ✅ |

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### "No puedo abrir la aplicación"
- ✅ Verifica que la ventana del navegador se abrió (espera 5 segundos)
- ✅ Si no, intenta: http://localhost:3000 manualmente

### "Error: Base de datos no encontrada"
- ✅ Ejecuta `INSTALAR.bat` nuevamente
- ✅ Verifica permisos de carpeta

### "No puedo crear productos/clientes"
- ✅ Verifica que tu usuario sea Admin o Root
- ✅ Intenta cerrar y abrir la aplicación nuevamente

### "Se perdieron datos"
- ✅ Los datos se respaldan automáticamente
- ✅ Abre la carpeta `backups\`
- ✅ Restaura desde el backup más reciente

### "Lentitud o errores"
- ✅ Cierra otras aplicaciones pesadas
- ✅ Reinicia la aplicación: Cierra el navegador y vuelve a hacer clic en el ícono
- ✅ Vacía la caché del navegador (Ctrl+Shift+Delete)

---

## 📞 SOPORTE

Para reportar problemas o sugerencias:
1. Guarda los detalles del error (screenshot si es posible)
2. Verifica los últimos backups disponibles
3. Intenta restaurar desde un backup anterior si es necesario

---

## ⚙️ MANTENIMIENTO

### Recomendaciones

- ✅ **Backup semanal**: Descarga una copia de la carpeta `backups\` a una unidad externa
- ✅ **Limpieza mensual**: Elimina backups muy antiguos si ocupan espacio
- ✅ **Verificación diaria**: Revisa que los reportes se vean correctamente

### Tareas Programadas (Opcional)

Para hacer backups a una hora específica:
1. Abre "Programador de tareas" de Windows
2. Crea una tarea para ejecutar `scripts/backup.js` diariamente a las 6 PM
3. Comando: `node "C:\ruta\scripts\backup.js" --create`

---

## 📝 NOTAS IMPORTANTES

⚠️ **NO elimines** las carpetas:
- `backend/` - Servidor
- `frontend/dist/` - Interfaz
- `database/` - Datos
- `scripts/` - Scripts de utilidad

⚠️ **Mantén siempre** backups en una ubicación segura

✅ **La aplicación es segura** para usar en producción si sigues estas guías

---

**Versión**: 1.0.0  
**Última actualización**: 2026-11-14  
**Desarrollado para**: Ferretería 32 Bits
