using System;
using System.Diagnostics;
using System.IO;
using System.Net;

class Program {
    static void Main() {
        try {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;

            // Crear directorios
            Directory.CreateDirectory(Path.Combine(appDir, "database"));
            Directory.CreateDirectory(Path.Combine(appDir, "database", "backups"));
            Directory.CreateDirectory(Path.Combine(appDir, "uploads"));

            // Crear .env
            string envFile = Path.Combine(appDir, ".env");
            if (!File.Exists(envFile)) {
                string jwt = "ferreteria_" + Guid.NewGuid().ToString().Substring(0, 8);
                File.WriteAllText(envFile,
                    "PORT=3000\n" +
                    "NODE_ENV=production\n" +
                    "DB_PATH=./database/ferreteria.db\n" +
                    "JWT_SECRET=" + jwt);
            }

            // Esperar a que el servidor inicie
            System.Threading.Thread.Sleep(2000);

            // Abrir navegador
            try {
                Process.Start("http://localhost:3000");
            } catch { }

            // Obtener ruta a Node.js
            string nodePath = "node.exe";
            string serverJs = Path.Combine(appDir, "backend", "server.js");

            // Iniciar servidor
            ProcessStartInfo psi = new ProcessStartInfo {
                FileName = nodePath,
                Arguments = "\"" + serverJs + "\"",
                WorkingDirectory = appDir,
                UseShellExecute = false,
                CreateNoWindow = false
            };

            Process process = Process.Start(psi);
            process.WaitForExit();

        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
            System.Threading.Thread.Sleep(5000);
        }
    }
}
