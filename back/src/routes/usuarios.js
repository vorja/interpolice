import express from 'express';
import { listarTodosUsuarios, buscarUsuarioPorID, crearUsuario, actualizarUsuario, eliminarUsuario, loginUsuario } from '../controllers/usuariosController.js';

const usuario = express.Router();

usuario.get('/listarTodos', listarTodosUsuarios);
usuario.get('/buscarxid/:id', buscarUsuarioPorID);
usuario.post('/crear', crearUsuario);
usuario.put('/actualizar/:id', actualizarUsuario);
usuario.delete('/eliminar/:id', eliminarUsuario);
usuario.post('/login', loginUsuario);

export default usuario;
