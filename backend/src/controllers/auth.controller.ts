import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'fileversex_clave_secreta';

// 1. REGISTRAR USUARIO CON MYSQL
export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      correo,
      password,
      descripcion,
      fotoPerfil
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message: 'Nombre, correo y contraseña son obligatorios'
      });
    }

    // Validar tamaño de contraseña
    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }

    // Validar formato (letra y número)
    const tieneLetra = /[A-Za-z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);

    if (!tieneLetra || !tieneNumero) {
      return res.status(400).json({
        message: 'La contraseña debe contener al menos una letra y un número'
      });
    }

    // Verificar en MySQL si el correo ya existe
    const [usuariosExistentes]: any = await db.query(
      'SELECT id_usuario FROM Usuarios WHERE email = ?',
      [correo.toLowerCase()]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(400).json({
        message: 'El correo ya está registrado'
      });
    }

    // Cifrar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar usuario en MySQL (id_rol = 2 es USUARIO Estándar según schema.sql)
    const [resultado]: any = await db.query(
      `INSERT INTO Usuarios (id_rol, nombre_completo, email, password_hash, descripcion, foto_perfil)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        2, // Rol de Usuario Estándar
        nombre,
        correo.toLowerCase(),
        passwordHash,
        descripcion || null,
        fotoPerfil || 'default_profile.png'
      ]
    );

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id: resultado.insertId,
        nombre,
        correo,
        descripcion,
        fotoPerfil: fotoPerfil || 'default_profile.png',
        rol: 'USUARIO',
        estado: 'activo'
      }
    });
  } catch (error) {
    console.error('Error en registrarUsuario:', error);
    return res.status(500).json({
      message: 'Error al registrar usuario en la base de datos'
    });
  }
};

// 2. INICIAR SESIÓN CON MYSQL
export const iniciarSesion = async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: 'Correo y contraseña son obligatorios'
      });
    }

    // Consultar usuario uniendo la tabla Roles para saber si es ADMINISTRADOR o USUARIO
    const [rows]: any = await db.query(
      `SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.esta_bloqueado, r.nombre AS nombre_rol
       FROM Usuarios u
       INNER JOIN Roles r ON u.id_rol = r.id_rol
       WHERE u.email = ?`,
      [correo.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      });
    }

    const usuario = rows[0];

    if (usuario.esta_bloqueado) {
      return res.status(403).json({
        message: 'El usuario se encuentra bloqueado'
      });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordCorrecta) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos'
      });
    }

    // Generar Token JWT con el id y rol desde la base de datos
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        correo: usuario.email,
        rol: usuario.nombre_rol
      },
      JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    return res.status(200).json({
      message: 'Inicio de sesión correcto',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_completo,
        correo: usuario.email,
        rol: usuario.nombre_rol,
        estado: usuario.esta_bloqueado ? 'bloqueado' : 'activo'
      }
    });
  } catch (error) {
    console.error('Error en iniciarSesion:', error);
    return res.status(500).json({
      message: 'Error al iniciar sesión'
    });
  }
};
