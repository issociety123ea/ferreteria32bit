const db = require('../config/database.js');

const getAll = async (req, res) => {
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

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM clientes ${whereClause}`).get(...params);

    const clientes = await db.prepare(`
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

const getById = async (req, res) => {
  try {
    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);

    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Get purchase history
    const historial = await db.prepare(`
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

const create = async (req, res) => {
  try {
    const { nombre_razon_social, nit_ci, telefono, direccion, tipo_cliente, limite_credito } = req.body;

    if (!nombre_razon_social) {
      return res.status(400).json({ success: false, message: 'El nombre o razón social es requerido' });
    }

    const result = await db.prepare(`
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

    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastID);

    res.status(201).json({ success: true, data: cliente, message: 'Cliente creado exitosamente' });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ success: false, message: 'Error al crear el cliente' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_razon_social, nit_ci, telefono, direccion, tipo_cliente, limite_credito, activo } = req.body;

    const existing = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    await db.prepare(`
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

    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);

    res.json({ success: true, data: cliente, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el cliente' });
  }
};

const search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;

    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const searchParam = `%${q}%`;
    const clientes = await db.prepare(`
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

const getProductosFrecuentes = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Obtener productos más comprados por este cliente
    const productos = await db.prepare(`
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


module.exports = { getAll, offset, getById, create, update, search, getProductosFrecuentes };