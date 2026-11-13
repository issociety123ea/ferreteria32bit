@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js no está instalado
  pause
  exit /b 1
)

if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups

echo Iniciando servidor...
echo URL: http://localhost:3000
echo.
echo Presione CTRL+C para detener
echo.

node backend/server.js

endlocal
