@echo off
REM ========================================
REM SISTEMA POS - FERRETERÍA
REM Inicio automático con navegador
REM Windows 7 32-bits compatible
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
  echo Para usar este sistema necesita Node.js LTS
  echo Descargue desde: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Obtener versión de Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js detectado: %NODE_VERSION%
echo.

REM Verificar que la carpeta de base de datos existe
if not exist "database\" mkdir database
if not exist "database\backups\" mkdir database\backups

REM Iniciar servidor en segundo plano
echo 🚀 Iniciando servidor en segundo plano...

REM Crear archivo temporal para el servidor
set SERVER_LOG=%temp%\ferreteria_server.log

start /B node backend/server.js > "%SERVER_LOG%" 2>&1

REM Esperar a que el servidor inicie
timeout /t 3 /nobreak

REM Verificar que el servidor está corriendo
netstat -ano | findstr ":3000" >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo ❌ Error: No se pudo iniciar el servidor en puerto 3000
  echo.
  echo Verifique el archivo de log: %SERVER_LOG%
  type "%SERVER_LOG%"
  pause
  exit /b 1
)

echo ✓ Servidor iniciado en http://localhost:3000
echo.
echo 🌐 Abriendo navegador...
echo.

REM Abrir navegador
timeout /t 1 /nobreak
start http://localhost:3000

echo.
echo ═══════════════════════════════════════════════════════════
echo.
echo El sistema está ejecutándose en segundo plano
echo URL: http://localhost:3000
echo.
echo Para detener el servidor, cierre esta ventana o ejecute:
echo   stop_pos.bat
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Mantener la ventana abierta
set /p DUMMY=Presione ENTER para cerrar esta ventana (el servidor seguirá ejecutándose)...

endlocal
