import { useEffect, useState } from 'react';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

interface Archivo {
  id: number;
  nombreOriginal: string;
  tipo: string;
  tamanio: number;
  fechaSubida: string;
  estado: string;
}

function Administracion() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [mensaje, setMensaje] = useState('');

  const token = localStorage.getItem('token');

  const obtenerUsuarios = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/admin/usuarios',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setUsuarios(datos);
      } else {
        setMensaje(datos.message);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al obtener usuarios');
    }
  };

  const obtenerArchivos = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/admin/archivos',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setArchivos(datos);
      } else {
        setMensaje(datos.message);
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al obtener archivos');
    }
  };

  useEffect(() => {
    obtenerUsuarios();
    obtenerArchivos();
  }, []);

  const cambiarEstadoUsuario = async (id: number) => {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/admin/usuarios/${id}/estado`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerUsuarios();
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al cambiar estado del usuario');
    }
  };

  const cambiarEstadoArchivo = async (id: number) => {
    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/admin/archivos/${id}/estado`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerArchivos();
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al cambiar estado del archivo');
    }
  };

  const eliminarArchivo = async (id: number) => {
    const confirmar = window.confirm(
      '¿Está seguro de eliminar este archivo?'
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/admin/archivos/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerArchivos();
      }
    } catch (error) {
      console.error(error);
      setMensaje('Error al eliminar archivo');
    }
  };

  return (
    <div className="archivos-container">

      <div className="lista-archivos">

        <h1>Panel de administración</h1>

        {mensaje && (
          <p style={{ textAlign: 'center' }}>
            {mensaje}
          </p>
        )}

        <h2>Usuarios</h2>

        {usuarios.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>

                  <td>{usuario.id}</td>

                  <td>{usuario.nombre}</td>

                  <td>{usuario.correo}</td>

                  <td>{usuario.rol}</td>

                  <td>{usuario.estado}</td>

                  <td>
                    {usuario.rol !== 'admin' && (
                      <button
                        type="button"
                        className="btn-ver"
                        onClick={() =>
                          cambiarEstadoUsuario(usuario.id)
                        }
                      >
                        {usuario.estado === 'activo'
                          ? 'Bloquear'
                          : 'Desbloquear'}
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 style={{ marginTop: '40px' }}>
          Archivos
        </h2>

        {archivos.length === 0 ? (
          <p>No hay archivos registrados.</p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {archivos.map((archivo) => (
                <tr key={archivo.id}>

                  <td>{archivo.id}</td>

                  <td>{archivo.nombreOriginal}</td>

                  <td>{archivo.tipo}</td>

                  <td>{archivo.estado}</td>

                  <td>

                    <button
                      type="button"
                      className="btn-ver"
                      onClick={() =>
                        cambiarEstadoArchivo(archivo.id)
                      }
                    >
                      {archivo.estado === 'activo'
                        ? 'Restringir'
                        : 'Habilitar'}
                    </button>

                    {' '}

                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() =>
                        eliminarArchivo(archivo.id)
                      }
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
}

export default Administracion;