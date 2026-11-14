const express = require('express');
const { getAll, getById, create, update, deleteProveedor } = require('../controllers/proveedores.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.get('/:id', authenticateToken, isAdmin, getById);
router.post('/', authenticateToken, isAdmin, create);
router.put('/:id', authenticateToken, isAdmin, update);
router.delete('/:id', authenticateToken, isAdmin, deleteProveedor);

module.exports = router;
