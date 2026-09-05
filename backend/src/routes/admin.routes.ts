import { Router } from 'express';

import {
  obtenerUsuarios,
  cambiarEstadoUsuario,
  obtenerArchivosAdmin,
  cambiarEstadoArchivo,
  eliminarArchivoAdmin
} from '../controllers/admin.controller';

import {
  verificarAdmin
} from '../middlewares/admin.middleware';

const router = Router();

router.get(
  '/usuarios',
  verificarAdmin,
  obtenerUsuarios
);

router.put(
  '/usuarios/:id/estado',
  verificarAdmin,
  cambiarEstadoUsuario
);

router.get(
  '/archivos',
  verificarAdmin,
  obtenerArchivosAdmin
);

router.put(
  '/archivos/:id/estado',
  verificarAdmin,
  cambiarEstadoArchivo
);

router.delete(
  '/archivos/:id',
  verificarAdmin,
  eliminarArchivoAdmin
);

export default router;