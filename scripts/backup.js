#!/usr/bin/env node

/**
 * Sistema de Backup Automático para Ferretería POS
 * Crea copias de seguridad de la base de datos y datos importantes
 * Se ejecuta automáticamente al iniciar la aplicación
 * Con verificación de integridad y logging detallado
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DB_PATH = path.join(__dirname, '..', 'database', 'ferreteria.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const MAX_BACKUPS = 30; // Mantener últimas 30 copias

// Crear directorio de logs si no existe
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Crear directorios si no existen
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Logger para backup
const logBackup = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);

  try {
    const logFile = path.join(LOGS_DIR, 'backup.log');
    fs.appendFileSync(logFile, logMessage + '\n');
  } catch (e) {
    console.error('Error escribiendo log:', e.message);
  }
};

// Calcular hash SHA256 de un archivo para verificar integridad
const calculateFileHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (error) {
    return null;
  }
};

const createBackup = () => {
  try {
    logBackup('=== INICIANDO BACKUP AUTOMÁTICO ===');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupName = `ferreteria-backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Crear directorio para este backup
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    let filesBackedUp = [];
    let errors = [];

    // 1. Copiar base de datos con verificación
    if (fs.existsSync(DB_PATH)) {
      try {
        const dbBackupPath = path.join(backupPath, 'ferreteria.db');
        fs.copyFileSync(DB_PATH, dbBackupPath);

        // Verificar que el archivo se copió correctamente
        const origHash = calculateFileHash(DB_PATH);
        const backupHash = calculateFileHash(dbBackupPath);

        if (origHash === backupHash) {
          logBackup(`✓ Base de datos respaldada correctamente (Hash: ${backupHash.substring(0, 8)}...)`);
          filesBackedUp.push({
            file: 'ferreteria.db',
            size: fs.statSync(dbBackupPath).size,
            hash: backupHash
          });
        } else {
          errors.push('Hash de verificación de base de datos no coincide');
          logBackup('⚠ Error en verificación de base de datos', 'WARNING');
        }
      } catch (error) {
        errors.push(`Error al copiar base de datos: ${error.message}`);
        logBackup(`❌ Error al copiar base de datos: ${error.message}`, 'ERROR');
      }
    } else {
      logBackup(`⚠ Base de datos no encontrada en: ${DB_PATH}`, 'WARNING');
    }

    // 2. Copiar directorio de uploads con verificación
    if (fs.existsSync(UPLOADS_DIR)) {
      try {
        const uploadsBackupPath = path.join(backupPath, 'uploads');
        copyDirRecursive(UPLOADS_DIR, uploadsBackupPath);
        const uploadStats = getDirSize(uploadsBackupPath);
        logBackup(`✓ Carpeta de uploads respaldada (${(uploadStats.size / 1024).toFixed(2)} KB)`);
        filesBackedUp.push({
          file: 'uploads/',
          size: uploadStats.size,
          fileCount: uploadStats.fileCount
        });
      } catch (error) {
        errors.push(`Error al copiar uploads: ${error.message}`);
        logBackup(`❌ Error al copiar uploads: ${error.message}`, 'ERROR');
      }
    } else {
      logBackup(`⚠ Carpeta uploads no encontrada`, 'WARNING');
    }

    // 3. Crear archivo de información del backup con metadatos
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
      description: 'Copia de seguridad automática del sistema POS Ferretería',
      includes: ['database', 'uploads'],
      filesBackedUp: filesBackedUp,
      errors: errors,
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

    if (errors.length === 0) {
      logBackup(`✅ Backup completado exitosamente: ${backupName}`);
      logBackup(`📁 Ubicación: ${backupPath}`);
    } else {
      logBackup(`⚠ Backup completado con advertencias: ${backupName}`, 'WARNING');
      errors.forEach(e => logBackup(`  - ${e}`, 'WARNING'));
    }

    // Limpiar backups antiguos
    cleanOldBackups();

    logBackup('=== FIN DE BACKUP AUTOMÁTICO ===\n');
    return backupPath;
  } catch (error) {
    logBackup(`❌ Error crítico al crear backup: ${error.message}`, 'ERROR');
    logBackup(error.stack, 'ERROR');
    process.exit(1);
  }
};

// Obtener tamaño total de un directorio
const getDirSize = (dirPath) => {
  let size = 0;
  let fileCount = 0;

  const walkDir = (currentPath) => {
    const files = fs.readdirSync(currentPath);
    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        walkDir(filePath);
      } else {
        size += stats.size;
        fileCount++;
      }
    });
  };

  walkDir(dirPath);
  return { size, fileCount };
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
      logBackup(`Limpiando ${toDelete.length} backups antiguos...`);
      toDelete.forEach((backup) => {
        try {
          const backupPath = path.join(BACKUP_DIR, backup);
          const size = getDirSize(backupPath);
          fs.rmSync(backupPath, { recursive: true, force: true });
          logBackup(`🗑️  Backup antiguo eliminado: ${backup} (${(size.size / 1024 / 1024).toFixed(2)} MB)`);
        } catch (error) {
          logBackup(`Error al eliminar backup ${backup}: ${error.message}`, 'ERROR');
        }
      });
    }
  } catch (error) {
    logBackup(`Error al limpiar backups antiguos: ${error.message}`, 'ERROR');
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
    let totalSize = 0;

    backups.forEach((backup, index) => {
      const backupPath = path.join(BACKUP_DIR, backup);
      const size = getDirSize(backupPath);
      const sizeInMB = (size.size / (1024 * 1024)).toFixed(2);
      totalSize += size.size;

      const infoFile = path.join(backupPath, 'backup-info.json');
      let status = 'UNKNOWN';
      if (fs.existsSync(infoFile)) {
        try {
          const info = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
          status = info.status || 'UNKNOWN';
        } catch (e) {
          status = 'ERROR_READING_INFO';
        }
      }

      console.log(`${index + 1}. ${backup}`);
      console.log(`   Estado: ${status}`);
      console.log(`   Tamaño: ${sizeInMB} MB`);
      console.log(`   Archivos: ${size.fileCount}`);
      console.log(`   Ubicación: ${backupPath}\n`);
    });

    console.log(`Total de backups: ${backups.length}`);
    console.log(`Tamaño total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB\n`);
  } catch (error) {
    console.error('Error al listar backups:', error.message);
  }
};

const verifyBackup = (backupName) => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
      console.log(`❌ Backup no encontrado: ${backupName}`);
      return false;
    }

    console.log(`\n🔍 Verificando backup: ${backupName}\n`);

    const infoFile = path.join(backupPath, 'backup-info.json');
    if (!fs.existsSync(infoFile)) {
      console.log('❌ Archivo backup-info.json no encontrado');
      return false;
    }

    const info = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
    console.log(`Estado: ${info.status}`);
    console.log(`Timestamp: ${info.timestamp}`);
    console.log(`Archivos incluidos:`);

    info.filesBackedUp.forEach(file => {
      console.log(`  ✓ ${file.file} (${(file.size / 1024).toFixed(2)} KB)`);
    });

    if (info.errors.length > 0) {
      console.log(`\nErrores encontrados:`);
      info.errors.forEach(error => {
        console.log(`  ❌ ${error}`);
      });
    } else {
      console.log(`\n✅ Backup verificado correctamente`);
    }

    return info.status === 'SUCCESS';
  } catch (error) {
    console.error('Error al verificar backup:', error.message);
    return false;
  }
};

// Ejecutar según argumentos
const args = process.argv.slice(2);

if (args.includes('--list')) {
  listBackups();
} else if (args.includes('--verify')) {
  const backupName = args[args.indexOf('--verify') + 1];
  if (backupName) {
    verifyBackup(backupName);
  } else {
    console.log('Uso: node backup.js --verify <nombre-del-backup>');
  }
} else if (args.includes('--create')) {
  createBackup();
} else {
  // Ejecutar automáticamente al iniciar
  createBackup();
}

module.exports = { createBackup, listBackups, verifyBackup, logBackup };
