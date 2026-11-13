@echo off
REM ========================================
REM SISTEMA POS - FERRETERÍA
REM Detener servidor
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           FERRETERÍA POS - DETENIENDO SERVIDOR           ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Buscar procesos de Node.js en puerto 3000
echo 🔍 Buscando procesos en puerto 3000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
  echo ✓ Deteniendo PID: %%a
  taskkill /PID %%a /F >nul 2>nul
)

echo.
echo ✓ Servidor detenido
echo.
echo ═══════════════════════════════════════════════════════════
echo.

timeout /t 2 /nobreak

endlocal
