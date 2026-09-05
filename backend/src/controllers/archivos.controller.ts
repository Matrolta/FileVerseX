import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export interface Archivo {
  id: number;
  nombreOriginal: string;
  nombreGuardado: string;
  tipo: string;
  tamanio: number;
  fechaSubida: Date;
  estado: 'activo' | 'restringido';
}

export const archivos: Archivo[] = [];

export const subirArchivo = (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'Debe seleccionar un archivo'
    });
  }

  const nuevoArchivo: Archivo = {
    id: archivos.length + 1,
    nombreOriginal: req.file.originalname,
    nombreGuardado: req.file.filename,
    tipo: req.file.mimetype,
    tamanio: req.file.size,
    fechaSubida: new Date(),
    estado: 'activo'
  };

  archivos.push(nuevoArchivo);

  return res.status(201).json({
    message: 'Archivo subido correctamente',
    archivo: nuevoArchivo
  });
};

export const obtenerArchivos = (
  req: Request,
  res: Response
) => {
  return res.status(200).json(archivos);
};

export const eliminarArchivo = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const indice = archivos.findIndex(
    (archivo) => archivo.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      message: 'Archivo no encontrado'
    });
  }

  const archivo = archivos[indice];

  const rutaArchivo = path.join(
    'src',
    'uploads',
    archivo.nombreGuardado
  );

  if (fs.existsSync(rutaArchivo)) {
    fs.unlinkSync(rutaArchivo);
  }

  archivos.splice(indice, 1);

  return res.status(200).json({
    message: 'Archivo eliminado correctamente'
  });
};