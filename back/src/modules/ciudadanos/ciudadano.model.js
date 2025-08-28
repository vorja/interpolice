import dbconn from '../../config/dbconeccion.js';

// Obtener todos los ciudadanos activos
export async function getActiveCiudadanos() {
  const [rows] = await dbconn.query(
    "SELECT * FROM ciudadano WHERE Actividad = 'Activo' ORDER BY codigo DESC"
  );
  return rows;
}

// Buscar un ciudadano por su código
export async function getCiudadanoByCodigo(codigo) {
  const [rows] = await dbconn.query('SELECT * FROM ciudadano WHERE codigo = ?', [codigo]);
  return rows;
}

// Insertar un nuevo ciudadano
export async function insertCiudadano(data) {
  const [resultado] = await dbconn.query('INSERT INTO ciudadano SET ?', [data]);
  return resultado.insertId;
}

// Actualizar un ciudadano existente
export async function updateCiudadano(codigo, data) {
  const [resultado] = await dbconn.query('UPDATE ciudadano SET ? WHERE codigo = ?', [data, codigo]);
  return resultado.affectedRows > 0;
}

// Inactivar (eliminar lógicamente) a un ciudadano
export async function inactivateCiudadano(codigo) {
  const [resultado] = await dbconn.query(
    "UPDATE ciudadano SET Actividad = 'Inactivo' WHERE codigo = ?",
    [codigo]
  );
  return resultado.affectedRows > 0;
}
