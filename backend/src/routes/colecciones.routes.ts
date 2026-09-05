import { Router } from 'express';

import {
  crearColeccion,
  obtenerColecciones,
  editarColeccion,
  eliminarColeccion,
  agregarArchivoColeccion,
  quitarArchivoColeccion
} from '../controllers/colecciones.controller';

const router = Router();

router.post(
  '/',
  crearColeccion
);

router.get(
  '/',
  obtenerColecciones
);

router.put(
  '/:id',
  editarColeccion
);

router.delete(
  '/:id',
  eliminarColeccion
);

router.post(
  '/:id/archivos',
  agregarArchivoColeccion
);

router.delete(
  '/:id/archivos/:archivoId',
  quitarArchivoColeccion
);

export default router;