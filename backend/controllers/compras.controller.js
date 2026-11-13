const db = require('../config/database.js');

const generateNumeroCompra = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `COM-${dateStr}-`;

  const lastCompra = await db.prepare(
    "SELECT numero_compra FROM compras_proveedores WHERE numero_compra LIKE ? ORDER BY id DESC LIMIT 1"
  ).get(`${prefix}%`);

  let nextNum = 1;
  if (lastCompra) {
    const lastNum = parseInt(lastCompra.numero_compra.split('-').pop());
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
};

const create = async (req, res) => {
  try {
    const { proveedor_id, items, notas } = req.body;

    if (!proveedor_id) {
      return res.status(400).json({ success: false, message: 'Debe seleccionar un proveedor' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Debe incluir al menos un producto' });
    }

    let totalCompra = 0;
    const detalles = [];

    // Validate and calculate totals
    for (const item of items) {
      const producto = await db.prepare('SELECT id, nombre FROM productos WHERE id = ?').get(item.producto_id);

      if (!producto) {
        throw new Error(`Producto ID ${item.producto_id} no encontrado`);
      }

      const subtotal = item.cantidad * item.precio_costo;
      totalCompra += subtotal;

      detalles.push({
        producto_id: producto.id,
        cantidad: item.cantidad,
        precio_costo: item.precio_costo,
        subtotal
      });
    }

    const numeroCompra = await generateNumeroCompra();

    // Manual transaction
    try {
      await db.prepare('BEGIN TRANSACTION').run();

      // Insert compra
      const compraResult = await db.prepare(`
        INSERT INTO compras_proveedores (numero_compra, proveedor_id, usuario_id, total_compra, estado, notas)
        VALUES (?, ?, ?, ?, 'COMPLETADA', ?)
      `).run(numeroCompra, proveedor_id, req.user.id, totalCompra, notas || null);

      const compraId = compraResult.lastID;

      // Insert detalles (triggers will update stock and cost)
      const insertDetalle = db.prepare(`
        INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_costo, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const det of detalles) {
        await insertDetalle.run(compraId, det.producto_id, det.cantidad, det.precio_costo, det.subtotal);
      }

      // Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'CREAR_COMPRA', 'COMPRAS', 'compras_proveedores', compraId);

      await db.prepare('COMMIT').run();

      const compra = await db.prepare(`
        SELECT c.*, p.nombre as proveedor_nombre
        FROM compras_proveedores c
        LEFT JOIN proveedores p ON c.proveedor_id = p.id
        WHERE c.id = ?
      `).get(compraId);

      const compraDetalles = await db.prepare(`
        SELECT dc.*, p.nombre as producto_nombre, p.codigo_sku_interno
        FROM detalle_compras dc
        JOIN productos p ON dc.producto_id = p.id
        WHERE dc.compra_id = ?
      `).all(compraId);

      res.status(201).json({
        success: true,
        data: { ...compra, detalles: compraDetalles },
        message: `Compra ${numeroCompra} registrada exitosamente`
      });
    } catch (error) {
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error al crear compra:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al registrar la compra' });
  }
};

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await db.prepare('SELECT COUNT(*) as total FROM compras_proveedores').get();

    const compras = await db.prepare(`
      SELECT c.*, p.nombre as proveedor_nombre, u.nombre as usuario_nombre
      FROM compras_proveedores c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      ORDER BY c.fecha DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      success: true,
      data: {
        items: compras,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ success: false, message: 'Error al obtener compras' });
  }
};

const getById = async (req, res) => {
  try {
    const compra = await db.prepare(`
      SELECT c.*, p.nombre as proveedor_nombre, u.nombre as usuario_nombre
      FROM compras_proveedores c
      LEFT JOIN proveedores p ON c.proveedor_id = p.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!compra) {
      return res.status(404).json({ success: false, message: 'Compra no encontrada' });
    }

    const detalles = await db.prepare(`
      SELECT dc.*, p.nombre as producto_nombre, p.codigo_sku_interno
      FROM detalle_compras dc
      JOIN productos p ON dc.producto_id = p.id
      WHERE dc.compra_id = ?
    `).all(req.params.id);

    res.json({ success: true, data: { ...compra, detalles } });
  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la compra' });
  }
};


module.exports = { generateNumeroCompra, create, getAll, offset, getById };