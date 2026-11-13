const bcrypt = require('bcryptjs');
const db = require('../config/database.js');
const { generateToken  } = require('../config/auth.js');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos' });
    }

    const user = await db.prepare('SELECT * FROM usuarios WHERE username = ? AND activo = 1').get(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    // Log de auditoría
    await db.prepare(
      'INSERT INTO auditoria (usuario_id, accion, modulo) VALUES (?, ?, ?)'
    ).run(user.id, 'LOGIN', 'AUTH');

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          username: user.username,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ success: false, message: 'Contraseña actual y nueva son requeridas' });
    }

    if (passwordNueva.length < 4) {
      return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 4 caracteres' });
    }

    const user = await db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.user.id);

    if (!bcrypt.compareSync(passwordActual, user.password_hash)) {
      return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
    }

    const hash = bcrypt.hashSync(passwordNueva, 10);
    await db.prepare('UPDATE usuarios SET password_hash = ? WHERE id = ?').run(hash, req.user.id);

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ success: false, message: 'Error al cambiar la contraseña' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await db.prepare('SELECT id, nombre, username, rol, activo, creado_at FROM usuarios WHERE id = ?').get(req.user.id);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el perfil' });
  }
};

module.exports = { login, cambiarPassword, getProfile };
