# 🚀 INSTALAR_COMPLETO_NODE12.bat - GUÍA COMPLETA

**Fecha**: 13 de Noviembre 2026  
**Script**: `INSTALAR_COMPLETO_NODE12.bat`  
**Propósito**: Instalación 100% automática en Windows 7 32-bits

---

## 📋 QUÉ HACE ESTE SCRIPT

Este script instala **TODO automáticamente** sin intervención manual:

### ✅ Paso 1: Verificar Permisos de Administrador
- Comprueba que se ejecute como administrador
- Si no: muestra instrucción para ejecutar como admin

### ✅ Paso 2: Crear Directorios
- Crea carpetas necesarias: `database`, `uploads`, `temp_installers`

### ✅ Paso 3: Instalar Visual C++ Build Tools (AUTOMÁTICO)
```
- Descarga: vs_buildtools.exe (~1.2 GB)
- Instala automáticamente en modo silencioso
- Incluye: Workload "Desktop development with C++"
- Tiempo: 20-30 minutos
- NO requiere intervención manual
```

### ✅ Paso 4: Instalar Python (si falta)
- Descarga Python 3.9 embebido
- Lo necesita node-gyp para compilar módulos nativos

### ✅ Paso 5: Verificar Node.js 12.22.12
- Comprueba que esté instalado
- Si no: instruye dónde descargarlo

### ✅ Paso 6: Instalar Dependencias Backend
- Ejecuta: `npm install --legacy-peer-deps --no-audit`
- Tiempo: 10-20 minutos

### ✅ Paso 7: Instalar Dependencias Frontend
- Ejecuta: `npm install` en carpeta frontend
- Tiempo: 5-10 minutos

### ✅ Paso 8: Forzar Vite v4 (CRÍTICO)
- Asegura que Vite sea v4 (no v5)
- v5 no funciona con Node.js 12
- Comando: `npm install vite@4 --force`

### ✅ Paso 9: Compilar Frontend
- Ejecuta: `npm run build`
- Genera archivos optimizados para producción
- Tiempo: 10-20 minutos

### ✅ Paso 10: Inicializar Base de Datos
- Ejecuta: `node scripts/init-database.js`
- Crea esquema SQLite3

### ✅ Paso 11: Crear Archivo .env
- Genera configuración de seguridad
- Crea JWT_SECRET aleatorio

### ✅ Paso 12: Crear Acceso Directo
- Crea icono en Escritorio: "Ferretería POS"
- Al hacer clic: inicia el sistema automáticamente

### ✅ Paso 13: Limpiar Archivos Temporales
- Elimina carpeta `temp_installers`
- Libera espacio en disco

---

## 🎯 CÓMO USAR

### Paso 1: Descargar Node.js 12.22.12

**IMPORTANTE**: Este script NO instala Node.js (se instala una sola vez).

Descargue e instale manualmente:
```
Link: https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi

Pasos:
1. Descargue el archivo .msi
2. Doble clic para ejecutar
3. Haga clic "Next" → "Next" → "Install"
4. Espere a que termine
5. Reinicie la computadora
```

### Paso 2: Ejecutar el Script

```batch
1. Haga clic derecho en: INSTALAR_COMPLETO_NODE12.bat
2. Seleccione: "Ejecutar como administrador"
3. Haga clic en "Sí" cuando se le pida
4. El script comienza automáticamente
```

### Paso 3: Esperar a que termine

```
⏱️ Tiempo total esperado: 60-90 minutos

Desglose:
- Visual C++ Build Tools: 20-30 minutos (primera vez)
- Backend dependencies: 10-20 minutos
- Frontend dependencies: 5-10 minutos
- Frontend build (Vite): 10-20 minutos
- Base de datos: 1-2 minutos
- Limpieza: 1-2 minutos
```

**IMPORTANTE**: 
- ❌ NO CIERRE LA VENTANA durante la instalación
- ❌ NO DESCONECTE LA COMPUTADORA
- ✅ Es normal ver mucho texto en la pantalla
- ✅ Es normal que tarde bastante (especialmente Visual C++)

### Paso 4: Cuando termine

La ventana mostrará:
```
✓✓✓ INSTALACIÓN COMPLETADA EXITOSAMENTE ✓✓✓

El sistema está LISTO PARA USAR

PARA INICIAR EL SISTEMA AHORA:
  Opción 1 (Recomendado):
    - Haga doble clic en: start_pos_win7.bat

  Opción 2:
    - Haga doble clic en icono "Ferretería POS" en Escritorio
```

### Paso 5: Iniciar el sistema

```batch
Doble clic en: start_pos_win7.bat
```

**Resultado**:
- Se abre navegador automáticamente
- URL: `http://localhost:3000`
- Login: `admin` / `admin123`

---

## 📊 QUÉ SE INSTALA AUTOMÁTICAMENTE

| Componente | Tamaño | Tiempo | Nota |
|-----------|--------|--------|------|
| Visual C++ Build Tools | ~1.2 GB | 20-30 min | Descarga + instala |
| Python 3.9 | ~100 MB | 2-3 min | Solo si falta |
| npm packages (backend) | ~200 MB | 10-20 min | - |
| npm packages (frontend) | ~300 MB | 5-10 min | - |
| Frontend build | ~50 MB | 10-20 min | Compilación Vite |
| SQLite3 database | ~1 MB | 1-2 min | - |
| **TOTAL** | **~1.8 GB** | **60-90 min** | Primero requiere espacio |

---

## ⚠️ REQUISITOS PREVIOS

### OBLIGATORIO: Node.js 12.22.12

**Debe estar instalado ANTES de ejecutar el script**

```
Link: https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi

Verificar instalación:
  Abra cmd y escriba: node --version
  
  Debería mostrar: v12.22.12
```

### Recomendado: Espacio en Disco

```
- Mínimo: 3 GB libres
- Recomendado: 5 GB libres

Verificar:
  Mi PC → C: (clic derecho) → Propiedades
  Ver espacio disponible
```

### Recomendado: Conexión a Internet

```
- Descarga: ~1.5 GB de archivos
- Velocidad: 5 Mbps (2 horas)
- Velocidad: 50 Mbps (20 minutos)
```

---

## 🔧 MENSAJES DE ERROR Y SOLUCIONES

### Error 1: "Requiere permisos de administrador"

```
Solución:
1. Haga clic derecho en INSTALAR_COMPLETO_NODE12.bat
2. Seleccione "Ejecutar como administrador"
3. Haga clic en "Sí"
```

### Error 2: "Node.js no está instalado"

```
Solución:
1. Descargue: https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
2. Ejecute el instalador
3. Reinicie la computadora
4. Ejecute el script nuevamente
```

### Error 3: "Error al descargar Visual C++ Build Tools"

```
Posible razón: Conexión a internet lenta o cortada

Soluciones:
1. Verifique conexión a internet
2. Espere 5 minutos
3. Intente ejecutar el script nuevamente

O descargue manualmente:
  https://visualstudio.microsoft.com/visual-cpp-build-tools/
  Seleccione: "Desktop development with C++"
  Instale
  Reinicie computadora
  Ejecute el script nuevamente
```

### Error 4: "Error al instalar backend" o "Error al compilar sqlite3"

```
Razón: Visual C++ Build Tools no se instaló correctamente

Soluciones:
1. Abra cmd como administrador
2. Escriba: npm install --build-from-source
3. Espere a que termine (10-20 minutos)
```

### Error 5: "Vite podría no funcionar óptimamente"

```
Advertencia: Vite v5 detectado (debería ser v4)

Solución automática:
  El script intenta instalarlo de todas formas
  Presione Enter para continuar
  Si sigue fallando:
    1. Abra cmd
    2. cd frontend
    3. npm install vite@4 --force
    4. cd ..
```

---

## ✅ VERIFICACIÓN

### Después de que termine, verifique:

```batch
1. Abra una nueva ventana de cmd
2. Escriba: node --version
   Resultado esperado: v12.22.12

3. Escriba: npm --version
   Resultado esperado: 6.x.x

4. Escriba: cd C:\Users\[tu-usuario]\Desktop\kkk\ferreteria
   (Ajuste la ruta según tu instalación)

5. Escriba: dir database\ferreteria.db
   Resultado esperado: ferreteria.db (archivo existe)

6. Escriba: npm start
   Resultado esperado: Servidor escuchando en puerto 3000
```

---

## 🚀 FLUJO DE INSTALACIÓN VISUAL

```
┌─────────────────────────────────────────────┐
│  INSTALAR_COMPLETO_NODE12.bat               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Verificar permisos de administrador        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Crear directorios necesarios               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Descargar e instalar Visual C++ (20-30 min)│
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Instalar Python (si falta)                 │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  npm install backend (10-20 min)            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  npm install frontend (5-10 min)            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Forzar Vite v4 (CRÍTICO para Node 12)      │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  npm run build (10-20 min)                  │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Inicializar SQLite3 database               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Crear archivo .env                         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Crear acceso directo en Escritorio         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  Limpiar archivos temporales                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  ✓ INSTALACIÓN COMPLETADA                   │
│                                             │
│  Opciones:                                  │
│  - Iniciar ahora (Sí/No)                    │
│  - O ejecutar: start_pos_win7.bat           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  http://localhost:3000                      │
│  admin / admin123                           │
│  ✓ SISTEMA FUNCIONANDO                      │
└─────────────────────────────────────────────┘
```

---

## 📝 RESUMEN

| Aspecto | Detalle |
|--------|---------|
| **Archivo** | `INSTALAR_COMPLETO_NODE12.bat` |
| **Plataforma** | Windows 7 32-bits |
| **Node.js requerido** | 12.22.12 (instalación manual previa) |
| **Instalación automática** | Visual C++ Build Tools, Python, dependencias |
| **Tiempo total** | 60-90 minutos (primera vez) |
| **Espacio necesario** | 3-5 GB |
| **Intervención manual** | Mínima (solo permisos de admin) |
| **Resultado** | Sistema POS completamente funcional |

---

## ✅ CONCLUSIÓN

**Este script hace TODO automáticamente:**

1. ✅ Descarga Visual C++ Build Tools
2. ✅ Lo instala sin intervención
3. ✅ Instala Python si falta
4. ✅ Instala todas las dependencias
5. ✅ Compila el frontend
6. ✅ Crea la base de datos
7. ✅ Crea accesos directos
8. ✅ Limpia archivos temporales

**Solo necesitas:**
1. Ejecutar: `INSTALAR_COMPLETO_NODE12.bat` como administrador
2. Esperar 60-90 minutos
3. ¡Disfrutar del sistema!

**¡Sin fallas, sin complicaciones, 100% automático!**

