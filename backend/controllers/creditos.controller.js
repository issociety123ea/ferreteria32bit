const db = require('../config/database.js');
const { getLocalDateTime } = require('../utils/date.js');

// Obtener todos los créditos con filtros
const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const estado = req.query.estado || 'PENDIENTE';
    const clienteId = req.query.cliente_id || null;

    let whereConditions = ['cr.estado = ?'];
    let params = [estado];

    // CORRECCIÓN 2026-11-17: Para estados de deuda activa (PENDIENTE/VENCIDO),
    // excluir registros con saldo_pendiente <= 0 (ya pagados o mal registrados).
    // Así "Créditos Activos" y "Clientes con Deuda" sólo cuentan deudas reales.
    if (estado === 'PENDIENTE' || estado === 'VENCIDO') {
      whereConditions.push('cr.saldo_pendiente > 0');
    }

    if (clienteId) {
      whereConditions.push('cr.cliente_id = ?');
      params.push(clienteId);
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM creditos cr WHERE ${whereClause}`).get(...params);

    const creditos = await db.prepare(`
      SELECT
        cr.*,
        v.numero_venta,
        c.nombre_razon_social as cliente_nombre,
        c.nit_ci as cliente_nit,
        c.telefono as cliente_telefono,
        u.nombre as creado_por_nombre,
        (cr.monto_total - cr.saldo_pendiente) as monto_pagado,
        CAST(julianday('now') - julianday(cr.fecha_credito) AS INTEGER) as dias_transcurridos,
        CASE
          WHEN cr.fecha_vencimiento IS NOT NULL AND julianday(cr.fecha_vencimiento) < julianday('now') AND cr.estado = 'PENDIENTE' THEN 1
          ELSE 0
        END as esta_vencido
      FROM creditos cr
      INNER JOIN clientes c ON cr.cliente_id = c.id
      INNER JOIN ventas v ON cr.venta_id = v.id
      INNER JOIN usuarios u ON cr.creado_por = u.id
      WHERE ${whereClause}
      ORDER BY cr.fecha_credito DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Actualizar estado a VENCIDO si corresponde
    for (const credito of creditos) {
      if (credito.esta_vencido && credito.estado === 'PENDIENTE') {
        await db.prepare('UPDATE creditos SET estado = ? WHERE id = ?').run('VENCIDO', credito.id);
        credito.estado = 'VENCIDO';
      }
    }

    res.json({
      success: true,
      data: {
        items: creditos,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener créditos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener créditos' });
  }
};

// Obtener un crédito por ID con su historial de pagos
const getById = async (req, res) => {
  try {
    const credito = await db.prepare(`
      SELECT
        cr.*,
        v.numero_venta,
        v.total as venta_total,
        c.nombre_razon_social as cliente_nombre,
        c.nit_ci as cliente_nit,
        c.telefono as cliente_telefono,
        c.direccion as cliente_direccion,
        u.nombre as creado_por_nombre,
        (cr.monto_total - cr.saldo_pendiente) as monto_pagado,
        CAST(julianday('now') - julianday(cr.fecha_credito) AS INTEGER) as dias_transcurridos
      FROM creditos cr
      INNER JOIN clientes c ON cr.cliente_id = c.id
      INNER JOIN ventas v ON cr.venta_id = v.id
      INNER JOIN usuarios u ON cr.creado_por = u.id
      WHERE cr.id = ?
    `).get(req.params.id);

    if (!credito) {
      return res.status(404).json({ success: false, message: 'Crédito no encontrado' });
    }

    // Obtener historial de pagos
    const pagos = await db.prepare(`
      SELECT pc.*, u.nombre as recibido_por_nombre
      FROM pagos_creditos pc
      LEFT JOIN usuarios u ON pc.recibido_por = u.id
      WHERE pc.credito_id = ?
      ORDER BY pc.fecha_pago DESC
    `).all(req.params.id);

    // Obtener detalles de la venta
    const detallesVenta = await db.prepare(`
      SELECT dv.*, p.nombre as producto_nombre
      FROM detalle_ventas dv
      JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = ?
    `).all(credito.venta_id);

    res.json({
      success: true,
      data: {
        ...credito,
        pagos,
        detalles_venta: detallesVenta
      }
    });
  } catch (error) {
    console.error('Error al obtener crédito:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el crédito' });
  }
};

// Registrar un pago a un crédito
const registrarPago = async (req, res) => {
  const connection = db.connection;

  try {
    const { credito_id, monto_pagado, metodo_pago, monto_efectivo, monto_qr, notas } = req.body;

    if (!credito_id || !monto_pagado || monto_pagado <= 0) {
      return res.status(400).json({ success: false, message: 'Crédito ID y monto pagado son requeridos' });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      const credito = await db.prepare('SELECT * FROM creditos WHERE id = ?').get(credito_id);

      if (!credito) {
        throw new Error('Crédito no encontrado');
      }

      if (credito.estado === 'PAGADO') {
        throw new Error('Este crédito ya está pagado completamente');
      }

      if (credito.estado === 'CANCELADO') {
        throw new Error('Este crédito está cancelado');
      }

      if (monto_pagado > credito.saldo_pendiente) {
        throw new Error(`El monto pagado (${monto_pagado}) no puede ser mayor al saldo pendiente (${credito.saldo_pendiente})`);
      }

      const saldoAnterior = credito.saldo_pendiente;
      const saldoNuevo = saldoAnterior - monto_pagado;

      const finalMetodoPago = metodo_pago || 'EFECTIVO';
      const finalMontoEfectivo = monto_efectivo || 0;
      const finalMontoQr = monto_qr || 0;

      // Insertar pago (el trigger actualizará el crédito y el saldo del cliente)
      // CORRECCIÓN 1 + 4: Pasar fecha/hora local Bolivia explícitamente (SQLite usa UTC por defecto)
      // Así el abono se registra el día correcto y aparece en corte de caja / mi historial del día
      const fechaLocal = getLocalDateTime();
      const pagoResult = await db.prepare(`
        INSERT INTO pagos_creditos (credito_id, monto_pagado, metodo_pago, monto_efectivo, monto_qr, saldo_anterior, saldo_nuevo, recibido_por, notas, fecha_pago)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        credito_id,
        monto_pagado,
        finalMetodoPago,
        finalMontoEfectivo,
        finalMontoQr,
        saldoAnterior,
        saldoNuevo,
        req.user.id,
        notas || null,
        fechaLocal
      );

      // Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'REGISTRAR_PAGO_CREDITO', 'CREDITOS', 'pagos_creditos', pagoResult.lastID);

      // Commit transaction
      await new Promise((resolve, reject) => {
        connection.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const creditoActualizado = await db.prepare('SELECT * FROM creditos WHERE id = ?').get(credito_id);

      res.status(201).json({
        success: true,
        data: creditoActualizado,
        message: saldoNuevo <= 0 ? 'Crédito pagado completamente' : 'Pago registrado exitosamente'
      });
    } catch (error) {
      // Rollback on error
      await new Promise((resolve) => {
        connection.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al registrar el pago' });
  }
};

// Obtener resumen de créditos por cliente
const getResumenPorCliente = async (req, res) => {
  try {
    const resumen = await db.prepare(`
      SELECT
        c.id as cliente_id,
        c.nombre_razon_social,
        c.nit_ci,
        c.telefono,
        c.limite_credito,
        c.saldo_credito,
        COUNT(cr.id) as total_creditos,
        SUM(CASE WHEN cr.estado = 'PENDIENTE' THEN 1 ELSE 0 END) as creditos_pendientes,
        SUM(CASE WHEN cr.estado = 'VENCIDO' THEN 1 ELSE 0 END) as creditos_vencidos,
        SUM(CASE WHEN cr.estado = 'PAGADO' THEN 1 ELSE 0 END) as creditos_pagados,
        SUM(cr.saldo_pendiente) as total_saldo_pendiente
      FROM clientes c
      LEFT JOIN creditos cr ON c.id = cr.cliente_id
      WHERE c.saldo_credito > 0 OR cr.id IS NOT NULL
      GROUP BY c.id
      HAVING total_saldo_pendiente > 0
      ORDER BY total_saldo_pendiente DESC
    `).all();

    res.json({ success: true, data: resumen });
  } catch (error) {
    console.error('Error al obtener resumen de créditos por cliente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen' });
  }
};

// Obtener historial de pagos de un cliente
const getHistorialPagosCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
    if (!cliente) {
      return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
    }

    const pagos = await db.prepare(`
      SELECT
        pc.*,
        cr.venta_id,
        v.numero_venta,
        u.nombre as recibido_por_nombre
      FROM pagos_creditos pc
      INNER JOIN creditos cr ON pc.credito_id = cr.id
      INNER JOIN ventas v ON cr.venta_id = v.id
      LEFT JOIN usuarios u ON pc.recibido_por = u.id
      WHERE cr.cliente_id = ?
      ORDER BY pc.fecha_pago DESC
    `).all(id);

    res.json({ success: true, data: pagos });
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial de pagos' });
  }
};

// Cancelar un crédito (solo si no se han realizado pagos)
const cancelarCredito = async (req, res) => {
  const connection = db.connection;

  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({ success: false, message: 'Debe proporcionar un motivo para cancelar el crédito' });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      const credito = await db.prepare('SELECT * FROM creditos WHERE id = ?').get(id);

      if (!credito) {
        throw new Error('Crédito no encontrado');
      }

      if (credito.estado === 'PAGADO') {
        throw new Error('No se puede cancelar un crédito que ya está pagado');
      }

      // Verificar si ya tiene pagos realizados
      const countPagos = await db.prepare('SELECT COUNT(*) as total FROM pagos_creditos WHERE credito_id = ?').get(id);

      if (countPagos.total > 0) {
        throw new Error('No se puede cancelar un crédito que ya tiene pagos registrados');
      }

      // Actualizar estado del crédito
      await db.prepare('UPDATE creditos SET estado = ?, notas = ? WHERE id = ?').run('CANCELADO', motivo, id);

      // Revertir saldo del cliente
      await db.prepare('UPDATE clientes SET saldo_credito = saldo_credito - ? WHERE id = ?').run(credito.saldo_pendiente, credito.cliente_id);

      // Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(req.user.id, 'CANCELAR_CREDITO', 'CREDITOS', 'creditos', id, JSON.stringify(credito));

      // Commit transaction
      await new Promise((resolve, reject) => {
        connection.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ success: true, message: 'Crédito cancelado exitosamente' });
    } catch (error) {
      // Rollback on error
      await new Promise((resolve) => {
        connection.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Error al cancelar crédito:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al cancelar el crédito' });
  }
};

module.exports = {
  getAll,
  getById,
  registrarPago,
  getResumenPorCliente,
  getHistorialPagosCliente,
  cancelarCredito
};
