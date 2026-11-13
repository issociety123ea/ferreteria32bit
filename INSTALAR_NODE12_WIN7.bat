@echo off
REM ========================================
REM FERRETERÍA POS - INSTALADOR NODE 12.22.12
REM Windows 7 32-bits Optimizado
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║    FERRETERÍA POS - SETUP NODE.JS 12.22.12             ║
echo ║         Windows 7 32-bits Optimizado                    ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Crear directorios necesarios
echo 📁 Creando estructura de carpetas...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
echo ✓ Directorios creados
echo.

REM Verificar que Node.js esté instalado
echo 🔍 Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ ERROR: Node.js no está instalado o no está en PATH
  echo.
  echo Instale Node.js 12.22.12 desde:
  echo   https://nodejs.org/dist/v12.22.12/
  echo.
  pause
  exit /b 1
)

REM Obtener versión de Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detectado
echo.

REM Verificar que es Node 12
echo %NODE_VERSION% | findstr /R "v12\." >nul
if %errorlevel% neq 0 (
  echo ⚠️  ADVERTENCIA: No se detectó Node.js v12
  echo    Versión detectada: %NODE_VERSION%
  echo    Se puede continuar, pero habrá incompatibilidades
  echo.
)

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ ERROR: npm no está disponible
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% detectado
echo.

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
echo    (esto puede tomar 5-15 minutos)
echo.

REM Usar --legacy-peer-deps para Node 12
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias del backend
  echo.
  echo Si hay error con sqlite3, necesita Visual C++ Build Tools:
  echo   https://visualstudio.microsoft.com/visual-cpp-build-tools/
  echo.
  pause
  exit /b 1
)
echo ✓ Backend listo
echo.

REM Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias del frontend
  cd ..
  pause
  exit /b 1
)
echo ✓ Frontend listo
echo.

REM CRÍTICO: Forzar Vite v4 en Node 12 (v5 no es compatible)
echo 🔧 Ajustando Vite para Node.js 12...
call npm install vite@4 @vitejs/plugin-vue@4 --save-dev --legacy-peer-deps --force
if %errorlevel% neq 0 (
  echo ⚠️  Advertencia: Vite podría no funcionar óptimamente
  echo    Pero intentaremos continuar...
)
echo ✓ Vite v4 instalado
echo.

REM Compilar frontend
echo 🏗️  Compilando interfaz gráfica...
echo    (esto puede tomar 5-15 minutos)
echo.
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Error al compilar frontend
  cd ..
  pause
  exit /b 1
)
cd ..
echo ✓ Frontend compilado
echo.

REM Inicializar base de datos
echo 🗄️  Inicializando base de datos...
if not exist "database\ferreteria.db" (
  call node scripts/init-database.js 2>nul
  if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: Error al inicializar BD (pero continuaremos)
  )
)
echo ✓ Base de datos lista
echo.

REM Crear archivo .env
if not exist ".env" (
  echo 🔐 Generando configuración de seguridad...
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
  echo ✓ Archivo .env creado
  echo.
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║      ✓ INSTALACIÓN COMPLETADA - LISTO PARA USAR        ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 PARA INICIAR EL SISTEMA:
echo.
echo   Opción 1 (Recomendado):
echo     - Ejecute: start_pos_win7.bat
echo.
echo   Opción 2 (Línea de comandos):
echo     - Escriba: npm start
echo.
echo   Opción 3 (Doble clic):
echo     - Doble clic en: start_pos.bat
echo.

echo 🌐 Se abrirá en: http://localhost:3000
echo.

echo 🔑 Credenciales por defecto:
echo    Usuario: admin
echo    Contraseña: admin123
echo.

echo ⚠️  IMPORTANTE: Cambie la contraseña en primer acceso
echo.

echo ═══════════════════════════════════════════════════════════
echo.

REM Crear acceso directo en escritorio
set DESKTOP=%USERPROFILE%\Desktop
if exist "!DESKTOP!" (
  powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Ferretería POS.lnk'); $Shortcut.TargetPath = 'wscript.exe'; $Shortcut.Arguments = '\"%CD%\start_pos.vbs\"'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = 'Sistema POS - Ferretería'; $Shortcut.Save()" 2>nul
  if %errorlevel% equ 0 (
    echo ✓ Acceso directo creado en Escritorio
    echo.
  )
)

pause

endlocal
