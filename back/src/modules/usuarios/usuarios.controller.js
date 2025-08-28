import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getUserByUsername,
} from './usuarios.model.js';

// Listar todos los usuarios
export async function listUsers(req, res) {
  try {
    const rows = await getUsers();
    res.send({ estado: 'ok', mensaje: 'Lista de usuarios', data: rows });
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Obtener un usuario por su ID
export async function showUser(req, res) {
  try {
    const id = req.params.id;
    const rows = await getUser(id);
    if (rows.length > 0) {
      res.send({ estado: 'ok', mensaje: 'Usuario encontrado', data: rows });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'Usuario no encontrado', data: null });
    }
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Crear un nuevo usuario
export async function createUserCtrl(req, res) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);
    const data = {
      usuario: req.body.usuario,
      pass: hashedPassword,
      rol_id: req.body.rol_id || 2,
    };
    const insertId = Date.now();
    
    res.send({ estado: 'ok', mensaje: 'Usuario creado', data: { id: insertId, ...data } });
    
  
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Actualizar un usuario existente
export async function updateUserCtrl(req, res) {
  try {
    const id = req.params.id;
    const data = {
      usuario: req.body.usuario,
      rol_id: req.body.rol_id || null,
    };
    if (req.body.pass) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);
      data.pass = hashedPassword;
    }
    const ok = await updateUser(id, data);
    if (ok) {
      res.send({ estado: 'ok', mensaje: 'Usuario actualizado', data: { id, ...data } });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'Usuario no encontrado', data: null });
    }
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Eliminar (cambiar estado) un usuario
export async function deleteUserCtrl(req, res) {
  try {
    const id = req.params.id;
    const ok = await deleteUser(id);
    if (ok) {
      res.send({ estado: 'ok', mensaje: 'Usuario eliminado', data: { id } });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'Usuario no encontrado', data: null });
    }
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Listar roles
export async function listRoles(req, res) {
  try {
    const rows = await getRoles();
    res.send({ estado: 'ok', mensaje: 'Lista de roles', data: rows });
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Inicio de sesión (login)
export async function login(req, res) {
  try {
    const { usuario, pass } = req.body;
    if (!usuario || !pass) {
      return res.status(400).send({ estado: 'Error', mensaje: 'Usuario y contraseña son requeridos', data: null });
    }
    const rows = await getUserByUsername(usuario);
    if (rows.length === 0) {
      return res.status(401).send({ estado: 'Error', mensaje: 'Usuario o contraseña incorrectos' });
    }
    const usuarioEncontrado = rows[0];
    const passwordValida = await bcrypt.compare(pass, usuarioEncontrado.pass);
    if (!passwordValida) {
      return res.status(401).send({ estado: 'Error', mensaje: 'Usuario o contraseña incorrectos' });
    }
    const token = jwt.sign(
      {
        id: usuarioEncontrado.id,
        usuario: usuarioEncontrado.usuario,
        rol_id: usuarioEncontrado.rol_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.send({
      estado: 'ok',
      mensaje: 'Login exitoso',
      data: {
        id: usuarioEncontrado.id,
        usuario: usuarioEncontrado.usuario,
        rol_id: usuarioEncontrado.rol_id,
        rol: usuarioEncontrado.rol,
        token,
      },
    });
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en el servidor', error: err.message });
  }
}
