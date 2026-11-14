import { verifyToken } from '../config/auth.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado, inicie sesión nuevamente' });
    }
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'No tiene permisos para esta acción' });
    }
    next();
  };
};

export const isAdmin = requireRole('ADMIN', 'ROOT');
export const isRoot = requireRole('ROOT');
