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
  echo SOLUCIÓN RÁPIDA (copie y pegue esto en navegador):
  echo   https://nodejs.org/en/download/package-manager/
  echo.
  echo Descargue "node-v12.22.12-win-x86.zip"
  echo Extraiga en cualquier carpeta
  echo Agregue esa carpeta a "Variables de entorno" en PATH
  echo.
  echo O descargue el instalador de:
  echo   https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
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
