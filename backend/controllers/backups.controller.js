/**
 * Controlador de Backups
 * Gestiona las copias de seguridad del sistema
 * Solo ROOT puede acceder a todas las funciones
 */

const db = require('../config/database.js');
const path = require('path');
const fs = require('fs');
const backupScript = require('../../scripts/backup.js');

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');

// archiver es opcional, pero recomendado para descargar backups en ZIP
let archiver;
try {
  archiver = require('archiver');
} catch (e) {
  archiver = null;
}

// =====================================================
// CREAR BACKUP MANUAL
// =====================================================

const crearBackupManual = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT') {
      return res.status(403).json({ success: false, message: 'Solo ROOT puede crear backups manuales' });
    }

    console.log(`[BACKUP] Iniciando backup manual solicitado por ${req.user.username}`);
    const backupPath = await backupScript.createBackup();

    // Registrar en auditoría
    await db.prepare(`
      INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, datos_nuevos, ip_address)
      VALUES (?, 'CREAR_BACKUP', 'SISTEMA', 'backups', ?, ?)
    `).run(
      req.user.id,
      JSON.stringify({ backup_path: backupPath }),
      req.ip
    );

    res.json({
      success: true,
      message: 'Backup creado exitosamente',
      data: {
        backup_path: backupPath,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error al crear backup manual:', error);
    res.status(500).json({ success: false, message: 'Error al crear backup' });
  }
};

// =====================================================
// LISTAR BACKUPS
// =====================================================

const listarBackups = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT' && req.user.rol !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'No tiene permisos para ver backups' });
    }

    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({
        success: true,
        data: {
          backups: [],
          total: 0
        }
      });
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('ferreteria-backup-'))
      .sort()
      .reverse()
      .map(backupName => {
        const backupPath = path.join(BACKUP_DIR, backupName);
        const stats = fs.statSync(backupPath);
        let status = 'UNKNOWN';
        let info = null;

        const infoFile = path.join(backupPath, 'backup-info.json');
        if (fs.existsSync(infoFile)) {
          try {
            info = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
            status = info.status || 'UNKNOWN';
          } catch (e) {
            status = 'ERROR_READING_INFO';
          }
        }

        // Calcular tamaño
        let size = 0;
        const walkDir = (dir) => {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            const fileStats = fs.statSync(filePath);
            if (fileStats.isDirectory()) {
              walkDir(filePath);
            } else {
              size += fileStats.size;
            }
          });
        };
        walkDir(backupPath);

        return {
          nombre: backupName,
          estado: status,
          tamaño: size,
          tamaño_mb: (size / (1024 * 1024)).toFixed(2),
          fecha_creacion: info?.timestamp || null,
          info: info
        };
      });

    const totalSize = backups.reduce((sum, b) => sum + b.tamaño, 0);

    res.json({
      success: true,
      data: {
        backups,
        total: backups.length,
        tamaño_total_mb: (totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error al listar backups:', error);
    res.status(500).json({ success: false, message: 'Error al listar backups' });
  }
};

// =====================================================
// VERIFICAR INTEGRIDAD DE BACKUP
// =====================================================

const verificarBackup = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT') {
      return res.status(403).json({ success: false, message: 'Solo ROOT puede verificar backups' });
    }

    const { backupName } = req.params;
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ success: false, message: 'Backup no encontrado' });
    }

    const infoFile = path.join(backupPath, 'backup-info.json');
    if (!fs.existsSync(infoFile)) {
      return res.status(400).json({ success: false, message: 'Archivo de información del backup no encontrado' });
    }

    const info = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));

    // Verificar que existen los archivos
    let archivosVerificados = [];
    let erroresVerificacion = [];

    if (info.filesBackedUp) {
      info.filesBackedUp.forEach(fileInfo => {
        const filePath = path.join(backupPath, fileInfo.file.replace(/\/$/, ''));
        if (fs.existsSync(filePath)) {
          archivosVerificados.push({
            archivo: fileInfo.file,
            estado: 'OK',
            tamaño: fileInfo.size
          });
        } else {
          erroresVerificacion.push(`Archivo no encontrado: ${fileInfo.file}`);
        }
      });
    }

    const resultadoVerificacion = {
      backup: backupName,
      estado: erroresVerificacion.length === 0 ? 'VÁLIDO' : 'INVÁLIDO',
      timestamp: info.timestamp,
      archivos_verificados: archivosVerificados,
      errores: erroresVerificacion,
      info_original: info
    };

    res.json({
      success: true,
      data: resultadoVerificacion
    });
  } catch (error) {
    console.error('Error al verificar backup:', error);
    res.status(500).json({ success: false, message: 'Error al verificar backup' });
  }
};

// =====================================================
// DESCARGAR BACKUP
// =====================================================

const descargarBackup = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT') {
      return res.status(403).json({ success: false, message: 'Solo ROOT puede descargar backups' });
    }

    const { backupName } = req.params;
    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ success: false, message: 'Backup no encontrado' });
    }

    // Si archiver está disponible, crear ZIP
    if (archiver) {
      const zipName = `${backupName}.zip`;
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => {
        console.error('Error al crear ZIP:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error al descargar backup' });
        }
      });

      archive.pipe(res);
      archive.directory(backupPath, backupName);
      archive.finalize();
    } else {
      // Si archiver no está disponible, devolver JSON con ruta
      return res.json({
        success: true,
        message: 'Backup disponible para descargar manualmente',
        data: {
          backup_name: backupName,
          backup_path: backupPath,
          nota: 'Para descargar como ZIP, instale: npm install archiver',
          archivos: fs.readdirSync(backupPath)
        }
      });
    }

    // Registrar descarga
    await db.prepare(`
      INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, datos_nuevos, ip_address)
      VALUES (?, 'DESCARGAR_BACKUP', 'SISTEMA', 'backups', ?, ?)
    `).run(
      req.user.id,
      JSON.stringify({ backup_name: backupName }),
      req.ip
    );
  } catch (error) {
    console.error('Error al descargar backup:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error al descargar backup' });
    }
  }
};

// =====================================================
// ELIMINAR BACKUP ANTIGUO
// =====================================================

const eliminarBackup = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT') {
      return res.status(403).json({ success: false, message: 'Solo ROOT puede eliminar backups' });
    }

    const { backupName } = req.params;
    const { confirmar } = req.body;

    if (!confirmar) {
      return res.status(400).json({
        success: false,
        message: 'Debe confirmar la eliminación',
        warning: 'Esta acción es irreversible'
      });
    }

    const backupPath = path.join(BACKUP_DIR, backupName);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ success: false, message: 'Backup no encontrado' });
    }

    // Calcular tamaño antes de eliminar
    let size = 0;
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const fileStats = fs.statSync(filePath);
        if (fileStats.isDirectory()) {
          walkDir(filePath);
        } else {
          size += fileStats.size;
        }
      });
    };
    walkDir(backupPath);

    fs.rmSync(backupPath, { recursive: true, force: true });

    // Registrar eliminación
    await db.prepare(`
      INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, datos_nuevos, ip_address)
      VALUES (?, 'ELIMINAR_BACKUP', 'SISTEMA', 'backups', ?, ?)
    `).run(
      req.user.id,
      JSON.stringify({ backup_name: backupName, size_mb: (size / (1024 * 1024)).toFixed(2) }),
      req.ip
    );

    res.json({
      success: true,
      message: 'Backup eliminado exitosamente',
      data: {
        backup_eliminado: backupName,
        espacio_liberado_mb: (size / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error al eliminar backup:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar backup' });
  }
};

// =====================================================
// OBTENER ESTADO DE BACKUPS
// =====================================================

const obtenerEstadoBackups = async (req, res) => {
  try {
    if (req.user.rol !== 'ROOT' && req.user.rol !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'No tiene permisos' });
    }

    const ultimoBackup = await db.prepare(`
      SELECT * FROM auditoria
      WHERE accion = 'CREAR_BACKUP' AND modulo = 'SISTEMA'
      ORDER BY fecha DESC
      LIMIT 1
    `).get();

    const estadisticas = await db.prepare(`
      SELECT
        COUNT(*) as total_backups_creados,
        MAX(fecha) as ultimo_backup,
        COUNT(CASE WHEN DATE(fecha) = DATE('now') THEN 1 END) as backups_hoy
      FROM auditoria
      WHERE accion = 'CREAR_BACKUP' AND modulo = 'SISTEMA'
    `).get();

    res.json({
      success: true,
      data: {
        ultimos_backups: estadisticas,
        ultimo_backup_info: ultimoBackup
      }
    });
  } catch (error) {
    console.error('Error al obtener estado de backups:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estado de backups' });
  }
};

module.exports = {
  crearBackupManual,
  listarBackups,
  verificarBackup,
  descargarBackup,
  eliminarBackup,
  obtenerEstadoBackups
};
