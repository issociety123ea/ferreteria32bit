@echo off
echo Deteniendo servidor POS...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (
    echo No se encontraron procesos de Node.js en ejecucion
) else (
    echo Servidor detenido exitosamente
)
pause
