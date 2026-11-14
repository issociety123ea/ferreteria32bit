import express from 'express';
import * as proveedoresController from '../controllers/proveedores.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, proveedoresController.getAll);
router.get('/:id', authenticateToken, isAdmin, proveedoresController.getById);
router.post('/', authenticateToken, isAdmin, proveedoresController.create);
router.put('/:id', authenticateToken, isAdmin, proveedoresController.update);

export default router;
