// src/amonestaciones.js
import { Router } from 'express';
import dbconn from '../../config/dbconeccion.js';
const router = Router();
console.log("Conexión a la DB EXITOSA (amonestaciones.js)");


// GET /api/amonestaciones?ciudadano=...
router.get('/amonestaciones', async (req, res) => {
  try {
    const { ciudadano } = req.query;
    if (!ciudadano) return res.status(400).json({ error: 'ciudadano requerido' });
    const [rows] = await dbconn.query(
      'SELECT * FROM amonestacion WHERE ciudadano_codigo=? ORDER BY fecha DESC, hora DESC',
      [ciudadano]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/amonestaciones
router.post('/amonestaciones', async (req, res) => {
  try {
    const { ciudadano_codigo, evento_id, fecha, hora, lugar, descripcion } = req.body;
    if (!ciudadano_codigo || !fecha || !hora || !lugar)
      return res.status(400).json({ error: 'ciudadano_codigo, fecha, hora, lugar requeridos' });

    const [r] = await dbconn.query(
      'INSERT INTO amonestacion (ciudadano_codigo, evento_id, fecha, hora, lugar, descripcion) VALUES (?,?,?,?,?,?)',
      [ciudadano_codigo, evento_id ?? null, fecha, hora, lugar, descripcion ?? null]
    );
    const [[row]] = await dbconn.query('SELECT * FROM amonestacion WHERE id=?', [r.insertId]);
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/amonestaciones/:id/pagar
router.patch('/amonestaciones/:id/pagar', async (req, res) => {
  try {
    const [r] = await dbconn.query("UPDATE amonestacion SET estado='pagada' WHERE id=?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE lógico /api/amonestaciones/:id  -> cancelada
router.delete('/amonestaciones/:id', async (req, res) => {
  try {
    const [r] = await dbconn.query("UPDATE amonestacion SET estado='cancelada' WHERE id=?", [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
