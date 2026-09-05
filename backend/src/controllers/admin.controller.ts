import type { Request, Response } from 'express';

import { usuarios } from './auth.controller';
import { archivos } from './archivos.controller';

export const obtenerUsuarios = (
  req: Request,
  res: Response
) => {
  const usuariosSinPassword = usuarios.map(
    (usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      descripcion: usuario.descripcion,
      fotoPerfil: usuario.fotoPerfil,
      rol: usuario.rol,
      estado: usuario.estado
    })
  );

  return res.status(200).json(
    usuariosSinPassword
  );
};

export const cambiarEstadoUsuario = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const usuario = usuarios.find(
    (item) => item.id === id
  );

  if (!usuario) {
    return res.status(404).json({
      message: 'Usuario no encontrado'
    });
  }

  if (usuario.rol === 'admin') {
    return res.status(400).json({
      message:
        'No se puede bloquear al administrador'
    });
  }

  usuario.estado =
    usuario.estado === 'activo'
      ? 'bloqueado'
      : 'activo';

  return res.status(200).json({
    message:
      usuario.estado === 'activo'
        ? 'Usuario desbloqueado correctamente'
        : 'Usuario bloqueado correctamente',
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado
    }
  });
};

export const obtenerArchivosAdmin = (
  req: Request,
  res: Response
) => {
  return res.status(200).json(
    archivos
  );
};

export const cambiarEstadoArchivo = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const archivo = archivos.find(
    (item) => item.id === id
  );

  if (!archivo) {
    return res.status(404).json({
      message: 'Archivo no encontrado'
    });
  }

  archivo.estado =
    archivo.estado === 'restringido'
      ? 'activo'
      : 'restringido';

  return res.status(200).json({
    message:
      archivo.estado === 'activo'
        ? 'Archivo habilitado correctamente'
        : 'Archivo restringido correctamente',
    archivo
  });
};

export const eliminarArchivoAdmin = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const indice = archivos.findIndex(
    (item) => item.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      message: 'Archivo no encontrado'
    });
  }

  archivos.splice(indice, 1);

  return res.status(200).json({
    message:
      'Archivo eliminado por el administrador'
  });
};