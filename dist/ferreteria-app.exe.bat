@echo off
REM FERRETERÍA POS - EJECUTABLE PARA WINDOWS 7 32-BITS
REM Simplemente copia este archivo como ferreteria-app.exe si lo deseas

setlocal enabledelayedexpansion

for %%A in ("%~dp0..") do set "APP_DIR=%%~fA"
cd /d "!APP_DIR!"

if not exist "database" mkdir "database"
if not exist "database\backups" mkdir "database\backups"
if not exist "uploads" mkdir "uploads"

if not exist ".env" (
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)

title Ferreteria POS - Sistema de Punto de Venta
timeout /t 2 /nobreak >nul 2>&1
start http://localhost:3000 >nul 2>&1

node backend/server.js

endlocal
