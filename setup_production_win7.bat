@echo off
REM ========================================
REM INSTALACIÓN - FERRETERÍA POS SYSTEM
REM Windows 7 32-bits Compatible
REM ========================================

setlocal enabledelayedexpansion

REM Detectar la ruta del script
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║        FERRETERÍA POS - SETUP INSTALACIÓN               ║
echo ║         Compatible Windows 7 32-bits                    ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Verificar que Node.js esté instalado
echo 🔍 Verificando requisitos del sistema...
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ ERROR: Node.js no está instalado
  echo.
  echo Este sistema requiere Node.js LTS
  echo.
  echo Opción 1: Usar la versión portátil (recomendado para Win7)
  echo   - Descargue node-v12.22.12-win-x86.zip de nodejs.org
  echo   - Extraiga en C:\nodejs
  echo   - Agregue C:\nodejs a la variable PATH del sistema
  echo.
  echo Opción 2: Descargar instalador
  echo   - Visite https://nodejs.org/
  echo   - Descargue versión 12.x LTS (última compatible con Win7)
  echo.
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detectado
echo.

REM Crear directorios necesarios
echo 📁 Creando directorios...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
echo ✓ Directorios creados
echo.

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
echo   (esto puede tomar varios minutos...)
echo.
call npm install
if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias del backend
  pause
  exit /b 1
)
echo ✓ Backend listo
echo.

REM Instalar y compilar frontend
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias del frontend
  cd ..
  pause
  exit /b 1
)

echo 🏗️  Compilando frontend (esto puede tomar un minuto)...
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Error al compilar frontend
  cd ..
  pause
  exit /b 1
)
echo ✓ Frontend compilado
cd ..
echo.

REM Inicializar base de datos
echo 🗄️  Inicializando base de datos...
call node scripts/init-database.js
if %errorlevel% neq 0 (
  echo ❌ Error al inicializar base de datos
  pause
  exit /b 1
)
echo ✓ Base de datos inicializada
echo.

REM Crear archivo .env
if not exist ".env" (
  echo 🔐 Generando configuración de seguridad...
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_secret_key_change_in_production_%random%_%random%
  ) > .env
  echo ✓ Archivo .env creado
  echo.
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           ✓ INSTALACIÓN COMPLETADA                       ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 Próximos pasos:
echo.
echo   1. Inicie el sistema:
echo      - Doble clic en: start_pos.bat
echo      - O use línea de comandos: npm start
echo.
echo   2. Acceda a:
echo      http://localhost:3000
echo.
echo   3. Credenciales por defecto:
echo      Usuario: admin
echo      Contraseña: admin123
echo.
echo   ⚠️  IMPORTANTE: Cambie la contraseña del admin inmediatamente
echo.
echo ═══════════════════════════════════════════════════════════
echo.

pause

endlocal
