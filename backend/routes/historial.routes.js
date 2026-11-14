const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller.js');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener historial completo de transacciones (ventas y compras)
router.get('/transacciones', requireRole('ADMIN', 'ROOT'), historialController.getHistorialTransacciones);

// Obtener historial de ventas (vendedores ven solo las suyas, admins ven todas)
router.get('/ventas', historialController.getHistorialVentas);

// Obtener historial de auditoría
router.get('/auditoria', requireRole('ADMIN', 'ROOT'), historialController.getHistorialAuditoria);

// Obtener historial de movimientos de inventario (kardex)
router.get('/kardex', requireRole('ADMIN', 'ROOT'), historialController.getHistorialKardex);

// Obtener historial completo de un cliente
router.get('/cliente/:id', requireRole('ADMIN', 'ROOT', 'VENDEDOR'), historialController.getHistorialCliente);

module.exports = router;
