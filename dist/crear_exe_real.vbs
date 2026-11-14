' VBScript para crear EXE real embebiendo el batch
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

appDir = objShell.CurrentDirectory

' Crear directorios
objFSO.CreateFolder(appDir & "\database")
objFSO.CreateFolder(appDir & "\database\backups")
objFSO.CreateFolder(appDir & "\uploads")

' Crear .env
Set envFile = objFSO.CreateTextFile(appDir & "\.env", True)
envFile.WriteLine("PORT=3000")
envFile.WriteLine("NODE_ENV=production")
envFile.WriteLine("DB_PATH=./database/ferreteria.db")
envFile.WriteLine("JWT_SECRET=ferreteria_" & Int(Rnd()*10000))
envFile.Close()

' Esperar
WScript.Sleep(1000)

' Abrir navegador
objShell.Run "http://localhost:3000"

' Iniciar servidor
objShell.Run "node """ & appDir & "\backend\server.js"""

WScript.Quit(0)
