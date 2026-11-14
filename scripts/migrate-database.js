const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'ferreteria.db');

console.log('═══════════════════════════════════════════════════════════');
console.log('  MIGRACIÓN DE BASE DE DATOS - SISTEMA FERRETERÍA POS');
console.log('═══════════════════════════════════════════════════════════\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos SQLite\n');
});

db.serialize(() => {
  console.log('📋 Iniciando migración...\n');

  // 1. Verificar si la columna monto_tarjeta existe en ventas
  db.all("PRAGMA table_info(ventas)", (err, columns) => {
    if (err) {
      console.error('❌ Error al verificar estructura de tabla ventas:', err);
      return;
    }

    const hasMontoCreditoColumn = columns.some(col => col.name === 'monto_credito');
    const hasMontaTarjetaColumn = columns.some(col => col.name === 'monto_tarjeta');

    if (hasMontaTarjetaColumn && !hasMontoCreditoColumn) {
      console.log('🔄 Actualizando tabla ventas (eliminando monto_tarjeta, agregando monto_credito)...');

      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          console.error('❌ Error al iniciar transacción:', err);
          return;
        }

        // Eliminar triggers y vistas temporalmente para evitar conflictos
        db.run('DROP TRIGGER IF EXISTS trg_after_venta_detalle_insert');
        db.run('DROP TRIGGER IF EXISTS trg_after_compra_detalle_insert');
        db.run('DROP TRIGGER IF EXISTS trg_after_pago_credito_insert');
        db.run('DROP TRIGGER IF EXISTS trg_after_venta_credito_insert');
        db.run('DROP VIEW IF EXISTS v_ventas_diarias');
        db.run('DROP VIEW IF EXISTS v_productos_stock_bajo');
        db.run('DROP VIEW IF EXISTS v_productos_mas_vendidos');
        db.run('DROP VIEW IF EXISTS v_historial_clientes');
        db.run('DROP VIEW IF EXISTS v_creditos_pendientes');
        db.run('DROP VIEW IF EXISTS v_historial_transacciones');
        db.run('DROP VIEW IF EXISTS v_alertas_inventario');

        // Crear tabla temporal con la nueva estructura
        db.run(`
          CREATE TABLE ventas_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_venta TEXT UNIQUE NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            cliente_id INTEGER,
            usuario_id INTEGER NOT NULL,
            subtotal REAL NOT NULL DEFAULT 0,
            descuento REAL DEFAULT 0,
            total REAL NOT NULL DEFAULT 0,
            total_costo REAL NOT NULL DEFAULT 0,
            ganancia_neta REAL GENERATED ALWAYS AS (total - total_costo) VIRTUAL,
            metodo_pago TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK(metodo_pago IN ('EFECTIVO', 'QR', 'CREDITO', 'MIXTO')),
            monto_efectivo REAL DEFAULT 0,
            monto_qr REAL DEFAULT 0,
            monto_credito REAL DEFAULT 0,
            estado TEXT DEFAULT 'COMPLETADA' CHECK(estado IN ('COMPLETADA', 'ANULADA', 'PENDIENTE')),
            notas TEXT,
            anulada_por INTEGER,
            anulada_en DATETIME,
            motivo_anulacion TEXT,
            creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES clientes(id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
            FOREIGN KEY (anulada_por) REFERENCES usuarios(id)
          )
        `, (err) => {
          if (err) {
            console.error('❌ Error al crear tabla ventas_new:', err);
            db.run('ROLLBACK');
            return;
          }

          // Copiar datos de la tabla antigua a la nueva
          db.run(`
            INSERT INTO ventas_new (id, numero_venta, fecha, cliente_id, usuario_id, subtotal, descuento, total, total_costo, metodo_pago, monto_efectivo, monto_qr, monto_credito, estado, notas, anulada_por, anulada_en, motivo_anulacion, creado_at)
            SELECT id, numero_venta, fecha, cliente_id, usuario_id, subtotal, descuento, total, total_costo, metodo_pago, monto_efectivo, monto_qr, COALESCE(monto_tarjeta, 0) as monto_credito, estado, notas, anulada_por, anulada_en, motivo_anulacion, creado_at
            FROM ventas
          `, (err) => {
            if (err) {
              console.error('❌ Error al copiar datos:', err);
              db.run('ROLLBACK');
              return;
            }

            // Eliminar tabla antigua
            db.run('DROP TABLE ventas', (err) => {
              if (err) {
                console.error('❌ Error al eliminar tabla antigua:', err);
                db.run('ROLLBACK');
                return;
              }

              // Renombrar tabla nueva
              db.run('ALTER TABLE ventas_new RENAME TO ventas', (err) => {
                if (err) {
                  console.error('❌ Error al renombrar tabla:', err);
                  db.run('ROLLBACK');
                  return;
                }

                // Recrear índices
                db.run('CREATE INDEX idx_ventas_fecha ON ventas(fecha)');
                db.run('CREATE INDEX idx_ventas_numero ON ventas(numero_venta)');
                db.run('CREATE INDEX idx_ventas_cliente ON ventas(cliente_id)');
                db.run('CREATE INDEX idx_ventas_usuario ON ventas(usuario_id)');
                db.run('CREATE INDEX idx_ventas_estado ON ventas(estado)');
                db.run('CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago)');

                db.run('COMMIT', (err) => {
                  if (err) {
                    console.error('❌ Error al confirmar cambios:', err);
                    return;
                  }
                  console.log('   ✅ Tabla ventas actualizada correctamente\n');
                  createCreditosTables();
                });
              });
            });
          });
        });
      });
    } else if (!hasMontoCreditoColumn) {
      console.log('✅ Tabla ventas ya tiene la estructura correcta\n');
      createCreditosTables();
    } else {
      console.log('✅ Tabla ventas ya está actualizada\n');
      createCreditosTables();
    }
  });
});

function createCreditosTables() {
  console.log('🔄 Verificando tablas de créditos...');

  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='creditos'", (err, row) => {
    if (err) {
      console.error('❌ Error al verificar tabla creditos:', err);
      db.close();
      return;
    }

    if (!row) {
      console.log('   Creando tabla creditos...');
      db.run(`
        CREATE TABLE IF NOT EXISTS creditos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          venta_id INTEGER NOT NULL,
          cliente_id INTEGER NOT NULL,
          monto_total REAL NOT NULL,
          saldo_pendiente REAL NOT NULL,
          estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO')),
          fecha_credito DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_vencimiento DATETIME,
          notas TEXT,
          creado_por INTEGER NOT NULL,
          creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (venta_id) REFERENCES ventas(id),
          FOREIGN KEY (cliente_id) REFERENCES clientes(id),
          FOREIGN KEY (creado_por) REFERENCES usuarios(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error al crear tabla creditos:', err);
        } else {
          console.log('   ✅ Tabla creditos creada');
          db.run('CREATE INDEX idx_creditos_venta ON creditos(venta_id)');
          db.run('CREATE INDEX idx_creditos_cliente ON creditos(cliente_id)');
          db.run('CREATE INDEX idx_creditos_estado ON creditos(estado)');
          db.run('CREATE INDEX idx_creditos_fecha ON creditos(fecha_credito)');
        }

        createPagosCreditosTable();
      });
    } else {
      console.log('   ✅ Tabla creditos ya existe\n');
      createPagosCreditosTable();
    }
  });
}

function createPagosCreditosTable() {
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='pagos_creditos'", (err, row) => {
    if (err) {
      console.error('❌ Error al verificar tabla pagos_creditos:', err);
      db.close();
      return;
    }

    if (!row) {
      console.log('   Creando tabla pagos_creditos...');
      db.run(`
        CREATE TABLE IF NOT EXISTS pagos_creditos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          credito_id INTEGER NOT NULL,
          monto_pagado REAL NOT NULL,
          metodo_pago TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK(metodo_pago IN ('EFECTIVO', 'QR', 'MIXTO')),
          monto_efectivo REAL DEFAULT 0,
          monto_qr REAL DEFAULT 0,
          saldo_anterior REAL NOT NULL,
          saldo_nuevo REAL NOT NULL,
          fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
          recibido_por INTEGER NOT NULL,
          notas TEXT,
          creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (credito_id) REFERENCES creditos(id) ON DELETE CASCADE,
          FOREIGN KEY (recibido_por) REFERENCES usuarios(id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error al crear tabla pagos_creditos:', err);
        } else {
          console.log('   ✅ Tabla pagos_creditos creada');
          db.run('CREATE INDEX idx_pagos_creditos_credito ON pagos_creditos(credito_id)');
          db.run('CREATE INDEX idx_pagos_creditos_fecha ON pagos_creditos(fecha_pago)');
        }

        createTriggers();
      });
    } else {
      console.log('   ✅ Tabla pagos_creditos ya existe\n');
      createTriggers();
    }
  });
}

function createTriggers() {
  console.log('🔄 Creando triggers...');

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_after_venta_detalle_insert
    AFTER INSERT ON detalle_ventas
    FOR EACH ROW
    WHEN (SELECT estado FROM ventas WHERE id = NEW.venta_id) = 'COMPLETADA'
    BEGIN
        UPDATE productos
        SET stock_actual = stock_actual - NEW.cantidad,
            actualizado_at = CURRENT_TIMESTAMP
        WHERE id = NEW.producto_id;

        INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_id, referencia_tipo, usuario_id, fecha)
        SELECT
            NEW.producto_id,
            'VENTA',
            NEW.cantidad,
            p.stock_actual + NEW.cantidad,
            p.stock_actual,
            NEW.costo_unitario,
            NEW.venta_id,
            'VENTA',
            v.usuario_id,
            CURRENT_TIMESTAMP
        FROM productos p, ventas v
        WHERE p.id = NEW.producto_id AND v.id = NEW.venta_id;
    END
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_after_compra_detalle_insert
    AFTER INSERT ON detalle_compras
    FOR EACH ROW
    WHEN (SELECT estado FROM compras_proveedores WHERE id = NEW.compra_id) = 'COMPLETADA'
    BEGIN
        UPDATE productos
        SET stock_actual = stock_actual + NEW.cantidad,
            precio_costo = NEW.precio_costo,
            actualizado_at = CURRENT_TIMESTAMP
        WHERE id = NEW.producto_id;

        INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_id, referencia_tipo, usuario_id, fecha)
        SELECT
            NEW.producto_id,
            'COMPRA',
            NEW.cantidad,
            p.stock_actual - NEW.cantidad,
            p.stock_actual,
            NEW.precio_costo,
            NEW.compra_id,
            'COMPRA',
            c.usuario_id,
            CURRENT_TIMESTAMP
        FROM productos p, compras_proveedores c
        WHERE p.id = NEW.producto_id AND c.id = NEW.compra_id;
    END
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_after_pago_credito_insert
    AFTER INSERT ON pagos_creditos
    FOR EACH ROW
    BEGIN
      UPDATE creditos
      SET saldo_pendiente = NEW.saldo_nuevo,
          estado = CASE
              WHEN NEW.saldo_nuevo <= 0 THEN 'PAGADO'
              ELSE estado
          END,
          actualizado_at = CURRENT_TIMESTAMP
      WHERE id = NEW.credito_id;

      UPDATE clientes
      SET saldo_credito = saldo_credito - NEW.monto_pagado,
          actualizado_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT cliente_id FROM creditos WHERE id = NEW.credito_id);
    END
  `);

  db.run(`
    CREATE TRIGGER IF NOT EXISTS trg_after_venta_credito_insert
    AFTER INSERT ON ventas
    FOR EACH ROW
    WHEN NEW.metodo_pago = 'CREDITO' OR NEW.monto_credito > 0
    BEGIN
      INSERT INTO creditos (venta_id, cliente_id, monto_total, saldo_pendiente, creado_por)
      VALUES (NEW.id, NEW.cliente_id, COALESCE(NEW.monto_credito, NEW.total), COALESCE(NEW.monto_credito, NEW.total), NEW.usuario_id);

      UPDATE clientes
      SET saldo_credito = saldo_credito + COALESCE(NEW.monto_credito, NEW.total),
          actualizado_at = CURRENT_TIMESTAMP
      WHERE id = NEW.cliente_id;
    END
  `);

  console.log('   ✅ Triggers creados\n');
  createViews();
}

function createViews() {
  console.log('🔄 Creando vistas...');

  db.run(`
    CREATE VIEW IF NOT EXISTS v_ventas_diarias AS
    SELECT
        DATE(fecha) as fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas,
        SUM(total_costo) as total_costos,
        SUM(total - total_costo) as ganancia_neta,
        AVG(total) as ticket_promedio
    FROM ventas
    WHERE estado = 'COMPLETADA'
    GROUP BY DATE(fecha)
    ORDER BY fecha DESC
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS v_productos_stock_bajo AS
    SELECT
        p.id,
        p.codigo_sku_interno,
        p.nombre,
        c.nombre as categoria,
        p.stock_actual,
        p.stock_minimo,
        p.unidad_medida,
        p.precio_costo,
        p.precio_venta
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = 1
      AND p.stock_actual <= p.stock_minimo
    ORDER BY p.stock_actual ASC
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS v_productos_mas_vendidos AS
    SELECT
        p.id,
        p.codigo_sku_interno,
        p.nombre,
        c.nombre as categoria,
        COUNT(dv.id) as cantidad_ventas,
        SUM(dv.cantidad) as unidades_vendidas,
        SUM(dv.total) as total_vendido
    FROM productos p
    JOIN detalle_ventas dv ON p.id = dv.producto_id
    JOIN ventas v ON dv.venta_id = v.id
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE v.estado = 'COMPLETADA'
    GROUP BY p.id, p.codigo_sku_interno, p.nombre, c.nombre
    ORDER BY unidades_vendidas DESC
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS v_historial_clientes AS
    SELECT
        c.id as cliente_id,
        c.nombre_razon_social,
        c.nit_ci,
        COUNT(v.id) as total_compras,
        SUM(v.total) as monto_total_comprado,
        AVG(v.total) as ticket_promedio,
        MAX(v.fecha) as ultima_compra
    FROM clientes c
    LEFT JOIN ventas v ON c.id = v.cliente_id AND v.estado = 'COMPLETADA'
    GROUP BY c.id, c.nombre_razon_social, c.nit_ci
    ORDER BY monto_total_comprado DESC
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS v_creditos_pendientes AS
    SELECT
      cr.id,
      cr.venta_id,
      v.numero_venta,
      cr.cliente_id,
      c.nombre_razon_social as cliente_nombre,
      c.nit_ci as cliente_nit,
      c.telefono as cliente_telefono,
      cr.monto_total,
      cr.saldo_pendiente,
      (cr.monto_total - cr.saldo_pendiente) as monto_pagado,
      cr.estado,
      cr.fecha_credito,
      cr.fecha_vencimiento,
      u.nombre as creado_por_nombre,
      CAST(julianday('now') - julianday(cr.fecha_credito) AS INTEGER) as dias_transcurridos,
      CASE
        WHEN cr.fecha_vencimiento IS NOT NULL AND julianday(cr.fecha_vencimiento) < julianday('now') THEN 1
        ELSE 0
      END as esta_vencido
    FROM creditos cr
    INNER JOIN clientes c ON cr.cliente_id = c.id
    INNER JOIN ventas v ON cr.venta_id = v.id
    INNER JOIN usuarios u ON cr.creado_por = u.id
    WHERE cr.estado IN ('PENDIENTE', 'VENCIDO')
    ORDER BY cr.fecha_credito DESC
  `);

  db.run(`
    CREATE VIEW IF NOT EXISTS v_historial_transacciones AS
    SELECT
      v.id,
      'VENTA' as tipo_transaccion,
      v.numero_venta as numero_documento,
      v.fecha,
      c.nombre_razon_social as cliente_proveedor,
      u.nombre as usuario_nombre,
      v.total as monto,
      v.metodo_pago,
      v.estado,
      v.notas
    FROM ventas v
    LEFT JOIN clientes c ON v.cliente_id = c.id
    INNER JOIN usuarios u ON v.usuario_id = u.id
    UNION ALL
    SELECT
      cp.id,
      'COMPRA' as tipo_transaccion,
      cp.numero_compra as numero_documento,
      cp.fecha,
      p.nombre as cliente_proveedor,
      u.nombre as usuario_nombre,
      cp.total_compra as monto,
      'N/A' as metodo_pago,
      cp.estado,
      cp.notas
    FROM compras_proveedores cp
    INNER JOIN proveedores p ON cp.proveedor_id = p.id
    INNER JOIN usuarios u ON cp.usuario_id = u.id
    ORDER BY fecha DESC
  `, (err) => {
    if (err) {
      console.error('❌ Error al crear vistas:', err);
    } else {
      console.log('   ✅ Vistas creadas correctamente\n');
    }

    finalizeMigration();
  });
}

function finalizeMigration() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════════════\n');

  db.close((err) => {
    if (err) {
      console.error('❌ Error al cerrar la conexión:', err);
    } else {
      console.log('✅ Conexión a la base de datos cerrada\n');
    }
  });
}
