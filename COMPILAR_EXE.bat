@echo off
REM ========================================
REM CONSTRUIR EXE - Ferretería POS
REM Windows 7 32-bits Standalone
REM ========================================

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║      COMPILANDO: Ferretería POS - EXE Win7 32-bit       ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 1. Compilar frontend
if not exist "frontend\dist" (
  echo 📦 Compilando interfaz...
  cd frontend
  call npm run build
  cd ..
  if %errorlevel% neq 0 (
    echo ❌ Error compilando frontend
    pause
    exit /b 1
  )
)
echo ✓ Interfaz lista
echo.

REM 2. Instalar pkg si es necesario
echo 📥 Preparando herramientas de compilación...
call npm install --save-dev pkg@latest

if %errorlevel% neq 0 (
  echo ⚠️  Advertencia: Intentando con pkg global
  where pkg >nul 2>nul
  if %errorlevel% neq 0 (
    echo npm install -g pkg
    call npm install -g pkg
  )
)
echo ✓ Compilador listo
echo.

REM 3. Crear carpeta de salida
if not exist "dist" mkdir dist

REM 4. Compilar EXE
echo 🔨 Compilando ejecutable (esto toma 2-5 minutos)...
echo    Destino: Windows 7 32-bits
echo.

call npx pkg . --target node18-win-x86 --compress Brotli --output dist\ferreteria-app.exe

if %errorlevel% neq 0 (
  echo ❌ Error en compilación
  echo.
  echo Intente manualmente:
  echo   npx pkg . --target node18-win-x86 --output dist\ferreteria-app.exe
  pause
  exit /b 1
)

echo.
echo ✓ Compilación completada
echo.

REM 5. Verificar resultado
if exist "dist\ferreteria-app.exe" (
  for %%A in ("dist\ferreteria-app.exe") do set SIZE=%%~zA
  set /a SIZE_MB=!SIZE!/1048576

  echo ╔═══════════════════════════════════════════════════════════╗
  echo ║                                                           ║
  echo ║           ✓ EXE GENERADO EXITOSAMENTE                   ║
  echo ║                                                           ║
  echo ╚═══════════════════════════════════════════════════════════╝
  echo.
  echo 📦 Archivo: dist\ferreteria-app.exe
  echo 💾 Tamaño: %SIZE_MB% MB
  echo.
  echo 🎯 USO:
  echo.
  echo   1. Copie: ferreteria-app.exe
  echo   2. En Windows 7 32-bits, doble clic
  echo   3. Se abrirá en navegador automáticamente
  echo.
  echo 🌐 URL: http://localhost:3000
  echo 🔑 Usuario: admin | Contraseña: admin123
  echo.
) else (
  echo ❌ Error: No se generó el EXE
  pause
  exit /b 1
)

echo.
pause

endlocal
