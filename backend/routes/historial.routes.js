const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller.js');
const { authenticate, authorize } = require('../middleware/auth.js');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener historial completo de transacciones (ventas y compras)
router.get('/transacciones', authorize(['ADMIN', 'ROOT']), historialController.getHistorialTransacciones);

// Obtener historial de ventas (vendedores ven solo las suyas, admins ven todas)
router.get('/ventas', authenticate, historialController.getHistorialVentas);

// Obtener historial de auditoría
router.get('/auditoria', authorize(['ADMIN', 'ROOT']), historialController.getHistorialAuditoria);

// Obtener historial de movimientos de inventario (kardex)
router.get('/kardex', authorize(['ADMIN', 'ROOT']), historialController.getHistorialKardex);

// Obtener historial completo de un cliente
router.get('/cliente/:id', authorize(['ADMIN', 'ROOT', 'VENDEDOR']), historialController.getHistorialCliente);

module.exports = router;
