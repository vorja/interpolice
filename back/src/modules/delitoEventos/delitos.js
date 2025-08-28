// src/delitoEventos.js
import { Router } from "express";
import dbconn from "../../config/dbconeccion.js";
const router = Router();
console.log("Conexión a la DB EXITOSA (delitoEventos.js)");

// GET /api/delito-eventos?ciudadano=...&from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/delito-eventos", async (req, res) => {
  try {
    const { ciudadano, from, to } = req.query;
    const params = [];
    let where = "WHERE 1=1";
    if (ciudadano) {
      where += " AND e.ciudadano_codigo=?";
      params.push(ciudadano);
    }
    if (from) {
      where += " AND e.fecha>=?";
      params.push(from);
    }
    if (to) {
      where += " AND e.fecha<=?";
      params.push(to);
    }

    const [rows] = await dbconn.query(
      `SELECT e.*, c.nombre AS ciudadano_nombre, c.apellido AS ciudadano_apellido,
              GROUP_CONCAT(DISTINCT dt.nombre ORDER BY dt.nombre SEPARATOR ', ') AS tipos
       FROM delito_evento e
       JOIN ciudadano c ON c.codigo=e.ciudadano_codigo
       LEFT JOIN delito_evento_tipo det ON det.evento_id=e.id
       LEFT JOIN delito_tipo dt ON dt.id=det.delito_tipo_id
       ${where}
       GROUP BY e.id
       ORDER BY e.created_at DESC`,
      params


    );
    console.log("Filas obtenidas (delitoEventos.js):", rows);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/delito-eventos/:id
router.get("/delito-eventos/:id", async (req, res) => {
  try {
    const [[evento]] = await dbconn.query(
      "SELECT * FROM delito_evento WHERE id=?",
      [req.params.id]
    );
    if (!evento) return res.status(404).json({ error: "Not found" });
    const [tipos] = await dbconn.query(
      "SELECT dt.* FROM delito_evento_tipo det JOIN delito_tipo dt ON dt.id=det.delito_tipo_id WHERE det.evento_id=? ORDER BY dt.nombre",
      [req.params.id]
    );
    res.json({ ...evento, tipos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

  // POST /api/delito-eventos  {ciudadano_codigo,fecha,hora,lugar,descripcion,creado_por_usuario_id,tipos:[ids]}
  router.post("/delito-eventos", async (req, res) => {
    const conn = await dbconn.getConnection();
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
      if (!ciudadano_codigo || !fecha || !hora || !lugar || !descripcion)
        return res
          .status(400)
          .json({
            error:
              "ciudadano_codigo, fecha, hora, lugar, descripcion son requeridos",
          });

      await conn.beginTransaction();
      const [r] = await conn.query(
        "INSERT INTO delito_evento (ciudadano_codigo, fecha, hora, lugar, descripcion, creado_por_usuario_id) VALUES (?,?,?,?,?,?)",
        [
          ciudadano_codigo,
          fecha,
          hora,
          lugar,
          descripcion,
          creado_por_usuario_id ?? null,
        ]
      );

      if (Array.isArray(tipos) && tipos.length) {
        const values = tipos.map((t) => [r.insertId, t]);
        await conn.query(
          "INSERT INTO delito_evento_tipo (evento_id, delito_tipo_id) VALUES ?",
          [values]
        );
      }

      await conn.commit();
      const [[row]] = await dbconn.query(
        "SELECT * FROM delito_evento WHERE id=?",
        [r.insertId]
      );
      res.status(201).json(row);
    } catch (e) {
      await conn.rollback();
      res.status(500).json({ error: e.message });
    } finally {
      conn.release();
    }
  });

// PUT /api/delito-eventos/:id  (reemplaza tipos si se envían)
router.put("/delito-eventos/:id", async (req, res) => {
  const conn = await dbconn.getConnection();
  try {
    const { fecha, hora, lugar, descripcion, tipos } = req.body;
    await conn.beginTransaction();
    const [r] = await conn.query(
      "UPDATE delito_evento SET fecha=COALESCE(?,fecha), hora=COALESCE(?,hora), lugar=COALESCE(?,lugar), descripcion=COALESCE(?,descripcion) WHERE id=?",
      [
        fecha ?? null,
        hora ?? null,
        lugar ?? null,
        descripcion ?? null,
        req.params.id,
      ]
    );
    if (!r.affectedRows) throw new Error("Not found");

    if (Array.isArray(tipos)) {
      await conn.query("DELETE FROM delito_evento_tipo WHERE evento_id=?", [
        req.params.id,
      ]);
      if (tipos.length) {
        const values = tipos.map((t) => [req.params.id, t]);
        await conn.query(
          "INSERT INTO delito_evento_tipo (evento_id, delito_tipo_id) VALUES ?",
          [values]
        );
      }
    }

    await conn.commit();
    const [[row]] = await dbconn.query(
      "SELECT * FROM delito_evento WHERE id=?",
      [req.params.id]
    );
    res.json(row);
  } catch (e) {
    await conn.rollback();
    if (e.message === "Not found")
      return res.status(404).json({ error: "Not found" });
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

// DELETE /api/delito-eventos/:id
router.delete("/delito-eventos/:id", async (req, res) => {
  try {
    const [r] = await dbconn.query("DELETE FROM delito_evento WHERE id=?", [
      req.params.id,
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
