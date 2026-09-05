import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  descripcion?: string;
  fotoPerfil?: string;
  rol: 'usuario' | 'admin';
  estado: 'activo' | 'bloqueado';
}

export const usuarios: Usuario[] = [];

const JWT_SECRET = 'fileversex_clave_secreta';

export const registrarUsuario = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      nombre,
      correo,
      password,
      descripcion,
      fotoPerfil
    } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message:
          'Nombre, correo y contraseña son obligatorios'
      });
    }

    const usuarioExistente = usuarios.find(
      (usuario) => usuario.correo === correo
    );

    if (usuarioExistente) {
      return res.status(400).json({
        message:
          'El correo ya está registrado'
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const nuevoUsuario: Usuario = {
      id: usuarios.length + 1,
      nombre,
      correo,
      password: passwordHash,
      descripcion,
      fotoPerfil,
      rol: 'usuario',
      estado: 'activo'
    };

    usuarios.push(nuevoUsuario);

    return res.status(201).json({
      message:
        'Usuario registrado correctamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        descripcion:
          nuevoUsuario.descripcion,
        fotoPerfil:
          nuevoUsuario.fotoPerfil,
        rol: nuevoUsuario.rol,
        estado: nuevoUsuario.estado
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        'Error al registrar usuario'
    });
  }
};

export const iniciarSesion = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      correo,
      password
    } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message:
          'Correo y contraseña son obligatorios'
      });
    }

    const usuario = usuarios.find(
      (usuario) =>
        usuario.correo === correo
    );

    if (!usuario) {
      return res.status(401).json({
        message:
          'Correo o contraseña incorrectos'
      });
    }

    if (usuario.estado === 'bloqueado') {
      return res.status(403).json({
        message:
          'El usuario se encuentra bloqueado'
      });
    }

    const passwordCorrecta =
      await bcrypt.compare(
        password,
        usuario.password
      );

    if (!passwordCorrecta) {
      return res.status(401).json({
        message:
          'Correo o contraseña incorrectos'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
      },
      JWT_SECRET,
      {
        expiresIn: '1h'
      }
    );

    return res.status(200).json({
      message:
        'Inicio de sesión correcto',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        'Error al iniciar sesión'
    });
  }
};