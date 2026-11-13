const express = require('express');
const { getAll, search, getFrecuentes, getById, create, update, adjustStock } = require('../controllers/productos.controller.js');
const { authenticateToken, isAdmin  } = require('../middleware/auth.js');
const { upload  } = require('../middleware/upload.js');

const router = express.Router();

router.get('/', authenticateToken, getAll);
router.get('/search', authenticateToken, search);
router.get('/frecuentes', authenticateToken, getFrecuentes);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, isAdmin, upload.single('imagen'), create);
router.put('/:id', authenticateToken, isAdmin, upload.single('imagen'), update);
router.post('/:id/ajustar-stock', authenticateToken, isAdmin, adjustStock);

module.exports = router;
