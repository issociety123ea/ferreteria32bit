@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ===============================================
echo   FERRETERIA POS - DIAGNOSTICO COMPLETO
echo ===============================================
echo.

REM Verificar Node.js
echo 1. Verificando Node.js...
node --version
if %errorlevel% neq 0 (
  echo ERROR: Node.js no funciona
  pause
  exit /b 1
)
echo OK - Node.js funciona
echo.

REM Verificar npm
echo 2. Verificando npm...
npm --version
if %errorlevel% neq 0 (
  echo ERROR: npm no funciona
  pause
  exit /b 1
)
echo OK - npm funciona
echo.

REM Verificar que backend/server.js existe
echo 3. Verificando archivos...
if not exist "backend\server.js" (
  echo ERROR: backend\server.js no existe
  pause
  exit /b 1
)
echo OK - backend\server.js existe
echo.

REM Verificar sintaxis de Node
echo 4. Verificando sintaxis de backend/server.js...
node -c backend/server.js
if %errorlevel% neq 0 (
  echo ERROR: Sintaxis invalida en backend/server.js
  pause
  exit /b 1
)
echo OK - Sintaxis correcta
echo.

REM Intentar cargar el servidor
echo 5. Intentando iniciar servidor...
echo.
timeout /t 2 /nobreak

node backend/server.js

REM Si llegamos aqui, hubo un error
echo.
echo ERROR: El servidor se cerro
pause

endlocal
