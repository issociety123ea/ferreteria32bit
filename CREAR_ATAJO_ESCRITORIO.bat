@echo off
REM =====================================================
REM CREAR ACCESO DIRECTO EN EL ESCRITORIO
REM Genera un ícono para ejecutar la aplicación fácilmente
REM =====================================================

setlocal enabledelayedexpansion

REM Obtener rutas
set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%
set DESKTOP=%USERPROFILE%\Desktop
set VBS_FILE=%ROOT_DIR%INICIAR_SIN_TERMINAL.vbs
set SHORTCUT=%DESKTOP%\Ferretería POS.lnk
set ICON_FILE=%ROOT_DIR%icon.ico

REM Verificar que existe el archivo VBS
if not exist "%VBS_FILE%" (
    echo Error: No se encontró INICIAR_SIN_TERMINAL.vbs
    pause
    exit /b 1
)

REM Crear el acceso directo usando PowerShell
powershell -NoProfile -Command ^
  "$shortcut = '%SHORTCUT%'; " ^
  "$scriptPath = '%VBS_FILE%'; " ^
  "$shell = New-Object -ComObject WScript.Shell; " ^
  "$link = $shell.CreateShortcut($shortcut); " ^
  "$link.TargetPath = $scriptPath; " ^
  "$link.WorkingDirectory = '%ROOT_DIR%'; " ^
  "$link.Description = 'Ferretería POS - Sistema de Punto de Venta'; " ^
  "$link.Save(); " ^
  "Write-Host 'Acceso directo creado en el escritorio'"

if errorlevel 1 (
    echo Error al crear el acceso directo
    pause
    exit /b 1
)

echo.
echo ✓ Acceso directo creado exitosamente en: %DESKTOP%
echo.
echo Ahora puede hacer doble clic en "Ferretería POS" en el escritorio para iniciar la aplicación
echo.
pause
