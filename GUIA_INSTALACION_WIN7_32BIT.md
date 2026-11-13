# 🖥️ Guía de Instalación - Windows 7 32-bits
## Sistema POS Ferretería - Versión Compatible

---

## ✅ Requisitos Mínimos

- **Windows 7 SP1** (32-bits o 64-bits)
- **500 MB** de espacio libre en disco
- **2 GB** de RAM recomendado
- **Navegador web** (Internet Explorer 11+, Firefox, Chrome)

---

## 📥 Paso 1: Instalar Node.js LTS (v12)

### Opción A: Instalador (Recomendado para principiantes)

1. Visite: https://nodejs.org/en/download/
2. Descargue la versión **v12.22.12 LTS**
3. Ejecute el instalador `.msi` de 32-bits
4. Siga los pasos del instalador (use opciones por defecto)
5. Reinicie la computadora

### Opción B: Portátil (Recomendado para Win7)

1. Descargue: `node-v12.22.12-win-x86.zip` desde nodejs.org
2. Extraiga en: `C:\nodejs` (o donde prefiera)
3. Agregue a PATH del sistema:
   - Click derecho en "Mi Computadora" → Propiedades
   - Variables de entorno
   - Agregue `C:\nodejs` a PATH

### Verificar instalación:

Abra `cmd` (Símbolo del sistema) y ejecute:
```
node --version
npm --version
```

Debe mostrar versiones (ejemplo: v12.22.12, 6.14.16)

---

## 📥 Paso 2: Descargar e Instalar Ferretería POS

### Método 1: Desde Git (Si tiene Git instalado)

```bash
git clone <url-del-repositorio>
cd ferreteria
```

### Método 2: Descarga directa

1. Descargue el archivo `.zip` del proyecto
2. Extraiga en una carpeta (ejemplo: `C:\ferreteria`)
3. Abra la carpeta

---

## 🚀 Paso 3: Ejecutar Instalación

1. Navegue a la carpeta de la ferretería
2. **Doble clic** en: `setup_production_win7.bat`
3. Espere a que complete (3-5 minutos)
4. La ventana se cerrará automáticamente

**Esto instalará:**
- ✓ Dependencias del backend
- ✓ Dependencias del frontend
- ✓ Compilación del frontend
- ✓ Base de datos SQLite
- ✓ Archivo de configuración (.env)

---

## 🎯 Paso 4: Iniciar el Sistema

### Opción A: Fácil (Recomendado)

1. **Doble clic** en: `start_pos.bat`
2. Se abrirá automáticamente el navegador en `http://localhost:3000`
3. Espere 3-5 segundos para que cargue

### Opción B: Línea de comandos

1. Abra `cmd` en la carpeta del proyecto
2. Ejecute: `npm start`
3. Abra navegador en: `http://localhost:3000`

---

## 🔐 Paso 5: Acceder al Sistema

### Credenciales por defecto:

**Usuario Administrador (ROOT):**
- Usuario: `admin`
- Contraseña: `admin123`

**Usuario Vendedor:**
- Usuario: `vendedor1`
- Contraseña: `1234`

⚠️ **IMPORTANTE**: Cambie estas contraseñas inmediatamente después del primer acceso.

---

## 📋 Primeros Pasos en el Sistema

1. **Login**: Ingrese con usuario `admin`
2. **Cambiar contraseña**: Menú superior derecha → Cambiar contraseña
3. **Cargar productos**: Ir a "Inventario" → Crear productos
4. **Crear usuarios**: Menú "Usuarios" (solo ROOT)
5. **Realizar una venta**: Ir a "POS" (Mostrador)

---

## 🛑 Detener el Sistema

### Opción A: Fácil
- **Doble clic** en: `stop_pos.bat`

### Opción B: Línea de comandos
- Presione `Ctrl+C` en la ventana del servidor

---

## 🔧 Solución de Problemas

### Error: "Node.js no encontrado"

**Solución:**
1. Verifique que Node.js está instalado: `node --version` en cmd
2. Si no está instalado, descargue desde nodejs.org v12 LTS
3. Agregue Node.js al PATH del sistema
4. Reinicie la computadora

### Error: "Puerto 3000 ya en uso"

**Solución:**
1. Ejecute `stop_pos.bat`
2. O abra `cmd` y ejecute: `netstat -ano | findstr ":3000"`
3. Luego: `taskkill /PID <número> /F`

### El navegador no abre automáticamente

**Solución:**
1. Abra el navegador manualmente
2. Vaya a: `http://localhost:3000`
3. Si no carga, espere 5 segundos más

### Base de datos corrupta

**Solución:**
1. Cierre el sistema (`stop_pos.bat`)
2. Navegue a carpeta `database/`
3. Haga backup de `ferreteria.db`
4. Elimine `ferreteria.db`, `ferreteria.db-shm`, `ferreteria.db-wal`
5. Reinicie el sistema (se recrearála base de datos)

---

## 💾 Backup de Datos

### Realizar backup manual:

```bash
node scripts/backup.js
```

Los backups se guardan en: `database/backups/`

### Restaurar desde backup:

1. Cierre el sistema
2. Vaya a `database/`
3. Elimine `ferreteria.db` y archivos relacionados
4. Copie el backup deseado: `ferreteria.db.backup.XXXXXX.db`
5. Cambie el nombre a: `ferreteria.db`
6. Reinicie el sistema

---

## 📊 Archivos Importantes

```
ferreteria/
├── start_pos.bat           ← Iniciar sistema (recomendado)
├── start_pos_win7.bat      ← Alternativa simple
├── stop_pos.bat            ← Detener servidor
├── setup_production_win7.bat ← Instalación
├── database/
│   ├── ferreteria.db       ← Base de datos (NO eliminar)
│   └── backups/            ← Copias de seguridad
├── frontend/dist/          ← Sistema web compilado
├── backend/                ← Servidor API
└── .env                    ← Configuración (NO compartir)
```

---

## 🌐 Características

✅ 100% Offline - Sin conexión a internet requerida  
✅ Búsqueda ultrarrápida de productos  
✅ Cantidades decimales (metros, kilos)  
✅ Múltiples métodos de pago  
✅ Reportes en tiempo real  
✅ Transacciones ACID garantizadas  
✅ Trazabilidad completa (Kardex)  
✅ Control de usuarios por rol  
✅ Respaldo automático de datos  

---

## 📞 Soporte

Si encuentra problemas:

1. Verifique que Node.js v12 está instalado
2. Ejecute `setup_production_win7.bat` nuevamente
3. Verifique el archivo de log del servidor
4. Consulte esta guía en la sección "Solución de Problemas"

---

**Última actualización**: Noviembre 2026  
**Versión del sistema**: 1.0.0  
**Plataforma**: Windows 7 32-bits + SQLite3
