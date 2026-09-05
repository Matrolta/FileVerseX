import type { Request, Response } from 'express';

interface Coleccion {
  id: number;
  nombre: string;
  archivos: number[];
}

const colecciones: Coleccion[] = [];

export const crearColeccion = (
  req: Request,
  res: Response
) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({
      message: 'El nombre de la colección es obligatorio'
    });
  }

  const nuevaColeccion: Coleccion = {
    id: colecciones.length + 1,
    nombre,
    archivos: []
  };

  colecciones.push(nuevaColeccion);

  return res.status(201).json({
    message: 'Colección creada correctamente',
    coleccion: nuevaColeccion
  });
};

export const obtenerColecciones = (
  req: Request,
  res: Response
) => {
  return res.status(200).json(colecciones);
};

export const editarColeccion = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);
  const { nombre } = req.body;

  const coleccion = colecciones.find(
    item => item.id === id
  );

  if (!coleccion) {
    return res.status(404).json({
      message: 'Colección no encontrada'
    });
  }

  if (!nombre) {
    return res.status(400).json({
      message: 'El nombre es obligatorio'
    });
  }

  coleccion.nombre = nombre;

  return res.status(200).json({
    message: 'Colección actualizada correctamente',
    coleccion
  });
};

export const eliminarColeccion = (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const indice = colecciones.findIndex(
    item => item.id === id
  );

  if (indice === -1) {
    return res.status(404).json({
      message: 'Colección no encontrada'
    });
  }

  colecciones.splice(indice, 1);

  return res.status(200).json({
    message: 'Colección eliminada correctamente'
  });
};

export const agregarArchivoColeccion = (
  req: Request,
  res: Response
) => {
  const coleccionId = Number(req.params.id);
  const { archivoId } = req.body;

  const coleccion = colecciones.find(
    item => item.id === coleccionId
  );

  if (!coleccion) {
    return res.status(404).json({
      message: 'Colección no encontrada'
    });
  }

  if (!archivoId) {
    return res.status(400).json({
      message: 'El archivo es obligatorio'
    });
  }

  const idArchivo = Number(archivoId);

  const archivoExiste = coleccion.archivos.includes(
    idArchivo
  );

  if (archivoExiste) {
    return res.status(400).json({
      message: 'El archivo ya pertenece a esta colección'
    });
  }

  coleccion.archivos.push(idArchivo);

  return res.status(200).json({
    message: 'Archivo agregado a la colección correctamente',
    coleccion
  });
};

export const quitarArchivoColeccion = (
  req: Request,
  res: Response
) => {
  const coleccionId = Number(req.params.id);
  const archivoId = Number(req.params.archivoId);

  const coleccion = colecciones.find(
    item => item.id === coleccionId
  );

  if (!coleccion) {
    return res.status(404).json({
      message: 'Colección no encontrada'
    });
  }

  const indiceArchivo = coleccion.archivos.indexOf(
    archivoId
  );

  if (indiceArchivo === -1) {
    return res.status(404).json({
      message: 'El archivo no pertenece a esta colección'
    });
  }

  coleccion.archivos.splice(indiceArchivo, 1);

  return res.status(200).json({
    message: 'Archivo eliminado de la colección correctamente',
    coleccion
  });
};