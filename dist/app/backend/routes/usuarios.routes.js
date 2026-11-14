import express from 'express';
import * as usuariosController from '../controllers/usuarios.controller.js';
import { authenticateToken, isAdmin, isRoot } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, isAdmin, usuariosController.getAll);
router.post('/', authenticateToken, isRoot, usuariosController.create);
router.put('/:id', authenticateToken, isRoot, usuariosController.update);
router.delete('/:id', authenticateToken, isRoot, usuariosController.deleteUser);

export default router;
