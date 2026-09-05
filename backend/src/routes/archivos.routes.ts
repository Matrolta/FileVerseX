import { Router } from 'express';
import upload from '../middlewares/upload.middleware';

import {
  subirArchivo,
  obtenerArchivos,
  eliminarArchivo
} from '../controllers/archivos.controller';

const router = Router();

router.post(
  '/subir',
  upload.single('archivo'),
  subirArchivo
);

router.get(
  '/',
  obtenerArchivos
);

router.delete(
  '/:id',
  eliminarArchivo
);

export default router;