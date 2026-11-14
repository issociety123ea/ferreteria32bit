const express = require('express');
const { getAll, getById, create, update, search, getProductosFrecuentes, deleteCliente } = require('../controllers/clientes.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.get('/search', authenticateToken, search);
router.get('/:id', authenticateToken, getById);
router.get('/:id/productos-frecuentes', authenticateToken, getProductosFrecuentes);
router.post('/', authenticateToken, isAdmin, create);
router.put('/:id', authenticateToken, isAdmin, update);
router.delete('/:id', authenticateToken, isAdmin, deleteCliente);

module.exports = router;
