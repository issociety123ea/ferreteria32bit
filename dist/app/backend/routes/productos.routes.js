import express from 'express';
import * as productosController from '../controllers/productos.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticateToken, productosController.getAll);
router.get('/search', authenticateToken, productosController.search);
router.get('/frecuentes', authenticateToken, productosController.getFrecuentes);
router.get('/:id', authenticateToken, productosController.getById);
router.post('/', authenticateToken, isAdmin, upload.single('imagen'), productosController.create);
router.put('/:id', authenticateToken, isAdmin, upload.single('imagen'), productosController.update);
router.post('/:id/ajustar-stock', authenticateToken, isAdmin, productosController.adjustStock);

export default router;
