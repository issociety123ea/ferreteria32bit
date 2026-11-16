const db = require('../config/database.js');
const { getLocalDate } = require('../utils/date.js');

const ventasDiarias = async (req, res) => {
  try {
    // CORRECCIÓN 1: Usar fecha local Bolivia (no UTC)
    const fechaDesde = req.query.fecha_desde || getLocalDate();
    const fechaHasta = req.query.fecha_hasta || fechaDesde;

    const resumen = await db.prepare(`
      SELECT
        DATE(fecha) as fecha,
        COUNT(*) as cantidad_ventas,
        SUM(total) as total_ventas,
        SUM(total_costo) as total_costos,
        SUM(total - total_costo) as ganancia_neta,
        AVG(total) as ticket_promedio,
        SUM(CASE WHEN metodo_pago = 'EFECTIVO' THEN total ELSE 0 END) as total_efectivo,
        SUM(CASE WHEN metodo_pago = 'QR' THEN total ELSE 0 END) as total_qr,
        SUM(CASE WHEN metodo_pago = 'CREDITO' THEN total ELSE 0 END) as total_credito,
        SUM(CASE WHEN metodo_pago = 'MIXTO' THEN total ELSE 0 END) as total_mixto
      FROM ventas
      WHERE estado = 'COMPLETADA'
        AND DATE(fecha) >= ?
        AND DATE(fecha) <= ?
      GROUP BY DATE(fecha)
      ORDER BY fecha DESC
    `).all(fechaDesde, fechaHasta);

    res.json({ success: true, data: resumen });
  } catch (error) {
    console.error('Error al obtener ventas diarias:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el reporte de ventas diarias' });
  }
};

const corteCaja = async (req, res) => {
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

    const usuarioId = req.query.usuario_id || req.user.id;

    let whereConditions = ['v.estado = "COMPLETADA"', 'DATE(v.fecha) = ?'];
    let params = [fecha];

    // If VENDEDOR, only their own sales
    if (req.user.rol === 'VENDEDOR') {
      whereConditions.push('v.usuario_id = ?');
      params.push(req.user.id);
    } else if (usuarioId) {
      whereConditions.push('v.usuario_id = ?');
      params.push(usuarioId);
    }

    const whereClause = whereConditions.join(' AND ');

    // CORRECCIÓN 2: Separar ventas contado de ventas fiadas correctamente
    const corte = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_ventas_total,
        SUM(total) as total_ventas_registradas,
        SUM(total_costo) as total_costos,
        SUM(total - total_costo) as ganancia_neta,

        -- Efectivo solo de ventas al contado
        SUM(CASE WHEN metodo_pago IN ('EFECTIVO', 'MIXTO') THEN monto_efectivo ELSE 0 END) as total_efectivo,

        -- QR solo de ventas al contado
        SUM(CASE WHEN metodo_pago IN ('QR', 'MIXTO') THEN monto_qr ELSE 0 END) as total_qr,

        -- Total fiado del día (ventas a crédito)
        SUM(CASE WHEN metodo_pago = 'CREDITO' OR monto_credito > 0 THEN monto_credito ELSE 0 END) as total_fiado,

        -- Ventas al contado (efectivo + QR sin crédito)
        SUM(CASE WHEN metodo_pago IN ('EFECTIVO', 'QR') OR (metodo_pago = 'MIXTO' AND monto_credito = 0) THEN total ELSE 0 END) as ventas_contado,

        -- Cantidad de ventas fiadas
        SUM(CASE WHEN metodo_pago = 'CREDITO' OR monto_credito > 0 THEN 1 ELSE 0 END) as cantidad_ventas_fiadas,

        AVG(total) as ticket_promedio
      FROM ventas v
      WHERE ${whereClause}
    `).get(...params);

    // CORRECCIÓN 2 + 4: Obtener abonos/cobros de créditos del día (dinero que entra físicamente a la caja)
    const abonosCreditos = await db.prepare(`
      SELECT
        COUNT(*) as cantidad_abonos,
        SUM(pc.monto_pagado) as total_abonos,
        SUM(pc.monto_efectivo) as abonos_efectivo,
        SUM(pc.monto_qr) as abonos_qr
      FROM pagos_creditos pc
      WHERE DATE(pc.fecha_pago) = ?
      ${req.user.rol === 'VENDEDOR' ? 'AND pc.recibido_por = ?' : (usuarioId ? 'AND pc.recibido_por = ?' : '')}
    `).get(...params);

    const ventasPorMetodo = await db.prepare(`
      SELECT
        metodo_pago,
        COUNT(*) as cantidad,
        SUM(total) as total
      FROM ventas v
      WHERE ${whereClause}
      GROUP BY metodo_pago
    `).all(...params);

    const usuario = usuarioId
      ? await db.prepare('SELECT id, nombre, username FROM usuarios WHERE id = ?').get(usuarioId)
      : null;

    // CORRECCIÓN 2: Calcular dinero FÍSICO real en caja (efectivo + QR de ventas + abonos)
    const dineroFisico =
      (corte.total_efectivo || 0) +
      (corte.total_qr || 0) +
      (abonosCreditos.total_abonos || 0);

    res.json({
      success: true,
      data: {
        fecha,
        usuario,
        resumen: {
          ...corte,
          // Abonos de créditos
          abonos_efectivo: abonosCreditos.abonos_efectivo || 0,
          abonos_qr: abonosCreditos.abonos_qr || 0,
          total_abonos_creditos: abonosCreditos.total_abonos || 0,
          cantidad_abonos: abonosCreditos.cantidad_abonos || 0,
          // Dinero físico real
          dinero_fisico_total: dineroFisico,
          // Claridad
          ventas_contado: corte.ventas_contado || 0,
          cantidad_ventas_fiadas: corte.cantidad_ventas_fiadas || 0
        },
        por_metodo_pago: ventasPorMetodo
      }
    });
  } catch (error) {
    console.error('Error al obtener corte de caja:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el corte de caja' });
  }
};

const productosMasVendidos = async (req, res) => {
  try {
    const fechaDesde = req.query.fecha_desde || '';
    const fechaHasta = req.query.fecha_hasta || '';
    const limit = parseInt(req.query.limit) || 20;

    let whereConditions = ['v.estado = "COMPLETADA"'];
    let params = [];

    if (fechaDesde) {
      whereConditions.push('DATE(v.fecha) >= ?');
      params.push(fechaDesde);
    }
    if (fechaHasta) {
      whereConditions.push('DATE(v.fecha) <= ?');
      params.push(fechaHasta);
    }

    const whereClause = whereConditions.join(' AND ');

    const productos = await db.prepare(`
      SELECT
        p.id,
        p.codigo_sku_interno,
        p.nombre,
        p.unidad_medida,
        c.nombre as categoria_nombre,
        COUNT(dv.id) as cantidad_ventas,
        SUM(dv.cantidad) as unidades_vendidas,
        SUM(dv.total) as total_vendido,
        SUM(dv.total - (dv.costo_unitario * dv.cantidad)) as ganancia_generada
      FROM detalle_ventas dv
      JOIN ventas v ON dv.venta_id = v.id
      JOIN productos p ON dv.producto_id = p.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE ${whereClause}
      GROUP BY p.id, p.codigo_sku_interno, p.nombre, p.unidad_medida, c.nombre
      ORDER BY unidades_vendidas DESC
      LIMIT ?
    `).all(...params, limit);

    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el reporte' });
  }
};

const stockBajo = async (req, res) => {
  try {
    const productos = await db.prepare(`
      SELECT
        p.id,
        p.codigo_sku_interno,
        p.nombre,
        c.nombre as categoria_nombre,
        p.stock_actual,
        p.stock_minimo,
        p.unidad_medida,
        p.precio_costo,
        p.precio_venta,
        (p.stock_minimo - p.stock_actual) as cantidad_requerida,
        ((p.stock_minimo - p.stock_actual) * p.precio_costo) as costo_reposicion
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
        AND p.stock_actual <= p.stock_minimo
      ORDER BY (p.stock_minimo - p.stock_actual) DESC
    `).all();

    const totalCostoReposicion = productos.reduce((sum, p) => sum + (p.costo_reposicion || 0), 0);

    res.json({
      success: true,
      data: {
        productos,
        resumen: {
          total_productos: productos.length,
          costo_total_reposicion: totalCostoReposicion
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el reporte' });
  }
};

const resumenGeneral = async (req, res) => {
  try {
    // CORRECCIÓN 1: Usar fecha local Bolivia (no UTC)
    const fecha = req.query.fecha || getLocalDate();

    // Ventas del día
    const ventasHoy = await db.prepare(`
      SELECT
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total,
        COALESCE(SUM(total - total_costo), 0) as ganancia
      FROM ventas
      WHERE estado = 'COMPLETADA' AND DATE(fecha) = ?
    `).get(fecha);

    // Ventas del mes
    const mesActual = fecha.slice(0, 7);
    const ventasMes = await db.prepare(`
      SELECT
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total,
        COALESCE(SUM(total - total_costo), 0) as ganancia
      FROM ventas
      WHERE estado = 'COMPLETADA' AND strftime('%Y-%m', fecha) = ?
    `).get(mesActual);

    // Productos con stock bajo
    const stockBajo = await db.prepare(`
      SELECT COUNT(*) as cantidad
      FROM productos
      WHERE activo = 1 AND stock_actual <= stock_minimo
    `).get();

    // Total productos
    const totalProductos = await db.prepare(`
      SELECT COUNT(*) as total, COALESCE(SUM(stock_actual), 0) as valor_inventario_unidades
      FROM productos
      WHERE activo = 1
    `).get();

    // Valor del inventario
    const valorInventario = await db.prepare(`
      SELECT COALESCE(SUM(stock_actual * precio_costo), 0) as valor_costo,
             COALESCE(SUM(stock_actual * precio_venta), 0) as valor_venta
      FROM productos
      WHERE activo = 1
    `).get();

    // Total clientes
    const totalClientes = await db.prepare('SELECT COUNT(*) as total FROM clientes WHERE activo = 1').get();

    res.json({
      success: true,
      data: {
        ventas_hoy: ventasHoy,
        ventas_mes: ventasMes,
        inventario: {
          total_productos: totalProductos.total,
          productos_stock_bajo: stockBajo.cantidad,
          valor_costo: valorInventario.valor_costo,
          valor_venta: valorInventario.valor_venta,
          unidades_totales: totalProductos.valor_inventario_unidades
        },
        clientes: totalClientes
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen general:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el resumen general' });
  }
};


module.exports = { ventasDiarias, corteCaja, productosMasVendidos, stockBajo, resumenGeneral };