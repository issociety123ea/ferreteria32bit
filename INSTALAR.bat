@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo INSTALANDO FERRETERIA POS...
echo.

REM Verificar admin
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Requiere "Ejecutar como administrador"
  pause
  exit /b 1
)

REM Crear directorios
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
if not exist "temp" mkdir temp

REM Verificar Visual C++
echo Verificando Visual C++ Build Tools...
where cl.exe >nul 2>&1
if %errorlevel% neq 0 (
  echo Descargando Visual C++ Build Tools...
  powershell -Command "
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    (New-Object System.Net.WebClient).DownloadFile('https://aka.ms/vs/16/release/vs_buildtools.exe', '%SCRIPT_DIR%temp\vs_buildtools.exe')
  " 2>nul

  if exist "%SCRIPT_DIR%temp\vs_buildtools.exe" (
    echo Instalando Visual C++ Build Tools (esto toma 20-30 minutos)...
    "%SCRIPT_DIR%temp\vs_buildtools.exe" --quiet --wait --norestart --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64
    del /Q "%SCRIPT_DIR%temp\vs_buildtools.exe"
  ) else (
    echo ERROR: No se pudo descargar Visual C++ Build Tools
    pause
    exit /b 1
  )
)

REM Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js 12.22.12 no está instalado
  echo Descargue desde: https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION% detectado

REM Instalar dependencias backend
echo.
echo Instalando dependencias (esto puede tomar 10-20 minutos)...
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ERROR: Fallo al instalar backend
  pause
  exit /b 1
)

REM Instalar dependencias frontend
cd frontend
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ERROR: Fallo al instalar frontend
  cd ..
  pause
  exit /b 1
)

REM Forzar Vite v4
echo Asegurando Vite v4...
call npm install vite@4 @vitejs/plugin-vue@4 --save-dev --legacy-peer-deps --force 2>nul

REM Compilar frontend
echo Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
  echo ERROR: Fallo al compilar frontend
  cd ..
  pause
  exit /b 1
)
cd ..

REM Inicializar base de datos
echo Inicializando base de datos...
if not exist "database\ferreteria.db" (
  call node scripts/init-database.js 2>nul
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

REM Limpiar temp
rmdir /S /Q "temp" 2>nul

echo.
echo ✓ INSTALACION COMPLETADA
echo.
echo Para iniciar el sistema:
echo   Doble clic en: start_pos_win7.bat
echo.
pause

endlocal
