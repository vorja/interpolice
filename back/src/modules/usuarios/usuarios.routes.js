import { Router } from 'express';
import { verifyToken } from '../../config/authMiddleware.js';
import {
  listUsers,
  showUser,
  createUserCtrl,
  updateUserCtrl,
  deleteUserCtrl,
  listRoles,
  login,
} from './usuarios.controller.js';

const router = Router();

router.get('/usuarios/listar', verifyToken, listUsers);
router.get('/usuarios/listar/:id', verifyToken, showUser);
router.post('/usuarios/crear/', verifyToken, createUserCtrl);
router.put('/usuarios/actualizar/:id', verifyToken, updateUserCtrl);
router.delete('/usuarios/eliminar/:id', verifyToken, deleteUserCtrl);
router.post('/usuarios/login', login);

export default router;
