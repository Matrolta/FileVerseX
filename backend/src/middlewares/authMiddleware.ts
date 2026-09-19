import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fileversex_clave_secreta';

interface TokenPayload {
  id: number;
  correo: string;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: TokenPayload;
    }
  }
}

// 1. Validar que la petición incluya un Token JWT válido
export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Acceso denegado. Token no proporcionado' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      message: 'Token inválido o expirado' 
    });
  }
};

// 2. Validar que el usuario tenga el rol ADMINISTRADOR
export const esAdministrador = (req: Request, res: Response, next: NextFunction) => {
  if (!req.usuario || req.usuario.rol !== 'ADMINISTRADOR') {
    return res.status(403).json({
      message: 'Acceso denegado. Se requieren permisos de ADMINISTRADOR'
    });
  }
  next();
};
