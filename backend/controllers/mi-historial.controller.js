const db = require('../config/database.js');

const getMiHistorial = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
    const esVendedor = req.user.rol === 'VENDEDOR';

    let whereConditions = ['estado = "COMPLETADA"', 'DATE(fecha) = ?'];
    let params = [fecha];

    if (esVendedor) {
      whereConditions.push('usuario_id = ?');
      params.push(req.user.id);
    }

    const whereClause = whereConditions.join(' AND ');

    const ventas = await db.prepare(`
      SELECT
        v.*,
        u.nombre as usuario_nombre,
        c.nombre_razon_social as cliente_nombre,
        c.nit_ci as cliente_nit
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE ${whereClause}
      ORDER BY v.fecha DESC
    `).all(...params);

    const resumen = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_vendido,
        SUM(monto_efectivo) as total_efectivo,
        SUM(monto_qr) as total_qr,
        SUM(monto_credito) as total_credito
      FROM ventas
      WHERE ${whereClause}
    `).get(...params);

    res.json({
      success: true,
      data: {
        ventas,
        resumen
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial' });
  }
};

module.exports = { getMiHistorial };
