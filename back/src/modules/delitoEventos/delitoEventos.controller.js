import {
  getEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
} from './delitoEventos.model.js';

// Listar eventos de delito con filtros
export async function listEventos(req, res) {
  try {
    const { ciudadano, from, to } = req.query;
    const rows = await getEventos({ ciudadano, from, to });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Obtener un evento por su ID
export async function showEvento(req, res) {
  try {
    const id = req.params.id;
    const result = await getEventoById(id);
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Crear un nuevo evento
export async function createEventoCtrl(req, res) {
  try {
    const {
      ciudadano_codigo,
      fecha,
      hora,
      lugar,
      descripcion,
      creado_por_usuario_id,
      tipos,
    } = req.body;
    if (!ciudadano_codigo || !fecha || !hora || !lugar || !descripcion) {
      return res.status(400).json({
        error:
          'ciudadano_codigo, fecha, hora, lugar y descripcion son requeridos',
      });
    }
    const row = await createEvento({
      ciudadano_codigo,
      fecha,
      hora,
      lugar,
      descripcion,
      creado_por_usuario_id,
      tipos,
    });
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Actualizar un evento
export async function updateEventoCtrl(req, res) {
  try {
    const id = req.params.id;
    const { fecha, hora, lugar, descripcion, tipos } = req.body;
    try {
      const row = await updateEvento(id, {
        fecha,
        hora,
        lugar,
        descripcion,
        tipos,
      });
      res.json(row);
    } catch (err) {
      if (err.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      throw err;
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Eliminar un evento
export async function deleteEventoCtrl(req, res) {
  try {
    const id = req.params.id;
    const ok = await deleteEvento(id);
    if (!ok) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
