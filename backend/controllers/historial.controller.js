const db = require('../config/database.js');

// Obtener historial completo de transacciones (ventas y compras)
const getHistorialTransacciones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const tipo = req.query.tipo || 'ALL'; // 'VENTA', 'COMPRA', 'ALL'
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    const usuarioId = req.query.usuario_id || null;
    const clienteId = req.query.cliente_id || null;

    let whereConditions = [];
    let params = [];

    // Construir query base según tipo
    let queryVentas = `
      SELECT
        v.id,
        'VENTA' as tipo_transaccion,
        v.numero_venta as numero_documento,
        v.fecha,
        c.nombre_razon_social as cliente_proveedor,
        u.nombre as usuario_nombre,
        v.total as monto,
        v.metodo_pago,
        v.estado,
        v.notas
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      INNER JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;

    let queryCompras = `
      SELECT
        cp.id,
        'COMPRA' as tipo_transaccion,
        cp.numero_compra as numero_documento,
        cp.fecha,
        p.nombre as cliente_proveedor,
        u.nombre as usuario_nombre,
        cp.total_compra as monto,
        'N/A' as metodo_pago,
        cp.estado,
        cp.notas
      FROM compras_proveedores cp
      INNER JOIN proveedores p ON cp.proveedor_id = p.id
      INNER JOIN usuarios u ON cp.usuario_id = u.id
      WHERE 1=1
    `;

    // Aplicar filtros
    if (fechaInicio) {
      queryVentas += ' AND DATE(v.fecha) >= DATE(?)';
      queryCompras += ' AND DATE(cp.fecha) >= DATE(?)';
    }

    if (fechaFin) {
      queryVentas += ' AND DATE(v.fecha) <= DATE(?)';
      queryCompras += ' AND DATE(cp.fecha) <= DATE(?)';
    }

    if (usuarioId) {
      queryVentas += ' AND v.usuario_id = ?';
      queryCompras += ' AND cp.usuario_id = ?';
    }

    if (clienteId) {
      queryVentas += ' AND v.cliente_id = ?';
    }

    // Construir query final según tipo
    let finalQuery;
    if (tipo === 'VENTA') {
      finalQuery = queryVentas;
    } else if (tipo === 'COMPRA') {
      finalQuery = queryCompras;
    } else {
      finalQuery = `${queryVentas} UNION ALL ${queryCompras}`;
    }

    // Contar total
    const countQuery = `SELECT COUNT(*) as total FROM (${finalQuery}) as combined`;

    // Preparar parámetros según filtros
    let queryParams = [];
    if (fechaInicio) queryParams.push(fechaInicio);
    if (fechaFin) queryParams.push(fechaFin);
    if (usuarioId) queryParams.push(usuarioId);
    if (clienteId && tipo !== 'COMPRA') queryParams.push(clienteId);

    // Para el UNION ALL, duplicar parámetros
    if (tipo === 'ALL') {
      const ventasParams = [...queryParams];
      queryParams = [...ventasParams, ...ventasParams.filter((_, idx) => {
        // Excluir clienteId para compras
        if (clienteId) return idx < ventasParams.length - 1;
        return true;
      })];
    }

    const countResult = await db.prepare(countQuery).get(...queryParams);

    // Obtener datos paginados
    finalQuery += ' ORDER BY fecha DESC LIMIT ? OFFSET ?';
    const transacciones = await db.prepare(finalQuery).all(...queryParams, limit, offset);

    res.json({
      success: true,
      data: {
        items: transacciones,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de transacciones:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de transacciones' });
  }
};

// Obtener historial de ventas (para vendedores y administradores)
const getHistorialVentas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    const clienteId = req.query.cliente_id || null;
    const metodoPago = req.query.metodo_pago || null;

    // Si es vendedor, solo puede ver sus propias ventas
    const esVendedor = req.user.rol === 'VENDEDOR';
    const usuarioId = esVendedor ? req.user.id : req.query.usuario_id || null;

    let whereConditions = ['v.estado = ?'];
    let params = ['COMPLETADA'];

    if (fechaInicio) {
      whereConditions.push('DATE(v.fecha) >= DATE(?)');
      params.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push('DATE(v.fecha) <= DATE(?)');
      params.push(fechaFin);
    }

    if (usuarioId) {
      whereConditions.push('v.usuario_id = ?');
      params.push(usuarioId);
    }

    if (clienteId) {
      whereConditions.push('v.cliente_id = ?');
      params.push(clienteId);
    }

    if (metodoPago) {
      whereConditions.push('v.metodo_pago = ?');
      params.push(metodoPago);
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM ventas v WHERE ${whereClause}`).get(...params);

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
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Calcular totales
    const totales = await db.prepare(`
      SELECT
        COUNT(*) as total_ventas,
        SUM(v.total) as total_monto,
        SUM(v.total_costo) as total_costos,
        SUM(v.total - v.total_costo) as ganancia_neta,
        AVG(v.total) as ticket_promedio
      FROM ventas v
      WHERE ${whereClause}
    `).get(...params);

    res.json({
      success: true,
      data: {
        items: ventas,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        },
        totales
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de ventas' });
  }
};

// Obtener historial de auditoría
const getHistorialAuditoria = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const modulo = req.query.modulo || null;
    const usuarioId = req.query.usuario_id || null;
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;

    let whereConditions = [];
    let params = [];

    if (modulo) {
      whereConditions.push('a.modulo = ?');
      params.push(modulo);
    }

    if (usuarioId) {
      whereConditions.push('a.usuario_id = ?');
      params.push(usuarioId);
    }

    if (fechaInicio) {
      whereConditions.push('DATE(a.fecha) >= DATE(?)');
      params.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push('DATE(a.fecha) <= DATE(?)');
      params.push(fechaFin);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM auditoria a ${whereClause}`).get(...params);

    const registros = await db.prepare(`
      SELECT
        a.*,
        u.nombre as usuario_nombre,
        u.username
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      ${whereClause}
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      success: true,
      data: {
        items: registros,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de auditoría' });
  }
};

// Obtener movimientos de kardex (historial de inventario)
const getHistorialKardex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const productoId = req.query.producto_id || null;
    const tipoMovimiento = req.query.tipo_movimiento || null;
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;

    let whereConditions = [];
    let params = [];

    if (productoId) {
      whereConditions.push('k.producto_id = ?');
      params.push(productoId);
    }

    if (tipoMovimiento) {
      whereConditions.push('k.tipo_movimiento = ?');
      params.push(tipoMovimiento);
    }

    if (fechaInicio) {
      whereConditions.push('DATE(k.fecha) >= DATE(?)');
      params.push(fechaInicio);
    }

    if (fechaFin) {
      whereConditions.push('DATE(k.fecha) <= DATE(?)');
      params.push(fechaFin);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM kardex k ${whereClause}`).get(...params);

    const movimientos = await db.prepare(`
      SELECT
        k.*,
        p.nombre as producto_nombre,
        p.codigo_sku_interno as producto_codigo,
        u.nombre as usuario_nombre
      FROM kardex k
      INNER JOIN productos p ON k.producto_id = p.id
      INNER JOIN usuarios u ON k.usuario_id = u.id
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
    console.error('Error al obtener historial de kardex:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de kardex' });
  }
};

// Obtener historial de un cliente específico
const getHistorialCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    // Obtener ventas
    const ventas = await db.prepare(`
      SELECT
        v.*,
        u.nombre as usuario_nombre
      FROM ventas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.cliente_id = ? AND v.estado = 'COMPLETADA'
      ORDER BY v.fecha DESC
      LIMIT 50
    `).all(id);

    // Obtener créditos
    const creditos = await db.prepare(`
      SELECT
        cr.*,
        v.numero_venta
      FROM creditos cr
      INNER JOIN ventas v ON cr.venta_id = v.id
      WHERE cr.cliente_id = ?
      ORDER BY cr.fecha_credito DESC
    `).all(id);

    // Obtener resumen
    const resumen = await db.prepare(`
      SELECT
        COUNT(v.id) as total_compras,
        SUM(v.total) as monto_total_comprado,
        AVG(v.total) as ticket_promedio,
        MAX(v.fecha) as ultima_compra,
        MIN(v.fecha) as primera_compra
      FROM ventas v
      WHERE v.cliente_id = ? AND v.estado = 'COMPLETADA'
    `).get(id);

    res.json({
      success: true,
      data: {
        cliente,
        ventas,
        creditos,
        resumen
      }
    });
  } catch (error) {
    console.error('Error al obtener historial del cliente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial del cliente' });
  }
};

module.exports = {
  getHistorialTransacciones,
  getHistorialVentas,
  getHistorialAuditoria,
  getHistorialKardex,
  getHistorialCliente
};
