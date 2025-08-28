import {
  getDelitoTipos,
  getDelitoTipoById,
  createDelitoTipo,
  updateDelitoTipo,
  deleteDelitoTipo,
} from './delitoTipos.model.js';

// Listar tipos de delito
export async function listDelitoTipos(req, res) {
  try {
    const { activos } = req.query;
    const rows = await getDelitoTipos(activos);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Obtener un tipo de delito por ID
export async function showDelitoTipo(req, res) {
  try {
    const id = req.params.id;
    const rows = await getDelitoTipoById(id);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Crear un nuevo tipo de delito
export async function createDelitoTipoCtrl(req, res) {
  try {
    const { codigo, nombre, descripcion, activo } = req.body;
    if (!codigo || !nombre) {
      return res.status(400).json({ error: 'codigo y nombre son requeridos' });
    }
    const insertId = await createDelitoTipo({ codigo, nombre, descripcion, activo });
    const rows = await getDelitoTipoById(insertId);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Actualizar un tipo de delito existente
export async function updateDelitoTipoCtrl(req, res) {
  try {
    const id = req.params.id;
    const { codigo, nombre, descripcion, activo } = req.body;
    const ok = await updateDelitoTipo(id, { codigo, nombre, descripcion, activo });
    if (!ok) return res.status(404).json({ error: 'Not found' });
    const rows = await getDelitoTipoById(id);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Eliminar (inactivar) un tipo de delito
export async function deleteDelitoTipoCtrl(req, res) {
  try {
    const id = req.params.id;
    const ok = await deleteDelitoTipo(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
