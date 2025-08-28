import { Router } from 'express';
import multer from 'multer';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { listCiudadanos, showCiudadano, createCiudadano, updateCiudadanoCtrl, deleteCiudadano } from './ciudadano.controller.js';
import { verifyToken } from '../../config/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../fotos');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'ciudadano-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  },
});

// Definición de rutas
const router = Router();

router.get('/ciudadanos/listar', verifyToken, listCiudadanos);
router.get('/ciudadanos/listar/:codigo', verifyToken, showCiudadano);
router.post('/ciudadanos/crear/', verifyToken, upload.single('foto'), createCiudadano);
router.put('/ciudadanos/actualizar/:id', verifyToken, upload.single('foto'), updateCiudadanoCtrl);
router.put('/ciudadanos/eliminar/:id', verifyToken, deleteCiudadano);

export default router;
