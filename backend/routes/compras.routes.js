const express = require('express');
const { generateNumeroCompra, create, getAll, offset, getById } = require('../controllers/compras.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.get('/:id', authenticateToken, isAdmin, getById);
router.post('/', authenticateToken, isAdmin, create);

module.exports = router;
