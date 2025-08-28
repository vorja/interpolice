// src/antecedentes.js
import { Router } from "express";
import dbconn from "../../config/dbconeccion.js";
const router = Router();
console.log("Conexión a la DB EXITOSA (antecedentes.js)");

router.get("/antecedentes", async (req, res) => {
  try {
    const { ciudadano } = req.query;
    if (!ciudadano)
      return res.status(400).json({ error: "ciudadano requerido" });
    const [rows] = await dbconn.query(
      `SELECT a.*, e.fecha, e.hora, e.lugar, e.descripcion AS evento_descripcion,
              GROUP_CONCAT(DISTINCT dt.nombre ORDER BY dt.nombre SEPARATOR ', ') AS tipos
       FROM antecedente a
       LEFT JOIN delito_evento e ON e.id=a.evento_id
       LEFT JOIN antecedente_delito_tipo adt ON adt.antecedente_id=a.id
       LEFT JOIN delito_tipo dt ON dt.id=adt.delito_tipo_id
       WHERE a.ciudadano_codigo=?
       GROUP BY a.id
       ORDER BY a.fecha_registro DESC`,
      [ciudadano]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/antecedentes/:id", async (req, res) => {
  try {
    const [[a]] = await dbconn.query("SELECT * FROM antecedente WHERE id=?", [req.params.id]);
    if (!a) return res.status(404).json({ error: "Not found" });

    // 1) Tipos del antecedente
    const [t1] = await dbconn.query(
      `SELECT dt.nombre
       FROM antecedente_delito_tipo adt
       JOIN delito_tipo dt ON dt.id = adt.delito_tipo_id
       WHERE adt.antecedente_id = ?`,
      [a.id]
    );

    let tipos = t1.map(r => r.nombre);

    if (!tipos.length && a.evento_id) {
      const [t2] = await dbconn.query(
        `SELECT dt.nombre
         FROM delito_evento_tipo det
         JOIN delito_tipo dt ON dt.id = det.delito_tipo_id
         WHERE det.evento_id = ?`,
        [a.evento_id]
      );
      tipos = t2.map(r => r.nombre);
    }

    let evento = null;
    if (a.evento_id) {
      const [[e]] = await dbconn.query(
        "SELECT id, fecha, hora, lugar, descripcion FROM delito_evento WHERE id=?",
        [a.evento_id]
      );
      evento = e || null;
    }

    res.json({ ...a, evento });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

 
router.post("/antecedentes", async (req, res) => {
  const conn = await dbconn.getConnection();
  try {
    const {
      ciudadano_codigo,
      evento_id,
      descripcion,
      estado = "abierto",
      autoridad_usuario_id,
    } = req.body;
    if (!ciudadano_codigo)
      return res.status(400).json({ error: "ciudadano_codigo requerido" });

    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO antecedente (ciudadano_codigo, evento_id, descripcion, estado, autoridad_usuario_id) VALUES (?,?,?,?,?)",
      [
        ciudadano_codigo,
        evento_id ?? null,
        descripcion ?? null,
        estado,
        autoridad_usuario_id ?? null,
      ]
    );
    if (autoridad_usuario_id != null) {
      const [[u]] = await dbconn.query("SELECT 1 FROM usuarios WHERE id=?", [
        autoridad_usuario_id,
      ]);
      if (!u)
        return res
          .status(422)
          .json({
            error: "La autoridad (usuario) no existe",
            field: "autoridad_usuario_id",
          });
    }
    if (Array.isArray(tipos) && tipos.length) {
      const values = tipos.map((t) => [r.insertId, t]);
      await conn.query(
        "INSERT INTO antecedente_delito_tipo (antecedente_id, delito_tipo_id) VALUES ?",
        [values]
      );
    }
    await conn.commit();
    const [[row]] = await dbconn.query("SELECT * FROM antecedente WHERE id=?", [
      r.insertId,
    ]);
    res.status(201).json(row);
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    conn.release();
  }
});

router.patch("/antecedentes/:id/cerrar", async (req, res) => {
  try {
    const [r] = await dbconn.query(
      "UPDATE antecedente SET estado='cerrado' WHERE id=?",
      [req.params.id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
