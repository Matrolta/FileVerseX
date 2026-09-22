USE FileVerseX_DB;

-- ============================================================
-- 1. TRIGGER: REGISTRO AUTOMÁTICO EN HISTORIAL AL CAMBIAR ALCANSE
-- ============================================================
DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_publicacion_cambio_alcance
BEFORE UPDATE ON Publicaciones
FOR EACH ROW
BEGIN
    IF OLD.alcance <> NEW.alcance THEN
        INSERT INTO Historial_Publicaciones (
            id_publicacion,
            alcance_anterior,
            alcance_nuevo,
            likes_acumulados,
            comentarios_acumulados,
            fecha_cambio
        )
        VALUES (
            OLD.id_publicacion,
            OLD.alcance,
            NEW.alcance,
            (SELECT COUNT(*) FROM Likes WHERE id_publicacion = OLD.id_publicacion),
            (SELECT COUNT(*) FROM Comentarios WHERE id_publicacion = OLD.id_publicacion),
            NOW()
        );
    END IF;
END;
//

DELIMITER ;

-- ============================================================
-- 2. VISTAS PARA EL PANEL DE ADMINISTRACIÓN (DASHBOARD)
-- ============================================================

-- A. Indicadores Globales (KPIs)
CREATE OR REPLACE VIEW vista_dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM Usuarios WHERE esta_bloqueado = FALSE) AS total_usuarios_activos,
    (SELECT COUNT(*) FROM Usuarios WHERE esta_bloqueado = TRUE) AS total_usuarios_bloqueados,
    (SELECT COUNT(*) FROM Archivos WHERE estado = 'activo') AS total_archivos_activos,
    (SELECT COUNT(*) FROM Archivos WHERE estado = 'restringido') AS total_archivos_restringidos,
    (SELECT COALESCE(SUM(tamano_bytes), 0) FROM Archivos WHERE estado != 'eliminado') AS almacenamiento_total_bytes,
    (SELECT COALESCE(SUM(contador_descargas), 0) FROM Archivos) AS total_descargas,
    (SELECT COUNT(*) FROM Publicaciones WHERE es_activa = TRUE) AS total_publicaciones_activas,
    (SELECT COUNT(*) FROM Likes) AS total_likes,
    (SELECT COUNT(*) FROM Comentarios) AS total_comentarios;

-- B. Métricas por Usuario (Resumen de actividad individual)
CREATE OR REPLACE VIEW vista_metricas_usuarios AS
SELECT 
    u.id_usuario,
    u.nombre_completo,
    u.email,
    r.nombre AS rol,
    u.esta_bloqueado,
    COUNT(DISTINCT a.id_archivo) AS total_archivos,
    COALESCE(SUM(a.tamano_bytes), 0) AS almacenamiento_usado_bytes,
    COALESCE(SUM(a.contador_descargas), 0) AS descargas_acumuladas,
    COUNT(DISTINCT p.id_publicacion) AS total_publicaciones,
    COUNT(DISTINCT c.id_comentario) AS total_comentarios_realizados,
    COUNT(DISTINCT l.id_like) AS total_likes_dados
FROM Usuarios u
INNER JOIN Roles r ON u.id_rol = r.id_rol
LEFT JOIN Archivos a ON u.id_usuario = a.id_usuario AND a.estado != 'eliminado'
LEFT JOIN Publicaciones p ON u.id_usuario = p.id_usuario
LEFT JOIN Comentarios c ON u.id_usuario = c.id_usuario
LEFT JOIN Likes l ON u.id_usuario = l.id_usuario
GROUP BY u.id_usuario, u.nombre_completo, u.email, r.nombre, u.esta_bloqueado;

-- C. Archivos más descargados
CREATE OR REPLACE VIEW vista_top_archivos_descargados AS
SELECT 
    a.id_archivo,
    a.nombre_original,
    a.tipo_mime,
    a.tamano_bytes,
    a.contador_descargas,
    a.estado,
    u.id_usuario AS id_propietario,
    u.nombre_completo AS nombre_propietario
FROM Archivos a
INNER JOIN Usuarios u ON a.id_usuario = u.id_usuario
WHERE a.estado != 'eliminado'
ORDER BY a.contador_descargas DESC;

-- ============================================================
-- 3. VISTAS DE FEED Y AUDITORÍA DE TRAZABILIDAD
-- ============================================================

-- A. Publicaciones Públicas (Filtra contenido privado/dirigido)
CREATE OR REPLACE VIEW vista_publicaciones_publicas AS
SELECT 
    p.id_publicacion,
    p.id_usuario AS id_autor,
    u.nombre_completo AS nombre_autor,
    u.foto_perfil AS foto_autor,
    p.id_archivo,
    p.id_coleccion,
    p.alcance,
    p.fecha_publicacion,
    COUNT(DISTINCT l.id_like) AS total_likes,
    COUNT(DISTINCT c.id_comentario) AS total_comentarios
FROM Publicaciones p
INNER JOIN Usuarios u ON p.id_usuario = u.id_usuario
LEFT JOIN Likes l ON p.id_publicacion = l.id_publicacion
LEFT JOIN Comentarios c ON p.id_publicacion = c.id_comentario
WHERE p.alcance = 'publica' 
  AND p.es_activa = TRUE
  AND u.esta_bloqueado = FALSE
GROUP BY p.id_publicacion, p.id_usuario, u.nombre_completo, u.foto_perfil, p.id_archivo, p.id_coleccion, p.alcance, p.fecha_publicacion;

-- B. Trazabilidad del Historial
CREATE OR REPLACE VIEW vista_trazabilidad_historial AS
SELECT 
    hp.id_historial,
    hp.id_publicacion,
    u.id_usuario,
    u.nombre_completo AS usuario,
    u.email,
    hp.alcance_anterior,
    hp.alcance_nuevo,
    hp.likes_acumulados,
    hp.comentarios_acumulados,
    hp.fecha_cambio,
    COALESCE(a.nombre_original, col.nombre, 'Contenido General') AS recurso_asociado
FROM Historial_Publicaciones hp
INNER JOIN Publicaciones p ON hp.id_publicacion = p.id_publicacion
INNER JOIN Usuarios u ON p.id_usuario = u.id_usuario
LEFT JOIN Archivos a ON p.id_archivo = a.id_archivo
LEFT JOIN Colecciones col ON p.id_coleccion = col.id_coleccion;
