const db = require('../config/database.js');

const getByProducto = async (req, res) => {
  try {
    const { producto_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await db.prepare('SELECT COUNT(*) as total FROM kardex WHERE producto_id = ?').get(producto_id);

    const movimientos = await db.prepare(`
      SELECT k.*, u.nombre as usuario_nombre, p.nombre as producto_nombre, p.codigo_sku_interno
      FROM kardex k
      LEFT JOIN usuarios u ON k.usuario_id = u.id
      LEFT JOIN productos p ON k.producto_id = p.id
      WHERE k.producto_id = ?
      ORDER BY k.fecha DESC
      LIMIT ? OFFSET ?
    `).all(producto_id, limit, offset);

    res.json({
      success: true,
      data: {
        items: movimientos,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener kardex:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos del kardex' });
  }
};

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const tipo = req.query.tipo || '';
    const fechaDesde = req.query.fecha_desde || '';
    const fechaHasta = req.query.fecha_hasta || '';

    let whereConditions = [];
    let params = [];

    if (tipo) {
      whereConditions.push('k.tipo_movimiento = ?');
      params.push(tipo);
    }
    if (fechaDesde) {
      whereConditions.push('DATE(k.fecha) >= ?');
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      whereConditions.push('DATE(k.fecha) <= ?');
      params.push(fechaHasta);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM kardex k ${whereClause}`).get(...params);

    const movimientos = await db.prepare(`
      SELECT k.*, u.nombre as usuario_nombre, p.nombre as producto_nombre, p.codigo_sku_interno
      FROM kardex k
      LEFT JOIN usuarios u ON k.usuario_id = u.id
      LEFT JOIN productos p ON k.producto_id = p.id
      ${whereClause}
      ORDER BY k.fecha DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      success: true,
      data: {
        items: movimientos,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener kardex:', error);
    res.status(500).json({ success: false, message: 'Error al obtener movimientos del kardex' });
  }
};


module.exports = { getByProducto, offset, getAll, offset };