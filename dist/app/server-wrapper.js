#!/usr/bin/env node
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const appDir = __dirname;

// Crear directorios
['database', 'database/backups', 'uploads'].forEach(dir => {
  const fullPath = path.join(appDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Crear .env
const envFile = path.join(appDir, '.env');
if (!fs.existsSync(envFile)) {
  fs.writeFileSync(envFile, 
    `PORT=3000\nNODE_ENV=production\nDB_PATH=./database/ferreteria.db\nJWT_SECRET=ferreteria_${Date.now()}`
  );
}

// Abrir navegador
setTimeout(() => {
  const cmd = process.platform === 'win32' ? 'start' : 'open';
  spawn(cmd, ['http://localhost:3000']);
}, 1000);

// Iniciar servidor
const server = spawn('node', [path.join(appDir, 'backend/server.js')], {
  cwd: appDir,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});
