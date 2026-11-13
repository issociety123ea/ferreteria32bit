@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ===============================================
echo   FERRETERIA POS - INSTALACION
echo   Windows 7 32-bits + Node.js 12.22.12
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

REM Crear directorios
echo Creando directorios...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
echo.

REM Limpiar viejos node_modules
echo Limpiando instalaciones viejas...
if exist "node_modules" rmdir /S /Q "node_modules" 2>nul
if exist "frontend\node_modules" rmdir /S /Q "frontend\node_modules" 2>nul
if exist "package-lock.json" del /Q "package-lock.json" 2>nul
if exist "frontend\package-lock.json" del /Q "frontend\package-lock.json" 2>nul
echo.

REM Instalar dependencias backend
echo Instalando dependencias backend (esto puede tomar 10-20 minutos)...
echo.
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Fallo al instalar dependencias backend
  pause
  exit /b 1
)
echo.
echo OK - Backend instalado
echo.

REM Instalar dependencias frontend
echo Instalando dependencias frontend (esto puede tomar 5-10 minutos)...
echo.
cd frontend
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Fallo al instalar dependencias frontend
  cd ..
  pause
  exit /b 1
)
echo.
echo OK - Frontend instalado
echo.

REM Compilar frontend
echo Compilando frontend (esto puede tomar 5-10 minutos)...
echo.
call node build-simple.js
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Fallo al compilar frontend
  cd ..
  pause
  exit /b 1
)
echo.
echo OK - Frontend compilado
cd ..
echo.

REM Crear .env si no existe
if not exist ".env" (
  echo Creando archivo .env...
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
  echo OK - .env creado
  echo.
)

echo.
echo ===============================================
echo   INSTALACION COMPLETADA
echo ===============================================
echo.
echo Para iniciar el sistema:
echo   Doble clic en: INICIAR.bat
echo.
echo.
pause

endlocal
