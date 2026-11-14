@echo off
REM Crear ejecutable desde batch usando VBScript

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Crear VBScript que genera el EXE
(
  echo ' Convertir batch a EXE
  echo Set objShell = CreateObject("WScript.Shell"^)
  echo Set objFSO = CreateObject("Scripting.FileSystemObject"^)
  echo.
  echo scriptPath = "%SCRIPT_DIR%ferreteria-app.bat"
  echo exePath = "%SCRIPT_DIR%ferreteria-app.exe"
  echo.
  echo ' Leer el batch
  echo Set batchFile = objFSO.OpenTextFile(scriptPath, 1^)
  echo batchContent = batchFile.ReadAll()
  echo batchFile.Close()
  echo.
  echo ' Crear wrapper en EXE (usando cmd /c^)
  echo objShell.Run "cmd /c echo @echo off ^& " ^& batchContent ^& " ^> """ ^& exePath ^& """.bat"
  echo.
  echo WScript.Echo "EXE creado: " ^& exePath
) > "%SCRIPT_DIR%crear_exe.vbs"

cscript //nologo "%SCRIPT_DIR%crear_exe.vbs"
del "%SCRIPT_DIR%crear_exe.vbs"

endlocal
