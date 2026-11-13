@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ============================================================
echo    FERRETERIA POS - INSTALACION AUTOMATICA
echo    Windows 7 32-bits + Node.js 12.22.12
echo ============================================================
echo.
echo Este script instalara el sistema y lo iniciara automaticamente.
echo.
echo Presiona cualquier tecla para comenzar...
pause >nul
cls

REM ============================================================
REM PASO 1: Verificar Node.js
REM ============================================================
echo.
echo [PASO 1/6] Verificando Node.js...
echo.

where node >nul 2>&1
if errorlevel 1 (
    cls
    echo.
    echo ============================================================
    echo ERROR: Node.js NO esta instalado
    echo ============================================================
    echo.
    echo Necesitas instalar Node.js 12.22.12 para Windows 7 32-bits
    echo.
    echo Descarga desde:
    echo https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
    echo.
    echo Instalalo y vuelve a ejecutar este script.
    echo.
    pause
    exit /b 1
)

node --version
echo.
echo ✓ Node.js instalado correctamente
timeout /t 1 >nul

REM ============================================================
REM PASO 2: Verificar NPM
REM ============================================================
echo.
echo [PASO 2/6] Verificando NPM...
echo.

call npm --version >nul 2>&1
if errorlevel 1 (
    cls
    echo.
    echo ============================================================
    echo ERROR: NPM no funciona correctamente
    echo ============================================================
    echo.
    pause
    exit /b 1
)

call npm --version
echo.
echo ✓ NPM funcionando correctamente
timeout /t 1 >nul

REM ============================================================
REM PASO 3: Verificar frontend compilado
REM ============================================================
echo.
echo [PASO 3/6] Verificando frontend compilado...
echo.

if not exist "frontend\dist\index.html" (
    cls
    echo.
    echo ============================================================
    echo ERROR: Frontend NO encontrado
    echo ============================================================
    echo.
    echo El archivo frontend\dist\index.html no existe.
    echo.
    echo Asegurate de haber clonado el repositorio completo:
    echo   git clone https://github.com/issociety123ea/ferreteria32bit.git
    echo.
    echo O descarga el ZIP completo desde GitHub.
    echo.
    pause
    exit /b 1
)

echo ✓ Frontend compilado encontrado
timeout /t 1 >nul

REM ============================================================
REM PASO 4: Crear directorios
REM ============================================================
echo.
echo [PASO 4/6] Creando directorios del sistema...
echo.

if not exist "database" mkdir "database"
if not exist "database\backups" mkdir "database\backups"
if not exist "uploads" mkdir "uploads"

echo ✓ Directorios creados
timeout /t 1 >nul

REM ============================================================
REM PASO 5: Limpiar e instalar dependencias
REM ============================================================
echo.
echo [PASO 5/6] Instalando dependencias del backend...
echo.
echo IMPORTANTE: Esto puede tardar 10-20 minutos en la primera vez.
echo No cierres esta ventana.
echo.

if exist "node_modules" rmdir /S /Q "node_modules" >nul 2>&1
if exist "package-lock.json" del /Q "package-lock.json" >nul 2>&1

echo Instalando ahora...
echo.

call npm install --production --no-optional --legacy-peer-deps
if errorlevel 1 (
    cls
    echo.
    echo ============================================================
    echo ERROR: Fallo la instalacion de dependencias
    echo ============================================================
    echo.
    echo Intenta manualmente:
    echo   npm install --production
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ Dependencias instaladas correctamente
timeout /t 2 >nul

REM ============================================================
REM PASO 6: Crear archivo .env
REM ============================================================
echo.
echo [PASO 6/6] Configurando sistema...
echo.

if not exist ".env" (
    (
        echo PORT=3000
        echo NODE_ENV=production
        echo DB_PATH=./database/ferreteria.db
        echo JWT_SECRET=ferreteria_secret_%RANDOM%%RANDOM%
    ) > ".env"
    echo ✓ Archivo .env creado
) else (
    echo ✓ Archivo .env ya existe
)

timeout /t 1 >nul

REM ============================================================
REM INSTALACION COMPLETADA - INICIANDO SISTEMA
REM ============================================================
cls
echo.
echo ============================================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ============================================================
echo.
echo El sistema se iniciara automaticamente en 3 segundos...
echo.
echo Abre tu navegador en: http://localhost:3000
echo.
echo Credenciales:
echo   Usuario:    admin
echo   Contrasena: admin123
echo.
echo ============================================================
echo.

timeout /t 3 >nul

cls
echo.
echo ============================================================
echo    FERRETERIA POS - SERVIDOR INICIADO
echo ============================================================
echo.
echo Servidor corriendo en: http://localhost:3000
echo.
echo CREDENCIALES POR DEFECTO:
echo   Usuario:    admin
echo   Contrasena: admin123
echo.
echo   Usuario:    vendedor1
echo   Contrasena: 1234
echo.
echo Presiona CTRL+C para detener el servidor
echo.
echo ============================================================
echo.

REM Iniciar el servidor
node backend/server.js

REM Si el servidor se detiene
echo.
echo.
echo ============================================================
echo SERVIDOR DETENIDO
echo ============================================================
echo.
echo Para reiniciar el servidor ejecuta: INICIAR.bat
echo.
pause

endlocal
exit /b 0
