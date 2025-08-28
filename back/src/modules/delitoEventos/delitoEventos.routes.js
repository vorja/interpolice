import { Router } from 'express';
import {
  listEventos,
  showEvento,
  createEventoCtrl,
  updateEventoCtrl,
  deleteEventoCtrl,
} from './delitoEventos.controller.js';

// Definición de rutas para eventos de delito
const router = Router();

router.get('/delito-eventos', listEventos);
router.get('/delito-eventos/:id', showEvento);
router.post('/delito-eventos', createEventoCtrl);
router.put('/delito-eventos/:id', updateEventoCtrl);
router.delete('/delito-eventos/:id', deleteEventoCtrl);

export default router;
