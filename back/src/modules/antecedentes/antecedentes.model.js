import dbconn from '../../config/dbconeccion.js';

// Obtener antecedentes de un ciudadano, incluyendo detalles de evento y tipos
export async function getAntecedentes(ciudadano) {
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
  return rows;
}

// Obtener un antecedente por su ID, incluyendo tipos y evento si corresponde
export async function getAntecedenteById(id) {
  const [[a]] = await dbconn.query('SELECT * FROM antecedente WHERE id=?', [id]);
  if (!a) return null;
  const [t1] = await dbconn.query(
    `SELECT dt.nombre
     FROM antecedente_delito_tipo adt
     JOIN delito_tipo dt ON dt.id = adt.delito_tipo_id
     WHERE adt.antecedente_id = ?`,
    [a.id]
  );
  let tipos = t1.map((r) => r.nombre);
  if (!tipos.length && a.evento_id) {
    const [t2] = await dbconn.query(
      `SELECT dt.nombre
       FROM delito_evento_tipo det
       JOIN delito_tipo dt ON dt.id = det.delito_tipo_id
       WHERE det.evento_id = ?`,
      [a.evento_id]
    );
    tipos = t2.map((r) => r.nombre);
  }
  let evento = null;
  if (a.evento_id) {
    const [[e]] = await dbconn.query(
      'SELECT id, fecha, hora, lugar, descripcion FROM delito_evento WHERE id=?',
      [a.evento_id]
    );
    evento = e || null;
  }
  return { ...a, tipos, evento };
}

// Crear un nuevo antecedente con posibles tipos
export async function createAntecedente(data) {
  const {
    ciudadano_codigo,
    evento_id,
    descripcion,
    estado,
    autoridad_usuario_id,
    tipos,
  } = data;
  const conn = await dbconn.getConnection();
  try {
    if (!ciudadano_codigo) {
      const err = new Error('ciudadano_codigo requerido');
      err.status = 400;
      throw err;
    }
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO antecedente (ciudadano_codigo, evento_id, descripcion, estado, autoridad_usuario_id) VALUES (?,?,?,?,?)',
      [
        ciudadano_codigo,
        evento_id ?? null,
        descripcion ?? null,
        estado ?? 'abierto',
        autoridad_usuario_id ?? null,
      ]
    );
    // Verificar existencia de la autoridad
    if (autoridad_usuario_id != null) {
      const [[u]] = await dbconn.query('SELECT 1 FROM usuarios WHERE id=?', [autoridad_usuario_id]);
      if (!u) {
        const error = new Error('La autoridad (usuario) no existe');
        error.field = 'autoridad_usuario_id';
        error.status = 422;
        throw error;
      }
    }
    // Insertar tipos asociados
    if (Array.isArray(tipos) && tipos.length) {
      const values = tipos.map((t) => [r.insertId, t]);
      await conn.query(
        'INSERT INTO antecedente_delito_tipo (antecedente_id, delito_tipo_id) VALUES ?',
        [values]
      );
    }
    await conn.commit();
    const [[row]] = await dbconn.query('SELECT * FROM antecedente WHERE id=?', [r.insertId]);
    return row;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Cerrar un antecedente (cambiar estado a cerrado)
export async function closeAntecedente(id) {
  const [r] = await dbconn.query("UPDATE antecedente SET estado='cerrado' WHERE id=?", [id]);
  return r.affectedRows > 0;
}

