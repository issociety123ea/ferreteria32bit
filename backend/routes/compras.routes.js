import express from 'express';
import * as comprasController from '../controllers/compras.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, comprasController.getAll);
router.get('/:id', authenticateToken, isAdmin, comprasController.getById);
router.post('/', authenticateToken, isAdmin, comprasController.create);

export default router;
