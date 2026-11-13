@echo off
REM ========================================
REM FERRETERÍA POS - APLICACIÓN ÚNICA
REM Windows 7 32-bits - Ejecutable directo
REM ========================================

setlocal enabledelayedexpansion

REM Obtener directorio del script
set APP_DIR=%~dp0
set APP_NAME=%~n0

REM Ir al directorio de la aplicación
cd /d "%APP_DIR%"

REM Crear directorios
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  msg * "Error: Node.js no detectado. Descargue desde nodejs.org/download"
  exit /b 1
)

REM Crear .env
if not exist ".env" (
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)

REM Abrir navegador
timeout /t 1 /nobreak >nul 2>&1
start http://localhost:3000 >nul 2>&1

REM Iniciar servidor silenciosamente
title Ferreteria POS
node backend/server.js

endlocal
