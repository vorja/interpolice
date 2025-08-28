import {
  getAmonestaciones,
  insertAmonestacion,
  getAmonestacionById,
  markPagada,
  cancelAmonestacion,
} from './amonestaciones.model.js';

// Listar amonestaciones de un ciudadano
export async function listAmonestaciones(req, res) {
  try {
    const { ciudadano } = req.query;
    if (!ciudadano) {
      return res.status(400).json({ error: 'ciudadano requerido' });
    }
    const rows = await getAmonestaciones(ciudadano);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Crear una nueva amonestación
export async function createAmonestacion(req, res) {
  try {
    const { ciudadano_codigo, evento_id, fecha, hora, lugar, descripcion } = req.body;
    if (!ciudadano_codigo || !fecha || !hora || !lugar) {
      return res.status(400).json({ error: 'ciudadano_codigo, fecha, hora, lugar requeridos' });
    }
    const insertId = await insertAmonestacion({
      ciudadano_codigo,
      evento_id,
      fecha,
      hora,
      lugar,
      descripcion,
    });
    const row = await getAmonestacionById(insertId);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Marcar una amonestación como pagada
export async function payAmonestacion(req, res) {
  try {
    const id = req.params.id;
    const ok = await markPagada(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Cancelar una amonestación (estado cancelada)
export async function deleteAmonestacion(req, res) {
  try {
    const id = req.params.id;
    const ok = await cancelAmonestacion(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
