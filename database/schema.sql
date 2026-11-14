-- =====================================================
-- SISTEMA POS FERRETERÍA - SCHEMA COMPLETO
-- Base de datos SQLite optimizada para alto rendimiento
-- =====================================================

-- TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('VENDEDOR', 'ADMIN', 'ROOT')),
    activo INTEGER DEFAULT 1,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- TABLA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_razon_social TEXT NOT NULL,
    nit_ci TEXT,
    telefono TEXT,
    direccion TEXT,
    tipo_cliente TEXT DEFAULT 'NORMAL' CHECK(tipo_cliente IN ('NORMAL', 'FRECUENTE', 'MAYORISTA', 'OBRA')),
    limite_credito REAL DEFAULT 0,
    saldo_credito REAL DEFAULT 0,
    activo INTEGER DEFAULT 1,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clientes_nit_ci ON clientes(nit_ci);
CREATE INDEX idx_clientes_nombre ON clientes(nombre_razon_social);
CREATE INDEX idx_clientes_tipo ON clientes(tipo_cliente);

-- TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    activo INTEGER DEFAULT 1,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorias_nombre ON categorias(nombre);

-- TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_sku_interno TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    categoria_id INTEGER,
    unidad_medida TEXT NOT NULL DEFAULT 'Pieza' CHECK(unidad_medida IN ('Pieza', 'Kg', 'Metro', 'Caja', 'Litro', 'Paquete')),
    permite_decimales INTEGER DEFAULT 0,
    stock_actual REAL DEFAULT 0,
    stock_minimo REAL DEFAULT 0,
    precio_costo REAL NOT NULL DEFAULT 0,
    precio_venta REAL NOT NULL DEFAULT 0,
    margen_ganancia REAL GENERATED ALWAYS AS (
        CASE
            WHEN precio_costo > 0 THEN ((precio_venta - precio_costo) / precio_costo * 100)
            ELSE 0
        END
    ) VIRTUAL,
    activo INTEGER DEFAULT 1,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE INDEX idx_productos_codigo ON productos(codigo_sku_interno);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_stock_bajo ON productos(stock_actual, stock_minimo) WHERE stock_actual <= stock_minimo;

-- TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_venta TEXT UNIQUE NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    cliente_id INTEGER,
    usuario_id INTEGER NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    descuento REAL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    total_costo REAL NOT NULL DEFAULT 0,
    ganancia_neta REAL GENERATED ALWAYS AS (total - total_costo) VIRTUAL,
    metodo_pago TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK(metodo_pago IN ('EFECTIVO', 'QR', 'CREDITO', 'MIXTO')),
    monto_efectivo REAL DEFAULT 0,
    monto_qr REAL DEFAULT 0,
    monto_credito REAL DEFAULT 0,
    estado TEXT DEFAULT 'COMPLETADA' CHECK(estado IN ('COMPLETADA', 'ANULADA', 'PENDIENTE')),
    notas TEXT,
    anulada_por INTEGER,
    anulada_en DATETIME,
    motivo_anulacion TEXT,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (anulada_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_numero ON ventas(numero_venta);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_metodo_pago ON ventas(metodo_pago);

-- TABLA DE DETALLE DE VENTAS
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    codigo_producto TEXT NOT NULL,
    nombre_producto TEXT NOT NULL,
    cantidad REAL NOT NULL,
    precio_unitario REAL NOT NULL,
    costo_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    descuento REAL DEFAULT 0,
    total REAL NOT NULL,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(producto_id);

-- TABLA DE KARDEX (Movimientos de Inventario)
CREATE TABLE IF NOT EXISTS kardex (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    producto_id INTEGER NOT NULL,
    tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('VENTA', 'COMPRA', 'AJUSTE_ENTRADA', 'AJUSTE_SALIDA', 'MERMA', 'DEVOLUCION')),
    cantidad REAL NOT NULL,
    stock_anterior REAL NOT NULL,
    stock_nuevo REAL NOT NULL,
    costo_unitario REAL DEFAULT 0,
    valor_total REAL GENERATED ALWAYS AS (cantidad * costo_unitario) VIRTUAL,
    referencia_id INTEGER,
    referencia_tipo TEXT,
    usuario_id INTEGER NOT NULL,
    notas TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_kardex_producto ON kardex(producto_id);
CREATE INDEX idx_kardex_fecha ON kardex(fecha);
CREATE INDEX idx_kardex_tipo ON kardex(tipo_movimiento);
CREATE INDEX idx_kardex_referencia ON kardex(referencia_id, referencia_tipo);

-- TABLA DE PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    razon_social TEXT,
    nit TEXT,
    telefono TEXT,
    email TEXT,
    direccion TEXT,
    contacto_nombre TEXT,
    activo INTEGER DEFAULT 1,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proveedores_nombre ON proveedores(nombre);

-- TABLA DE COMPRAS A PROVEEDORES
CREATE TABLE IF NOT EXISTS compras_proveedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_compra TEXT UNIQUE NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    proveedor_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    total_compra REAL NOT NULL DEFAULT 0,
    estado TEXT DEFAULT 'COMPLETADA' CHECK(estado IN ('COMPLETADA', 'ANULADA', 'PENDIENTE')),
    notas TEXT,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_compras_fecha ON compras_proveedores(fecha);
CREATE INDEX idx_compras_proveedor ON compras_proveedores(proveedor_id);
CREATE INDEX idx_compras_usuario ON compras_proveedores(usuario_id);

-- TABLA DE DETALLE DE COMPRAS
CREATE TABLE IF NOT EXISTS detalle_compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad REAL NOT NULL,
    precio_costo REAL NOT NULL,
    subtotal REAL NOT NULL,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES compras_proveedores(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE INDEX idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(producto_id);

-- TABLA DE CORTES DE CAJA
CREATE TABLE IF NOT EXISTS cortes_caja (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    fecha_apertura DATETIME NOT NULL,
    fecha_cierre DATETIME,
    monto_inicial REAL DEFAULT 0,
    total_efectivo REAL DEFAULT 0,
    total_tarjeta REAL DEFAULT 0,
    total_qr REAL DEFAULT 0,
    total_ventas REAL DEFAULT 0,
    total_costos REAL DEFAULT 0,
    ganancia_neta REAL DEFAULT 0,
    monto_esperado REAL DEFAULT 0,
    monto_real REAL DEFAULT 0,
    diferencia REAL DEFAULT 0,
    notas TEXT,
    estado TEXT DEFAULT 'ABIERTO' CHECK(estado IN ('ABIERTO', 'CERRADO')),
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_cortes_fecha ON cortes_caja(fecha_apertura, fecha_cierre);
CREATE INDEX idx_cortes_usuario ON cortes_caja(usuario_id);
CREATE INDEX idx_cortes_estado ON cortes_caja(estado);

-- TABLA DE AUDITORÍA
CREATE TABLE IF NOT EXISTS auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    accion TEXT NOT NULL,
    modulo TEXT NOT NULL,
    tabla_afectada TEXT,
    registro_id INTEGER,
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip_address TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);
CREATE INDEX idx_auditoria_modulo ON auditoria(modulo);

-- TABLA DE CRÉDITOS / FIADOS
CREATE TABLE IF NOT EXISTS creditos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id INTEGER NOT NULL,
    cliente_id INTEGER NOT NULL,
    monto_total REAL NOT NULL,
    saldo_pendiente REAL NOT NULL,
    estado TEXT DEFAULT 'PENDIENTE' CHECK(estado IN ('PENDIENTE', 'PAGADO', 'VENCIDO', 'CANCELADO')),
    fecha_credito DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME,
    notas TEXT,
    creado_por INTEGER NOT NULL,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (creado_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_creditos_venta ON creditos(venta_id);
CREATE INDEX idx_creditos_cliente ON creditos(cliente_id);
CREATE INDEX idx_creditos_estado ON creditos(estado);
CREATE INDEX idx_creditos_fecha ON creditos(fecha_credito);

-- TABLA DE PAGOS DE CRÉDITOS
CREATE TABLE IF NOT EXISTS pagos_creditos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    credito_id INTEGER NOT NULL,
    monto_pagado REAL NOT NULL,
    metodo_pago TEXT NOT NULL DEFAULT 'EFECTIVO' CHECK(metodo_pago IN ('EFECTIVO', 'QR', 'MIXTO')),
    monto_efectivo REAL DEFAULT 0,
    monto_qr REAL DEFAULT 0,
    saldo_anterior REAL NOT NULL,
    saldo_nuevo REAL NOT NULL,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    recibido_por INTEGER NOT NULL,
    notas TEXT,
    creado_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (credito_id) REFERENCES creditos(id) ON DELETE CASCADE,
    FOREIGN KEY (recibido_por) REFERENCES usuarios(id)
);

CREATE INDEX idx_pagos_creditos_credito ON pagos_creditos(credito_id);
CREATE INDEX idx_pagos_creditos_fecha ON pagos_creditos(fecha_pago);

-- =====================================================
-- TRIGGERS PARA MANTENER INTEGRIDAD
-- =====================================================

-- Trigger para actualizar stock en productos después de venta
CREATE TRIGGER IF NOT EXISTS trg_after_venta_detalle_insert
AFTER INSERT ON detalle_ventas
FOR EACH ROW
WHEN (SELECT estado FROM ventas WHERE id = NEW.venta_id) = 'COMPLETADA'
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual - NEW.cantidad,
        actualizado_at = CURRENT_TIMESTAMP
    WHERE id = NEW.producto_id;

    INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_id, referencia_tipo, usuario_id, fecha)
    SELECT
        NEW.producto_id,
        'VENTA',
        NEW.cantidad,
        p.stock_actual + NEW.cantidad,
        p.stock_actual,
        NEW.costo_unitario,
        NEW.venta_id,
        'VENTA',
        v.usuario_id,
        CURRENT_TIMESTAMP
    FROM productos p, ventas v
    WHERE p.id = NEW.producto_id AND v.id = NEW.venta_id;
END;

-- Trigger para actualizar stock en productos después de compra
CREATE TRIGGER IF NOT EXISTS trg_after_compra_detalle_insert
AFTER INSERT ON detalle_compras
FOR EACH ROW
WHEN (SELECT estado FROM compras_proveedores WHERE id = NEW.compra_id) = 'COMPLETADA'
BEGIN
    UPDATE productos
    SET stock_actual = stock_actual + NEW.cantidad,
        precio_costo = NEW.precio_costo,
        actualizado_at = CURRENT_TIMESTAMP
    WHERE id = NEW.producto_id;

    INSERT INTO kardex (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, costo_unitario, referencia_id, referencia_tipo, usuario_id, fecha)
    SELECT
        NEW.producto_id,
        'COMPRA',
        NEW.cantidad,
        p.stock_actual - NEW.cantidad,
        p.stock_actual,
        NEW.precio_costo,
        NEW.compra_id,
        'COMPRA',
        c.usuario_id,
        CURRENT_TIMESTAMP
    FROM productos p, compras_proveedores c
    WHERE p.id = NEW.producto_id AND c.id = NEW.compra_id;
END;

-- Trigger para actualizar timestamp
CREATE TRIGGER IF NOT EXISTS trg_usuarios_updated
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    UPDATE usuarios SET actualizado_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_productos_updated
AFTER UPDATE ON productos
FOR EACH ROW
BEGIN
    UPDATE productos SET actualizado_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_clientes_updated
AFTER UPDATE ON clientes
FOR EACH ROW
BEGIN
    UPDATE clientes SET actualizado_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger para actualizar el estado de crédito después de un pago
CREATE TRIGGER IF NOT EXISTS trg_after_pago_credito_insert
AFTER INSERT ON pagos_creditos
FOR EACH ROW
BEGIN
    UPDATE creditos
    SET saldo_pendiente = NEW.saldo_nuevo,
        estado = CASE
            WHEN NEW.saldo_nuevo <= 0 THEN 'PAGADO'
            ELSE estado
        END,
        actualizado_at = CURRENT_TIMESTAMP
    WHERE id = NEW.credito_id;

    -- Actualizar saldo de crédito del cliente
    UPDATE clientes
    SET saldo_credito = saldo_credito - NEW.monto_pagado,
        actualizado_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT cliente_id FROM creditos WHERE id = NEW.credito_id);
END;

-- Trigger para crear registro de crédito cuando una venta es a crédito
CREATE TRIGGER IF NOT EXISTS trg_after_venta_credito_insert
AFTER INSERT ON ventas
FOR EACH ROW
WHEN NEW.metodo_pago = 'CREDITO' OR NEW.monto_credito > 0
BEGIN
    INSERT INTO creditos (venta_id, cliente_id, monto_total, saldo_pendiente, creado_por)
    VALUES (NEW.id, NEW.cliente_id, COALESCE(NEW.monto_credito, NEW.total), COALESCE(NEW.monto_credito, NEW.total), NEW.usuario_id);

    -- Actualizar saldo de crédito del cliente
    UPDATE clientes
    SET saldo_credito = saldo_credito + COALESCE(NEW.monto_credito, NEW.total),
        actualizado_at = CURRENT_TIMESTAMP
    WHERE id = NEW.cliente_id;
END;

-- Trigger para actualizar timestamp de créditos
CREATE TRIGGER IF NOT EXISTS trg_creditos_updated
AFTER UPDATE ON creditos
FOR EACH ROW
BEGIN
    UPDATE creditos SET actualizado_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías básicas
INSERT OR IGNORE INTO categorias (nombre, descripcion) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
('Herramientas Eléctricas', 'Taladros, amoladoras, sierras eléctricas'),
('Materiales de Construcción', 'Cemento, arena, ladrillos, bloques'),
('Electricidad', 'Cables, interruptores, enchufes, focos'),
('Plomería', 'Tuberías, codos, llaves de paso, grifos'),
('Pinturas y Accesorios', 'Pinturas, brochas, rodillos, solventes'),
('Ferretería General', 'Clavos, tornillos, pernos, tuercas'),
('Seguridad', 'Candados, cerraduras, cadenas'),
('Jardín', 'Mangueras, regaderas, palas'),
('Otros', 'Productos varios');

-- Insertar cliente genérico
INSERT OR IGNORE INTO clientes (id, nombre_razon_social, nit_ci, tipo_cliente)
VALUES (1, 'Cliente General', '0', 'NORMAL');

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de productos con stock bajo
CREATE VIEW IF NOT EXISTS v_productos_stock_bajo AS
SELECT
    p.id,
    p.codigo_sku_interno,
    p.nombre,
    c.nombre as categoria,
    p.stock_actual,
    p.stock_minimo,
    p.unidad_medida,
    p.precio_costo,
    p.precio_venta
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = 1
  AND p.stock_actual <= p.stock_minimo
ORDER BY p.stock_actual ASC;

-- Vista de ventas diarias
CREATE VIEW IF NOT EXISTS v_ventas_diarias AS
SELECT
    DATE(fecha) as fecha,
    COUNT(*) as cantidad_ventas,
    SUM(total) as total_ventas,
    SUM(total_costo) as total_costos,
    SUM(total - total_costo) as ganancia_neta,
    AVG(total) as ticket_promedio
FROM ventas
WHERE estado = 'COMPLETADA'
GROUP BY DATE(fecha)
ORDER BY fecha DESC;

-- Vista de productos más vendidos
CREATE VIEW IF NOT EXISTS v_productos_mas_vendidos AS
SELECT
    p.id,
    p.codigo_sku_interno,
    p.nombre,
    c.nombre as categoria,
    COUNT(dv.id) as cantidad_ventas,
    SUM(dv.cantidad) as unidades_vendidas,
    SUM(dv.total) as total_vendido
FROM productos p
JOIN detalle_ventas dv ON p.id = dv.producto_id
JOIN ventas v ON dv.venta_id = v.id
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE v.estado = 'COMPLETADA'
GROUP BY p.id, p.codigo_sku_interno, p.nombre, c.nombre
ORDER BY unidades_vendidas DESC;

-- Vista de historial de cliente
CREATE VIEW IF NOT EXISTS v_historial_clientes AS
SELECT
    c.id as cliente_id,
    c.nombre_razon_social,
    c.nit_ci,
    COUNT(v.id) as total_compras,
    SUM(v.total) as monto_total_comprado,
    AVG(v.total) as ticket_promedio,
    MAX(v.fecha) as ultima_compra
FROM clientes c
LEFT JOIN ventas v ON c.id = v.cliente_id AND v.estado = 'COMPLETADA'
GROUP BY c.id, c.nombre_razon_social, c.nit_ci
ORDER BY monto_total_comprado DESC;

-- Vista de créditos pendientes
CREATE VIEW IF NOT EXISTS v_creditos_pendientes AS
SELECT
    cr.id,
    cr.venta_id,
    v.numero_venta,
    cr.cliente_id,
    c.nombre_razon_social as cliente_nombre,
    c.nit_ci as cliente_nit,
    c.telefono as cliente_telefono,
    cr.monto_total,
    cr.saldo_pendiente,
    (cr.monto_total - cr.saldo_pendiente) as monto_pagado,
    cr.estado,
    cr.fecha_credito,
    cr.fecha_vencimiento,
    u.nombre as creado_por_nombre,
    julianday('now') - julianday(cr.fecha_credito) as dias_transcurridos,
    CASE
        WHEN cr.fecha_vencimiento IS NOT NULL AND julianday(cr.fecha_vencimiento) < julianday('now') THEN 1
        ELSE 0
    END as esta_vencido
FROM creditos cr
INNER JOIN clientes c ON cr.cliente_id = c.id
INNER JOIN ventas v ON cr.venta_id = v.id
INNER JOIN usuarios u ON cr.creado_por = u.id
WHERE cr.estado IN ('PENDIENTE', 'VENCIDO')
ORDER BY cr.fecha_credito DESC;

-- Vista de historial de transacciones completo
CREATE VIEW IF NOT EXISTS v_historial_transacciones AS
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
UNION ALL
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
ORDER BY fecha DESC;

-- Vista de productos con stock bajo o agotado
CREATE VIEW IF NOT EXISTS v_alertas_inventario AS
SELECT
    p.id,
    p.codigo_sku_interno,
    p.nombre,
    c.nombre as categoria,
    p.stock_actual,
    p.stock_minimo,
    p.unidad_medida,
    p.precio_venta,
    CASE
        WHEN p.stock_actual <= 0 THEN 'AGOTADO'
        WHEN p.stock_actual <= p.stock_minimo THEN 'STOCK_BAJO'
        ELSE 'OK'
    END as nivel_alerta
FROM productos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = 1
  AND p.stock_actual <= p.stock_minimo
ORDER BY p.stock_actual ASC;
