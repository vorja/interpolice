import dbconn from '../../config/dbconeccion.js';

// Obtener lista de tipos de delito; si 'activos' es '1', filtra por activos
export async function getDelitoTipos(activos) {
  let sql;
  if (activos === '1') {
    sql = 'SELECT * FROM delito_tipo WHERE activo=1 ORDER BY nombre';
  } else {
    sql = 'SELECT * FROM delito_tipo ORDER BY activo DESC, nombre';
  }
  const [rows] = await dbconn.query(sql);
  return rows;
}

// Obtener un tipo de delito por ID
export async function getDelitoTipoById(id) {
  const [rows] = await dbconn.query('SELECT * FROM delito_tipo WHERE id=?', [id]);
  return rows;
}

// Crear un nuevo tipo de delito
export async function createDelitoTipo(data) {
  const [r] = await dbconn.query(
    'INSERT INTO delito_tipo (codigo, nombre, descripcion, activo) VALUES (?,?,?,?)',
    [data.codigo, data.nombre, data.descripcion ?? null, Number(!!data.activo)]
  );
  return r.insertId;
}

// Actualizar un tipo de delito existente
export async function updateDelitoTipo(id, data) {
  const [r] = await dbconn.query(
    'UPDATE delito_tipo SET codigo=COALESCE(?,codigo), nombre=COALESCE(?,nombre), descripcion=COALESCE(?,descripcion), activo=COALESCE(?,activo) WHERE id=?',
    [data.codigo ?? null, data.nombre ?? null, data.descripcion ?? null, data.activo ?? null, id]
  );
  return r.affectedRows > 0;
}

// Eliminar (inactivar) un tipo de delito
export async function deleteDelitoTipo(id) {
  const [r] = await dbconn.query('UPDATE delito_tipo SET activo=0 WHERE id=?', [id]);
  return r.affectedRows > 0;
}
