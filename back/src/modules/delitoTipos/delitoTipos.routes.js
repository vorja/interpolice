import { Router } from 'express';
import {
  listDelitoTipos,
  showDelitoTipo,
  createDelitoTipoCtrl,
  updateDelitoTipoCtrl,
  deleteDelitoTipoCtrl,
} from './delitoTipos.controller.js';

const router = Router();

router.get('/delito-tipos', listDelitoTipos);
router.get('/delito-tipos/:id', showDelitoTipo);
router.post('/delito-tipos', createDelitoTipoCtrl);
router.put('/delito-tipos/:id', updateDelitoTipoCtrl);
router.delete('/delito-tipos/:id', deleteDelitoTipoCtrl);

export default router;
