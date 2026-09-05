import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'fileversex_clave_secreta';

interface TokenPayload {
  id: number;
  correo: string;
  rol: string;
}

export interface RequestConUsuario extends Request {
  usuario?: TokenPayload;
}

export const verificarAdmin = (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token no proporcionado'
    });
  }

  const partes = authHeader.split(' ');

  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer'
  ) {
    return res.status(401).json({
      message: 'Formato de token inválido'
    });
  }

  const token = partes[1];

  try {
    const datos = jwt.verify(
      token,
      JWT_SECRET
    ) as TokenPayload;

    if (datos.rol !== 'admin') {
      return res.status(403).json({
        message:
          'Acceso permitido únicamente para administradores'
      });
    }

    req.usuario = datos;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message:
        'Token inválido o expirado'
    });
  }
};