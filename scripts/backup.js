const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'ferreteria.db');
const BACKUP_DIR = path.join(__dirname, '..', 'database', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Check if database exists
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ Base de datos no encontrada');
  process.exit(1);
}

// Create backup with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFilename = `ferreteria_backup_${timestamp}.db`;
const backupPath = path.join(BACKUP_DIR, backupFilename);

console.log(`📦 Creando respaldo: ${backupFilename}`);

try {
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`✓ Respaldo creado exitosamente en: ${backupPath}`);

  // Clean old backups (keep last 7)
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('ferreteria_backup_') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (backups.length > 7) {
    console.log(`\n🧹 Limpiando respaldos antiguos (manteniendo últimos 7)...`);
    const toDelete = backups.slice(7);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`  ✓ Eliminado: ${backup.name}`);
    });
  }

  console.log(`\n✓ Total de respaldos actuales: ${Math.min(backups.length, 7)}`);
} catch (error) {
  console.error('❌ Error al crear respaldo:', error.message);
  process.exit(1);
}
