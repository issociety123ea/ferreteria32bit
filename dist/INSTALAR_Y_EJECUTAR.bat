@echo off
REM ========================================
REM FERRETERÍA POS - INSTALACIÓN + EJECUCIÓN
REM Windows 7 32-bits
REM ========================================

setlocal enabledelayedexpansion

REM Obtener ruta
for %%A in ("%~dp0..") do set "APP_DIR=%%~fA"
cd /d "!APP_DIR!"

REM Crear carpetas
if not exist "database" mkdir "database"
if not exist "database\backups" mkdir "database\backups"
if not exist "uploads" mkdir "uploads"

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
timeout /t 2 /nobreak >nul 2>&1
start http://localhost:3000 >nul 2>&1

REM Iniciar
node backend/server.js

endlocal
