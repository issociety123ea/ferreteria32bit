const db = require('../config/database.js');
const { getLocalDateTime } = require('../utils/date.js');

// Generate sequential venta number: VTA-YYYYMMDD-XXXX
// CORRECCIÓN D6: Manejo de race condition con reintentos automáticos
// CORRECCIÓN 1: Usar fecha local Bolivia (no UTC)
const generateNumeroVenta = async (retries = 3) => {
  // Obtener fecha local Bolivia
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const prefix = `VTA-${dateStr}-`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const lastVenta = await db.prepare(
        "SELECT numero_venta FROM ventas WHERE numero_venta LIKE ? ORDER BY id DESC LIMIT 1"
      ).get(`${prefix}%`);

      let nextNum = 1;
      if (lastVenta) {
        const lastNum = parseInt(lastVenta.numero_venta.split('-').pop());
        nextNum = lastNum + 1;
      }

      const numeroVenta = `${prefix}${String(nextNum).padStart(4, '0')}`;

      // Verificar que no existe (prevención extra contra race condition)
      const exists = await db.prepare('SELECT id FROM ventas WHERE numero_venta = ?').get(numeroVenta);
      if (!exists) {
        return numeroVenta;
      }

      // Si existe, esperar un tiempo aleatorio antes de reintentar
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      }
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
  }

  // Fallback: usar timestamp si todos los reintentos fallan
  return `${prefix}${Date.now().toString().slice(-4)}`;
};

const create = async (req, res) => {
  const connection = db.connection;

  try {
    const { cliente_id, items, metodo_pago, monto_efectivo, monto_qr, monto_credito, notas, fecha_vencimiento_credito } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe incluir al menos un producto' });
    }

    // Validación: Si el método de pago es CREDITO o hay monto_credito, debe haber un cliente válido (no genérico)
    if ((metodo_pago === 'CREDITO' || (monto_credito && monto_credito > 0)) && (!cliente_id || cliente_id === 1)) {
      return res.status(400).json({
        success: false,
        message: 'Para ventas a crédito debe seleccionar un cliente registrado (no puede ser Cliente General)'
      });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // 1. Validate stock availability for all items
      for (const item of items) {
        if (!item.producto_id) {
          throw new Error('Cada ítem debe tener un producto_id válido');
        }

        const producto = await db.prepare('SELECT id, codigo_sku_interno, nombre, stock_actual, precio_venta, precio_costo, permite_decimales FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);

        if (!producto) {
          throw new Error(`Producto ID ${item.producto_id} no encontrado o inactivo`);
        }

        if (producto.stock_actual < item.cantidad) {
          throw new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_actual}, Solicitado: ${item.cantidad}`);
        }

        if (!producto.permite_decimales && item.cantidad % 1 !== 0) {
          throw new Error(`El producto "${producto.nombre}" no permite cantidades decimales`);
        }
      }

      // 2. Calculate totals
      let subtotal = 0;
      let totalCosto = 0;
      const detalles = [];

      for (const item of items) {
        const producto = await db.prepare('SELECT * FROM productos WHERE id = ?').get(item.producto_id);
        const precioUnitario = item.precio_unitario || producto.precio_venta;
        const costoUnitario = producto.precio_costo;
        const itemSubtotal = precioUnitario * item.cantidad;
        const itemDescuento = item.descuento || 0;
        const itemTotal = itemSubtotal - itemDescuento;

        subtotal += itemSubtotal;
        totalCosto += costoUnitario * item.cantidad;

        detalles.push({
          producto_id: producto.id,
          codigo_producto: producto.codigo_sku_interno,
          nombre_producto: producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          costo_unitario: costoUnitario,
          subtotal: itemSubtotal,
          descuento: itemDescuento,
          total: itemTotal
        });
      }

      const descuento = req.body.descuento || 0;
      const total = subtotal - descuento;
      const numeroVenta = await generateNumeroVenta();

      // Determinar método de pago
      const finalMetodoPago = metodo_pago || 'EFECTIVO';
      const finalMontoEfectivo = monto_efectivo || 0;
      const finalMontoQr = monto_qr || 0;
      const finalMontoCredito = monto_credito || 0;

      // 3. Insert venta
      // CORRECCIÓN 1: Pasar fecha/hora local Bolivia explícitamente (SQLite usa UTC por defecto)
      const fechaLocal = getLocalDateTime();
      const ventaResult = await db.prepare(`
        INSERT INTO ventas (numero_venta, cliente_id, usuario_id, subtotal, descuento, total, total_costo, metodo_pago, monto_efectivo, monto_qr, monto_credito, estado, notas, fecha)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETADA', ?, ?)
      `).run(
        numeroVenta,
        cliente_id || 1,
        req.user.id,
        subtotal,
        descuento,
        total,
        totalCosto,
        finalMetodoPago,
        finalMontoEfectivo,
        finalMontoQr,
        finalMontoCredito,
        notas || null,
        fechaLocal
      );

      const ventaId = ventaResult.lastID;

      // 4. Insert detalle items con codigo_producto
      const insertDetalle = db.prepare(`
        INSERT INTO detalle_ventas (venta_id, producto_id, codigo_producto, nombre_producto, cantidad, precio_unitario, costo_unitario, subtotal, descuento, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const det of detalles) {
        await insertDetalle.run(
          ventaId,
          det.producto_id,
          det.codigo_producto,
          det.nombre_producto,
          det.cantidad,
          det.precio_unitario,
          det.costo_unitario,
          det.subtotal,
          det.descuento,
          det.total
        );
      }

      // 5. Stock update y kardex son manejados automáticamente por el trigger trg_after_venta_detalle_insert
      // (Ver schema.sql líneas 309-333)
      // CORRECCIÓN D1 y D2: Eliminado el doble descuento de stock y doble inserción en kardex

      // 6. Si es venta a crédito, el trigger creará el registro automáticamente
      // Pero si se proporciona fecha de vencimiento, actualizarla
      if ((finalMetodoPago === 'CREDITO' || finalMontoCredito > 0) && fecha_vencimiento_credito) {
        await db.prepare(`
          UPDATE creditos SET fecha_vencimiento = ? WHERE venta_id = ?
        `).run(fecha_vencimiento_credito, ventaId);
      }

      // CORRECCIÓN 1 (Abono Inicial): Si la venta a crédito tiene un abono inicial (monto_efectivo > 0),
      // registrar el pago en pagos_creditos y ajustar el saldo del crédito.
      // El trigger trg_after_venta_credito_insert crea el crédito con saldo_pendiente = monto_credito (lo fiado).
      // El abono inicial (monto_efectivo) es dinero que ENTRA a la caja hoy y debe descontarse de la deuda.
      if (finalMetodoPago === 'CREDITO' && finalMontoEfectivo > 0) {
        // Buscar el crédito recién creado por el trigger
        const creditoCreado = await db.prepare('SELECT * FROM creditos WHERE venta_id = ?').get(ventaId);

        if (creditoCreado) {
          const saldoAnterior = creditoCreado.saldo_pendiente; // = monto_credito (lo fiado)
          const saldoNuevo = Math.max(0, saldoAnterior - finalMontoEfectivo);

          // Registrar el abono inicial en pagos_creditos con fecha local Bolivia
          const fechaLocal = getLocalDateTime();
          await db.prepare(`
            INSERT INTO pagos_creditos (credito_id, monto_pagado, metodo_pago, monto_efectivo, saldo_anterior, saldo_nuevo, recibido_por, notas, fecha_pago)
            VALUES (?, ?, 'EFECTIVO', ?, ?, ?, ?, ?, ?)
          `).run(
            creditoCreado.id,
            finalMontoEfectivo,
            finalMontoEfectivo,
            saldoAnterior,
            saldoNuevo,
            req.user.id,
            `Abono inicial - Venta ${numeroVenta}`,
            fechaLocal
          );

          // El trigger trg_after_pago_credito_insert actualizará automáticamente:
          // - creditos.saldo_pendiente = saldoNuevo
          // - creditos.estado = 'PAGADO' si saldoNuevo <= 0
          // - clientes.saldo_credito -= monto_pagado
        }
      }

      // 8. Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'CREAR_VENTA', 'VENTAS', 'ventas', ventaId);

      // Commit transaction
      await new Promise((resolve, reject) => {
        connection.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const venta = await db.prepare('SELECT * FROM ventas WHERE id = ?').get(ventaId);

      res.status(201).json({
        success: true,
        data: { ...venta, detalles },
        message: `Venta ${numeroVenta} registrada exitosamente`
      });
    } catch (error) {
      // Rollback on error
      await new Promise((resolve) => {
        connection.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al registrar la venta' });
  }
};

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const estado = req.query.estado || 'COMPLETADA';

    const countResult = await db.prepare('SELECT COUNT(*) as total FROM ventas WHERE estado = ?').get(estado);

    const ventas = await db.prepare(`
      SELECT
        v.*,
        u.nombre as usuario_nombre,
        c.nombre_razon_social as cliente_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.estado = ?
      ORDER BY v.fecha DESC
      LIMIT ? OFFSET ?
    `).all(estado, limit, offset);

    res.json({
      success: true,
      data: {
        items: ventas,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas' });
  }
};

const getById = async (req, res) => {
  try {
    const venta = await db.prepare(`
      SELECT
        v.*,
        u.nombre as usuario_nombre,
        c.nombre_razon_social as cliente_nombre,
        c.nit_ci as cliente_nit
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    const detalles = await db.prepare(`
      SELECT dv.*, p.nombre as producto_nombre, p.codigo_sku_interno
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `).all(req.params.id);

    // Si la venta es a crédito, obtener información del crédito
    let credito = null;
    if (venta.metodo_pago === 'CREDITO' || venta.monto_credito > 0) {
      credito = await db.prepare(`
        SELECT cr.*,
          (SELECT COUNT(*) FROM pagos_creditos WHERE credito_id = cr.id) as total_pagos
        FROM creditos cr
        WHERE cr.venta_id = ?
      `).get(req.params.id);

      if (credito) {
        const pagos = await db.prepare(`
          SELECT pc.*, u.nombre as recibido_por_nombre
          FROM pagos_creditos pc
          LEFT JOIN usuarios u ON pc.recibido_por = u.id
          WHERE pc.credito_id = ?
          ORDER BY pc.fecha_pago DESC
        `).all(credito.id);
        credito.pagos = pagos;
      }
    }

    res.json({ success: true, data: { ...venta, detalles, credito } });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la venta' });
  }
};

const annulSale = async (req, res) => {
  const connection = db.connection;

  try {
    const ventaId = req.params.id;
    const { razon } = req.body;

    if (!razon) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar una razón para anular la venta' });
    }

    const venta = await db.prepare('SELECT * FROM ventas WHERE id = ?').get(ventaId);
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    if (venta.estado === 'ANULADA') {
      return res.status(400).json({ success: false, message: 'La venta ya fue anulada' });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Get detalles
      const detalles = await db.prepare('SELECT * FROM detalle_ventas WHERE venta_id = ?').all(ventaId);

      // Restore stock for each item
      for (const det of detalles) {
        await db.prepare('UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?').run(det.cantidad, det.producto_id);
      }

      // CORRECCIÓN D7: Guardar metadata completa de anulación
      await db.prepare(`
        UPDATE ventas
        SET estado = ?,
            anulada_por = ?,
            anulada_en = CURRENT_TIMESTAMP,
            motivo_anulacion = ?
        WHERE id = ?
      `).run('ANULADA', req.user.id, razon, ventaId);

      // CORRECCIÓN ANU-06: Si la venta fue a crédito, cancelar el crédito y revertir saldo del cliente
      if (venta.metodo_pago === 'CREDITO' || venta.monto_credito > 0) {
        const credito = await db.prepare('SELECT * FROM creditos WHERE venta_id = ?').get(ventaId);

        if (credito && credito.estado !== 'CANCELADO') {
          // Cancelar el crédito
          await db.prepare(`
            UPDATE creditos
            SET estado = 'CANCELADO',
                notas = COALESCE(notas, '') || ' | CANCELADO: Venta anulada por ' || ? || ' el ' || datetime('now') || '. Motivo: ' || ?
            WHERE venta_id = ?
          `).run(req.user.username || req.user.nombre, razon, ventaId);

          // Revertir el saldo_credito del cliente (solo si aún tiene saldo pendiente)
          if (credito.saldo_pendiente > 0) {
            await db.prepare(`
              UPDATE clientes
              SET saldo_credito = saldo_credito - ?,
                  actualizado_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(credito.saldo_pendiente, credito.cliente_id);
          }
        }
      }

      // Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(req.user.id, 'ANULAR_VENTA', 'VENTAS', 'ventas', ventaId, JSON.stringify(venta));

      // Commit transaction
      await new Promise((resolve, reject) => {
        connection.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: 'Venta anulada exitosamente' });
    } catch (error) {
      // Rollback on error
      await new Promise((resolve) => {
        connection.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Error al anular venta:', error);
    res.status(500).json({ success: false, message: 'Error al anular la venta' });
  }
};


module.exports = { generateNumeroVenta, create, getAll, getById, annulSale };