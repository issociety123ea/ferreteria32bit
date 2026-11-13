const express = require('express');
const { getAll, getById, create, update } = require('../controllers/proveedores.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.get('/:id', authenticateToken, isAdmin, getById);
router.post('/', authenticateToken, isAdmin, create);
router.put('/:id', authenticateToken, isAdmin, update);

module.exports = router;
