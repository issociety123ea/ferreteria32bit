const db = require('../config/database.js');

// Generate sequential venta number: VTA-YYYYMMDD-XXXX
const generateNumeroVenta = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `VTA-${dateStr}-`;

  const lastVenta = await db.prepare(
    "SELECT numero_venta FROM ventas WHERE numero_venta LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${prefix}%`);

  let nextNum = 1;
  if (lastVenta) {
    const lastNum = parseInt(lastVenta.numero_venta.split('-').pop());
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

const create = async (req, res) => {
  const connection = db.connection;

  try {
    const { cliente_id, items, metodo_pago, monto_efectivo, monto_tarjeta, monto_qr, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe incluir al menos un producto' });
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
        const producto = await db.prepare('SELECT id, nombre, stock_actual, precio_venta, precio_costo, permite_decimales FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);

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

      // 3. Insert venta
      const ventaResult = await db.prepare(`
        INSERT INTO ventas (numero_venta, cliente_id, usuario_id, subtotal, descuento, total, total_costo, metodo_pago, monto_efectivo, monto_tarjeta, monto_qr, estado, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETADA', ?)
      `).run(
        numeroVenta,
        cliente_id || 1,
        req.user.id,
        subtotal,
        descuento,
        total,
        totalCosto,
        metodo_pago || 'EFECTIVO',
        monto_efectivo || 0,
        monto_tarjeta || 0,
        monto_qr || 0,
        notas || null
      );

      const ventaId = ventaResult.lastID;

      // 4. Insert detalle items (triggers will update stock)
      const insertDetalle = db.prepare(`
        INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, costo_unitario, subtotal, descuento, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const det of detalles) {
        await insertDetalle.run(
          ventaId,
          det.producto_id,
          det.cantidad,
          det.precio_unitario,
          det.costo_unitario,
          det.subtotal,
          det.descuento,
          det.total
        );
      }

      // 5. Update product stock
      for (const item of items) {
        await db.prepare('UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?').run(item.cantidad, item.producto_id);
      }

      // 6. Insert kardex entries
      for (const det of detalles) {
        await db.prepare(`
          INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_tipo, usuario_id, notas)
          SELECT id, 'VENTA', ?, stock_actual + ?, stock_actual, ?, 'VENTA', ?, ?
          FROM productos WHERE id = ?
        `).run(
          det.cantidad,
          det.cantidad,
          det.costo_unitario,
          req.user.id,
          `Venta ${numeroVenta}`,
          det.producto_id
        );
      }

      // 7. Auditoría
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

    const countResult = await db.prepare('SELECT COUNT(*) as total FROM ventas WHERE estado = "COMPLETADA"').get();

    const ventas = await db.prepare(`
      SELECT v.*, u.nombre as usuario_nombre, c.nombre as cliente_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.estado = 'COMPLETADA'
      ORDER BY v.fecha DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

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
      SELECT v.*, u.nombre as usuario_nombre, c.nombre as cliente_nombre
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

    res.json({ success: true, data: { ...venta, detalles } });
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

      // Update venta status
      await db.prepare('UPDATE ventas SET estado = ? WHERE id = ?').run('ANULADA', ventaId);

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


module.exports = { generateNumeroVenta, create, getAll, offset, getById, annulSale };