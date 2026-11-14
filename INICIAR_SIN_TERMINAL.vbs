' =====================================================
' FERRETERÍA POS - EJECUTABLE SIN VENTANA TERMINAL
' Ejecuta el sistema automáticamente sin mostrar cmd
' =====================================================

Option Explicit
Dim objShell, objFSO, strScriptDir, strRootDir, strBatchFile
Dim objWshScriptExec, objWshProcessEnv

' Crear objetos
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Obtener rutas
strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strRootDir = strScriptDir

' Archivo batch que contiene la lógica
strBatchFile = strRootDir & "\INICIAR.bat"

' Verificar que el archivo batch existe
If Not objFSO.FileExists(strBatchFile) Then
    MsgBox "Error: No se encontró INICIAR.bat en: " & strRootDir, vbCritical, "Ferretería POS - Error"
    WScript.Quit(1)
End If

' Ejecutar batch sin mostrar ventana
' 0 = Oculta, 1 = Normal, 2 = Minimizada
objShell.Run strBatchFile, 0, False

' Esperar un momento antes de salir
WScript.Sleep(2000)

WScript.Quit(0)
