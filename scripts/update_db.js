/**
 * Script para actualizar la base de datos con las nuevas tablas
 * - creditos_refinanciamientos
 * - precios_proveedor
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'ferreteria.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('Conectado a la base de datos SQLite');
});

db.serialize(() => {
  // Habilitar foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // 1. Crear tabla creditos_refinanciamientos
  db.run(`
    CREATE TABLE IF NOT EXISTS creditos_refinanciamientos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credito_id INTEGER NOT NULL,
        fecha_vencimiento_anterior DATETIME,
        fecha_vencimiento_nueva DATETIME,
        razon TEXT,
        usuario_id INTEGER NOT NULL,
        creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (credito_id) REFERENCES creditos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `, (err) => {
    if (err) console.error('Error al crear tabla creditos_refinanciamientos:', err.message);
    else console.log('✓ Tabla creditos_refinanciamientos creada o verificada');
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_refinanciamientos_credito ON creditos_refinanciamientos(credito_id)
  `);

  // 2. Crear tabla precios_proveedor
  db.run(`
    CREATE TABLE IF NOT EXISTS precios_proveedor (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        producto_id INTEGER NOT NULL,
        proveedor_id INTEGER NOT NULL,
        precio_costo REAL NOT NULL,
        fecha_vigencia DATETIME DEFAULT CURRENT_TIMESTAMP,
        notas TEXT,
        activo INTEGER DEFAULT 1,
        creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
        UNIQUE(producto_id, proveedor_id)
    )
  `, (err) => {
    if (err) console.error('Error al crear tabla precios_proveedor:', err.message);
    else console.log('✓ Tabla precios_proveedor creada o verificada');
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_precios_proveedor_producto ON precios_proveedor(producto_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_precios_proveedor_proveedor ON precios_proveedor(proveedor_id)
  `, () => {
    console.log('\n✅ Base de datos actualizada exitosamente.');
    db.close();
  });
});
