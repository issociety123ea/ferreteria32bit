Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\EDGE\Desktop\ferreteria"
WshShell.Run "cmd /c node backend/server.js", 0, False
WScript.Sleep 2000
WshShell.Run "http://localhost:3000"
