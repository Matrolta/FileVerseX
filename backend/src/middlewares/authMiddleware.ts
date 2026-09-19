import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id_usuario: number;
  nombre_rol: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// 1. Validar Token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_key_fileversex'
    ) as UserPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

// 2. Validar que el Rol sea ADMINISTRADOR
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.nombre_rol !== 'ADMINISTRADOR') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Se requieren permisos de ADMINISTRADOR.' 
    });
  }
  next();
};
