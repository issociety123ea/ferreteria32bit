/**
 * Middleware de Auditoría
 * Registra todas las acciones de usuarios en la tabla auditoria
 * Solo ROOT y ADMIN pueden ver el historial de auditoría
 */

const db = require('../config/database.js');

/**
 * Middleware que registra acciones de auditoría
 * @param {string} modulo - Nombre del módulo (VENTAS, PRODUCTOS, USUARIOS, etc)
 * @param {string} accion - Acción realizada (CREAR, ACTUALIZAR, ELIMINAR, VER, etc)
 * @param {object} options - Opciones adicionales
 */
const auditAction = (modulo, accion, options = {}) => {
  return async (req, res, next) => {
    try {
      // Obtener información de la solicitud
      const usuarioId = (req.user && req.user.id) ? req.user.id : null;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const tablaAfectada = options.tabla || null;
      const registroId = options.registroId || null;
      const datosAnteriores = options.datosAnteriores ? JSON.stringify(options.datosAnteriores) : null;
      const datosNuevos = options.datosNuevos ? JSON.stringify(options.datosNuevos) : null;

      // Si hay usuario autenticado, registrar en auditoría
      if (usuarioId) {
        await db.prepare(`
          INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores, datos_nuevos, ip_address)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          usuarioId,
          accion,
          modulo,
          tablaAfectada,
          registroId,
          datosAnteriores,
          datosNuevos,
          ipAddress
        );

        console.log(`[AUDIT] ${modulo} - ${accion} - Usuario: ${usuarioId} - IP: ${ipAddress}`);
      }

      next();
    } catch (error) {
      console.error('Error en middleware de auditoría:', error);
      // No detener la solicitud si hay error en auditoría
      next();
    }
  };
};

/**
 * Registrar auditoría de forma manual (para acciones más complejas)
 */
const registrarAuditoria = async (usuarioId, accion, modulo, options = {}) => {
  try {
    const ipAddress = options.ipAddress || '127.0.0.1';
    const tablaAfectada = options.tabla || null;
    const registroId = options.registroId || null;
    const datosAnteriores = options.datosAnteriores ? JSON.stringify(options.datosAnteriores) : null;
    const datosNuevos = options.datosNuevos ? JSON.stringify(options.datosNuevos) : null;

    await db.prepare(`
      INSERT INTO auditoria (usuario_id, accion, modulo, tabla_afectada, registro_id, datos_anteriores, datos_nuevos, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuarioId,
      accion,
      modulo,
      tablaAfectada,
      registroId,
      datosAnteriores,
      datosNuevos,
      ipAddress
    );

    console.log(`[AUDIT] ${modulo} - ${accion} - Usuario: ${usuarioId}`);
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
};

module.exports = {
  auditAction,
  registrarAuditoria
};
