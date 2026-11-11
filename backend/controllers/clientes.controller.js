import db from '../config/database.js';

export const getAll = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(LOWER(nombre_razon_social) LIKE LOWER(?) OR nit_ci LIKE ? OR telefono LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = db.prepare(`SELECT COUNT(*) as total FROM clientes ${whereClause}`).get(...params);

    const clientes = db.prepare(`
      SELECT *
      FROM clientes
      ${whereClause}
      ORDER BY nombre_razon_social ASC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      success: true,
      data: {
        items: clientes,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener clientes' });
  }
};

export const getById = (req, res) => {
  try {
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);

    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Get purchase history
    const historial = db.prepare(`
      SELECT COUNT(*) as total_compras, SUM(total) as monto_total, MAX(fecha) as ultima_compra
      FROM ventas
      WHERE cliente_id = ? AND estado = 'COMPLETADA'
    `).get(req.params.id);

    res.json({
      success: true,
      data: {
        ...cliente,
        historial
      }
    });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el cliente' });
  }
};

export const create = (req, res) => {
  try {
    const { nombre_razon_social, nit_ci, telefono, direccion, tipo_cliente, limite_credito } = req.body;

    if (!nombre_razon_social) {
      return res.status(400).json({ success: false, message: 'El nombre o razón social es requerido' });
    }

    const result = db.prepare(`
      INSERT INTO clientes (nombre_razon_social, nit_ci, telefono, direccion, tipo_cliente, limite_credito)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      nombre_razon_social,
      nit_ci || null,
      telefono || null,
      direccion || null,
      tipo_cliente || 'NORMAL',
      limite_credito || 0
    );

    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: cliente, message: 'Cliente creado exitosamente' });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ success: false, message: 'Error al crear el cliente' });
  }
};

export const update = (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_razon_social, nit_ci, telefono, direccion, tipo_cliente, limite_credito, activo } = req.body;

    const existing = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    db.prepare(`
      UPDATE clientes SET
        nombre_razon_social = COALESCE(?, nombre_razon_social),
        nit_ci = ?,
        telefono = ?,
        direccion = ?,
        tipo_cliente = COALESCE(?, tipo_cliente),
        limite_credito = COALESCE(?, limite_credito),
        activo = COALESCE(?, activo)
      WHERE id = ?
    `).run(
      nombre_razon_social,
      nit_ci !== undefined ? nit_ci : existing.nit_ci,
      telefono !== undefined ? telefono : existing.telefono,
      direccion !== undefined ? direccion : existing.direccion,
      tipo_cliente,
      limite_credito,
      activo !== undefined ? (activo ? 1 : 0) : null,
      id
    );

    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);

    res.json({ success: true, data: cliente, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el cliente' });
  }
};

export const search = (req, res) => {
  try {
    const q = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;

    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const searchParam = `%${q}%`;
    const clientes = db.prepare(`
      SELECT id, nombre_razon_social, nit_ci, telefono, tipo_cliente
      FROM clientes
      WHERE activo = 1
        AND (LOWER(nombre_razon_social) LIKE LOWER(?) OR nit_ci LIKE ? OR telefono LIKE ?)
      ORDER BY nombre_razon_social ASC
      LIMIT ?
    `).all(searchParam, searchParam, searchParam, limit);

    res.json({ success: true, data: clientes });
  } catch (error) {
    console.error('Error en búsqueda de clientes:', error);
    res.status(500).json({ success: false, message: 'Error en la búsqueda' });
  }
};

export const getProductosFrecuentes = (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Obtener productos más comprados por este cliente
    const productos = db.prepare(`
      SELECT
        p.id,
        p.nombre,
        p.codigo_sku_interno,
        p.imagen_url,
        p.precio_venta,
        p.unidad_medida,
        SUM(dv.cantidad) as cantidad_total,
        COUNT(DISTINCT v.id) as veces_comprado,
        MAX(v.fecha) as ultima_compra
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE v.cliente_id = ? AND v.estado = 'COMPLETADA'
      GROUP BY p.id
      ORDER BY cantidad_total DESC, veces_comprado DESC
      LIMIT ?
    `).all(id, limit);

    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error al obtener productos frecuentes del cliente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos frecuentes' });
  }
};
