const db = require('../config/database.js');

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoriaId = req.query.categoria_id || '';
    const stockBajo = req.query.stock_bajo === 'true';
    const sinStock = req.query.sin_stock === 'true';
    const activo = req.query.activo !== undefined ? parseInt(req.query.activo) : 1;

    let whereConditions = ['p.activo = ?'];
    let params = [activo];

    if (search) {
      whereConditions.push('(LOWER(p.nombre) LIKE LOWER(?) OR LOWER(p.codigo_sku_interno) LIKE LOWER(?))');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (categoriaId) {
      whereConditions.push('p.categoria_id = ?');
      params.push(parseInt(categoriaId));
    }

    if (stockBajo) {
      whereConditions.push('p.stock_actual <= p.stock_minimo AND p.stock_actual > 0');
    }

    if (sinStock) {
      whereConditions.push('p.stock_actual <= 0');
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const countResult = await db.prepare(`SELECT COUNT(*) as total FROM productos p ${whereClause}`).get(...params);

    const isVendedor = req.user.rol === 'VENDEDOR';
    const selectFields = isVendedor
      ? 'p.id, p.codigo_sku_interno, p.nombre, p.descripcion, p.imagen_url, p.categoria_id, c.nombre as categoria_nombre, p.unidad_medida, p.permite_decimales, p.stock_actual, p.precio_venta, p.activo'
      : 'p.id, p.codigo_sku_interno, p.nombre, p.descripcion, p.imagen_url, p.categoria_id, c.nombre as categoria_nombre, p.unidad_medida, p.permite_decimales, p.stock_actual, p.stock_minimo, p.precio_costo, p.precio_venta, p.margen_ganancia, p.activo, p.creado_at, p.actualizado_at';

    const productos = await db.prepare(`
      SELECT ${selectFields}
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ${whereClause}
      ORDER BY p.nombre ASC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    res.json({
      success: true,
      data: {
        items: productos,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

const getById = async (req, res) => {
  try {
    const isVendedor = req.user.rol === 'VENDEDOR';
    const selectFields = isVendedor
      ? 'p.id, p.codigo_sku_interno, p.nombre, p.imagen_url, p.unidad_medida, p.permite_decimales, p.stock_actual, p.precio_venta'
      : 'p.*, c.nombre as categoria_nombre';

    const producto = await db.prepare(`
      SELECT ${selectFields}
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    res.json({ success: true, data: producto });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el producto' });
  }
};

const create = async (req, res) => {
  try {
    const { codigo_sku_interno, nombre, descripcion, categoria_id, unidad_medida, permite_decimales, stock_actual, stock_minimo, precio_costo, precio_venta, imagen_url } = req.body;

    if (!codigo_sku_interno || !nombre || precio_venta === undefined) {
      return res.status(400).json({ success: false, message: 'Código, nombre y precio de venta son requeridos' });
    }

    const existing = await db.prepare('SELECT id FROM productos WHERE codigo_sku_interno = ?').get(codigo_sku_interno);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe un producto con ese código' });
    }

    // Handle uploaded image or URL
    let finalImageUrl = imagen_url || null;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    try {
      await db.prepare('BEGIN TRANSACTION').run();

      const result = await db.prepare(`
        INSERT INTO productos (codigo_sku_interno, nombre, descripcion, imagen_url, categoria_id, unidad_medida, permite_decimales, stock_actual, stock_minimo, precio_costo, precio_venta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        codigo_sku_interno,
        nombre,
        descripcion || null,
        finalImageUrl,
        categoria_id || null,
        unidad_medida || 'Pieza',
        permite_decimales ? 1 : 0,
        stock_actual || 0,
        stock_minimo || 0,
        precio_costo || 0,
        precio_venta
      );

      // Registrar en kardex si hay stock inicial
      if (stock_actual && stock_actual > 0) {
        await db.prepare(`
          INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_tipo, usuario_id, notas)
          VALUES (?, 'AJUSTE_ENTRADA', ?, 0, ?, ?, 'INVENTARIO_INICIAL', ?, 'Stock inicial al crear producto')
        `).run(result.lastID, stock_actual, stock_actual, precio_costo || 0, req.user.id);
      }

      // Auditoría
      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, 'CREAR_PRODUCTO', 'INVENTARIO', 'productos', result.lastID);

      await db.prepare('COMMIT').run();

      const producto = await db.prepare('SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?').get(result.lastID);

      res.status(201).json({ success: true, data: producto, message: 'Producto creado exitosamente' });
    } catch (error) {
      await db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el producto' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo_sku_interno, nombre, descripcion, categoria_id, unidad_medida, permite_decimales, stock_minimo, precio_costo, precio_venta, activo, imagen_url } = req.body;

    const existing = await db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Check for duplicate code
    if (codigo_sku_interno && codigo_sku_interno !== existing.codigo_sku_interno) {
      const duplicate = await db.prepare('SELECT id FROM productos WHERE codigo_sku_interno = ? AND id != ?').get(codigo_sku_interno, id);
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Ya existe un producto con ese código' });
      }
    }

    // Handle uploaded image or URL
    let finalImageUrl = imagen_url !== undefined ? imagen_url : existing.imagen_url;
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    await db.prepare(`
      UPDATE productos SET
        codigo_sku_interno = COALESCE(?, codigo_sku_interno),
        nombre = COALESCE(?, nombre),
        descripcion = ?,
        imagen_url = ?,
        categoria_id = ?,
        unidad_medida = COALESCE(?, unidad_medida),
        permite_decimales = COALESCE(?, permite_decimales),
        stock_minimo = COALESCE(?, stock_minimo),
        precio_costo = COALESCE(?, precio_costo),
        precio_venta = COALESCE(?, precio_venta),
        activo = COALESCE(?, activo)
      WHERE id = ?
    `).run(
      codigo_sku_interno,
      nombre,
      descripcion !== undefined ? descripcion : existing.descripcion,
      finalImageUrl,
      categoria_id !== undefined ? categoria_id : existing.categoria_id,
      unidad_medida,
      permite_decimales !== undefined ? (permite_decimales ? 1 : 0) : null,
      stock_minimo,
      precio_costo,
      precio_venta,
      activo !== undefined ? (activo ? 1 : 0) : null,
      id
    );

    // Auditoría
    await db.prepare(
      'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, 'ACTUALIZAR_PRODUCTO', 'INVENTARIO', 'productos', id, JSON.stringify(existing));

    const producto = await db.prepare('SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?').get(id);

    res.json({ success: true, data: producto, message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el producto' });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_movimiento, cantidad, notas } = req.body;

    if (!tipo_movimiento || cantidad === undefined) {
      return res.status(400).json({ success: false, message: 'Tipo de movimiento y cantidad son requeridos' });
    }

    if (!['AJUSTE_ENTRADA', 'AJUSTE_SALIDA', 'MERMA'].includes(tipo_movimiento)) {
      return res.status(400).json({ success: false, message: 'Tipo de movimiento no válido' });
    }

    const producto = await db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    if (!producto) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const stockAnterior = producto.stock_actual;
    let stockNuevo;

    if (tipo_movimiento === 'AJUSTE_ENTRADA') {
      stockNuevo = stockAnterior + cantidad;
    } else {
      stockNuevo = stockAnterior - cantidad;
      if (stockNuevo < 0) {
        return res.status(400).json({ success: false, message: 'Stock insuficiente para este ajuste' });
      }
    }

    try {
      await db.prepare('BEGIN TRANSACTION').run();

      await db.prepare('UPDATE productos SET stock_actual = ? WHERE id = ?').run(stockNuevo, id);

      await db.prepare(`
        INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_tipo, usuario_id, notas)
        VALUES (?, ?, ?, ?, ?, ?, 'AJUSTE_MANUAL', ?, ?)
      `).run(id, tipo_movimiento, cantidad, stockAnterior, stockNuevo, producto.precio_costo, req.user.id, notas || null);

      await db.prepare(
        'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id) VALUES (?, ?, ?, ?, ?)'
      ).run(req.user.id, `AJUSTE_STOCK_${tipo_movimiento}`, 'INVENTARIO', 'productos', id);

      await db.prepare('COMMIT').run();
    } catch (error) {
      await db.prepare('ROLLBACK').run();
      throw error;
    }

    res.json({
      success: true,
      message: 'Stock ajustado exitosamente',
      data: {
        producto_id: parseInt(id),
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        tipo_movimiento,
        cantidad
      }
    });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({ success: false, message: 'Error al ajustar el stock' });
  }
};

const search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;

    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const isVendedor = req.user.rol === 'VENDEDOR';
    const selectFields = isVendedor
      ? 'p.id, p.codigo_sku_interno, p.nombre, p.imagen_url, p.unidad_medida, p.permite_decimales, p.stock_actual, p.precio_venta'
      : 'p.id, p.codigo_sku_interno, p.nombre, p.imagen_url, p.unidad_medida, p.permite_decimales, p.stock_actual, p.stock_minimo, p.precio_costo, p.precio_venta, p.margen_ganancia';

    const searchParam = `%${q}%`;
    const productos = await db.prepare(`
      SELECT ${selectFields}, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
        AND (LOWER(p.nombre) LIKE LOWER(?) OR LOWER(p.codigo_sku_interno) LIKE LOWER(?))
      ORDER BY
        CASE
          WHEN LOWER(p.codigo_sku_interno) = LOWER(?) THEN 1
          WHEN LOWER(p.codigo_sku_interno) LIKE LOWER(?) THEN 2
          WHEN LOWER(p.nombre) LIKE LOWER(?) THEN 3
          ELSE 4
        END
      LIMIT ?
    `).all(searchParam, searchParam, q, `${q}%`, `${q}%`, limit);

    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ success: false, message: 'Error en la búsqueda' });
  }
};

const getFrecuentes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    const isVendedor = req.user.rol === 'VENDEDOR';
    const selectFields = isVendedor
      ? 'p.id, p.codigo_sku_interno, p.nombre, p.imagen_url, p.unidad_medida, p.permite_decimales, p.stock_actual, p.precio_venta'
      : 'p.id, p.codigo_sku_interno, p.nombre, p.imagen_url, p.unidad_medida, p.permite_decimales, p.stock_actual, p.stock_minimo, p.precio_costo, p.precio_venta, p.margen_ganancia';

    // Get most sold products
    const productos = await db.prepare(`
      SELECT ${selectFields}, c.nombre as categoria_nombre, COALESCE(SUM(dv.cantidad), 0) as total_vendido
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
      LEFT JOIN ventas v ON dv.venta_id = v.id AND v.estado = 'COMPLETADA'
      WHERE p.activo = 1 AND p.stock_actual > 0
      GROUP BY p.id
      ORDER BY total_vendido DESC, p.nombre ASC
      LIMIT ?
    `).all(limit);

    res.json({ success: true, data: productos });
  } catch (error) {
    console.error('Error al obtener productos frecuentes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos frecuentes' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Soft delete: set activo = 0
    await db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').run(id);

    // Auditoría
    await db.prepare(
      'INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, 'ELIMINAR_PRODUCTO', 'INVENTARIO', 'productos', id, JSON.stringify(existing));

    res.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
  }
};

module.exports = { getAll, search, getFrecuentes, getById, create, update, adjustStock, deleteProducto };


module.exports = { getAll, getById, create, update, adjustStock, search, getFrecuentes };