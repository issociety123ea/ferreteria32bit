const express = require('express');
const { getAll, create, update } = require('../controllers/categorias.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, getAll);
router.post('/', authenticateToken, isAdmin, create);
router.put('/:id', authenticateToken, isAdmin, update);

module.exports = router;
