CreateObject("WScript.Shell").Run "cmd /c @echo off & " & _
"setlocal enabledelayedexpansion & " & _
"for %%A in (""%~dp0."") do set ""APP_DIR=%%~fA"" & " & _
"cd /d ""!APP_DIR!"" & " & _
"if not exist ""database"" mkdir ""database"" & " & _
"if not exist ""database\backups"" mkdir ""database\backups"" & " & _
"if not exist ""uploads"" mkdir ""uploads"" & " & _
"if not exist "".env"" ( " & _
"  (echo PORT=3000 & echo NODE_ENV=production & echo DB_PATH=./database/ferreteria.db & echo JWT_SECRET=ferreteria_%random%_%random%_%random%) > .env " & _
") & " & _
"title Ferreteria POS & " & _
"timeout /t 1 /nobreak >nul 2>&1 & " & _
"start http://localhost:3000 >nul 2>&1 & " & _
"node ""!APP_DIR!\backend\server.js"" & " & _
"endlocal", 0
