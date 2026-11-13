@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ===============================================
echo   FERRETERIA POS - INICIANDO SISTEMA
echo ===============================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
  echo ERROR: Node.js no esta instalado
  pause
  exit /b 1
)
echo.

REM Crear directorios si no existen
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
echo.

REM Iniciar servidor
echo.
echo ===============================================
echo   SERVIDOR INICIANDO EN http://localhost:3000
echo ===============================================
echo.
echo Presione CTRL+C para detener el servidor
echo.
echo Usuario: admin
echo Contraseña: admin123
echo.
echo ===============================================
echo.

REM Iniciar servidor y mantener la ventana abierta
node backend/server.js

REM Si llegamos aqui significa que se cerro
echo.
echo.
echo ===============================================
echo SERVIDOR CERRADO
echo ===============================================
pause

endlocal
