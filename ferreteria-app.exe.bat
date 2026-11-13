@echo off
REM ========================================
REM FERRETERÍA POS - APLICACIÓN COMPLETA
REM Windows 7 32-bits - Ejecutable único
REM ========================================

setlocal enabledelayedexpansion

REM Obtener directorio del script
for %%A in ("%~dp0.") do set "APP_DIR=%%~fA"
cd /d "!APP_DIR!"

REM Crear directorios necesarios
if not exist "database" mkdir "database"
if not exist "database\backups" mkdir "database\backups"
if not exist "uploads" mkdir "uploads"

REM Crear archivo .env si no existe
if not exist ".env" (
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)

REM Cambiar título de ventana
title Ferreteria POS - Sistema de Punto de Venta

REM Esperar un segundo
timeout /t 1 /nobreak >nul 2>&1

REM Intentar abrir navegador en segundo plano
(start http://localhost:3000) >nul 2>&1

REM Iniciar el servidor Node.js
node "!APP_DIR!\backend\server.js"

REM Si Node.js no está disponible, mostrar error
if %errorlevel% neq 0 (
  echo.
  echo ======================================
  echo ERROR: No se pudo iniciar el servidor
  echo ======================================
  echo.
  echo Posibles soluciones:
  echo.
  echo 1. Node.js v12 no está instalado
  echo    Descargue desde: https://nodejs.org/
  echo    Versión recomendada: v12.x LTS
  echo.
  echo 2. Node.js no está en la variable PATH
  echo    Agregue manualmente a "Variables de entorno"
  echo.
  echo 3. Puerto 3000 ya está en uso
  echo    Intente con otro puerto en .env
  echo.
  pause
  exit /b 1
)

endlocal
