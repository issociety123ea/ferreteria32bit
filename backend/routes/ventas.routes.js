import express from 'express';
import * as ventasController from '../controllers/ventas.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, ventasController.getAll);
router.get('/mi-historial', authenticateToken, ventasController.getMiHistorial);
router.get('/:id', authenticateToken, ventasController.getById);
router.post('/', authenticateToken, ventasController.create);
router.post('/:id/anular', authenticateToken, isAdmin, ventasController.anular);

export default router;
