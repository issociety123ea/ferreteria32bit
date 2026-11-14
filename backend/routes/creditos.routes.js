const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditos.controller.js');
const { authenticateToken, requireRole } = require('../middleware/auth.js');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los créditos con filtros
router.get('/', requireRole('ADMIN', 'ROOT'), creditosController.getAll);

// Obtener resumen de créditos por cliente
router.get('/resumen', requireRole('ADMIN', 'ROOT'), creditosController.getResumenPorCliente);

// Obtener un crédito por ID
router.get('/:id', requireRole('ADMIN', 'ROOT', 'VENDEDOR'), creditosController.getById);

// Registrar un pago a un crédito
router.post('/pagar', requireRole('ADMIN', 'ROOT', 'VENDEDOR'), creditosController.registrarPago);

// Obtener historial de pagos de un cliente
router.get('/cliente/:id/pagos', requireRole('ADMIN', 'ROOT'), creditosController.getHistorialPagosCliente);

// Cancelar un crédito
router.post('/:id/cancelar', requireRole('ADMIN', 'ROOT'), creditosController.cancelarCredito);

module.exports = router;
