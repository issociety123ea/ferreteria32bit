const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, isRoot } = require('../middleware/auth.js');
const backupsController = require('../controllers/backups.controller.js');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// =====================================================
// RUTAS DE BACKUPS - Solo para ROOT
// =====================================================

// Crear backup manual
router.post('/crear', isRoot, backupsController.crearBackupManual);

// Listar todos los backups
router.get('/listar', requireRole('ADMIN', 'ROOT'), backupsController.listarBackups);

// Verificar integridad de un backup
router.get('/verificar/:backupName', isRoot, backupsController.verificarBackup);

// Descargar backup (ZIP)
router.get('/descargar/:backupName', isRoot, backupsController.descargarBackup);

// Eliminar backup antiguo
router.delete('/eliminar/:backupName', isRoot, backupsController.eliminarBackup);

// Obtener estado y estadísticas de backups
router.get('/estado', requireRole('ADMIN', 'ROOT'), backupsController.obtenerEstadoBackups);

module.exports = router;
