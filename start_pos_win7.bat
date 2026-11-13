@echo off
REM ========================================
REM SISTEMA POS - FERRETERÍA
REM Inicio para Windows 7 32-bits
REM ========================================

setlocal enabledelayedexpansion

REM Detectar la ruta del script
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           FERRETERÍA POS - SISTEMA INICIANDO             ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Verificar que Node.js esté instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Error: Node.js no está instalado o no está en PATH
  echo.
  echo Para usar este script necesita Node.js LTS
  echo Descargue desde: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Obtener versión de Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js detectado: %NODE_VERSION%
echo.

REM Verificar que npm esté disponible
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Error: npm no está disponible
  pause
  exit /b 1
)

REM Verificar que la carpeta de base de datos existe
if not exist "database\" (
  echo ✓ Creando carpeta de base de datos...
  mkdir database
)

if not exist "database\backups\" (
  mkdir database\backups
)

REM Iniciar el servidor Node.js
echo.
echo 🚀 Iniciando servidor...
echo.
echo Acceda al sistema en: http://localhost:3000
echo.
echo Presione CTRL+C para detener el servidor
echo.
echo ═══════════════════════════════════════════════════════════
echo.

node backend/server.js

if %errorlevel% neq 0 (
  echo.
  echo ❌ Error al iniciar el servidor
  pause
)

endlocal
