@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo ===== DIAGNOSTICO SERVIDOR FERRETERIA =====
echo.

REM Verificar Node.js
echo Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js no esta instalado
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js: %NODE_VERSION%
echo.

REM Verificar npm
for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
echo npm: %NPM_VERSION%
echo.

REM Intentar iniciar servidor con diagnostico
echo Intentando iniciar servidor...
echo.

node backend/server.js

pause
