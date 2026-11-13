# PowerShell script para crear EXE wrapper

$source = @"
using System;
using System.Diagnostics;
using System.IO;

class Program {
    static void Main() {
        string appDir = AppDomain.CurrentDomain.BaseDirectory;
        string nodePath = Path.Combine(appDir, "node_modules", ".bin", "node.exe");
        string serverPath = Path.Combine(appDir, "backend", "server.js");
        
        // Crear directorios
        Directory.CreateDirectory(Path.Combine(appDir, "database"));
        Directory.CreateDirectory(Path.Combine(appDir, "database", "backups"));
        Directory.CreateDirectory(Path.Combine(appDir, "uploads"));
        
        // Crear .env
        string envFile = Path.Combine(appDir, ".env");
        if (!File.Exists(envFile)) {
            File.WriteAllText(envFile, 
                $"PORT=3000\nNODE_ENV=production\nDB_PATH=./database/ferreteria.db\nJWT_SECRET=ferreteria_{Guid.NewGuid()}");
        }
        
        // Abrir navegador
        System.Threading.Thread.Sleep(1000);
        Process.Start("http://localhost:3000");
        
        // Iniciar servidor
        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = nodePath,
            Arguments = serverPath,
            WorkingDirectory = appDir,
            UseShellExecute = false
        };
        Process.Start(psi).WaitForExit();
    }
}
"@

Add-Type -TypeDefinition $source -Language CSharp -OutputAssembly "dist/ferreteria-app.exe"
Write-Host "EXE generado: dist/ferreteria-app.exe"
