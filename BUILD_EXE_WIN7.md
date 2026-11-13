# 📦 Construcción de EXE Standalone para Windows 7 32-bits

## Visión General

Este documento describe cómo empaquetar la aplicación Ferretería POS en un ejecutable `.exe` standalone que funciona en Windows 7 32-bits sin requerir Node.js instalado.

---

## ✅ Requisitos

- Windows 10/11 (para compilación) o Windows 7 (para testing)
- Node.js v18+ instalado (para compilación)
- npm instalado
- ~500MB de espacio libre

---

## 📋 Pasos para Construir el EXE

### Paso 1: Instalar dependencia de pkg

```bash
npm install --save-dev pkg@5.11.5
```

### Paso 2: Compilar frontend (si no está compilado)

```bash
cd frontend
npm install
npm run build
cd ..
```

### Paso 3: Construir EXE de 32-bits

```bash
npx pkg . --target node18-win-x86 --output ferreteria-app.exe
```

**Resultado esperado:**
- Archivo: `ferreteria-app.exe` (~150-200MB)
- Tiempo de compilación: 2-5 minutos
- Compatible: Windows 7 SP1 32-bits y superiores

### Paso 4: Distribuir

1. Cree carpeta: `ferreteria_win7_32bit/`
2. Copie:
   - `ferreteria-app.exe`
   - `start_app.bat` (ver abajo)
   - `GUIA_INSTALACION_WIN7_32BIT.md`
   - `database/` (carpeta vacía, se crea automáticamente)

---

## 🎯 Script de Inicio para EXE

**Archivo: `start_app.bat`** (en la misma carpeta del `.exe`)

```batch
@echo off
REM Script para iniciar Ferretería POS desde EXE standalone

setlocal enabledelayedexpansion

set APP_DIR=%~dp0
cd /d "%APP_DIR%"

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║         FERRETERÍA POS - APLICACIÓN STANDALONE           ║
echo ║         Windows 7 32-bits                                 ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Crear carpetas necesarias
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups

echo 🚀 Iniciando aplicación...
echo.

REM Ejecutar el EXE
ferreteria-app.exe

if %errorlevel% neq 0 (
  echo.
  echo ❌ Error al ejecutar la aplicación
  pause
)

endlocal
```

---

## 🔧 Configuración en package.json

Ya está configurado en el proyecto:

```json
{
  "pkg": {
    "targets": [
      "node18-win-x86",
      "node18-win-x64"
    ],
    "outputPath": "./dist",
    "scripts": [
      "backend/**/*.js",
      "frontend/dist/**/*"
    ],
    "assets": [
      "frontend/dist/**/*",
      "database/schema.sql",
      ".env.example"
    ]
  },
  "bin": "backend/server.js"
}
```

---

## 📊 Tamaño de Archivos

| Componente | Tamaño |
|-----------|--------|
| Node.js runtime | ~120MB |
| Backend + Frontend | ~30MB |
| SQLite3 módulo | ~15MB |
| **Total EXE** | **~150-200MB** |

---

## 💾 Base de Datos y Persistencia

Cuando ejecuta `ferreteria-app.exe`:

1. **Primera ejecución:**
   - Se crea carpeta `database/` en el mismo directorio del `.exe`
   - Se inicializa `ferreteria.db` (SQLite)
   - Se carga el esquema inicial
   - Se crean usuarios de prueba

2. **Ejecuciones posteriores:**
   - Los datos persisten en `database/ferreteria.db`
   - Los backups se guardan en `database/backups/`

3. **Portabilidad:**
   - Puede copiar `ferreteria-app.exe + carpeta database` a otro PC
   - Los datos viajan con la aplicación

---

## 🎮 Distribución Final

### Estructura de carpeta para entregar:

```
ferreteria_win7_32bit/
├── ferreteria-app.exe          (la aplicación)
├── start_app.bat               (acceso fácil)
├── stop_app.bat                (detener servidor)
├── GUIA_INSTALACION_WIN7_32BIT.md
├── README_QUICKSTART.txt       (instrucciones rápidas)
└── database/                   (carpeta vacía)
    └── backups/                (para respaldos)
```

### Instrucciones para usuario final:

1. Descargar `ferreteria_win7_32bit.zip`
2. Extraer en cualquier carpeta
3. Doble clic en `start_app.bat`
4. Abrirá automáticamente en navegador
5. Usar credenciales por defecto (admin/admin123)

---

## 🔒 Variables de Entorno

El EXE buscará `.env` en su directorio. Si no existe, usará valores por defecto:

```
PORT=3000
NODE_ENV=production
DB_PATH=./database/ferreteria.db
JWT_SECRET=ferreteria_default_secret_change_in_production
```

Para producción, cree `.env`:

```bash
echo PORT=3000 > .env
echo NODE_ENV=production >> .env
echo DB_PATH=./database/ferreteria.db >> .env
echo JWT_SECRET=su_secret_aqui >> .env
```

---

## ✅ Testing en Windows 7 32-bits

Una vez que tenga el `.exe`, para probar en Win7:

1. Copie `ferreteria-app.exe` en PC con Win7 32-bits
2. Ejecute: `start_app.bat` o doble clic en `.exe`
3. Verifique:
   - ✓ Se abre navegador en `http://localhost:3000`
   - ✓ Login funciona (admin/admin123)
   - ✓ Puede navegar módulos (POS, Inventario, etc.)
   - ✓ Datos persisten después de cerrar y abrir de nuevo
   - ✓ Base de datos se crea en `database/`

---

## 🐛 Solución de Problemas al Compilar

### Error: "pkg: command not found"

```bash
npm install -g pkg@5.11.5
```

### Error: "Cannot find module..."

```bash
npm install
cd frontend && npm install && npm run build
cd ..
```

### EXE no inicia

1. Verifique que `frontend/dist/` existe y tiene archivos
2. Verifique que `backend/server.js` existe
3. Intente compilar nuevamente:

```bash
rm -rf dist/
npm install --save-dev pkg@5.11.5
npx pkg . --target node18-win-x86
```

---

## 📝 Changelog de Cambios

Esta versión incluye:

✅ `better-sqlite3` → `sqlite3` para compatibilidad Win7  
✅ Controllers migrando a async/await  
✅ Scripts BAT simples para Win7  
✅ Soporte para Node.js v12 LTS  
✅ Configuración de pkg para EXE standalone  
✅ Base de datos SQLite persistente  
✅ Sin requerimientos de instalación adicionales en Win7  

---

**Documentación actualizada**: Noviembre 2026  
**Versión**: 1.0.0 Win7-Compatible  
**Plataforma**: Windows 7 SP1 32-bits y superiores
