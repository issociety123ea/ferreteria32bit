@echo off
setlocal enabledelayedexpansion

:: Cambiar a directorio del script
cd /d "%~dp0"

cls
echo.
echo ============================================================
echo    FERRETERIA POS - INSTALACION PARA WINDOWS 7 32-BITS
echo ============================================================
echo.
echo Este script instalara el sistema y lo iniciara.
echo.
echo Presiona cualquier tecla para comenzar...
pause >nul
cls

:: ============================================================
:: PASO 1: Verificar Node.js
:: ============================================================
echo.
echo [PASO 1/6] Verificando Node.js...
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo ERROR: Node.js NO esta instalado
    echo ============================================================
    echo.
    echo Descarga Node.js 12.22.12 para Windows 7 32-bits desde:
    echo https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
    echo.
    echo Instalalo y vuelve a ejecutar este script.
    echo.
    pause
    exit /b 1
)

node --version
echo OK - Node.js detectado
echo.
ping localhost -n 2 >nul

:: ============================================================
:: PASO 2: Verificar NPM
:: ============================================================
echo [PASO 2/6] Verificando NPM...
echo.

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: NPM no funciona
    echo.
    pause
    exit /b 1
)

call npm --version
echo OK - NPM funciona correctamente
echo.
ping localhost -n 2 >nul

:: ============================================================
:: PASO 3: Verificar frontend compilado
:: ============================================================
echo [PASO 3/6] Verificando frontend compilado...
echo.

if not exist "frontend\dist\index.html" (
    echo.
    echo ============================================================
    echo ERROR: Frontend NO encontrado
    echo ============================================================
    echo.
    echo El archivo frontend\dist\index.html no existe.
    echo.
    echo Soluciones:
    echo 1. Descarga el proyecto completo desde GitHub
    echo 2. Clona con: git clone https://github.com/issociety123ea/ferreteria32bit.git
    echo.
    pause
    exit /b 1
)

echo OK - Frontend compilado encontrado
echo.
ping localhost -n 2 >nul

:: ============================================================
:: PASO 4: Crear directorios
:: ============================================================
echo [PASO 4/6] Creando directorios...
echo.

if not exist "database" mkdir database
if not exist "database\backups" mkdir database\backups
if not exist "uploads" mkdir uploads

echo OK - Directorios creados
echo.
ping localhost -n 2 >nul

:: ============================================================
:: PASO 5: Instalar dependencias del backend
:: ============================================================
echo [PASO 5/6] Instalando dependencias del backend...
echo.
echo ATENCION: Esto puede tomar 10-20 minutos.
echo No cierres esta ventana.
echo.

if exist "node_modules" (
    echo Limpiando instalacion anterior...
    rmdir /S /Q node_modules 2>nul
)
if exist "package-lock.json" (
    del /Q package-lock.json 2>nul
)

echo.
echo Instalando ahora (espera por favor)...
echo.

call npm install --production --no-optional --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo ERROR: Fallo la instalacion de dependencias
    echo ============================================================
    echo.
    echo Intenta manualmente con:
    echo   npm install --production
    echo.
    pause
    exit /b 1
)

echo.
echo OK - Dependencias instaladas correctamente
echo.
ping localhost -n 2 >nul

:: ============================================================
:: PASO 6: Crear archivo de configuracion
:: ============================================================
echo [PASO 6/6] Configurando sistema...
echo.

if not exist ".env" (
    echo PORT=3000 > .env
    echo NODE_ENV=production >> .env
    echo DB_PATH=./database/ferreteria.db >> .env
    echo JWT_SECRET=ferreteria_secret_%RANDOM%%RANDOM% >> .env
    echo OK - Archivo .env creado
) else (
    echo OK - Archivo .env ya existe
)

echo.
ping localhost -n 2 >nul

:: ============================================================
:: INSTALACION COMPLETADA - INICIANDO
:: ============================================================
cls
echo.
echo ============================================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ============================================================
echo.
echo El servidor se iniciara en 5 segundos...
echo.
echo Luego abre tu navegador en: http://localhost:3000
echo.
echo Credenciales por defecto:
echo   Usuario:    admin
echo   Password:   admin123
echo.
echo   Usuario:    vendedor1
echo   Password:   1234
echo.
echo ============================================================
echo.

ping localhost -n 6 >nul

cls
echo.
echo ============================================================
echo    SERVIDOR INICIADO
echo ============================================================
echo.
echo Abre tu navegador en: http://localhost:3000
echo.
echo Credenciales:
echo   admin / admin123
echo   vendedor1 / 1234
echo.
echo Presiona CTRL+C para detener el servidor
echo.
echo ============================================================
echo.

:: Iniciar servidor
node backend\server.js

:: Si se detiene el servidor
echo.
echo.
echo ============================================================
echo Servidor detenido
echo ============================================================
echo.
echo Para reiniciar ejecuta: INICIAR.bat
echo.
pause

endlocal
