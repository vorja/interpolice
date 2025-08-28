import { Router } from 'express';
import {
  listAmonestaciones,
  createAmonestacion,
  payAmonestacion,
  deleteAmonestacion,
} from './amonestaciones.controller.js';

const router = Router();

router.get('/amonestaciones', listAmonestaciones);
router.post('/amonestaciones', createAmonestacion);
router.patch('/amonestaciones/:id/pagar', payAmonestacion);
router.delete('/amonestaciones/:id', deleteAmonestacion);

export default router;
