import {
  getActiveCiudadanos,
  getCiudadanoByCodigo,
  insertCiudadano,
  updateCiudadano,
  inactivateCiudadano,
} from './ciudadano.model.js';
import path, { dirname } from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function listCiudadanos(req, res) {
  try {
    const rows = await getActiveCiudadanos();
    res.send({ estado: 'ok', mensaje: 'Lista de ciudadanos', data: rows });
  } catch (e) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: e.code, error: e.message });
  }
}

export async function showCiudadano(req, res) {
  try {
    const codigo = req.params.codigo;
    const resultado = await getCiudadanoByCodigo(codigo);
    if (resultado.length > 0) {
      res.send({ estado: 'ok', mensaje: 'ciudadano encontrado', data: resultado });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'ciudadano no encontrado', data: null });
    }
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

export async function createCiudadano(req, res) {
  try {
    const codigo = Date.now();
    const data = {
      codigo,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      apodo: req.body.apodo,
      fechaNacimiento: req.body.fechaNacimiento,
      planetaOrigen: req.body.planetaOrigen,
      planetaResidencia: req.body.planetaResidencia,
      foto: req.file ? req.file.filename : 'default.png',
      estado: req.body.estado || '1',
    };

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrUrlLink = `${baseUrl}/ciudadanos/listar/${data.codigo}`;
    const qrFileName = `${data.codigo}.png`;
    const qrDir = path.join(__dirname, '../../../qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const qrPath = path.join(qrDir, qrFileName);
    await QRCode.toFile(qrPath, qrUrlLink);
    data.qr = `/qr/${qrFileName}`;

    const insertId = await insertCiudadano(data);
    if (insertId) {
      res.send({ estado: 'ok', mensaje: 'ciudadano creado', data: { id: insertId, ...data } });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'ciudadano no creado', data: null });
    }
  } catch (err) {
    console.error('Error al crear ciudadano:', err);
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

// Actualizar un ciudadano existente
export async function updateCiudadanoCtrl(req, res) {
  try {
    const id = req.params.id;
    const current = await getCiudadanoByCodigo(id);
    const currentPhoto = current.length > 0 ? current[0].foto : 'default.png';
    const data = {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      apodo: req.body.apodo,
      fechaNacimiento: req.body.fechaNacimiento,
      planetaOrigen: req.body.planetaOrigen,
      planetaResidencia: req.body.planetaResidencia,
      foto: req.file ? req.file.filename : currentPhoto,
      estado: req.body.estado || '1',
    };

    // Generar nuevo QR apuntando a la misma ruta de detalle
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrUrlLink = `${baseUrl}/ciudadanos/listar/${id}`;
    const qrFileName = `${id}.png`;
    const qrDir = path.join(__dirname, '../qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const qrPath = path.join(qrDir, qrFileName);
    await QRCode.toFile(qrPath, qrUrlLink);
    data.qr = `/qr/${qrFileName}`;

    const ok = await updateCiudadano(id, data);
    if (ok) {
      res.send({ estado: 'ok', mensaje: 'ciudadano actualizado', data: { id, ...data } });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'ciudadano no encontrado', data: null });
    }
  } catch (err) {
    console.error('Error al actualizar ciudadano:', err);
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}

export async function updateCiudadanoFotoCtrl(req, res) {
  try {
    const id = req.params.id;
    const current = await getCiudadanoByCodigo(id);
    const currentPhoto = current.length > 0 ? current[0].foto : 'default.png';
    const data = {
      foto: req.file ? req.file.filename : currentPhoto
    };

    // Generar nuevo QR apuntando a la misma ruta de detalle
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const qrUrlLink = `${baseUrl}/ciudadanos/listar/${id}`;
    const qrFileName = `${id}.png`;
    const qrDir = path.join(__dirname, '../qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }
    const qrPath = path.join(qrDir, qrFileName);
    await QRCode.toFile(qrPath, qrUrlLink);
    data.qr = `/qr/${qrFileName}`;

    const ok = await updateCiudadano(id, data);
    if (ok) {
      res.send({ estado: 'ok', mensaje: 'ciudadano actualizado', data: { id, ...data } });
    } else {
      res.status(404).send({ estado: 'Error', mensaje: 'ciudadano no encontrado', data: null });
    }
  } catch (err) {
    console.error('Error al actualizar ciudadano:', err);
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}



export async function deleteCiudadano(req, res) {
  try {
    const id = req.params.id;
    const ok = await inactivateCiudadano(id);
    if (ok) {
      res.send({ estado: 'ok', mensaje: 'ciudadano eliminado', data: { id, Actividad: 'Inactivo' } });
    } else {
      res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: null });
    }
  } catch (err) {
    res.status(500).send({ estado: 'Error', mensaje: 'Error en la consulta', data: err.code, error: err.message });
  }
}
