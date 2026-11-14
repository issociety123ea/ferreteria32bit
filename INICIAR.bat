@echo off
REM =====================================================
REM FERRETERÍA POS - EJECUTABLE SIN TERMINAL
REM Inicia automáticamente el sistema sin mostrar ventana cmd
REM =====================================================

setlocal enabledelayedexpansion

REM Obtener la ruta del script
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Node.js no está instalado
    echo.
    echo Por favor, ejecute primero: INSTALAR.bat
    echo.
    pause
    exit /b 1
)

REM Verificar si la base de datos existe
if not exist "%ROOT_DIR%database\ferreteria.db" (
    echo.
    echo ❌ ERROR: Base de datos no encontrada
    echo.
    echo Por favor, ejecute primero: INSTALAR.bat
    echo.
    pause
    exit /b 1
)

REM Crear directorio de backups si no existe
if not exist "%ROOT_DIR%backups" (
    mkdir "%ROOT_DIR%backups"
)

REM Compilar frontend para asegurar que los cambios se reflejen
echo Actualizando interfaz frontend...
cd /d "%ROOT_DIR%frontend"
call npm run build >nul 2>&1
cd /d "%ROOT_DIR%"

REM Ejecutar backup automático (silenciosamente)
echo Creando copia de seguridad...
node "%ROOT_DIR%scripts\backup.js" >nul 2>&1

REM Iniciar el servidor backend silenciosamente
echo Iniciando servidor...
start "" /B node "%ROOT_DIR%backend\server.js"

REM Esperar a que el servidor esté listo
timeout /t 3 /nobreak >nul

REM Abrir navegador en el POS
start http://localhost:3000

REM Mantener el script esperando (para que no se cierre la ventana cmd)
REM Pero ocultarla usando una ventana invisible
if exist "%ROOT_DIR%node_modules\.bin\node.cmd" (
    REM El proceso está corriendo en background
    exit /b 0
)
