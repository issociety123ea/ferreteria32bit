const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'ferreteria.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║       FERRETERÍA POS - INICIALIZACIÓN DE BASE DE DATOS   ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✓ Directorio de base de datos creado');
}

// Create database
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('✓ Base de datos conectada\n');

// Check if database is already initialized
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'").get();

if (tables) {
  console.log('⚠️  Base de datos ya inicializada');
  console.log('✓ Saltando creación de schema\n');
} else {
  // Load and execute schema
  console.log('📋 Ejecutando schema SQL...');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('✓ Schema creado exitosamente\n');
}

// Create default users
console.log('👤 Verificando usuarios por defecto...');

const existingUsers = db.prepare('SELECT COUNT(*) as count FROM usuarios').get();

if (existingUsers.count === 0) {
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const vendedorPasswordHash = bcrypt.hashSync('1234', 10);

  db.prepare(`
    INSERT INTO usuarios (nombre, username, password_hash, rol)
    VALUES ('Administrador', 'admin', ?, 'ROOT')
  `).run(adminPasswordHash);

  db.prepare(`
    INSERT INTO usuarios (nombre, username, password_hash, rol)
    VALUES ('Vendedor 1', 'vendedor1', ?, 'VENDEDOR')
  `).run(vendedorPasswordHash);

  console.log('✓ Usuarios creados:');
  console.log('  - admin / admin123 (ROOT)');
  console.log('  - vendedor1 / 1234 (VENDEDOR)\n');
} else {
  console.log('✓ Usuarios ya existen\n');
}

// Insert sample products
console.log('📦 Verificando productos de muestra...');

const existingProducts = db.prepare('SELECT COUNT(*) as count FROM productos').get();

if (existingProducts.count === 0) {
  // Get category IDs for product insertion
  const categorias = db.prepare('SELECT id, nombre FROM categorias').all();
  const getCategoriaId = (nombre) => {
    const cat = categorias.find(c => c.nombre.includes(nombre));
    return cat ? cat.id : categorias[0].id;
  };

  const productos = [
    // Herramientas Manuales
    { codigo: 'FER-001', nombre: 'Martillo de Uña 16oz', categoria: 'Herramientas Manuales', unidad: 'Pieza', decimales: 0, stock: 25, minimo: 5, costo: 35, venta: 55 },
    { codigo: 'FER-002', nombre: 'Destornillador Phillips #2', categoria: 'Herramientas Manuales', unidad: 'Pieza', decimales: 0, stock: 40, minimo: 10, costo: 12, venta: 20 },
    { codigo: 'FER-003', nombre: 'Llave Inglesa 10"', categoria: 'Herramientas Manuales', unidad: 'Pieza', decimales: 0, stock: 15, minimo: 5, costo: 45, venta: 75 },
    { codigo: 'FER-004', nombre: 'Alicate Universal 8"', categoria: 'Herramientas Manuales', unidad: 'Pieza', decimales: 0, stock: 20, minimo: 5, costo: 28, venta: 48 },
    { codigo: 'FER-005', nombre: 'Sierra Manual para Madera', categoria: 'Herramientas Manuales', unidad: 'Pieza', decimales: 0, stock: 12, minimo: 3, costo: 35, venta: 60 },

    // Electricidad
    { codigo: 'ELE-001', nombre: 'Cable THW 12 AWG', categoria: 'Electricidad', unidad: 'Metro', decimales: 1, stock: 500, minimo: 100, costo: 3.5, venta: 6 },
    { codigo: 'ELE-002', nombre: 'Interruptor Simple', categoria: 'Electricidad', unidad: 'Pieza', decimales: 0, stock: 60, minimo: 20, costo: 8, venta: 15 },
    { codigo: 'ELE-003', nombre: 'Foco LED 9W Luz Blanca', categoria: 'Electricidad', unidad: 'Pieza', decimales: 0, stock: 100, minimo: 30, costo: 10, venta: 18 },
    { codigo: 'ELE-004', nombre: 'Tomacorriente Doble', categoria: 'Electricidad', unidad: 'Pieza', decimales: 0, stock: 45, minimo: 15, costo: 12, venta: 22 },
    { codigo: 'ELE-005', nombre: 'Cinta Aislante 3M', categoria: 'Electricidad', unidad: 'Pieza', decimales: 0, stock: 80, minimo: 20, costo: 7, venta: 13 },

    // Plomería
    { codigo: 'PLO-001', nombre: 'Tubo PVC 1/2" x 4m', categoria: 'Plomería', unidad: 'Pieza', decimales: 0, stock: 30, minimo: 10, costo: 12, venta: 22 },
    { codigo: 'PLO-002', nombre: 'Codo PVC 1/2" 90°', categoria: 'Plomería', unidad: 'Pieza', decimales: 0, stock: 200, minimo: 50, costo: 1.5, venta: 3 },
    { codigo: 'PLO-003', nombre: 'Llave de Paso 1/2"', categoria: 'Plomería', unidad: 'Pieza', decimales: 0, stock: 20, minimo: 5, costo: 18, venta: 35 },
    { codigo: 'PLO-004', nombre: 'Cinta Teflón', categoria: 'Plomería', unidad: 'Pieza', decimales: 0, stock: 50, minimo: 15, costo: 3, venta: 6 },

    // Materiales de Construcción
    { codigo: 'CON-001', nombre: 'Cemento Portland 50kg', categoria: 'Materiales de Construcción', unidad: 'Pieza', decimales: 0, stock: 50, minimo: 20, costo: 55, venta: 72 },
    { codigo: 'CON-002', nombre: 'Arena Fina', categoria: 'Materiales de Construcción', unidad: 'Kg', decimales: 1, stock: 2000, minimo: 500, costo: 0.5, venta: 1.2 },
    { codigo: 'CON-003', nombre: 'Ladrillo Gambote', categoria: 'Materiales de Construcción', unidad: 'Pieza', decimales: 0, stock: 500, minimo: 200, costo: 1.8, venta: 3 },

    // Pinturas
    { codigo: 'PIN-001', nombre: 'Pintura Látex Blanca 4lt', categoria: 'Pinturas', unidad: 'Pieza', decimales: 0, stock: 20, minimo: 5, costo: 45, venta: 75 },
    { codigo: 'PIN-002', nombre: 'Thinner Corriente 1lt', categoria: 'Pinturas', unidad: 'Pieza', decimales: 0, stock: 30, minimo: 10, costo: 15, venta: 28 },
    { codigo: 'PIN-003', nombre: 'Brocha 2"', categoria: 'Pinturas', unidad: 'Pieza', decimales: 0, stock: 35, minimo: 10, costo: 8, venta: 15 },
    { codigo: 'PIN-004', nombre: 'Rodillo Espuma 9"', categoria: 'Pinturas', unidad: 'Pieza', decimales: 0, stock: 25, minimo: 8, costo: 12, venta: 22 },

    // Ferretería General
    { codigo: 'GEN-001', nombre: 'Clavos 2 1/2"', categoria: 'Ferretería General', unidad: 'Kg', decimales: 1, stock: 100, minimo: 30, costo: 12, venta: 22 },
    { codigo: 'GEN-002', nombre: 'Tornillos Drywall 1" (x100)', categoria: 'Ferretería General', unidad: 'Caja', decimales: 0, stock: 50, minimo: 15, costo: 18, venta: 30 },
    { codigo: 'GEN-003', nombre: 'Alambre de Amarre #16', categoria: 'Ferretería General', unidad: 'Kg', decimales: 1, stock: 80, minimo: 20, costo: 14, venta: 25 },
    { codigo: 'GEN-004', nombre: 'Silicona Transparente', categoria: 'Ferretería General', unidad: 'Pieza', decimales: 0, stock: 40, minimo: 12, costo: 15, venta: 28 },

    // Seguridad
    { codigo: 'SEG-001', nombre: 'Candado 40mm', categoria: 'Seguridad', unidad: 'Pieza', decimales: 0, stock: 35, minimo: 10, costo: 22, venta: 40 },
    { codigo: 'SEG-002', nombre: 'Cerradura Tipo Bola', categoria: 'Seguridad', unidad: 'Pieza', decimales: 0, stock: 15, minimo: 5, costo: 45, venta: 85 },
    { codigo: 'SEG-003', nombre: 'Cadena Galvanizada 6mm (x metro)', categoria: 'Seguridad', unidad: 'Metro', decimales: 1, stock: 50, minimo: 15, costo: 8, venta: 15 },

    // Herramientas Eléctricas
    { codigo: 'HER-001', nombre: 'Taladro Percutor 13mm 600W', categoria: 'Herramientas Eléctricas', unidad: 'Pieza', decimales: 0, stock: 8, minimo: 2, costo: 280, venta: 450 },
    { codigo: 'HER-002', nombre: 'Amoladora 4 1/2" 850W', categoria: 'Herramientas Eléctricas', unidad: 'Pieza', decimales: 0, stock: 6, minimo: 2, costo: 195, venta: 320 },
    { codigo: 'HER-003', nombre: 'Sierra Circular 7 1/4"', categoria: 'Herramientas Eléctricas', unidad: 'Pieza', decimales: 0, stock: 4, minimo: 1, costo: 350, venta: 580 },
  ];

  const insertProducto = db.prepare(`
    INSERT INTO productos (codigo_sku_interno, nombre, categoria_id, unidad_medida, permite_decimales, stock_actual, stock_minimo, precio_costo, precio_venta)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let contador = 0;
  for (const prod of productos) {
    const categoriaId = getCategoriaId(prod.categoria);
    insertProducto.run(
      prod.codigo,
      prod.nombre,
      categoriaId,
      prod.unidad,
      prod.decimales,
      prod.stock,
      prod.minimo,
      prod.costo,
      prod.venta
    );
    contador++;
  }

  console.log(`✓ ${contador} productos creados\n`);
} else {
  console.log('✓ Productos ya existen\n');
}

// Create default provider
console.log('🏢 Verificando proveedor por defecto...');

const existingProviders = db.prepare('SELECT COUNT(*) as count FROM proveedores').get();

if (existingProviders.count === 0) {
  db.prepare(`
    INSERT INTO proveedores (nombre, razon_social, telefono)
    VALUES ('Distribuidora Central', 'Distribuidora Central SRL', '2-2234567')
  `).run();
  console.log('✓ Proveedor creado\n');
} else {
  console.log('✓ Proveedor ya existe\n');
}

db.close();

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║          ✓ INICIALIZACIÓN COMPLETADA EXITOSAMENTE        ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');
