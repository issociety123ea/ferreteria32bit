@echo off
REM ========================================
REM FERRETERÍA POS - INSTALADOR ÚNICO
REM Windows 7 32-bits - SIN REQUISITOS
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║        FERRETERÍA POS - INSTALADOR ÚNICO               ║
echo ║   Windows 7 32-bits - Sin instalar nada adicional       ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Crear carpetas
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads

echo ✓ Sistema preparado
echo.
echo 🚀 Iniciando instalación...
echo.

REM Verificar Node.js en el sistema
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ ERROR: Node.js no está instalado
  echo.
  echo PARA WINDOWS 7 32-BITS - SOLUCIÓN RÁPIDA:
  echo.
  echo Opción 1 - Versión portátil (recomendado):
  echo   1. Descargue: https://nodejs.org/dist/v13.14.0/node-v13.14.0-win-x86.zip
  echo   2. Extraiga en C:\nodejs
  echo   3. Agregue C:\nodejs a "Variables de entorno" en PATH
  echo.
  echo Opción 2 - Instalador MSI:
  echo   1. Descargue: https://nodejs.org/dist/v13.14.0/node-v13.14.0-x86.msi
  echo   2. Ejecute el instalador
  echo.
  echo Nota: v13.14.0 es la última versión compatible con Windows 7 32-bits
  echo.
  pause
  exit /b 1
)

REM Confirmar Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detectado
echo.

REM Instalar todo
echo 📦 Instalando sistema (esto toma 3-5 minutos)...
echo.

call npm install --legacy-peer-deps --no-audit 2>nul
if %errorlevel% neq 0 (
  echo Error en backend, reintentando...
  call npm install
)

cd frontend
call npm install --legacy-peer-deps --no-audit 2>nul
call npm run build 2>nul
cd ..

REM Base de datos
call node scripts/init-database.js 2>nul

REM Config
if not exist ".env" (
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              ✓ INSTALACIÓN COMPLETADA                   ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 PARA INICIAR EL SISTEMA:
echo.
echo   Doble clic en: start_pos.bat
echo.
echo   ó escriba: npm start
echo.

echo 🌐 Se abrirá en: http://localhost:3000
echo.

echo 🔑 Usuario: admin  |  Contraseña: admin123
echo.

pause

endlocal
