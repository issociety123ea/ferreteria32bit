const db = require('../config/database.js');

const getMiHistorial = async (req, res) => {
  try {
    // CORRECCIÓN 1: Usar fecha local Bolivia (no UTC)
    const fechaParam = req.query.fecha;
    let fecha;

    if (fechaParam) {
      fecha = fechaParam;
    } else {
      // Obtener fecha actual en Bolivia (no UTC)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      fecha = `${year}-${month}-${day}`;
    }

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

    // CORRECCIÓN 3: Calcular correctamente el resumen con abonos de créditos del día
    const resumen = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_vendido,

        -- CORRECCIÓN 3: Solo efectivo de ventas al contado
        SUM(CASE WHEN metodo_pago IN ('EFECTIVO', 'MIXTO') THEN monto_efectivo ELSE 0 END) as total_efectivo,

        -- CORRECCIÓN 3: Solo QR de ventas al contado
        SUM(CASE WHEN metodo_pago IN ('QR', 'MIXTO') THEN monto_qr ELSE 0 END) as total_qr,

        -- CORRECCIÓN 3: Total fiado (no cobrado aún)
        SUM(CASE WHEN metodo_pago = 'CREDITO' OR monto_credito > 0 THEN monto_credito ELSE 0 END) as total_credito
      FROM ventas
      WHERE ${whereClause}
    `).get(...params);

    // CORRECCIÓN 3 + 4: Obtener abonos de créditos del día (dinero realmente cobrado)
    let abonosParams = [fecha];
    if (esVendedor) {
      abonosParams.push(req.user.id);
    }

    const abonos = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_abonos,
        SUM(monto_pagado) as total_abonos
      FROM pagos_creditos
      WHERE DATE(fecha_pago) = ?
      ${esVendedor ? 'AND recibido_por = ?' : ''}
    `).get(...abonosParams);

    // CORRECCIÓN 3: Total cobrado = efectivo + QR + abonos de créditos
    const totalCobrado =
      (resumen.total_efectivo || 0) +
      (resumen.total_qr || 0) +
      (abonos.total_abonos || 0);

    res.json({
      success: true,
      data: {
        ventas,
        resumen: {
          cantidad_ventas: resumen.cantidad_ventas || 0,
          total_vendido: resumen.total_vendido || 0,
          total_efectivo: resumen.total_efectivo || 0,
          total_qr: resumen.total_qr || 0,
          total_credito: resumen.total_credito || 0,
          total_abonos: abonos.total_abonos || 0,
          cantidad_abonos: abonos.cantidad_abonos || 0,
          total_cobrado: totalCobrado
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el historial' });
  }
};

module.exports = { getMiHistorial };
