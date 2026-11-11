import db from '../config/database.js';

// Generate sequential venta number: VTA-YYYYMMDD-XXXX
const generateNumeroVenta = () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `VTA-${dateStr}-`;

  const lastVenta = db.prepare(
    "SELECT numero_venta FROM ventas WHERE numero_venta LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${prefix}%`);

  let nextNum = 1;
  if (lastVenta) {
    const lastNum = parseInt(lastVenta.numero_venta.split('-').pop());
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

export const create = (req, res) => {
  try {
    const { cliente_id, items, metodo_pago, monto_efectivo, monto_tarjeta, monto_qr, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe incluir al menos un producto' });
    }

    const createVenta = db.transaction(() => {
      // 1. Validate stock availability for all items
      for (const item of items) {
        const producto = db.prepare('SELECT id, nombre, stock_actual, precio_venta, precio_costo, permite_decimales FROM productos WHERE id = ? AND activo = 1').get(item.producto_id);

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
        const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(item.producto_id);
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
      const numeroVenta = generateNumeroVenta();

      // 3. Insert venta
      const ventaResult = db.prepare(`
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

      const ventaId = ventaResult.lastInsertRowid;

      // 4. Insert detalle_ventas (triggers handle stock/kardex)
      const insertDetalle = db.prepare(`
        INSERT INTO detalle_ventas (venta_id, producto_id, codigo_producto, nombre_producto, cantidad, precio_unitario, costo_unitario, subtotal, descuento, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const det of detalles) {
        insertDetalle.run(
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

      // 5. Auditoría
      db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'CREAR_VENTA', 'POS', 'ventas', ventaId);

      return { ventaId, numeroVenta, total, totalCosto, descuento, subtotal };
    });

    const result = createVenta();

    // Get the full venta with details for response
    const venta = db.prepare('SELECT * FROM ventas WHERE id = ?').get(result.ventaId);
    const detalles = db.prepare('SELECT * FROM detalle_ventas WHERE venta_id = ?').all(result.ventaId);

    const responseData = {
      ...venta,
      detalles
    };

    // Strip cost fields for VENDEDOR
    if (req.user.rol === 'VENDEDOR') {
      delete responseData.total_costo;
      delete responseData.ganancia_neta;
      responseData.detalles = responseData.detalles.map(d => {
        const { costo_unitario, ...rest } = d;
        return rest;
      });
    }

    res.status(201).json({
      success: true,
      data: responseData,
      message: `Venta ${result.numeroVenta} registrada exitosamente`
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al registrar la venta' });
  }
};

export const getAll = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const fechaDesde = req.query.fecha_desde || '';
    const fechaHasta = req.query.fecha_hasta || '';
    const estado = req.query.estado || '';
    const clienteId = req.query.cliente_id || '';

    let whereConditions = [];
    let params = [];

    if (fechaDesde) {
      whereConditions.push('DATE(v.fecha) >= ?');
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      whereConditions.push('DATE(v.fecha) <= ?');
      params.push(fechaHasta);
    }
    if (estado) {
      whereConditions.push('v.estado = ?');
      params.push(estado);
    }
    if (clienteId) {
      whereConditions.push('v.cliente_id = ?');
      params.push(parseInt(clienteId));
    }

    // VENDEDOR only sees their own sales
    if (req.user.rol === 'VENDEDOR') {
      whereConditions.push('v.usuario_id = ?');
      params.push(req.user.id);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM ventas v ${whereClause}`).get(...params);

    const isVendedor = req.user.rol === 'VENDEDOR';
    const selectFields = isVendedor
      ? 'v.id, v.numero_venta, v.fecha, v.cliente_id, v.usuario_id, v.subtotal, v.descuento, v.total, v.metodo_pago, v.estado'
      : 'v.*';

    const ventas = db.prepare(`
      SELECT ${selectFields}, c.nombre_razon_social as cliente_nombre, u.nombre as vendedor_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      ${whereClause}
      ORDER BY v.fecha DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

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
    console.error('Error al listar ventas:', error);
    res.status(500).json({ success: false, message: 'Error al listar ventas' });
  }
};

export const getById = (req, res) => {
  try {
    const venta = db.prepare(`
      SELECT v.*, c.nombre_razon_social as cliente_nombre, c.nit_ci as cliente_nit, u.nombre as vendedor_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }

    const detalles = db.prepare('SELECT * FROM detalle_ventas WHERE venta_id = ?').all(req.params.id);

    const responseData = { ...venta, detalles };

    if (req.user.rol === 'VENDEDOR') {
      delete responseData.total_costo;
      delete responseData.ganancia_neta;
      responseData.detalles = responseData.detalles.map(d => {
        const { costo_unitario, ...rest } = d;
        return rest;
      });
    }

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la venta' });
  }
};

export const getMiHistorial = (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);

    let whereConditions = ['v.estado = "COMPLETADA"', 'DATE(v.fecha) = ?', 'v.usuario_id = ?'];
    let params = [fecha, req.user.id];

    const whereClause = whereConditions.join(' AND ');

    const ventas = db.prepare(`
      SELECT v.id, v.numero_venta, v.fecha, v.subtotal, v.descuento, v.total, v.metodo_pago,
             c.nombre_razon_social as cliente_nombre
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE ${whereClause}
      ORDER BY v.fecha DESC
    `).all(...params);

    const resumen = db.prepare(`
      SELECT
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_vendido,
        SUM(monto_efectivo) as total_efectivo,
        SUM(monto_tarjeta) as total_tarjeta,
        SUM(monto_qr) as total_qr
      FROM ventas v
      WHERE ${whereClause}
    `).get(...params);

    res.json({
      success: true,
      data: {
        fecha,
        ventas,
        resumen
      }
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial' });
  }
};

export const anular = (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({ success: false, message: 'Debe indicar un motivo de anulación' });
    }

    const venta = db.prepare('SELECT * FROM ventas WHERE id = ?').get(id);
    if (!venta) {
      return res.status(404).json({ success: false, message: 'Venta no encontrada' });
    }
    if (venta.estado === 'ANULADA') {
      return res.status(400).json({ success: false, message: 'La venta ya fue anulada' });
    }

    const anularVenta = db.transaction(() => {
      // Restore stock for each item
      const detalles = db.prepare('SELECT * FROM detalle_ventas WHERE venta_id = ?').all(id);

      for (const det of detalles) {
        const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(det.producto_id);
        const stockAnterior = producto.stock_actual;
        const stockNuevo = stockAnterior + det.cantidad;

        db.prepare('UPDATE productos SET stock_actual = ? WHERE id = ?').run(stockNuevo, det.producto_id);

        db.prepare(`
          INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_id, referencia_tipo, usuario_id, notas)
          VALUES (?, 'DEVOLUCION', ?, ?, ?, ?, ?, 'ANULACION_VENTA', ?, ?)
        `).run(det.producto_id, det.cantidad, stockAnterior, stockNuevo, det.costo_unitario, id, req.user.id, `Anulación de venta ${venta.numero_venta}: ${motivo}`);
      }

      // Update venta status
      db.prepare(`
        UPDATE ventas SET estado = 'ANULADA', anulada_por = ?, anulada_en = CURRENT_TIMESTAMP, motivo_anulacion = ?
        WHERE id = ?
      `).run(req.user.id, motivo, id);

      db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'ANULAR_VENTA', 'POS', 'ventas', id);
    });

    anularVenta();

    res.json({ success: true, message: `Venta ${venta.numero_venta} anulada exitosamente` });
  } catch (error) {
    console.error('Error al anular venta:', error);
    res.status(500).json({ success: false, message: 'Error al anular la venta' });
  }
};
