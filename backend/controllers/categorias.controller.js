import db from '../config/database.js';

export const getAll = async (req, res) => {
  try {
    const categorias = await db.prepare('SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre ASC').all();
    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías' });
  }
};

export const create = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre de la categoría es requerido' });
    }

    const result = await db.prepare(`
      INSERT INTO categorias (nombre, descripcion)
      VALUES (?, ?)
    `).run(nombre, descripcion || null);

    const categoria = await db.prepare('SELECT * FROM categorias WHERE id = ?').get(result.lastID);

    res.status(201).json({ success: true, data: categoria, message: 'Categoría creada exitosamente' });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ success: false, message: 'Error al crear la categoría' });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const existing = await db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }

    await db.prepare(`
      UPDATE categorias SET
        nombre = COALESCE(?, nombre),
        descripcion = ?,
        activo = COALESCE(?, activo)
      WHERE id = ?
    `).run(
      nombre,
      descripcion !== undefined ? descripcion : existing.descripcion,
      activo !== undefined ? (activo ? 1 : 0) : null,
      id
    );

    const categoria = await db.prepare('SELECT * FROM categorias WHERE id = ?').get(id);

    res.json({ success: true, data: categoria, message: 'Categoría actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la categoría' });
  }
};
