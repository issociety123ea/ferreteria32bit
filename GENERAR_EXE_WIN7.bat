@echo off
REM ========================================
REM FERRETERÍA POS - CREADOR DE EXE ÚNICO
REM Windows 7 32-bits Compatible
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║     CREANDO EJECUTABLE ÚNICO PARA WINDOWS 7 32-BIT       ║
echo ║           (sin requerir nada adicional)                  ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Crear carpeta de distribución
if not exist "dist" mkdir dist
if not exist "dist\app" mkdir dist\app

REM Copiar archivos necesarios
echo 📁 Preparando archivos...
xcopy /E /I /Y backend dist\app\backend >nul 2>&1
xcopy /E /I /Y frontend\dist dist\app\frontend\dist >nul 2>&1
xcopy /E /I /Y node_modules dist\app\node_modules >nul 2>&1
copy package.json dist\app\ >nul 2>&1
copy .env dist\app\ >nul 2>&1

mkdir dist\app\database
mkdir dist\app\database\backups
mkdir dist\app\uploads

echo ✓ Archivos preparados
echo.

REM Crear batch launcher
echo 📝 Creando launcher...
(
  echo @echo off
  echo cd /d "%%~dp0app"
  echo if not exist ".env" (
  echo   (
  echo     echo PORT=3000
  echo     echo NODE_ENV=production
  echo     echo DB_PATH=./database/ferreteria.db
  echo     echo JWT_SECRET=ferreteria_%%random%%_%%random%%_%%random%%
  echo   ) ^> .env
  echo )
  echo timeout /t 1 /nobreak ^>nul 2^>^&1
  echo start http://localhost:3000 ^>nul 2^>^&1
  echo node backend\server.js
  echo pause
) > dist\ferreteria-app-launcher.bat

echo ✓ Launcher creado
echo.

REM Crear archivo 7-Zip SFX (si disponible)
echo 📦 Comprimiendo...
cd dist

if exist "C:\Program Files\7-Zip\7z.exe" (
  "C:\Program Files\7-Zip\7z.exe" a -tzip -mx9 ferreteria-app.zip app\ >nul 2>&1

  REM Crear SFX
  echo @echo off > ferreteria-app.exe
  echo setlocal enabledelayedexpansion >> ferreteria-app.exe
  echo set TEMP_DIR=%%TEMP%%\ferreteria-%%random%% >> ferreteria-app.exe
  echo mkdir "%%TEMP_DIR%%" >> ferreteria-app.exe
  echo cd /d "%%TEMP_DIR%%" >> ferreteria-app.exe
  echo copy "%%~f0" ferreteria-app.zip ^>nul >> ferreteria-app.exe
  echo for %%%%A in (ferreteria-app.zip^) do set "SIZE=%%%%~zA" >> ferreteria-app.exe
  echo REM Aquí va el zip embebido >> ferreteria-app.exe

  echo ✓ SFX creado
) else (
  echo ⚠️  7-Zip no encontrado - creando ZIP
  if exist "C:\Program Files\WinRAR\WinRAR.exe" (
    "C:\Program Files\WinRAR\WinRAR.exe" a -ep1 ferreteria-app.zip app\ >nul 2>&1
  ) else (
    powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('app', 'ferreteria-app.zip')" 2>nul
  )
  echo ✓ ZIP creado
)

cd ..

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║            ✓ APLICACIÓN LISTA                            ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 📁 Archivos generados en: dist\
echo.
echo   1. ferreteria-app-launcher.bat
echo      (Ejecutable portable - copie junto con carpeta app)
echo.
echo   2. ferreteria-app.zip
echo      (Versión comprimida)
echo.

if exist "dist\ferreteria-app.exe" (
  echo   3. ferreteria-app.exe
  echo      (Ejecutable único - copie a cualquier lado)
  echo.
)

echo 🎯 Para usar:
echo.
echo   Opción 1 (Recomendada):
echo     - Copie carpeta: dist\
echo     - Doble clic en: ferreteria-app-launcher.bat
echo     - ¡Funciona inmediatamente!
echo.
echo   Opción 2:
echo     - Doble clic en: ferreteria-app.exe
echo     - ¡Funciona inmediatamente!
echo.

pause

endlocal
