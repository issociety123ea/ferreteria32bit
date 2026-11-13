const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}:`, err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'JSON inválido en el cuerpo de la solicitud' });
  }

  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({ success: false, message: 'Registro duplicado o restricción de integridad violada' });
  }

  if (err.code === 'SQLITE_BUSY') {
    return res.status(503).json({ success: false, message: 'Base de datos ocupada, intente nuevamente' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = { errorHandler };
