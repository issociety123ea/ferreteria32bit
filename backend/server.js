const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const { errorHandler } = require('./middleware/errorHandler.js');

// Ejecutar backup automático al iniciar
try {
  const backupScript = require('../scripts/backup.js');
  console.log('🔄 Iniciando backup automático...');
  backupScript.createBackup();
} catch (error) {
  console.warn('⚠️  No se pudo ejecutar backup automático:', error.message);
}

// Import routes
const authRoutes = require('./routes/auth.routes.js');
const productosRoutes = require('./routes/productos.routes.js');
const ventasRoutes = require('./routes/ventas.routes.js');
const clientesRoutes = require('./routes/clientes.routes.js');
const categoriasRoutes = require('./routes/categorias.routes.js');
const comprasRoutes = require('./routes/compras.routes.js');
const proveedoresRoutes = require('./routes/proveedores.routes.js');
const reportesRoutes = require('./routes/reportes.routes.js');
const usuariosRoutes = require('./routes/usuarios.routes.js');
const kardexRoutes = require('./routes/kardex.routes.js');
const creditosRoutes = require('./routes/creditos.routes.js');
const historialRoutes = require('./routes/historial.routes.js');
const auditoriaRoutes = require('./routes/auditoria.routes.js');
const backupsRoutes = require('./routes/backups.routes.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Demasiadas solicitudes, intente nuevamente más tarde' }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'http://localhost:3000'
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads folder
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/kardex', kardexRoutes);
app.use('/api/creditos', creditosRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/backups', backupsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Servidor funcionando correctamente', timestamp: new Date().toISOString() });
});

// Serve static frontend files in production
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║           FERRETERÍA POS - SISTEMA INICIADO              ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  🚀 Servidor: http://localhost:${PORT}`);
  console.log(`  📊 API: http://localhost:${PORT}/api`);
  console.log(`  🗄️  Base de datos: SQLite`);
  console.log(`  📁 Uploads: ${uploadsDir}`);
  console.log('');
  console.log('  Presione CTRL+C para detener');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Cerrando servidor...');
  process.exit(0);
});

module.exports = app;

