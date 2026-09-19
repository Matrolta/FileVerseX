-- ============================================================
-- BASE DE DATOS: FileVerseX
-- ============================================================

CREATE DATABASE IF NOT EXISTS FileVerseX_DB;
USE FileVerseX_DB;

-- ------------------------------------------------------------
-- 1. MÓDULO DE USUARIOS, ROLES Y PERMISOS (RBAC)
-- ------------------------------------------------------------

CREATE TABLE Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE Permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE Rol_Permisos (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES Permisos(id_permiso) ON DELETE CASCADE
);

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL DEFAULT 2, -- Rol 2: Usuario Estándar por defecto
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    descripcion TEXT,
    foto_perfil VARCHAR(255) DEFAULT 'default_profile.png',
    esta_bloqueado BOOLEAN DEFAULT FALSE, -- Estado de bloqueo del usuario
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES Roles(id_rol) ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- 2. MÓDULO DE GESTIÓN DE ARCHIVOS Y COLECCIONES
-- ------------------------------------------------------------

CREATE TABLE Archivos (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_almacenamiento VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL, -- ej: image/png, audio/mp3, video/mp4, application/pdf
    tamano_bytes BIGINT NOT NULL,
    contador_descargas INT DEFAULT 0,
    estado ENUM('activo', 'restringido', 'eliminado') DEFAULT 'activo', -- Estado del archivo
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Colecciones (
    id_coleccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla intermedia M:N (Un archivo puede estar en varias colecciones)
CREATE TABLE Coleccion_Archivos (
    id_coleccion INT NOT NULL,
    id_archivo INT NOT NULL,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_coleccion, id_archivo),
    FOREIGN KEY (id_coleccion) REFERENCES Colecciones(id_coleccion) ON DELETE CASCADE,
    FOREIGN KEY (id_archivo) REFERENCES Archivos(id_archivo) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. MÓDULO DE PUBLICACIONES, SOCIAL Y TRAZABILIDAD
-- ------------------------------------------------------------

CREATE TABLE Publicaciones (
    id_publicacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_archivo INT NULL,
    id_coleccion INT NULL,
    alcance ENUM('publica', 'dirigida', 'privada') NOT NULL DEFAULT 'privada',
    es_activa BOOLEAN DEFAULT TRUE,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_archivo) REFERENCES Archivos(id_archivo) ON DELETE CASCADE,
    FOREIGN KEY (id_coleccion) REFERENCES Colecciones(id_coleccion) ON DELETE CASCADE,
    CONSTRAINT chk_publicacion_tipo CHECK (
        (id_archivo IS NOT NULL AND id_coleccion IS NULL) OR 
        (id_archivo IS NULL AND id_coleccion IS NOT NULL)
    )
);

-- Destinatarios para publicaciones de alcance 'dirigida'
CREATE TABLE Publicacion_Destinatarios (
    id_publicacion INT NOT NULL,
    id_usuario_destinatario INT NOT NULL,
    PRIMARY KEY (id_publicacion, id_usuario_destinatario),
    FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_destinatario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Likes (
    id_like INT AUTO_INCREMENT PRIMARY KEY,
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_like DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuario_publicacion_like (id_publicacion, id_usuario),
    FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Comentarios (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_publicacion INT NOT NULL,
    id_usuario INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

-- Trazabilidad de cambios de alcance y destinatarios
CREATE TABLE Historial_Publicaciones (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_publicacion INT NOT NULL,
    alcance_anterior ENUM('publica', 'dirigida', 'privada') NOT NULL,
    alcance_nuevo ENUM('publica', 'dirigida', 'privada') NOT NULL,
    likes_acumulados INT DEFAULT 0,
    comentarios_acumulados INT DEFAULT 0,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_publicacion) REFERENCES Publicaciones(id_publicacion) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. ÍNDICES DE OPTIMIZACIÓN
-- ------------------------------------------------------------

CREATE INDEX idx_archivos_usuario ON Archivos(id_usuario);
CREATE INDEX idx_archivos_estado ON Archivos(estado);
CREATE INDEX idx_publicaciones_alcance ON Publicaciones(alcance, es_activa);
CREATE INDEX idx_likes_publicacion ON Likes(id_publicacion);
CREATE INDEX idx_comentarios_publicacion ON Comentarios(id_publicacion);

-- ------------------------------------------------------------
-- 5. DATOS INICIALES (SEEDING)
-- ------------------------------------------------------------

INSERT INTO Roles (id_rol, nombre, descripcion) VALUES 
(1, 'ADMINISTRADOR', 'Acceso total a moderación, gestión de usuarios y sistema'),
(2, 'USUARIO', 'Usuario estándar de la plataforma');

INSERT INTO Permisos (nombre, descripcion) VALUES 
('MODERAR_CONTENIDO', 'Eliminar archivos, colecciones o comentarios de otros usuarios'),
('GESTIONAR_USUARIOS', 'Bloquear o restablecer contraseñas de usuarios');

INSERT INTO Rol_Permisos (id_rol, id_permiso) VALUES (1, 1), (1, 2);

-- Insertar usuario Administrador inicial (password encriptada de ejemplo)
INSERT INTO Usuarios (id_rol, nombre_completo, email, password_hash, descripcion, esta_bloqueado) VALUES 
(1, 'Administrador FileVerseX', 'admin@fileversex.com', '$2b$10$e8p.y.vK4W5pY9xO8d9e0uXmZJ8O8d9e0uXmZJ8O8d9e0uXmZJ', 'Cuenta Administradora Principal', FALSE);
