import express from 'express';
import * as clientesController from '../controllers/clientes.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, clientesController.getAll);
router.get('/search', authenticateToken, clientesController.search);
router.get('/:id', authenticateToken, clientesController.getById);
router.get('/:id/productos-frecuentes', authenticateToken, clientesController.getProductosFrecuentes);
router.post('/', authenticateToken, clientesController.create);
router.put('/:id', authenticateToken, clientesController.update);

export default router;
