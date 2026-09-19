import type { Request, Response } from 'express';
import { db } from '../config/database';

// 1. Obtener la lista de usuarios para el panel de administración
export const obtenerUsuarios = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      `SELECT u.id_usuario AS id, u.nombre_completo AS nombre, u.email AS correo, 
              u.descripcion, u.foto_perfil AS fotoPerfil, r.nombre AS rol,
              IF(u.esta_bloqueado, 'bloqueado', 'activo') AS estado
       FROM Usuarios u
       INNER JOIN Roles r ON u.id_rol = r.id_rol`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ message: 'Error al consultar usuarios en la base de datos' });
  }
};

// 2. Bloquear o desbloquear a un usuario (alterna la columna esta_bloqueado)
export const cambiarEstadoUsuario = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de usuario inválido' });
  }

  try {
    // Verificar si el usuario existe y su rol
    const [rows]: any = await db.query(
      `SELECT u.id_usuario, u.esta_bloqueado, r.nombre AS nombre_rol 
       FROM Usuarios u 
       INNER JOIN Roles r ON u.id_rol = r.id_rol 
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    if (usuario.nombre_rol === 'ADMINISTRADOR') {
      return res.status(400).json({ message: 'No se puede bloquear al administrador' });
    }

    const nuevoEstadoBloqueo = !usuario.esta_bloqueado;

    await db.query(
      'UPDATE Usuarios SET esta_bloqueado = ? WHERE id_usuario = ?',
      [nuevoEstadoBloqueo, id]
    );

    return res.status(200).json({
      message: nuevoEstadoBloqueo
        ? 'Usuario bloqueado correctamente'
        : 'Usuario desbloqueado correctamente',
      usuario: {
        id: usuario.id_usuario,
        estado: nuevoEstadoBloqueo ? 'bloqueado' : 'activo'
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del usuario' });
  }
};

// 3. Obtener la lista de archivos para administración
export const obtenerArchivosAdmin = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      `SELECT a.id_archivo AS id, a.nombre_original AS nombreOriginal, a.tipo_mime AS tipoMime,
              a.tamano_bytes AS tamanoBytes, a.contador_descargas AS contadorDescargas,
              a.estado, a.fecha_subida AS fechaSubida, u.nombre_completo AS propietario
       FROM Archivos a
       INNER JOIN Usuarios u ON a.id_usuario = u.id_usuario`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener archivos admin:', error);
    return res.status(500).json({ message: 'Error al consultar archivos' });
  }
};

// 4. Alternar estado del archivo (activo <-> restringido)
export const cambiarEstadoArchivo = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de archivo inválido' });
  }

  try {
    const [rows]: any = await db.query(
      'SELECT id_archivo, estado FROM Archivos WHERE id_archivo = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    const archivo = rows[0];
    const nuevoEstado = archivo.estado === 'restringido' ? 'activo' : 'restringido';

    await db.query(
      'UPDATE Archivos SET estado = ? WHERE id_archivo = ?',
      [nuevoEstado, id]
    );

    return res.status(200).json({
      message: nuevoEstado === 'activo'
        ? 'Archivo habilitado correctamente'
        : 'Archivo restringido correctamente',
      archivo: {
        id,
        estado: nuevoEstado
      }
    });
  } catch (error) {
    console.error('Error al cambiar estado del archivo:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del archivo' });
  }
};

// 5. Eliminar (marcar como 'eliminado') un archivo por el Administrador
export const eliminarArchivoAdmin = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'ID de archivo inválido' });
  }

  try {
    const [result]: any = await db.query(
      "UPDATE Archivos SET estado = 'eliminado' WHERE id_archivo = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }

    return res.status(200).json({
      message: 'Archivo eliminado por el administrador'
    });
  } catch (error) {
    console.error('Error al eliminar archivo admin:', error);
    return res.status(500).json({ message: 'Error al eliminar el archivo' });
  }
};
