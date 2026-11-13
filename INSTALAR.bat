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
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Node.js no esta instalado
  echo.
  echo Descarga Node.js 12.22.12 (32-bit) desde:
  echo https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
  echo.
  pause
  exit /b 1
)
node --version
echo OK - Node.js detectado
echo.

REM Verificar que frontend/dist existe
echo [2/5] Verificando frontend compilado...
if not exist "frontend\dist\index.html" (
  echo.
  echo ===============================================
  echo   ATENCION: Frontend no esta compilado
  echo ===============================================
  echo.
  echo El frontend debe compilarse en una maquina con Node.js 18+
  echo.
  echo PASOS:
  echo   1. En una PC con Node 18+, ejecuta:
  echo      cd frontend
  echo      npm install
  echo      npm run build
  echo.
  echo   2. Copia la carpeta 'frontend/dist' generada a este proyecto
  echo.
  echo   3. Vuelve a ejecutar instalar.bat
  echo.
  pause
  exit /b 1
)
echo OK - Frontend compilado encontrado en frontend\dist\
echo.

REM Crear directorios
echo [3/5] Creando directorios...
if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads
echo OK - Directorios creados
echo.

REM Limpiar instalaciones viejas del backend
echo [4/5] Limpiando instalaciones viejas...
if exist "node_modules" rmdir /S /Q "node_modules" 2>nul
if exist "package-lock.json" del /Q "package-lock.json" 2>nul
echo OK - Limpieza completada
echo.

REM Instalar dependencias SOLO del backend
echo [5/5] Instalando dependencias del backend...
echo (Esto puede tomar 10-20 minutos en la primera instalacion)
echo.
call npm install --production --legacy-peer-deps --no-audit --no-fund
if %errorlevel% neq 0 (
  echo.
  echo ERROR: Fallo al instalar dependencias del backend
  echo.
  echo Intenta manualmente:
  echo   npm install --production
  echo.
  pause
  exit /b 1
)
echo.
echo OK - Backend instalado correctamente
echo.

REM Crear .env si no existe
if not exist ".env" (
  echo Creando archivo de configuracion .env...
  (
    echo PORT=3000
    echo NODE_ENV=production
    echo DB_PATH=./database/ferreteria.db
    echo JWT_SECRET=ferreteria_pos_secret_%random%_%random%
  ) > .env
  echo OK - Archivo .env creado
  echo.
)

echo.
echo ===============================================
echo   INSTALACION COMPLETADA EXITOSAMENTE
echo ===============================================
echo.
echo El sistema esta listo para usar.
echo.
echo Para iniciar el servidor:
echo   - Doble clic en: INICIAR.bat
echo   - O ejecuta: npm start
echo.
echo Luego abre tu navegador en: http://localhost:3000
echo.
echo Credenciales por defecto:
echo   Usuario: admin
echo   Contrasena: admin123
echo.
echo.
pause

endlocal
