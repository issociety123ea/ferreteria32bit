import express from 'express';
import * as categoriasController from '../controllers/categorias.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, categoriasController.getAll);
router.post('/', authenticateToken, isAdmin, categoriasController.create);
router.put('/:id', authenticateToken, isAdmin, categoriasController.update);

export default router;
