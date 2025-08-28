import dbconn from '../../config/dbconeccion.js';

// Obtener eventos de delito con filtros opcionales
export async function getEventos({ ciudadano, from, to }) {
  const params = [];
  let where = 'WHERE 1=1';
  if (ciudadano) {
    where += ' AND e.ciudadano_codigo=?';
    params.push(ciudadano);
  }
  if (from) {
    where += ' AND e.fecha>=?';
    params.push(from);
  }
  if (to) {
    where += ' AND e.fecha<=?';
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
  return rows;
}

// Obtener un evento de delito por ID con tipos asociados
export async function getEventoById(id) {
  const [[evento]] = await dbconn.query('SELECT * FROM delito_evento WHERE id=?', [id]);
  if (!evento) {
    return null;
  }
  const [tipos] = await dbconn.query(
    'SELECT dt.* FROM delito_evento_tipo det JOIN delito_tipo dt ON dt.id=det.delito_tipo_id WHERE det.evento_id=? ORDER BY dt.nombre',
    [id]
  );
  return { ...evento, tipos };
}

// Crear un nuevo evento de delito
export async function createEvento(data) {
  const {
    ciudadano_codigo,
    fecha,
    hora,
    lugar,
    descripcion,
    creado_por_usuario_id,
    tipos,
  } = data;
  const conn = await dbconn.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO delito_evento (ciudadano_codigo, fecha, hora, lugar, descripcion, creado_por_usuario_id) VALUES (?,?,?,?,?,?)',
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
        'INSERT INTO delito_evento_tipo (evento_id, delito_tipo_id) VALUES ?',
        [values]
      );
    }
    await conn.commit();
    const [[row]] = await dbconn.query('SELECT * FROM delito_evento WHERE id=?', [
      r.insertId,
    ]);
    return row;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Actualizar un evento de delito existente
export async function updateEvento(id, data) {
  const { fecha, hora, lugar, descripcion, tipos } = data;
  const conn = await dbconn.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'UPDATE delito_evento SET fecha=COALESCE(?,fecha), hora=COALESCE(?,hora), lugar=COALESCE(?,lugar), descripcion=COALESCE(?,descripcion) WHERE id=?',
      [fecha ?? null, hora ?? null, lugar ?? null, descripcion ?? null, id]
    );
    if (!r.affectedRows) {
      throw new Error('Not found');
    }
    if (Array.isArray(tipos)) {
      await conn.query('DELETE FROM delito_evento_tipo WHERE evento_id=?', [id]);
      if (tipos.length) {
        const values = tipos.map((t) => [id, t]);
        await conn.query(
          'INSERT INTO delito_evento_tipo (evento_id, delito_tipo_id) VALUES ?',
          [values]
        );
      }
    }
    await conn.commit();
    const [[row]] = await dbconn.query('SELECT * FROM delito_evento WHERE id=?', [
      id,
    ]);
    return row;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Eliminar un evento de delito
export async function deleteEvento(id) {
  const [r] = await dbconn.query('DELETE FROM delito_evento WHERE id=?', [id]);
  return r.affectedRows > 0;
}
