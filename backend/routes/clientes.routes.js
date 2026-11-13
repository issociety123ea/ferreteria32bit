const express = require('express');
const { getAll, getById, create, update, search, getProductosFrecuentes } = require('../controllers/clientes.controller.js');
const { authenticateToken  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, getAll);
router.get('/search', authenticateToken, search);
router.get('/:id', authenticateToken, getById);
router.get('/:id/productos-frecuentes', authenticateToken, getProductosFrecuentes);
router.post('/', authenticateToken, create);
router.put('/:id', authenticateToken, update);

module.exports = router;
