import express from "express";
import dbconn from "../../config/dbconeccion.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../config/authMiddleware.js";

const usuarios = express.Router();

// Esperamos la conexión
console.log("Conexión a la DB EXITOSA (usuarios.js)");

// Consulta para listar todos los usuarios con información del rol
usuarios.get("/usuario/listar", /*verifyToken,*/ async (req, res) => {
    try {
        let consulta = `
            SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.fecha_creacion, usuarios.rol_id, roles.rol 
            FROM usuarios 
            LEFT JOIN roles ON usuarios.rol_id = roles.id 
            ORDER BY usuarios.id DESC
        `;

        let [resultado] = await dbconn.query(consulta);
        res.send({
            estado: "ok",
            mensaje: "Lista de usuarios",
            data: resultado,
        });
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

// Búsqueda por id
usuarios.get("/usuario/listar/:id", verifyToken, async (req, res) => {
    try {
        let id = req.params.id;
        console.log("ID solicitado: ", id);

        let consulta = `
            SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.fecha_creacion, usuarios.rol_id, roles.rol 
            FROM usuarios 
            LEFT JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.id = ?
        `;

        let [resultado] = await dbconn.query(consulta, [id]);
        if (resultado.length > 0) {
            res.send({
                estado: "ok",
                mensaje: "Usuario encontrado",
                data: resultado,
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "Usuario no encontrado",
                data: null,
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

// Insertar usuario método POST
usuarios.post("/usuario/crear/", verifyToken, async (req, res) => {
    try {
        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);

        // La data del usuario se recibe en el cuerpo (body) de la solicitud
        let data = {
            usuario: req.body.usuario,
            pass: hashedPassword,
            rol_id: req.body.rol_id || 2,
        };

        // Insertamos el usuario en la base de datos
        const consulta = "INSERT INTO usuarios SET ?";
        const [resultado] = await dbconn.query(consulta, [data]);

        if (resultado.affectedRows > 0) {
            console.log("Usuario creado con id: ", resultado.insertId);
            res.send({
                estado: "ok",
                mensaje: "Usuario creado",
                data: {
                    id: resultado.insertId,
                    ...data,
                },
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "Usuario no creado",
                data: null,
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

// Editar usuario método PUT
usuarios.put("/usuario/actualizar/:id", verifyToken, async (req, res) => {
    try {
        let id = req.params.id;

        // Hashear la contraseña si se proporciona
        let data = {
            usuario: req.body.usuario,
            rol_id: req.body.rol_id || null,
        };

        // Solo actualizar la contraseña si se proporciona una nueva
        if (req.body.pass) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.pass, saltRounds);
            data.pass = hashedPassword;
        }

        // Actualizamos el usuario en la base de datos
        const consulta = "UPDATE usuarios SET ? WHERE id = ?";
        const [resultado] = await dbconn.query(consulta, [data, id]);

        if (resultado.affectedRows > 0) {
            res.send({
                estado: "ok",
                mensaje: "Usuario actualizado",
                data: {
                    id: id,
                    ...data,
                },
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "Usuario no encontrado",
                data: null,
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

// Eliminar usuario método DELETE
usuarios.delete("/usuario/eliminar/:id", verifyToken, async (req, res) => {
    try {
        let id = req.params.id;

        const consulta = "UPDATE usuarios SET Estado = 1 WHERE id = ?";
        const [resultado] = await dbconn.query(consulta, [id]);

        if (resultado.affectedRows > 0) {
            res.send({
                estado: "ok",
                mensaje: "Usuario eliminado",
                data: {
                    id: id,
                },
            });
        } else {
            res.status(404).send({
                estado: "Error",
                mensaje: "Usuario no encontrado",
                data: null,
            });
        }
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

usuarios.get("/roles/listar", verifyToken, async (req, res) => {
    try {
        let consulta = "SELECT * FROM roles ORDER BY id";
        let [resultado] = await dbconn.query(consulta);
        res.send({
            estado: "ok",
            mensaje: "Lista de roles",
            data: resultado,
        });
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en la consulta",
            data: err.code,
            error: err.message,
            sql: err.sql,
        });
    }
});

usuarios.post("/usuario/login",  async (req, res) => {
    try {
        const { usuario, pass } = req.body;
        if (!usuario || !pass) {
            return res.status(400).send({
                estado: "Error",
                mensaje: "Usuario y contraseña son requeridos",
                data: null,
            });
        }

        let consulta = `
            SELECT usuarios.id, usuarios.usuario, usuarios.pass, usuarios.rol_id, roles.rol 
            FROM usuarios 
            LEFT JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.usuario = ? AND usuarios.Estado != 1
        `;
        let [resultado] = await dbconn.query(consulta, [usuario]);

        if (resultado.length === 0) {
            return res
                .status(401)
                .send({ estado: "Error", mensaje: "Usuario o contraseña incorrectos" });
        }

        const usuarioEncontrado = resultado[0];
        const passwordValida = await bcrypt.compare(pass, usuarioEncontrado.pass);
        if (!passwordValida) {
            return res
                .status(401)
                .send({ estado: "Error", mensaje: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol_id: usuarioEncontrado.rol_id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.send({
            estado: "ok",
            mensaje: "Login exitoso",
            data: {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol_id: usuarioEncontrado.rol_id,
                rol: usuarioEncontrado.rol,
                token,
            },
        });
    } catch (err) {
        res.status(500).send({
            estado: "Error",
            mensaje: "Error en el servidor",
            error: err.message,
        });
    }
});

export default usuarios;
