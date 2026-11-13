@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

cls
echo.
echo ============================================================
echo    FERRETERIA POS - INSTALACION PARA WINDOWS 7 32-BITS
echo ============================================================
echo.
echo Presiona cualquier tecla para continuar...
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
    echo ERROR: Node.js NO esta instalado
    echo.
    echo Descarga Node.js 12.22.12 para Windows 7 32-bits desde:
    echo https://nodejs.org/dist/v12.22.12/node-v12.22.12-x86.msi
    echo.
    echo Instalalo y vuelve a ejecutar este script.
    echo.
    pause
    exit /b 1
)

node --version 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no se puede ejecutar
    echo.
    pause
    exit /b 1
)
echo.
echo OK - Node.js instalado correctamente
timeout /t 2 >nul
echo.

REM ============================================================
REM PASO 2: Verificar NPM
REM ============================================================
echo [PASO 2/6] Verificando NPM...
echo.
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: NPM no esta instalado
    echo.
    pause
    exit /b 1
)

call npm --version 2>&1
if errorlevel 1 (
    echo ERROR: NPM no se puede ejecutar
    echo.
    pause
    exit /b 1
)
echo.
echo OK - NPM instalado correctamente
timeout /t 2 >nul
echo.

REM ============================================================
REM PASO 3: Crear directorios necesarios
REM ============================================================
echo [PASO 3/6] Creando directorios del sistema...
echo.

if not exist "database" (
    mkdir "database"
    echo   - Creado: database\
)
if not exist "database\backups" (
    mkdir "database\backups"
    echo   - Creado: database\backups\
)
if not exist "uploads" (
    mkdir "uploads"
    echo   - Creado: uploads\
)

echo.
echo OK - Directorios creados
timeout /t 2 >nul
echo.

REM ============================================================
REM PASO 4: Limpiar instalaciones anteriores
REM ============================================================
echo [PASO 4/6] Limpiando instalaciones anteriores...
echo.

if exist "node_modules" (
    echo   - Eliminando node_modules antiguo...
    rmdir /S /Q "node_modules" >nul 2>&1
)
if exist "package-lock.json" (
    echo   - Eliminando package-lock.json antiguo...
    del /Q "package-lock.json" >nul 2>&1
)

echo.
echo OK - Limpieza completada
timeout /t 2 >nul
echo.

REM ============================================================
REM PASO 5: Instalar dependencias del BACKEND
REM ============================================================
echo [PASO 5/6] Instalando dependencias del BACKEND...
echo.
echo IMPORTANTE: Esto puede tardar 10-20 minutos.
echo No cierres esta ventana hasta que termine.
echo.
echo Instalando ahora...
echo.

call npm install --production --no-optional --legacy-peer-deps 2>&1
if errorlevel 1 (
    echo.
    echo ============================================================
    echo ERROR: Fallo la instalacion de dependencias
    echo ============================================================
    echo.
    echo Intenta manualmente con: npm install --production
    echo.
    pause
    exit /b 1
)

echo.
echo OK - Dependencias del backend instaladas correctamente
timeout /t 2 >nul
echo.

REM ============================================================
REM PASO 6: Verificar frontend y crear .env
REM ============================================================
echo [PASO 6/6] Configuracion final...
echo.

REM Verificar frontend compilado
if not exist "frontend\dist\index.html" (
    echo.
    echo ============================================================
    echo ADVERTENCIA: Frontend NO esta compilado
    echo ============================================================
    echo.
    echo El directorio frontend\dist\ no existe o esta vacio.
    echo.
    echo El frontend debe estar pre-compilado porque Node 12
    echo no puede ejecutar Vite 5.
    echo.
    echo SOLUCION:
    echo   1. En una PC con Node.js 18 o superior, ejecuta:
    echo      cd frontend
    echo      npm install
    echo      npm run build
    echo.
    echo   2. Copia la carpeta frontend\dist\ generada a este proyecto
    echo.
    echo   3. Vuelve a ejecutar instalar.bat
    echo.
    echo ============================================================
    echo.
    pause
    exit /b 1
)

echo   - Frontend compilado encontrado: frontend\dist\index.html
echo.

REM Crear archivo .env si no existe
if not exist ".env" (
    echo   - Creando archivo de configuracion .env...
    (
        echo PORT=3000
        echo NODE_ENV=production
        echo DB_PATH=./database/ferreteria.db
        echo JWT_SECRET=ferreteria_secret_%RANDOM%%RANDOM%
    ) > ".env"
    echo   - Archivo .env creado
) else (
    echo   - Archivo .env ya existe
)

echo.
echo OK - Configuracion completada
timeout /t 2 >nul
echo.

REM ============================================================
REM INSTALACION COMPLETADA
REM ============================================================
cls
echo.
echo ============================================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ============================================================
echo.
echo El sistema POS esta listo para usar en Windows 7 32-bits.
echo.
echo PARA INICIAR EL SERVIDOR:
echo   1. Ejecuta el archivo: INICIAR.bat
echo   2. O desde la terminal: npm start
echo.
echo LUEGO ABRE TU NAVEGADOR EN:
echo   http://localhost:3000
echo.
echo CREDENCIALES POR DEFECTO:
echo   Usuario:    admin
echo   Contrasena: admin123
echo.
echo   Usuario:    vendedor1
echo   Contrasena: 1234
echo.
echo ============================================================
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul

endlocal
exit /b 0
