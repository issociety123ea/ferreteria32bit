@echo off
REM ========================================
REM FERRETERÍA POS - APLICACIÓN ÚNICA
REM Windows 7 32-bits - Sin instalación
REM ========================================

setlocal enabledelayedexpansion

REM Obtener ruta del ejecutable
set APP_DIR=%~dp0
set APP_NAME=%~n0

REM Cambiar a directorio de la aplicación
cd /d "%APP_DIR%"

REM Crear carpetas necesarias
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo Node.js no encontrado en PATH
  echo.
  echo Descargue Node.js v12 LTS desde: https://nodejs.org/
  echo.
  timeout /t 5 /nobreak
  exit /b 1
)

REM Crear archivo .env si no existe
if not exist ".env" (
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)

REM Esperar 1 segundo y abrir navegador
timeout /t 1 /nobreak
start http://localhost:3000 >nul 2>&1

REM Iniciar servidor
node backend/server.js

endlocal
