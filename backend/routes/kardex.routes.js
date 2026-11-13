const express = require('express');
const { getByProducto, getAll } = require('../controllers/kardex.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.get('/producto/:producto_id', authenticateToken, isAdmin, getByProducto);

module.exports = router;
