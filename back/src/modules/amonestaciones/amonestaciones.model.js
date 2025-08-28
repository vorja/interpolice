import dbconn from '../../config/dbconeccion.js';

// Obtener amonestaciones por código de ciudadano
export async function getAmonestaciones(ciudadano) {
  const [rows] = await dbconn.query(
    'SELECT * FROM amonestacion WHERE ciudadano_codigo=? ORDER BY fecha DESC, hora DESC',
    [ciudadano]
  );
  return rows;
}

// Crear una nueva amonestación
export async function insertAmonestacion(data) {
  const [r] = await dbconn.query(
    'INSERT INTO amonestacion (ciudadano_codigo, evento_id, fecha, hora, lugar, descripcion) VALUES (?,?,?,?,?,?)',
    [
      data.ciudadano_codigo,
      data.evento_id ?? null,
      data.fecha,
      data.hora,
      data.lugar,
      data.descripcion ?? null,
    ]
  );
  return r.insertId;
}

// Obtener una amonestación por su ID
export async function getAmonestacionById(id) {
  const [[row]] = await dbconn.query('SELECT * FROM amonestacion WHERE id=?', [id]);
  return row;
}

// Marcar una amonestación como pagada
export async function markPagada(id) {
  const [r] = await dbconn.query("UPDATE amonestacion SET estado='pagada' WHERE id=?", [id]);
  return r.affectedRows > 0;
}

// Cancelar (eliminar lógicamente) una amonestación
export async function cancelAmonestacion(id) {
  const [r] = await dbconn.query("UPDATE amonestacion SET estado='cancelada' WHERE id=?", [id]);
  return r.affectedRows > 0;
}
