import dbconn from '../../config/dbconeccion.js';

// Obtener todos los usuarios con información de rol
export async function getUsers() {
  const [rows] = await dbconn.query(
    `SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.fecha_creacion, usuarios.rol_id, roles.rol
     FROM usuarios
     LEFT JOIN roles ON usuarios.rol_id = roles.id
     ORDER BY usuarios.id DESC`
  );
  return rows;
}

// Obtener un usuario por ID, incluyendo su rol
export async function getUser(id) {
  const [rows] = await dbconn.query(
    `SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.fecha_creacion, usuarios.rol_id, roles.rol
     FROM usuarios
     LEFT JOIN roles ON usuarios.rol_id = roles.id
     WHERE usuarios.id = ?`,
    [id]
  );
  return rows;
}

// Crear un nuevo usuario
export async function createUser(data) {
  const [r] = await dbconn.query('INSERT INTO usuarios SET ?', [data]);
  return r.insertId;
}

// Actualizar un usuario existente
export async function updateUser(id, data) {
  const [r] = await dbconn.query('UPDATE usuarios SET ? WHERE id = ?', [data, id]);
  return r.affectedRows > 0;
}

// Eliminar (cambiar estado) un usuario
export async function deleteUser(id) {
  const [r] = await dbconn.query("UPDATE usuarios SET Estado = 1 WHERE id = ?", [id]);
  return r.affectedRows > 0;
}

// Obtener todos los roles
export async function getRoles() {
  const [rows] = await dbconn.query('SELECT * FROM roles ORDER BY id');
  return rows;
}

// Obtener usuario por nombre de usuario para login
export async function getUserByUsername(usuario) {
  const [rows] = await dbconn.query(
    `SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.rol_id, roles.rol
     FROM usuarios
     LEFT JOIN roles ON usuarios.rol_id = roles.id
     WHERE usuarios.usuario = ? AND usuarios.Estado != 1`,
    [usuario]
  );
  return rows;
}
