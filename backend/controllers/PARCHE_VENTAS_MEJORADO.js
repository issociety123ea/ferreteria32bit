/**
 * PARCHE CRÍTICO: Validaciones y Cálculos en Ventas Controller
 * Aplicar INMEDIATAMENTE a backend/controllers/ventas.controller.js
 *
 * Este archivo contiene las funciones mejoradas que reemplazan
 * las secciones críticas del controlador existente
 */

const {
  validateCurrency,
  validateQuantity,
  validateCart,
  validatePaymentAmounts,
  roundMoney
} = require('../middleware/validation.js');

/**
 * REEMPLAZAR la función 'create' existente con esta versión mejorada
 * que incluye:
 * - Validaciones estrictas
 * - Cálculos precisos (sin errores de punto flotante)
 * - Lógica correcta de fiados
 */
const createVentaMejorada = async (req, res) => {
  const connection = db.connection;

  try {
    const { cliente_id, items, metodo_pago, monto_efectivo, monto_qr, monto_credito, descuento, notas } = req.body;

    // ============================================================
    // VALIDACIONES INICIALES
    // ============================================================

    // 1. Validar que hay items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos un producto en la venta'
      });
    }

    // 2. Validar cada item del carrito
    for (const item of items) {
      if (!item.producto_id) {
        return res.status(400).json({
          success: false,
          message: 'Todos los items deben tener un producto_id válido'
        });
      }

      // Validar cantidad
      const qtyResult = validateQuantity(item.cantidad, false);
      if (!qtyResult.valid) {
        return res.status(400).json({
          success: false,
          message: `Cantidad inválida: ${qtyResult.message}`
        });
      }

      // Validar precio unitario
      const priceResult = validateCurrency(item.precio_unitario);
      if (!priceResult.valid) {
        return res.status(400).json({
          success: false,
          message: `Precio unitario inválido: ${priceResult.message}`
        });
      }
    }

    // 3. Validar descuento (no puede ser negativo)
    const descuentoValidado = parseFloat(descuento) || 0;
    if (descuentoValidado < 0) {
      return res.status(400).json({
        success: false,
        message: 'El descuento no puede ser negativo'
      });
    }

    // 4. Validar método de pago
    const metodosPagovalidos = ['EFECTIVO', 'QR', 'CREDITO', 'MIXTO', 'FIADO'];
    if (!metodosPagovalidos.includes(metodo_pago)) {
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Válidos: ${metodosPagovalidos.join(', ')}`
      });
    }

    // Begin transaction
    await new Promise((resolve, reject) => {
      connection.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // ============================================================
      // VALIDAR STOCK Y OBTENER DATOS DE PRODUCTOS
      // ============================================================

      for (const item of items) {
        const producto = await db.prepare(
          'SELECT id, nombre, stock_actual, precio_venta, precio_costo, permite_decimales FROM productos WHERE id = ? AND activo = 1'
        ).get(item.producto_id);

        if (!producto) {
          throw new Error(`Producto ID ${item.producto_id} no encontrado o inactivo`);
        }

        // Validar que la cantidad no supere stock
        if (item.cantidad > producto.stock_actual) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". ` +
            `Disponible: ${producto.stock_actual}, Solicitado: ${item.cantidad}`
          );
        }

        // Validar decimales si el producto no los permite
        if (!producto.permite_decimales && item.cantidad % 1 !== 0) {
          throw new Error(
            `El producto "${producto.nombre}" no permite cantidades decimales`
          );
        }
      }

      // ============================================================
      // CÁLCULOS PRECISOS CON REDONDEO A 2 DECIMALES
      // ============================================================

      let subtotal = 0;
      let totalCosto = 0;
      const detalles = [];

      for (const item of items) {
        const producto = await db.prepare(
          'SELECT * FROM productos WHERE id = ?'
        ).get(item.producto_id);

        const precioUnitario = item.precio_unitario || producto.precio_venta;
        const costoUnitario = producto.precio_costo;

        // Cálculos con redondeo preciso
        const itemSubtotal = roundMoney(precioUnitario * item.cantidad);
        const itemDescuento = roundMoney(item.descuento || 0);
        const itemTotal = roundMoney(itemSubtotal - itemDescuento);

        subtotal = roundMoney(subtotal + itemSubtotal);
        totalCosto = roundMoney(totalCosto + (costoUnitario * item.cantidad));

        detalles.push({
          producto_id: producto.id,
          codigo_producto: producto.codigo_sku_interno,
          nombre_producto: producto.nombre,
          cantidad: item.cantidad,
          precio_unitario: precioUnitario,
          costo_unitario: costoUnitario,
          subtotal: itemSubtotal,
          descuento: itemDescuento,
          total: itemTotal
        });
      }

      // Cálculo final del total
      const descuentoFinal = roundMoney(descuentoValidado);
      const total = roundMoney(subtotal - descuentoFinal);

      // Validar que el total sea positivo
      if (total <= 0) {
        throw new Error('El total de la venta debe ser mayor a 0');
      }

      // ============================================================
      // VALIDAR MONTOS DE PAGO
      // ============================================================

      const montoEfectivoValidado = roundMoney(monto_efectivo || 0);
      const montoQrValidado = roundMoney(monto_qr || 0);
      const montoCreditoValidado = roundMoney(monto_credito || 0);

      // Validar que no sean negativos
      if (montoEfectivoValidado < 0 || montoQrValidado < 0 || montoCreditoValidado < 0) {
        throw new Error('Los montos de pago no pueden ser negativos');
      }

      // Validar que la suma de montos sea >= total
      const sumaMontosRecibidos = roundMoney(montoEfectivoValidado + montoQrValidado + montoCreditoValidado);
      if (sumaMontosRecibidos < total) {
        throw new Error(
          `Monto insuficiente. Total: ${total.toFixed(2)} Bs., ` +
          `Recibido: ${sumaMontosRecibidos.toFixed(2)} Bs.`
        );
      }

      // Calcular vuelto (solo si el monto recibido es mayor)
      const vuelto = roundMoney(sumaMontosRecibidos - total);

      // ============================================================
      // LÓGICA CORRECTA DE FIADOS
      // ============================================================

      // REGLA CRÍTICA:
      // - Si el cliente paga el monto TOTAL → NO es fiado
      // - Si el cliente paga MENOS del total → SÍ es fiado
      // - Si el cliente paga 0 → SÍ es fiado por el total

      const esFilado = sumaMontosRecibidos < total;
      const saldoPendiente = esFilado ? roundMoney(total - sumaMontosRecibidos) : 0;

      // Si es fiado, debe haber cliente válido
      if (esFilado && (!cliente_id || cliente_id === 1)) {
        throw new Error(
          'Para registrar una venta como fiado/crédito, debe seleccionar un cliente específico'
        );
      }

      // ============================================================
      // GENERAR NÚMERO DE VENTA E INSERTAR
      // ============================================================

      const numeroVenta = await generateNumeroVenta();

      const ventaResult = await db.prepare(`
        INSERT INTO ventas (
          numero_venta, cliente_id, usuario_id, subtotal, descuento, total,
          total_costo, metodo_pago, monto_efectivo, monto_qr, monto_credito,
          estado, notas
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETADA', ?)
      `).run(
        numeroVenta,
        cliente_id || 1,
        req.user.id,
        subtotal,
        descuentoFinal,
        total,
        totalCosto,
        metodo_pago,
        montoEfectivoValidado,
        montoQrValidado,
        montoCreditoValidado,
        notas || ''
      );

      const ventaId = ventaResult.lastID;

      // ============================================================
      // INSERTAR DETALLE DE VENTAS Y ACTUALIZAR STOCK
      // ============================================================

      for (const detalle of detalles) {
        // Insertar en detalle_ventas
        await db.prepare(`
          INSERT INTO detalle_ventas (
            venta_id, producto_id, codigo_producto, nombre_producto,
            cantidad, precio_unitario, costo_unitario, subtotal, descuento, total
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          ventaId,
          detalle.producto_id,
          detalle.codigo_producto,
          detalle.nombre_producto,
          detalle.cantidad,
          detalle.precio_unitario,
          detalle.costo_unitario,
          detalle.subtotal,
          detalle.descuento,
          detalle.total
        );

        // Actualizar stock (restar cantidad vendida)
        await db.prepare(
          'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?'
        ).run(detalle.cantidad, detalle.producto_id);

        // Registrar movimiento en kardex
        const productoActual = await db.prepare(
          'SELECT stock_actual FROM productos WHERE id = ?'
        ).get(detalle.producto_id);

        await db.prepare(`
          INSERT INTO kardex (
            producto_id, tipo_movimiento, cantidad, stock_anterior,
            stock_nuevo, costo_unitario, referencia_id, referencia_tipo,
            usuario_id, notas
          )
          VALUES (?, 'VENTA', ?, ?, ?, ?, ?, 'VENTA', ?, ?)
        `).run(
          detalle.producto_id,
          detalle.cantidad,
          detalle.cantidad + (productoActual.stock_actual - detalle.cantidad), // stock anterior
          productoActual.stock_actual, // stock nuevo
          detalle.costo_unitario,
          ventaId,
          req.user.id,
          `Venta: ${numeroVenta}`
        );
      }

      // ============================================================
      // REGISTRAR FIADO SI APLICA
      // ============================================================

      if (esFilado) {
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // 30 días por defecto

        await db.prepare(`
          INSERT INTO creditos (
            venta_id, cliente_id, monto_total, saldo_pendiente,
            estado, fecha_vencimiento, creado_por, notas
          )
          VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?)
        `).run(
          ventaId,
          cliente_id,
          total,
          saldoPendiente,
          fechaVencimiento.toISOString().split('T')[0],
          req.user.id,
          `Venta: ${numeroVenta} - Monto pagado: ${sumaMontosRecibidos.toFixed(2)}`
        );

        // Registrar en auditoría
        await db.prepare(`
          INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_nuevos, ip_address)
          VALUES (?, 'CREAR_FIADO', 'VENTAS', 'creditos', ?, ?, ?)
        `).run(
          req.user.id,
          ventaId,
          JSON.stringify({
            venta: numeroVenta,
            total,
            saldo_pendiente: saldoPendiente,
            monto_pagado: sumaMontosRecibidos
          }),
          req.ip
        );
      }

      // ============================================================
      // COMMIT Y RESPUESTA
      // ============================================================

      await new Promise((resolve, reject) => {
        connection.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Registrar en auditoría
      await db.prepare(`
        INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_nuevos, ip_address)
        VALUES (?, 'CREAR_VENTA', 'VENTAS', 'ventas', ?, ?, ?)
      `).run(
        req.user.id,
        ventaId,
        JSON.stringify({
          numero_venta: numeroVenta,
          total,
          items_count: items.length,
          es_fiado: esFilado,
          saldo_pendiente: saldoPendiente
        }),
        req.ip
      );

      res.json({
        success: true,
        message: esFilado ? 'Venta registrada como fiado correctamente' : 'Venta completada correctamente',
        data: {
          venta_id: ventaId,
          numero_venta: numeroVenta,
          total: total,
          vuelto: vuelto,
          es_fiado: esFilado,
          saldo_pendiente: saldoPendiente,
          fecha: new Date().toISOString()
        }
      });
    } catch (innerError) {
      await new Promise((resolve) => {
        connection.run('ROLLBACK', () => resolve());
      });
      throw innerError;
    }
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la venta'
    });
  }
};

module.exports = {
  createVentaMejorada
};
