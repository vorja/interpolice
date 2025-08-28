// src/delitoTipos.js
import { Router } from 'express';
import dbconn from '../../config/dbconeccion.js';
const router = Router();

console.log("Conexión a la DB EXITOSA (delitoTipos.js)");

// GET /api/delito-tipos?activos=1
router.get('/delito-tipos', async (req, res) => {
    try {
        const { activos } = req.query;
        const sql = activos === '1'
            ? 'SELECT * FROM delito_tipo WHERE activo=1 ORDER BY nombre'
            : 'SELECT * FROM delito_tipo ORDER BY activo DESC, nombre';
        const [rows] = await dbconn.query(sql);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/delito-tipos/:id
router.get('/delito-tipos/:id', async (req, res) => {
    try {
        const [rows] = await dbconn.query('SELECT * FROM delito_tipo WHERE id=?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/delito-tipos
router.post('/delito-tipos', async (req, res) => {
    try {
        const { codigo, nombre, descripcion, activo = 1 } = req.body;
        if (!codigo || !nombre) return res.status(400).json({ error: 'codigo y nombre son requeridos' });
        const [r] = await dbconn.query(
            'INSERT INTO delito_tipo (codigo, nombre, descripcion, activo) VALUES (?,?,?,?)',
            [codigo, nombre, descripcion ?? null, Number(!!activo)]
        );
        const [[row]] = await dbconn.query('SELECT * FROM delito_tipo WHERE id=?', [r.insertId]);
        res.status(201).json(row);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/delito-tipos/:id
router.put('/delito-tipos/:id', async (req, res) => {
    try {
        const { codigo, nombre, descripcion, activo } = req.body;
        const [r] = await dbconn.query(
            'UPDATE delito_tipo SET codigo=COALESCE(?,codigo), nombre=COALESCE(?,nombre), descripcion=COALESCE(?,descripcion), activo=COALESCE(?,activo) WHERE id=?',
            [codigo ?? null, nombre ?? null, descripcion ?? null, activo ?? null, req.params.id]
        );
        if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
        const [[row]] = await dbconn.query('SELECT * FROM delito_tipo WHERE id=?', [req.params.id]);
        res.json(row);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE lógico /api/delito-tipos/:id
router.delete('/delito-tipos/:id', async (req, res) => {
    try {
        const [r] = await dbconn.query('UPDATE delito_tipo SET activo=0 WHERE id=?', [req.params.id]);
        if (!r.affectedRows) return res.status(404).json({ error: 'Not found' });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
