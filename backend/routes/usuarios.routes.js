const express = require('express');
const { getAll, create, update, deleteUser } = require('../controllers/usuarios.controller.js');
const { authenticateToken, isAdmin, isRoot  } = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, isAdmin, getAll);
router.post('/', authenticateToken, isRoot, create);
router.put('/:id', authenticateToken, isRoot, update);
router.delete('/:id', authenticateToken, isRoot, deleteUser);

module.exports = router;
