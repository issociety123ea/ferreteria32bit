@echo off
setlocal enabledelayedexpansion

REM Obtener directorio padre (carpeta raíz del proyecto)
for %%A in ("%~dp0..") do set "APP_DIR=%%~fA"
cd /d "!APP_DIR!"

REM Crear directorios necesarios
if not exist "database" mkdir "database"
if not exist "database\backups" mkdir "database\backups"
if not exist "uploads" mkdir "uploads"

REM Crear .env si no existe
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

REM Esperar 2 segundos
timeout /t 2 /nobreak >nul 2>&1

REM Abrir navegador automáticamente
start http://localhost:3000 >nul 2>&1

REM Iniciar servidor Node.js
node backend/server.js

REM Si llegamos aquí, hubo error
echo.
echo ERROR: No se pudo iniciar el servidor
echo.
echo Asegúrese de tener Node.js v12 LTS instalado
echo Descargue desde: https://nodejs.org/
echo.
pause

endlocal
