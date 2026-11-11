import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/cambiar-password', authenticateToken, authController.cambiarPassword);
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
