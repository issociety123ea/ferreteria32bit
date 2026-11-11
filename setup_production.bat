@echo off
echo ==========================================
echo  INSTALACION - FERRETERIA POS
echo  Sistema de Punto de Venta
echo ==========================================
echo.

:: Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado. Instale Node.js v22 LTS desde https://nodejs.org
    pause
    exit /b 1
)

echo [√] Node.js detectado
echo.

:: Install backend dependencies
echo Instalando dependencias del servidor...
call npm install --omit=dev
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias del servidor
    pause
    exit /b 1
)
echo [√] Dependencias del servidor instaladas
echo.

:: Install frontend dependencies
echo Instalando dependencias del frontend...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: Fallo al instalar dependencias del frontend
    cd ..
    pause
    exit /b 1
)
echo [√] Dependencias del frontend instaladas
echo.

:: Build frontend
echo Compilando interfaz grafica...
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al compilar el frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [√] Interfaz compilada exitosamente
echo.

:: Setup database
echo Configurando base de datos...
node scripts/setup.js
if errorlevel 1 (
    echo ERROR: Fallo al configurar la base de datos
    pause
    exit /b 1
)
echo [√] Base de datos inicializada
echo.

:: Create startup VBS script
echo Creando script de inicio...
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.CurrentDirectory = "%CD%"
echo WshShell.Run "cmd /c node backend/server.js", 0, False
echo WScript.Sleep 2000
echo WshShell.Run "http://localhost:3000"
) > start_pos.vbs
echo [√] Script de inicio creado ^(start_pos.vbs^)
echo.

:: Create desktop shortcut using PowerShell
echo Creando acceso directo en el Escritorio...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Ferreteria POS.lnk'); $Shortcut.TargetPath = 'wscript.exe'; $Shortcut.Arguments = '\"%CD%\start_pos.vbs\"'; $Shortcut.WorkingDirectory = '%CD%'; $Shortcut.IconLocation = 'shell32.dll,21'; $Shortcut.Description = 'Sistema Punto de Venta - Ferreteria'; $Shortcut.Save()"
if errorlevel 1 (
    echo ADVERTENCIA: No se pudo crear el acceso directo automaticamente
    echo Por favor, cree un acceso directo manualmente a start_pos.vbs
) else (
    echo [√] Acceso directo creado en el Escritorio
)
echo.

echo ==========================================
echo  INSTALACION COMPLETADA
echo ==========================================
echo.
echo  Credenciales por defecto:
echo  --------------------------
echo  Admin:    admin / admin123
echo  Vendedor: vendedor1 / 1234
echo.
echo  Para iniciar el sistema:
echo  - Doble clic en el icono "Ferreteria POS" del Escritorio
echo  - O doble clic en: start_pos.vbs
echo  - O ejecute: npm start
echo.
echo  URL: http://localhost:3000
echo ==========================================
pause
