import express from 'express';
import * as reportesController from '../controllers/reportes.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/ventas-diarias', authenticateToken, isAdmin, reportesController.ventasDiarias);
router.get('/corte-caja', authenticateToken, reportesController.corteCaja);
router.get('/productos-mas-vendidos', authenticateToken, isAdmin, reportesController.productosMasVendidos);
router.get('/stock-bajo', authenticateToken, isAdmin, reportesController.stockBajo);
router.get('/resumen-general', authenticateToken, isAdmin, reportesController.resumenGeneral);

export default router;
