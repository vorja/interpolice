import dbconn from '../dbconeccion.js';
import bcrypt from 'bcrypt';

export async function listarTodosUsuarios(req, res) {
    try {
        const sql = 'SELECT id, nombre_usuario, correo, rol_id FROM usuarios WHERE estado = 1';
        const [resultado] = await dbconn.execute(sql);
        res.send({ resultado });
    } catch (err) {
        console.error('Error al listar usuarios:', err);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
}

export async function buscarUsuarioPorID(req, res) {
    try {
        const id = req.params.id;
        const sql = 'SELECT id, nombre_usuario, correo, rol_id FROM usuarios WHERE id = ? AND estado = 1';
        const [resultado] = await dbconn.execute(sql, [id]);
        if (resultado.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.send({
            estado: 'ok',
            mensaje: 'usuario encontrado',
            data: resultado
        });
    } catch (err) {
        console.error('Error al buscar usuario por ID:', err);
        res.status(500).json({ error: 'Error al buscar usuario por ID' });
    }
}

export async function crearUsuario(req, res) {
    try {
        const { nombre_usuario, correo, contrasena, rol_id } = req.body;
        if (!nombre_usuario || !correo || !contrasena || !rol_id) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const sql = 'INSERT INTO usuarios (nombre_usuario, correo, contrasena, rol_id, estado) VALUES (?, ?, ?, ?, ?)';
        await dbconn.execute(sql, [nombre_usuario, correo, hashedPassword, rol_id, 1]);
        res.send({ estado: 'ok', mensaje: 'usuario creado correctamente' });
    } catch (err) {
        console.error('Error al crear usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario' });
    }
}

export async function actualizarUsuario(req, res) {
    try {
        const id = req.params.id;
        const { nombre_usuario, correo, rol_id } = req.body;
        if (!nombre_usuario || !correo || !rol_id) {
            return res.status(400).json({ error: 'Nombre, correo y rol son requeridos' });
        }
        let sql;
        let params;
        if (req.body.contrasena && req.body.contrasena !== '') {
            const hashedPassword = await bcrypt.hash(req.body.contrasena, 10);
            sql = 'UPDATE usuarios SET nombre_usuario = ?, correo = ?, rol_id = ?, contrasena = ? WHERE id = ?';
            params = [nombre_usuario, correo, rol_id, hashedPassword, id];
        } else {
            sql = 'UPDATE usuarios SET nombre_usuario = ?, correo = ?, rol_id = ? WHERE id = ?';
            params = [nombre_usuario, correo, rol_id, id];
        }
        const [resultado] = await dbconn.execute(sql, params);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.send({ estado: 'ok', mensaje: 'usuario actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
}

export async function eliminarUsuario(req, res) {
    try {
        const id = req.params.id;
        const sql = 'UPDATE usuarios SET estado = 0 WHERE id = ?';
        const [resultado] = await dbconn.execute(sql, [id]);
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado o ya eliminado' });
        }
        res.send({ estado: 'ok', mensaje: 'usuario eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
}

export async function loginUsuario(req, res) {
    try {
        const { nombre_usuario, contrasena } = req.body;
        if (!nombre_usuario || !contrasena) {
            return res.status(400).json({ error: 'Debe proporcionar usuario y contraseña' });
        }
        const sql = 'SELECT id, nombre_usuario, correo, contrasena, rol_id FROM usuarios WHERE nombre_usuario = ? AND estado = 1';
        const [resultado] = await dbconn.execute(sql, [nombre_usuario]);
        if (resultado.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
        const usuario = resultado[0];
        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
        delete usuario.contrasena;
        res.send({ estado: 'ok', mensaje: 'Login exitoso', usuario });
    } catch (err) {
        console.error('Error en login de usuario:', err);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
}
