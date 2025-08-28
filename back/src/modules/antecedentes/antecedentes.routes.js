import { Router } from 'express';
import {
  listAntecedentes,
  showAntecedente,
  createAntecedenteCtrl,
  closeAntecedenteCtrl,
} from './antecedentes.controller.js';

const router = Router();

router.get('/antecedentes', listAntecedentes);
router.get('/antecedentes/:id', showAntecedente);
router.post('/antecedentes', createAntecedenteCtrl);
router.patch('/antecedentes/:id/cerrar', closeAntecedenteCtrl);

export default router;
