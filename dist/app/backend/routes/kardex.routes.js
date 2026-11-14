import express from 'express';
import * as kardexController from '../controllers/kardex.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, kardexController.getAll);
router.get('/producto/:producto_id', authenticateToken, isAdmin, kardexController.getByProducto);

export default router;
