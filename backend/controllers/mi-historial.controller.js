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

    // CORRECCIÓN 2 (2026-11-17): prefijar con v. porque ahora JOIN-eamos creditos
    // (ambas tablas tienen columna "estado", sería ambiguo sin prefijo).
    let whereConditions = ['v.estado = "COMPLETADA"', 'DATE(v.fecha) = ?'];
    let params = [fecha];

    if (esVendedor) {
      whereConditions.push('usuario_id = ?');
      params.push(req.user.id);
    }

    const whereClause = whereConditions.join(' AND ');

    // CORRECCIÓN 3 (2026-11-17): JOIN a creditos para traer el saldo_pendiente actual
    // de cada venta a crédito (descuenta abonos iniciales y pagos posteriores),
    // así la lista puede mostrar "Abonó / Falta" coherente con la realidad.
    const ventas = await db.prepare(`
      SELECT
        v.*,
        u.nombre as usuario_nombre,
        c.nombre_razon_social as cliente_nombre,
        c.nit_ci as cliente_nit,
        cr.id as credito_id,
        cr.saldo_pendiente as credito_saldo_pendiente,
        cr.estado as credito_estado,
        cr.monto_total as credito_monto_total
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN creditos cr ON cr.venta_id = v.id
      WHERE ${whereClause}
      ORDER BY v.fecha DESC
    `).all(...params);

    // CORRECCIÓN 2 (2026-11-17): Calcular el resumen correctamente.
    // total_credito ahora muestra el SALDO PENDIENTE por cobrar (no el monto bruto fiado),
    // restando los abonos ya recibidos. Así la tarjeta "Fiado / Crédito" no contradice
    // a la tarjeta "Abonos de Fiados".
    // LEFT JOIN creditos para obtener saldo_pendiente de cada venta; si no hay crédito, es 0.
    const resumen = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_vendido,

        -- Solo efectivo de ventas al contado + abono inicial de ventas a crédito
        SUM(CASE WHEN metodo_pago IN ('EFECTIVO', 'MIXTO') THEN monto_efectivo ELSE 0 END) as total_efectivo,

        -- Solo QR de ventas al contado
        SUM(CASE WHEN metodo_pago IN ('QR', 'MIXTO') THEN monto_qr ELSE 0 END) as total_qr,

        -- SALDO PENDIENTE por cobrar de ventas a crédito del día (no el monto bruto fiado).
        -- saldo_pendiente ya descuenta abonos iniciales y pagos posteriores (trigger).
        COALESCE(SUM(CASE WHEN v.metodo_pago = 'CREDITO' OR v.monto_credito > 0 THEN COALESCE(cr.saldo_pendiente, 0) ELSE 0 END), 0) as total_credito
      FROM ventas v
      LEFT JOIN creditos cr ON cr.venta_id = v.id
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
