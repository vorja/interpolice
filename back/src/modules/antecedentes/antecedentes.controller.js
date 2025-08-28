import {
  getAntecedentes,
  getAntecedenteById,
  createAntecedente,
  closeAntecedente,
} from './antecedentes.model.js';

// Listar antecedentes de un ciudadano
export async function listAntecedentes(req, res) {
  try {
    const { ciudadano } = req.query;
    if (!ciudadano) {
      return res.status(400).json({ error: 'ciudadano requerido' });
    }
    const rows = await getAntecedentes(ciudadano);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Mostrar un antecedente específico
export async function showAntecedente(req, res) {
  try {
    const id = req.params.id;
    const result = await getAntecedenteById(id);
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Crear un nuevo antecedente
export async function createAntecedenteCtrl(req, res) {
  try {
    const {
      ciudadano_codigo,
      evento_id,
      descripcion,
      estado,
      autoridad_usuario_id,
      tipos,
    } = req.body;
    try {
      const row = await createAntecedente({
        ciudadano_codigo,
        evento_id,
        descripcion,
        estado,
        autoridad_usuario_id,
        tipos,
      });
      res.status(201).json(row);
    } catch (err) {
      if (err.status === 400) {
        return res.status(400).json({ error: err.message });
      }
      if (err.status === 422) {
        return res.status(422).json({ error: err.message, field: err.field });
      }
      throw err;
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Cerrar un antecedente
export async function closeAntecedenteCtrl(req, res) {
  try {
    const id = req.params.id;
    const ok = await closeAntecedente(id);
    if (!ok) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
