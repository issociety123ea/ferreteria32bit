const express = require('express');
const { ventasDiarias, corteCaja, productosMasVendidos, stockBajo, resumenGeneral } = require('../controllers/reportes.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/ventas-diarias', authenticateToken, isAdmin, ventasDiarias);
router.get('/corte-caja', authenticateToken, corteCaja);
router.get('/productos-mas-vendidos', authenticateToken, isAdmin, productosMasVendidos);
router.get('/stock-bajo', authenticateToken, isAdmin, stockBajo);
router.get('/resumen-general', authenticateToken, isAdmin, resumenGeneral);

module.exports = router;
