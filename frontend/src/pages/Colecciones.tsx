import { useEffect, useState } from 'react';

interface Coleccion {
  id: number;
  nombre: string;
  archivos: number[];
}

interface Archivo {
  id: number;
  nombreOriginal: string;
}

function Colecciones() {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [colecciones, setColecciones] = useState<Coleccion[]>([]);
  const [archivos, setArchivos] = useState<Archivo[]>([]);

  const [archivoSeleccionado, setArchivoSeleccionado] =
    useState<Record<number, number | ''>>({});

  const obtenerColecciones = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/colecciones'
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setColecciones(datos);
      } else {
        setMensaje(
          datos.message || 'Error al obtener las colecciones'
        );
      }
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  const obtenerArchivos = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/archivos'
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setArchivos(datos);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerColecciones();
    obtenerArchivos();
  }, []);

  const crearColeccion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setMensaje(
        'Debe escribir un nombre para la colección'
      );
      return;
    }

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/colecciones',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: nombre.trim()
          })
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        setNombre('');
        await obtenerColecciones();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'No se pudo conectar con el servidor'
      );
    }
  };

  const editarColeccion = async (
    id: number,
    nombreActual: string
  ) => {
    const nuevoNombre = window.prompt(
      'Nuevo nombre de la colección:',
      nombreActual
    );

    if (!nuevoNombre || !nuevoNombre.trim()) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/colecciones/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre: nuevoNombre.trim()
          })
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerColecciones();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'Error al editar la colección'
      );
    }
  };

  const eliminarColeccion = async (
    id: number
  ) => {
    const confirmar = window.confirm(
      '¿Está seguro de eliminar esta colección?'
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/colecciones/${id}`,
        {
          method: 'DELETE'
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerColecciones();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'Error al eliminar la colección'
      );
    }
  };

  const agregarArchivo = async (
    coleccionId: number
  ) => {
    const archivoId =
      archivoSeleccionado[coleccionId];

    if (!archivoId) {
      setMensaje(
        'Debe seleccionar un archivo'
      );
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/colecciones/${coleccionId}/archivos`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            archivoId
          })
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        setArchivoSeleccionado(
          (estadoAnterior) => ({
            ...estadoAnterior,
            [coleccionId]: ''
          })
        );

        await obtenerColecciones();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'Error al agregar archivo'
      );
    }
  };

  const quitarArchivo = async (
    coleccionId: number,
    archivoId: number
  ) => {
    const confirmar = window.confirm(
      '¿Desea quitar este archivo de la colección?'
    );

    if (!confirmar) {
      return;
    }

    try {
      const respuesta = await fetch(
        `http://localhost:3000/api/colecciones/${coleccionId}/archivos/${archivoId}`,
        {
          method: 'DELETE'
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        await obtenerColecciones();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'Error al quitar archivo'
      );
    }
  };

  const obtenerNombreArchivo = (
    archivoId: number
  ) => {
    const archivo = archivos.find(
      (item) => item.id === archivoId
    );

    if (!archivo) {
      return `Archivo ${archivoId}`;
    }

    return archivo.nombreOriginal;
  };

  return (
    <div className="archivos-container">

      <div className="form-container">

        <h1>
          Mis colecciones
        </h1>

        <form onSubmit={crearColeccion}>

          <div className="form-group">

            <label>
              Nombre de la colección
            </label>

            <input
              type="text"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              placeholder="Ejemplo: Universidad"
              required
            />

          </div>

          <button type="submit">
            Crear colección
          </button>

          {mensaje && (
            <p
              style={{
                textAlign: 'center',
                marginTop: '15px'
              }}
            >
              {mensaje}
            </p>
          )}

        </form>

      </div>

      <div className="lista-archivos">

        <h2>
          Colecciones registradas
        </h2>

        {colecciones.length === 0 ? (

          <p>
            No hay colecciones registradas.
          </p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Archivos</th>
                <th>Agregar archivo</th>
                <th>Acciones</th>
              </tr>

            </thead>

            <tbody>

              {colecciones.map(
                (coleccion) => (

                  <tr key={coleccion.id}>

                    <td>
                      {coleccion.id}
                    </td>

                    <td>
                      {coleccion.nombre}
                    </td>

                    <td>

                      {coleccion.archivos.length === 0 ? (

                        <span>
                          Sin archivos
                        </span>

                      ) : (

                        coleccion.archivos.map(
                          (archivoId) => (

                            <div
                              key={archivoId}
                              className="archivo-coleccion"
                            >

                              <span>
                                {obtenerNombreArchivo(
                                  archivoId
                                )}
                              </span>

                              <button
                                type="button"
                                className="btn-eliminar"
                                onClick={() =>
                                  quitarArchivo(
                                    coleccion.id,
                                    archivoId
                                  )
                                }
                              >
                                Quitar
                              </button>

                            </div>

                          )
                        )

                      )}

                    </td>

                    <td>

                      <select
                        value={
                          archivoSeleccionado[
                            coleccion.id
                          ] ?? ''
                        }
                        onChange={(e) => {

                          const valor =
                            e.target.value;

                          setArchivoSeleccionado(
                            (estadoAnterior) => ({
                              ...estadoAnterior,

                              [coleccion.id]:
                                valor === ''
                                  ? ''
                                  : Number(valor)
                            })
                          );

                        }}
                      >

                        <option value="">
                          Seleccionar archivo
                        </option>

                        {archivos.map(
                          (archivo) => (

                            <option
                              key={archivo.id}
                              value={archivo.id}
                            >
                              {
                                archivo.nombreOriginal
                              }
                            </option>

                          )
                        )}

                      </select>

                      <button
                        type="button"
                        className="btn-ver"
                        onClick={() =>
                          agregarArchivo(
                            coleccion.id
                          )
                        }
                      >
                        Agregar
                      </button>

                    </td>

                    <td>

                      <button
                        type="button"
                        className="btn-ver"
                        onClick={() =>
                          editarColeccion(
                            coleccion.id,
                            coleccion.nombre
                          )
                        }
                      >
                        Editar
                      </button>

                      {' '}

                      <button
                        type="button"
                        className="btn-eliminar"
                        onClick={() =>
                          eliminarColeccion(
                            coleccion.id
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Colecciones;