import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      rol: user.rol,
      nombre: user.nombre
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export { JWT_SECRET };
