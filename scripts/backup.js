#!/usr/bin/env node

/**
 * Sistema de Backup Automático para Ferretería POS
 * Crea copias de seguridad de la base de datos y datos importantes
 * Se ejecuta automáticamente al iniciar la aplicación
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_PATH = path.join(__dirname, '..', 'database', 'ferreteria.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_BACKUPS = 30; // Mantener últimas 30 copias

// Crear directorio de backups si no existe
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const createBackup = () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupName = `ferreteria-backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Crear directorio para este backup
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    // 1. Copiar base de datos
    if (fs.existsSync(DB_PATH)) {
      const dbBackupPath = path.join(backupPath, 'ferreteria.db');
      fs.copyFileSync(DB_PATH, dbBackupPath);
      console.log(`✓ Base de datos respaldada: ${dbBackupPath}`);
    } else {
      console.warn(`⚠ Base de datos no encontrada en: ${DB_PATH}`);
    }

    // 2. Copiar directorio de uploads (imágenes, etc)
    if (fs.existsSync(UPLOADS_DIR)) {
      const uploadsBackupPath = path.join(backupPath, 'uploads');
      copyDirRecursive(UPLOADS_DIR, uploadsBackupPath);
      console.log(`✓ Carpeta de uploads respaldada`);
    } else {
      console.warn(`⚠ Carpeta uploads no encontrada`);
    }

    // 3. Crear archivo de información del backup
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      description: 'Copia de seguridad automática del sistema POS Ferretería',
      includes: ['database', 'uploads'],
      restoreInstructions: `
Para restaurar este backup:
1. Detener la aplicación
2. Copiar ferreteria.db al directorio database/
3. Copiar contenido de uploads/ al directorio uploads/
4. Reiniciar la aplicación
      `
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    );

    console.log(`\n✅ Backup completado: ${backupName}`);
    console.log(`📁 Ubicación: ${backupPath}\n`);

    // Limpiar backups antiguos
    cleanOldBackups();

    return backupPath;
  } catch (error) {
    console.error('❌ Error al crear backup:', error.message);
    process.exit(1);
  }
};

const copyDirRecursive = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

const cleanOldBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('ferreteria-backup-'))
      .sort()
      .reverse();

    if (backups.length > MAX_BACKUPS) {
      const toDelete = backups.slice(MAX_BACKUPS);
      toDelete.forEach((backup) => {
        const backupPath = path.join(BACKUP_DIR, backup);
        fs.rmSync(backupPath, { recursive: true, force: true });
        console.log(`🗑️  Backup antiguo eliminado: ${backup}`);
      });
    }
  } catch (error) {
    console.warn('⚠ Error al limpiar backups antiguos:', error.message);
  }
};

const listBackups = () => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('ferreteria-backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('No hay backups disponibles');
      return;
    }

    console.log('\n📦 Backups disponibles:\n');
    backups.forEach((backup, index) => {
      const backupPath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(backupPath);
      const size = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`${index + 1}. ${backup}`);
      console.log(`   Tamaño: ${size} MB`);
      console.log(`   Ubicación: ${backupPath}\n`);
    });
  } catch (error) {
    console.error('Error al listar backups:', error.message);
  }
};

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listBackups();
} else if (args.includes('--create')) {
  createBackup();
} else {
  // Ejecutar automáticamente al iniciar
  createBackup();
}

module.exports = { createBackup, listBackups };
