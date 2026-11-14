/**
 * Controlador de Auditoría
 * Gestiona y muestra los registros de auditoría del sistema
 * Solo ROOT y ADMIN pueden acceder
 */

const db = require('../config/database.js');
const path = require('path');
const fs = require('fs');

// json2csv es opcional, pero recomendado para exportar a CSV
let Parser;
try {
  Parser = require('json2csv').Parser;
} catch (e) {
  Parser = null;
}

// =====================================================
// OBTENER REGISTROS DE AUDITORÍA
// =====================================================

const getRegistrosAuditoria = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const modulo = req.query.modulo || null;
    const usuarioId = req.query.usuario_id || null;
    const accion = req.query.accion || null;
    const fechaInicio = req.query.fecha_inicio || null;
    const fechaFin = req.query.fecha_fin || null;
    const ordenar = req.query.ordenar || 'DESC'; // ASC o DESC

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

    if (accion) {
      whereConditions.push('a.accion = ?');
      params.push(accion);
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
        u.username,
        u.rol as usuario_rol
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      ${whereClause}
      ORDER BY a.fecha ${ordenar}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    // Parsear datos JSON si existen
    const registrosFormateados = registros.map(reg => ({
      ...reg,
      datos_anteriores: reg.datos_anteriores ? JSON.parse(reg.datos_anteriores) : null,
      datos_nuevos: reg.datos_nuevos ? JSON.parse(reg.datos_nuevos) : null
    }));

    res.json({
      success: true,
      data: {
        items: registrosFormateados,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener registros de auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al obtener registros de auditoría' });
  }
};

// =====================================================
// OBTENER AUDITORÍA DE UN USUARIO
// =====================================================

const getAuditoriaUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verificar que el usuario existe
    const usuario = await db.prepare('SELECT id, nombre, username, rol FROM usuarios WHERE id = ?').get(usuarioId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const countResult = await db.prepare(
      'SELECT COUNT(*) as total FROM auditoria WHERE usuario_id = ?'
    ).get(usuarioId);

    const registros = await db.prepare(`
      SELECT * FROM auditoria
      WHERE usuario_id = ?
      ORDER BY fecha DESC
      LIMIT ? OFFSET ?
    `).all(usuarioId, limit, offset);

    const resumen = await db.prepare(`
      SELECT
        COUNT(*) as total_acciones,
        COUNT(DISTINCT modulo) as modulos_afectados,
        COUNT(DISTINCT accion) as tipos_acciones,
        MAX(fecha) as ultima_accion,
        MIN(fecha) as primera_accion
      FROM auditoria
      WHERE usuario_id = ?
    `).get(usuarioId);

    res.json({
      success: true,
      data: {
        usuario,
        registros,
        resumen,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener auditoría del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener auditoría del usuario' });
  }
};

// =====================================================
// OBTENER AUDITORÍA POR MÓDULO
// =====================================================

const getAuditoriaModulo = async (req, res) => {
  try {
    const { modulo } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countResult = await db.prepare(
      'SELECT COUNT(*) as total FROM auditoria WHERE modulo = ?'
    ).get(modulo);

    const registros = await db.prepare(`
      SELECT
        a.*,
        u.nombre as usuario_nombre,
        u.username
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.modulo = ?
      ORDER BY a.fecha DESC
      LIMIT ? OFFSET ?
    `).all(modulo, limit, offset);

    const estadisticas = await db.prepare(`
      SELECT
        accion,
        COUNT(*) as total,
        COUNT(DISTINCT usuario_id) as usuarios_distintos,
        MAX(fecha) as ultima_vez
      FROM auditoria
      WHERE modulo = ?
      GROUP BY accion
      ORDER BY total DESC
    `).all(modulo);

    res.json({
      success: true,
      data: {
        modulo,
        registros,
        estadisticas,
        pagination: {
          total: countResult.total,
          page,
          limit,
          totalPages: Math.ceil(countResult.total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener auditoría del módulo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener auditoría del módulo' });
  }
};

// =====================================================
// OBTENER AUDITORÍA DE UN REGISTRO ESPECÍFICO
// =====================================================

const getAuditoriaRegistro = async (req, res) => {
  try {
    const { registroId } = req.params;
    const tablaAfectada = req.query.tabla || null;

    let whereConditions = ['registro_id = ?'];
    let params = [registroId];

    if (tablaAfectada) {
      whereConditions.push('tabla_afectada = ?');
      params.push(tablaAfectada);
    }

    const whereClause = whereConditions.join(' AND ');

    const registros = await db.prepare(`
      SELECT
        a.*,
        u.nombre as usuario_nombre,
        u.username
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY a.fecha DESC
    `).all(...params);

    if (registros.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay registros de auditoría para este elemento' });
    }

    // Parsear datos JSON
    const registrosFormateados = registros.map(reg => ({
      ...reg,
      datos_anteriores: reg.datos_anteriores ? JSON.parse(reg.datos_anteriores) : null,
      datos_nuevos: reg.datos_nuevos ? JSON.parse(reg.datos_nuevos) : null
    }));

    res.json({
      success: true,
      data: {
        total: registros.length,
        registros: registrosFormateados,
        resumen: {
          tabla: registros[0].tabla_afectada,
          registro_id: registroId,
          primera_modificacion: registros[registros.length - 1].fecha,
          ultima_modificacion: registros[0].fecha,
          usuarios_involucrados: [...new Set(registros.map(r => r.usuario_nombre))]
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener auditoría del registro:', error);
    res.status(500).json({ success: false, message: 'Error al obtener auditoría del registro' });
  }
};

// =====================================================
// RESUMEN DE AUDITORÍA DEL SISTEMA
// =====================================================

const getResumenAuditoria = async (req, res) => {
  try {
    const diasAtras = parseInt(req.query.dias) || 7;
    const fechaLimite = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Total de acciones
    const totalAcciones = await db.prepare(
      'SELECT COUNT(*) as total FROM auditoria WHERE DATE(fecha) >= ?'
    ).get(fechaLimite);

    // Acciones por tipo
    const accionesPorTipo = await db.prepare(`
      SELECT
        accion,
        COUNT(*) as total
      FROM auditoria
      WHERE DATE(fecha) >= ?
      GROUP BY accion
      ORDER BY total DESC
    `).all(fechaLimite);

    // Módulos más activos
    const modulosMasActivos = await db.prepare(`
      SELECT
        modulo,
        COUNT(*) as total,
        COUNT(DISTINCT usuario_id) as usuarios
      FROM auditoria
      WHERE DATE(fecha) >= ?
      GROUP BY modulo
      ORDER BY total DESC
    `).all(fechaLimite);

    // Usuarios más activos
    const usuariosMasActivos = await db.prepare(`
      SELECT
        a.usuario_id,
        u.nombre,
        u.username,
        u.rol,
        COUNT(*) as total_acciones,
        COUNT(DISTINCT a.modulo) as modulos_usados
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE DATE(a.fecha) >= ?
      GROUP BY a.usuario_id
      ORDER BY total_acciones DESC
      LIMIT 10
    `).all(fechaLimite);

    // Cambios de datos (CREATE, UPDATE, DELETE)
    const cambiosDatos = await db.prepare(`
      SELECT
        accion,
        COUNT(*) as total,
        COUNT(DISTINCT tabla_afectada) as tablas_modificadas
      FROM auditoria
      WHERE DATE(fecha) >= ? AND accion IN ('CREAR', 'ACTUALIZAR', 'ELIMINAR')
      GROUP BY accion
    `).all(fechaLimite);

    res.json({
      success: true,
      data: {
        periodo: {
          dias: diasAtras,
          desde: fechaLimite
        },
        resumen: {
          total_acciones: totalAcciones.total,
          acciones_por_tipo: accionesPorTipo,
          modulos_mas_activos: modulosMasActivos,
          usuarios_mas_activos: usuariosMasActivos,
          cambios_datos: cambiosDatos
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener resumen de auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al obtener resumen de auditoría' });
  }
};

// =====================================================
// EXPORTAR AUDITORÍA A CSV (Solo ROOT)
// =====================================================

const exportAuditoriaCsv = async (req, res) => {
  try {
    const modulo = req.query.modulo || null;
    const diasAtras = parseInt(req.query.dias) || 30;
    const fechaLimite = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let whereConditions = ['DATE(a.fecha) >= ?'];
    let params = [fechaLimite];

    if (modulo) {
      whereConditions.push('a.modulo = ?');
      params.push(modulo);
    }

    const whereClause = whereConditions.join(' AND ');

    const registros = await db.prepare(`
      SELECT
        a.id,
        a.accion,
        a.modulo,
        a.tabla_afectada,
        a.registro_id,
        a.fecha,
        a.ip_address,
        u.nombre as usuario_nombre,
        u.username,
        u.rol as usuario_rol
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY a.fecha DESC
    `).all(...params);

    if (registros.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay registros para exportar' });
    }

    try {
      const csv = new Parser({
        fields: ['id', 'accion', 'modulo', 'tabla_afectada', 'registro_id', 'usuario_nombre', 'usuario_rol', 'fecha', 'ip_address']
      }).parse(registros);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="auditoria-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (parseError) {
      // Si json2csv no está instalado, devolver JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="auditoria-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(registros);
    }
  } catch (error) {
    console.error('Error al exportar auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al exportar auditoría' });
  }
};

// =====================================================
// LIMPIAR AUDITORÍA ANTIGUA (Solo ROOT - MUY PELIGROSO)
// =====================================================

const limpiarAuditoriaAntigua = async (req, res) => {
  try {
    // Verificar que es ROOT
    if (req.user.rol !== 'ROOT') {
      return res.status(403).json({ success: false, message: 'Solo ROOT puede ejecutar esta acción' });
    }

    // Requiere confirmación
    const diasRetener = parseInt(req.body.diasRetener) || 90;
    const confirmar = req.body.confirmar === true;

    if (!confirmar) {
      return res.status(400).json({
        success: false,
        message: 'Debe confirmar la eliminación',
        warning: `Se eliminarán registros de auditoría más antiguos de ${diasRetener} días. Esta acción es irreversible.`
      });
    }

    const fechaLimite = new Date(Date.now() - diasRetener * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const countBefore = await db.prepare('SELECT COUNT(*) as total FROM auditoria').get();

    const resultado = await db.prepare('DELETE FROM auditoria WHERE DATE(fecha) < ?').run(fechaLimite);

    const countAfter = await db.prepare('SELECT COUNT(*) as total FROM auditoria').get();

    // Registrar esta acción crítica
    await db.prepare(`
      INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, datos_nuevos, ip_address)
      VALUES (?, 'LIMPIAR', 'AUDITORIA', 'auditoria', ?, ?)
    `).run(
      req.user.id,
      JSON.stringify({ registros_eliminados: countBefore.total - countAfter.total, dias_retenidos: diasRetener }),
      req.ip
    );

    res.json({
      success: true,
      message: 'Registros de auditoría antiguos eliminados',
      data: {
        registros_antes: countBefore.total,
        registros_despues: countAfter.total,
        registros_eliminados: countBefore.total - countAfter.total,
        fecha_limite: fechaLimite
      }
    });
  } catch (error) {
    console.error('Error al limpiar auditoría:', error);
    res.status(500).json({ success: false, message: 'Error al limpiar auditoría' });
  }
};

module.exports = {
  getRegistrosAuditoria,
  getAuditoriaUsuario,
  getAuditoriaModulo,
  getAuditoriaRegistro,
  getResumenAuditoria,
  exportAuditoriaCsv,
  limpiarAuditoriaAntigua
};
