@echo off
REM ========================================
REM FERRETERÍA POS - INSTALADOR TODO-EN-UNO
REM Windows 7 32-bits - Completamente automático
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║        FERRETERÍA POS - INSTALADOR AUTOMÁTICO           ║
echo ║           Windows 7 32-bits (SIN REQUISITOS)             ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Crear directorios
echo 📁 Creando estructura de carpetas...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
if not exist "node_portable" mkdir node_portable

REM Descargar Node.js portátil automáticamente si no existe
if not exist "node_portable\node.exe" (
  echo.
  echo 📥 Descargando Node.js v13.14.0 (compatible Windows 7 32-bits)...
  echo    Esto puede tomar 2-3 minutos según su conexión...
  echo.

  REM Usar PowerShell para descargar (más seguro que wget)
  powershell -Command "
    try {
      [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
      $url = 'https://nodejs.org/dist/v13.14.0/node-v13.14.0-win-x86.zip'
      $output = '%SCRIPT_DIR%node-v13.zip'

      Write-Host 'Descargando desde: ' $url
      (New-Object System.Net.WebClient).DownloadFile($url, $output)
      Write-Host 'Descarga completada'

      REM Extraer ZIP
      Write-Host 'Extrayendo archivos...'
      Add-Type -AssemblyName System.IO.Compression.FileSystem
      [System.IO.Compression.ZipFile]::ExtractToDirectory($output, '%SCRIPT_DIR%node_temp')

      REM Mover a carpeta final
      Move-Item '%SCRIPT_DIR%node_temp\node-v13.14.0-win-x86\*' '%SCRIPT_DIR%node_portable\'

      REM Limpiar temporales
      Remove-Item '%SCRIPT_DIR%node_temp' -Recurse -Force
      Remove-Item $output -Force

      Write-Host 'Node.js v13.14.0 instalado exitosamente'
    } catch {
      Write-Host 'Error en descarga: ' $_
      exit 1
    }
  "

  if %errorlevel% neq 0 (
    echo.
    echo ❌ Error al descargar Node.js
    echo.
    echo Opción manual:
    echo   1. Descargue: https://nodejs.org/dist/v13.14.0/node-v13.14.0-win-x86.zip
    echo   2. Extraiga en carpeta: node_portable
    echo   3. Ejecute este script nuevamente
    echo.
    pause
    exit /b 1
  )
)

REM Configurar PATH para Node.js portátil
set PATH=%SCRIPT_DIR%node_portable;%PATH%

echo ✓ Node.js listo
echo.

REM Verificar Node.js
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Usando: %NODE_VERSION%
echo.

REM Instalar backend
echo 📦 Instalando dependencias (backend)...
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ❌ Error en dependencias backend
  pause
  exit /b 1
)
echo ✓ Backend listo
echo.

REM Instalar frontend
echo 📦 Instalando dependencias (frontend)...
cd frontend
call npm install --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo ❌ Error en dependencias frontend
  cd ..
  pause
  exit /b 1
)

echo 🏗️  Compilando interfaz (1-2 minutos)...
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Error compilando interfaz
  cd ..
  pause
  exit /b 1
)
cd ..
echo ✓ Frontend compilado
echo.

REM Base de datos
echo 🗄️  Configurando base de datos...
if not exist "database\ferreteria.db" (
  call node scripts/init-database.js 2>nul
)
echo ✓ Base de datos lista
echo.

REM Archivo de configuración
if not exist ".env" (
  echo 🔐 Generando configuración...
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_%random%_%random%_%random%
  ) > .env
)
echo ✓ Configuración lista
echo.

REM Acceso directo en escritorio
set DESKTOP=%USERPROFILE%\Desktop
if exist "!DESKTOP!" (
  (
    echo Set oWS = WScript.CreateObject("WScript.Shell"^)
    echo sLinkFile = "!DESKTOP!\Ferretería POS.lnk"
    echo Set oLink = oWS.CreateShortLink(sLinkFile^)
    echo oLink.TargetPath = "%SCRIPT_DIR%start_pos.bat"
    echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
    echo oLink.Description = "Sistema POS - Ferretería"
    echo oLink.Save
  ) > temp_shortcut.vbs
  cscript //nologo temp_shortcut.vbs 2>nul
  del temp_shortcut.vbs 2>nul
)
echo.

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║      ✓ INSTALACIÓN COMPLETADA - LISTO PARA USAR        ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🎯 INICIAR AHORA:
echo.
echo   1. Doble clic en: start_pos.bat
echo      (o busque "Ferretería POS" en el escritorio)
echo.
echo   Se abrirá automáticamente en el navegador
echo.

echo 🔑 Credenciales:
echo    Usuario: admin
echo    Contraseña: admin123
echo.

echo ⚠️  Cambie la contraseña en primer acceso
echo.

echo ═══════════════════════════════════════════════════════════
echo.

pause

endlocal
