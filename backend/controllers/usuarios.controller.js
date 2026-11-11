import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export const getAll = (req, res) => {
  try {
    const usuarios = db.prepare('SELECT id, nombre, username, rol, activo, creado_at FROM usuarios ORDER BY nombre ASC').all();
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
};

export const create = (req, res) => {
  try {
    const { nombre, username, password, rol } = req.body;

    if (!nombre || !username || !password || !rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
    }

    if (!['VENDEDOR', 'ADMIN', 'ROOT'].includes(rol)) {
      return res.status(400).json({ success: false, message: 'Rol inválido' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' });
    }

    const existing = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese nombre de usuario' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
      INSERT INTO usuarios (nombre, username, password_hash, rol)
      VALUES (?, ?, ?, ?)
    `).run(nombre, username, passwordHash, rol);

    const usuario = db.prepare('SELECT id, nombre, username, rol, activo, creado_at FROM usuarios WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ success: true, data: usuario, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear el usuario' });
  }
};

export const update = (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, username, password, rol, activo } = req.body;

    const existing = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Cannot modify last ROOT user
    if (existing.rol === 'ROOT' && rol && rol !== 'ROOT') {
      const rootCount = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE rol = "ROOT" AND activo = 1').get();
      if (rootCount.count <= 1) {
        return res.status(400).json({ success: false, message: 'No se puede cambiar el rol del único administrador ROOT activo' });
      }
    }

    if (username && username !== existing.username) {
      const duplicate = db.prepare('SELECT id FROM usuarios WHERE username = ? AND id != ?').get(username, id);
      if (duplicate) {
        return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese nombre de usuario' });
      }
    }

    let updateFields = [];
    let updateParams = [];

    if (nombre) {
      updateFields.push('nombre = ?');
      updateParams.push(nombre);
    }
    if (username) {
      updateFields.push('username = ?');
      updateParams.push(username);
    }
    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres' });
      }
      updateFields.push('password_hash = ?');
      updateParams.push(bcrypt.hashSync(password, 10));
    }
    if (rol && ['VENDEDOR', 'ADMIN', 'ROOT'].includes(rol)) {
      updateFields.push('rol = ?');
      updateParams.push(rol);
    }
    if (activo !== undefined) {
      // Cannot deactivate last ROOT
      if (activo === false && existing.rol === 'ROOT') {
        const rootCount = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE rol = "ROOT" AND activo = 1').get();
        if (rootCount.count <= 1) {
          return res.status(400).json({ success: false, message: 'No se puede desactivar el único administrador ROOT activo' });
        }
      }
      updateFields.push('activo = ?');
      updateParams.push(activo ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
    }

    updateParams.push(id);

    db.prepare(`UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`).run(...updateParams);

    const usuario = db.prepare('SELECT id, nombre, username, rol, activo, creado_at FROM usuarios WHERE id = ?').get(id);

    res.json({ success: true, data: usuario, message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
  }
};

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Cannot delete last ROOT
    if (usuario.rol === 'ROOT') {
      const rootCount = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE rol = "ROOT" AND activo = 1').get();
      if (rootCount.count <= 1) {
        return res.status(400).json({ success: false, message: 'No se puede eliminar el único administrador ROOT activo' });
      }
    }

    // Cannot delete yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'No puede eliminar su propia cuenta' });
    }

    // Soft delete by deactivating
    db.prepare('UPDATE usuarios SET activo = 0 WHERE id = ?').run(id);

    res.json({ success: true, message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
  }
};
