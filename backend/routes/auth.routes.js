const express = require('express');
const { login, cambiarPassword, getProfile } = require('../controllers/auth.controller.js');
const { authenticateToken  } = require('../middleware/auth.js');

const router = express.Router();

router.post('/login', login);
router.post('/cambiar-password', authenticateToken, cambiarPassword);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
