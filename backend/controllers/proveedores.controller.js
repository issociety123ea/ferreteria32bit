const db = require('../config/database.js');

const getAll = async (req, res) => {
  try {
    const proveedores = await db.prepare('SELECT * FROM proveedores WHERE activo = 1 ORDER BY nombre ASC').all();
    res.json({ success: true, data: proveedores });
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ success: false, message: 'Error al obtener proveedores' });
  }
};

const getById = async (req, res) => {
  try {
    const proveedor = await db.prepare('SELECT * FROM proveedores WHERE id = ?').get(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }
    res.json({ success: true, data: proveedor });
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el proveedor' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, razon_social, nit, telefono, email, direccion, contacto_nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre del proveedor es requerido' });
    }

    const result = await db.prepare(`
      INSERT INTO proveedores (nombre, razon_social, nit, telefono, email, direccion, contacto_nombre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(nombre, razon_social || null, nit || null, telefono || null, email || null, direccion || null, contacto_nombre || null);

    const proveedor = await db.prepare('SELECT * FROM proveedores WHERE id = ?').get(result.lastID);

    res.status(201).json({ success: true, data: proveedor, message: 'Proveedor creado exitosamente' });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ success: false, message: 'Error al crear el proveedor' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, razon_social, nit, telefono, email, direccion, contacto_nombre, activo } = req.body;

    const existing = await db.prepare('SELECT * FROM proveedores WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }

    await db.prepare(`
      UPDATE proveedores SET
        nombre = COALESCE(?, nombre),
        razon_social = ?,
        nit = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        contacto_nombre = ?,
        activo = COALESCE(?, activo)
      WHERE id = ?
    `).run(
      nombre,
      razon_social !== undefined ? razon_social : existing.razon_social,
      nit !== undefined ? nit : existing.nit,
      telefono !== undefined ? telefono : existing.telefono,
      email !== undefined ? email : existing.email,
      direccion !== undefined ? direccion : existing.direccion,
      contacto_nombre !== undefined ? contacto_nombre : existing.contacto_nombre,
      activo !== undefined ? (activo ? 1 : 0) : null,
      id
    );

    const proveedor = await db.prepare('SELECT * FROM proveedores WHERE id = ?').get(id);

    res.json({ success: true, data: proveedor, message: 'Proveedor actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el proveedor' });
  }
};


module.exports = { getAll, getById, create, update };