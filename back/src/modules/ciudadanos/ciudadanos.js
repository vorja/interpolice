import express from 'express';
import dbconn from './config/dbconeccion.js';
import QRCode from 'qrcode';

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ciudadano = express.Router();

ciudadano.get('/listarTodos', async (req, res) => {
    try {
        //consulta
        const sql = 'SELECT * FROM ciudadano';

        //ejecutamos la consulta y guardamos el resultado en un arreglo de objetos
        const [resultado] = await dbconn.execute(sql);

        res.send({ resultado });
    } catch (err) {
        console.error('Error al listar ciudadano:', err);
        res.status(500).json({ error: 'Error al listar ciudadano' });
    }
});

ciudadano.get('/buscarxid/:id', async (req, res) => {
    try {
        //recibir el parametro id desde la url
        let id = req.params.id;

        let sql = 'SELECT * FROM ciudadano WHERE codigo = ?';

        let [resultado] = await dbconn.execute(sql, [id]);

        //verificamos si el resultado es un arreglo y tiene al menos un elemento
        res.send({
            estado: "ok",
            mensaje: "ciudadano encontrado",
            data: resultado,
        });

    } catch (err) {
        console.error('Error al buscar ciudadano por ID:', err);
        res.status(500).json({ error: 'Error al buscar ciudadano por ID' });
    }
});

ciudadano.post('/crear', async (req, res) => {
    try {
        let datosFormulario = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            apodo: req.body.apodo,
            fechaNacimiento: req.body.fechaNacimiento,
            planetaOrigen: req.body.planetaOrigen,
            planetaResidencia: req.body.planetaResidencia,
            
        };

       
        let sql = 'INSERT INTO ciudadano (nombre, apellidos, apodo, fechaNacimiento, planetaOrigen, planetaResidencia) VALUES (?, ?, ?, ?, ?, ?)';

        let [resultado] = await dbconn.execute(sql, [datosFormulario.nombre, datosFormulario.apellidos, datosFormulario.apodo, datosFormulario.fechaNacimiento, datosFormulario.planetaOrigen, datosFormulario.planetaResidencia]);
       
        const newId = resultado.insertId; 

    
        const qrText = `https://localhost:4100/ciudadano/${newId}`;
        const qrBuffer = await QRCode.toBuffer(qrText);

        const qrDir = path.join(__dirname, '..', 'qrCodes');
        const filename = `qr_${newId}.png`;
        const filepath = path.join(qrDir, filename);
        await fs.writeFile(filepath, qrBuffer);

        const qrUrl = `/qrCodes/${filename}`;

        const sqlUpdate = 'UPDATE ciudadano SET codigoQr = ? WHERE codigo = ?';
        await dbconn.execute(sqlUpdate, [qrUrl, newId]);


        res.send({
            estado: "ok",
            mensaje: "ciudadano actualizado a muerto correctamente",
        });
    } catch (err) {
       
        console.error('Error al crear ciudadano:', err);
        res.status(500).json({ error: 'Error al crear ciudadano' });
    }
});

ciudadano.put('/actualizar/:id', async (req, res) => {
    try {
        //recibir el parametro id desde la url
        let codigo = req.params.id;

        //recibir los datos del ciudadano
        let datosFormulario = {
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            apodo: req.body.apodo,
            fechaNacimiento: req.body.fechaNacimiento,
            planetaOrigen: req.body.planetaOrigen,
            planetaResidencia: req.body.planetaResidencia,
            estado: req.body.estado
        };

        
        let sql = 'UPDATE ciudadano SET nombre = ?, apellidos = ?, apodo = ?, fechaNacimiento = ?, planetaOrigen = ?, planetaResidencia = ?, estado = ? WHERE codigo = ?';

        let [resultado] = await dbconn.execute(sql, [datosFormulario.nombre, datosFormulario.apellidos, datosFormulario.apodo, datosFormulario.fechaNacimiento, datosFormulario.planetaOrigen, datosFormulario.planetaResidencia, datosFormulario.estado, codigo]);

        res.send({
            estado: "ok",
            data: resultado,
        });

    } catch (err) {
        console.error('Error al actualizar ciudadano:', err);
        res.status(500).json({ error: 'Error al actualizar ciudadano' });
    }
});

ciudadano.delete('/estadoMuerto/:id', async (req, res) => {
    try {
        let id = req.params.id;

        
        let sql = 'UPDATE ciudadano set estado="0" WHERE codigo = ?';

        let [resultado] = await dbconn.execute(sql, [id]);

            res.send({
                estado: "ok",
                mensaje: "ciudadano actualizado a muerto correctamente",
            });
  

    } catch (err) {
        console.error('Error al eliminar ciudadano:', err);
        res.status(500).json({ error: 'Error al eliminar ciudadano' });
    }
});
ciudadano.put('/cambiarEstado/:id', async (req, res) => {
    try {
        let id = req.params.id;

        let nuevoEstado = req.body.nuevoEstado;
        let sql = 'UPDATE ciudadano SET estado = ? WHERE codigo = ?';

        let [resultado] = await dbconn.execute(sql, [nuevoEstado, id]);

        res.send({
            estado: "ok",
            mensaje: "Estado del ciudadano actualizado correctamente",
        });

    } catch (err) {
        console.error('Error al cambiar estado del ciudadano:', err);
        res.status(500).json({ error: 'Error al cambiar estado del ciudadano' });
    }
});

export default ciudadano;