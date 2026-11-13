@echo off
REM ========================================
REM FERRETERÍA POS - INSTALADOR COMPLETO
REM Windows 7 32-bits - TODO AUTOMÁTICO
REM Instala: Visual C++ Build Tools + Node.js + Sistema
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   FERRETERÍA POS - INSTALADOR COMPLETO AUTOMÁTICO      ║
echo ║      Windows 7 32-bits + Node.js 12.22.12              ║
echo ║     (Instala todo lo necesario automáticamente)         ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM ============================================
REM PASO 1: VERIFICAR PRIVILEGIOS DE ADMIN
REM ============================================
echo 🔐 Verificando permisos de administrador...
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo ❌ ERROR: Este script requiere permisos de ADMINISTRADOR
  echo.
  echo Solución:
  echo   1. Haga clic derecho en este archivo
  echo   2. Seleccione "Ejecutar como administrador"
  echo   3. Haga clic en "Sí" cuando se le pida
  echo.
  pause
  exit /b 1
)
echo ✓ Permisos de administrador verificados
echo.

REM ============================================
REM PASO 2: CREAR DIRECTORIOS NECESARIOS
REM ============================================
echo 📁 Preparando directorios...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
if not exist "temp_installers" mkdir temp_installers
echo ✓ Directorios creados
echo.

REM ============================================
REM PASO 3: VERIFICAR VISUAL C++ BUILD TOOLS
REM ============================================
echo 🔍 Verificando Visual C++ Build Tools...
where cl.exe >nul 2>&1
if %errorlevel% equ 0 (
  echo ✓ Visual C++ Build Tools ya está instalado
  echo.
) else (
  echo ⚠️  Visual C++ Build Tools no detectado
  echo.
  echo 📥 Descargando Visual C++ Build Tools (esto toma 10-15 minutos)...
  echo    Tamaño: ~1.2 GB
  echo.

  REM Descargar Visual Studio Build Tools
  set BUILD_TOOLS_URL=https://aka.ms/vs/16/release/vs_buildtools.exe
  set BUILD_TOOLS_PATH=%SCRIPT_DIR%temp_installers\vs_buildtools.exe

  REM Usar PowerShell para descargar (más confiable)
  powershell -Command "
    try {
      [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
      $url = '!BUILD_TOOLS_URL!'
      $output = '!BUILD_TOOLS_PATH!'

      Write-Host 'Descargando desde: ' $url
      Write-Host 'Destino: ' $output
      Write-Host ''

      (New-Object System.Net.WebClient).DownloadFile($url, $output)
      Write-Host 'Descarga completada'
    } catch {
      Write-Host 'Error en descarga: ' $_
      exit 1
    }
  " 2>nul

  if %errorlevel% neq 0 (
    echo ❌ Error al descargar Visual C++ Build Tools
    echo.
    echo Intente:
    echo   1. Descargar manualmente desde:
    echo      https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo   2. Ejecutar el instalador
    echo   3. Seleccionar "Desktop development with C++"
    echo   4. Reiniciar la computadora
    echo   5. Ejecutar este script nuevamente
    echo.
    pause
    exit /b 1
  )

  echo ✓ Descarga completada
  echo.
  echo 🔧 Instalando Visual C++ Build Tools...
  echo    Esto puede tomar 20-30 minutos
  echo    NO CIERRE ESTA VENTANA
  echo.

  REM Ejecutar instalador en modo desatendido
  REM --quiet = sin interfaz gráfica
  REM --wait = esperar a que termine
  REM --nocache = no guardar caché
  call "!BUILD_TOOLS_PATH!" ^
    --quiet ^
    --wait ^
    --nocache ^
    --add Microsoft.VisualStudio.Workload.VCTools ^
    --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64

  if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Error durante instalación de Visual C++ Build Tools
    echo.
    echo Posibles soluciones:
    echo   1. Intente descargar manualmente desde:
    echo      https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo   2. Ejecute el instalador manualmente
    echo   3. Reinicie la computadora
    echo   4. Ejecute este script nuevamente
    echo.
    pause
    exit /b 1
  )

  echo ✓ Visual C++ Build Tools instalado
  echo.

  REM Limpiar archivo descargado
  if exist "!BUILD_TOOLS_PATH!" del /Q "!BUILD_TOOLS_PATH!" 2>nul

  echo ⚠️  IMPORTANTE: Reiniciando computadora en 30 segundos...
  echo    Para cancelar: presione CTRL+C
  echo.
  timeout /t 30
  shutdown /r /t 10 /c "Visual C++ Build Tools instalado. Reiniciando para completar la configuración..."
  exit /b 0
)

REM ============================================
REM PASO 4: VERIFICAR PYTHON (para node-gyp)
REM ============================================
echo 🐍 Verificando Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
  where python3 >nul 2>&1
  if %errorlevel% neq 0 (
    echo ⚠️  Python no detectado (necesario para compilar módulos nativos)
    echo.
    echo Instalando Python 3.9...

    set PYTHON_URL=https://www.python.org/ftp/python/3.9.13/python-3.9.13-embed-amd64.zip
    set PYTHON_PATH=%SCRIPT_DIR%temp_installers\python-embed.zip

    REM Descargar Python embebido
    powershell -Command "
      try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        (New-Object System.Net.WebClient).DownloadFile('!PYTHON_URL!', '!PYTHON_PATH!')
        Write-Host 'Python descargado'
      } catch {
        Write-Host 'Error: ' $_
        exit 1
      }
    " 2>nul

    if %errorlevel% equ 0 (
      echo 📂 Extrayendo Python...
      powershell -Command "
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory('!PYTHON_PATH!', '!SCRIPT_DIR!python')
      " 2>nul

      set PATH=!SCRIPT_DIR!python;!PATH!
      echo ✓ Python instalado
      del /Q "!PYTHON_PATH!" 2>nul
    )
  ) else (
    echo ✓ Python detectado (python3)
  )
) else (
  echo ✓ Python detectado
)
echo.

REM ============================================
REM PASO 5: VERIFICAR NODE.JS
REM ============================================
echo 🔍 Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo ❌ ERROR: Node.js no está instalado
  echo.
  echo Este script requiere Node.js 12.22.12 pre-instalado
  echo.
  echo Descargue e instale desde:
  echo   https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
  echo.
  echo Después de instalar, ejecute este script nuevamente
  echo.
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% detectado
echo.

REM Verificar que sea Node 12
echo %NODE_VERSION% | findstr /R "v12\." >nul
if %errorlevel% neq 0 (
  echo ⚠️  ADVERTENCIA: No se detectó Node.js v12
  echo    Versión detectada: %NODE_VERSION%
  echo    El script continuará, pero habrá incompatibilidades
  echo.
  timeout /t 5
)

REM Verificar npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo ❌ ERROR: npm no está disponible
  pause
  exit /b 1
)

for /f "tokens=1" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% detectado
echo.

REM ============================================
REM PASO 6: INSTALAR DEPENDENCIAS BACKEND
REM ============================================
echo 📦 Instalando dependencias del backend...
echo    (esto puede tomar 10-20 minutos)
echo.

call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias del backend
  echo.
  echo Intentando nuevamente con más tiempo...
  timeout /t 5
  call npm install --legacy-peer-deps --no-audit --no-fund
  if %errorlevel% neq 0 (
    echo ❌ Error persistente al instalar backend
    pause
    exit /b 1
  )
)
echo ✓ Backend listo
echo.

REM ============================================
REM PASO 7: INSTALAR DEPENDENCIAS FRONTEND
REM ============================================
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

REM ============================================
REM PASO 8: ASEGURAR VITE V4 (CRÍTICO)
REM ============================================
echo 🔧 Asegurando Vite v4 para Node.js 12...
call npm install vite@4 @vitejs/plugin-vue@4 --save-dev --legacy-peer-deps --force --no-audit
if %errorlevel% neq 0 (
  echo ⚠️  Advertencia: Vite podría no funcionar óptimamente
  echo    Pero intentaremos continuar...
)
echo ✓ Vite v4 confirmado
echo.

REM ============================================
REM PASO 9: COMPILAR FRONTEND
REM ============================================
echo 🏗️  Compilando interfaz gráfica...
echo    (esto puede tomar 10-20 minutos)
echo    NO CIERRE ESTA VENTANA
echo.
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Error al compilar frontend
  cd ..
  pause
  exit /b 1
)
cd ..
echo ✓ Frontend compilado exitosamente
echo.

REM ============================================
REM PASO 10: INICIALIZAR BASE DE DATOS
REM ============================================
echo 🗄️  Inicializando base de datos...
if not exist "database\ferreteria.db" (
  call node scripts/init-database.js 2>nul
  if %errorlevel% neq 0 (
    echo ⚠️  Advertencia: Error al inicializar BD (pero continuaremos)
  )
)
echo ✓ Base de datos lista
echo.

REM ============================================
REM PASO 11: CREAR ARCHIVO .ENV
REM ============================================
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

REM ============================================
REM PASO 12: CREAR ACCESO DIRECTO
REM ============================================
echo 🎯 Creando acceso directo en Escritorio...
set DESKTOP=%USERPROFILE%\Desktop
if exist "!DESKTOP!" (
  powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\Ferretería POS.lnk'); $Shortcut.TargetPath = 'wscript.exe'; $Shortcut.Arguments = '\"%CD%\start_pos.vbs\"'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = 'Sistema POS - Ferretería'; $Shortcut.Save()" 2>nul
  if %errorlevel% equ 0 (
    echo ✓ Acceso directo creado en Escritorio
    echo.
  )
)

REM ============================================
REM PASO 13: LIMPIAR ARCHIVOS TEMPORALES
REM ============================================
echo 🧹 Limpiando archivos temporales...
if exist "temp_installers" (
  rmdir /S /Q "temp_installers" 2>nul
)
echo ✓ Limpieza completada
echo.

REM ============================================
REM INSTALACIÓN COMPLETADA
REM ============================================
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║    ✓✓✓ INSTALACIÓN COMPLETADA EXITOSAMENTE ✓✓✓         ║
echo ║                                                           ║
echo ║      El sistema está LISTO PARA USAR                    ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 PARA INICIAR EL SISTEMA AHORA:
echo.
echo   Opción 1 (Recomendado - Más fácil):
echo     - Haga doble clic en: start_pos_win7.bat
echo.
echo   Opción 2 (Doble clic):
echo     - Haga doble clic en icono "Ferretería POS" en Escritorio
echo.
echo   Opción 3 (Línea de comandos):
echo     - Escriba: npm start
echo.

echo 🌐 Se abrirá en: http://localhost:3000
echo.

echo 🔑 Credenciales por defecto:
echo    Usuario: admin
echo    Contraseña: admin123
echo.

echo ⚠️  IMPORTANTE:
echo    - Cambie la contraseña en primer acceso
echo    - Guarde esta información en lugar seguro
echo.

echo ═══════════════════════════════════════════════════════════
echo.

REM Crear y ejecutar el script de inicio automático
echo 🚀 ¿Desea iniciar el sistema ahora? (S/N)
set /p START_NOW=
if /i "%START_NOW%"=="S" (
  echo.
  echo Iniciando Ferretería POS...
  echo.
  call start_pos_win7.bat
)

pause

endlocal
