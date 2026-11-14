const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, isRoot } = require('../middleware/auth.js');
const auditController = require('../controllers/auditoria.controller.js');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// =====================================================
// RUTAS DE AUDITORÍA - Solo para ROOT y ADMIN
// =====================================================

// Obtener todos los registros de auditoría (Solo ROOT ve todo sin filtros)
router.get('/registros', requireRole('ADMIN', 'ROOT'), auditController.getRegistrosAuditoria);

// Obtener auditoría de un usuario específico (Solo ROOT puede ver auditoría de otros)
router.get('/usuario/:usuarioId', requireRole('ADMIN', 'ROOT'), auditController.getAuditoriaUsuario);

// Obtener auditoría por módulo
router.get('/modulo/:modulo', requireRole('ADMIN', 'ROOT'), auditController.getAuditoriaModulo);

// Obtener auditoría de un registro específico
router.get('/registro/:registroId', requireRole('ADMIN', 'ROOT'), auditController.getAuditoriaRegistro);

// Obtener resumen de auditoría (actividad general del sistema)
router.get('/resumen', requireRole('ADMIN', 'ROOT'), auditController.getResumenAuditoria);

// Exportar auditoría a CSV (Solo ROOT)
router.get('/export/csv', isRoot, auditController.exportAuditoriaCsv);

// Limpiar auditoría antigua (Solo ROOT - PELIGROSO)
router.post('/limpiar-antigua', isRoot, auditController.limpiarAuditoriaAntigua);

module.exports = router;
