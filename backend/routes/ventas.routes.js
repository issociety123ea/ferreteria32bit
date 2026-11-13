const express = require('express');
const { generateNumeroVenta, create, getAll, offset, getById, annulSale } = require('../controllers/ventas.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, getAll);
router.get('/mi-historial', authenticateToken, getMiHistorial);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, create);
router.post('/:id/anular', authenticateToken, isAdmin, anular);

module.exports = router;
