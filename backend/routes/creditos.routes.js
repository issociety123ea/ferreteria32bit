const express = require('express');
const router = express.Router();
const creditosController = require('../controllers/creditos.controller.js');
const { authenticate, authorize } = require('../middleware/auth.js');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todos los créditos con filtros
router.get('/', authorize(['ADMIN', 'ROOT']), creditosController.getAll);

// Obtener resumen de créditos por cliente
router.get('/resumen', authorize(['ADMIN', 'ROOT']), creditosController.getResumenPorCliente);

// Obtener un crédito por ID
router.get('/:id', authorize(['ADMIN', 'ROOT', 'VENDEDOR']), creditosController.getById);

// Registrar un pago a un crédito
router.post('/pagar', authorize(['ADMIN', 'ROOT', 'VENDEDOR']), creditosController.registrarPago);

// Obtener historial de pagos de un cliente
router.get('/cliente/:id/pagos', authorize(['ADMIN', 'ROOT']), creditosController.getHistorialPagosCliente);

// Cancelar un crédito
router.post('/:id/cancelar', authorize(['ADMIN', 'ROOT']), creditosController.cancelarCredito);

module.exports = router;
