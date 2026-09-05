import { useEffect, useState } from 'react';

interface Archivo {
  id: number;
  nombreOriginal: string;
  nombreGuardado: string;
  tipo: string;
  tamanio: number;
  fechaSubida: string;
}

function Archivos() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [archivoVista, setArchivoVista] = useState<Archivo | null>(null);

  const obtenerArchivos = async () => {
    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/archivos'
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setArchivos(datos);
      } else {
        setMensaje('Error al obtener los archivos');
      }
    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  useEffect(() => {
    obtenerArchivos();
  }, []);

  const subirArchivo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo) {
      setMensaje('Debe seleccionar un archivo');
      return;
    }

    const formData = new FormData();

    formData.append('archivo', archivo);

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/archivos/subir',
        {
          method: 'POST',
          body: formData
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(datos.message);
        setArchivo(null);

        await obtenerArchivos();
      } else {
        setMensaje(
          datos.message || 'Error al subir archivo'
        );
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'No se pudo conectar con el servidor'
      );
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
        `http://localhost:3000/api/archivos/${id}`,
        {
          method: 'DELETE'
        }
      );

      const datos = await respuesta.json();

      setMensaje(datos.message);

      if (respuesta.ok) {
        if (archivoVista?.id === id) {
          setArchivoVista(null);
        }

        await obtenerArchivos();
      }
    } catch (error) {
      console.error(error);

      setMensaje(
        'Error al eliminar archivo'
      );
    }
  };

  const convertirTamanio = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };

  const obtenerUrlArchivo = (item: Archivo) => {
    return `http://localhost:3000/uploads/${item.nombreGuardado}`;
  };

  return (
    <div className="archivos-container">

      <div className="form-container">

        <h1>Mis archivos</h1>

        <form onSubmit={subirArchivo}>

          <div className="form-group">

            <label>
              Seleccionar archivo
            </label>

            <input
              type="file"
              onChange={(e) => {
                if (
                  e.target.files &&
                  e.target.files.length > 0
                ) {
                  setArchivo(
                    e.target.files[0]
                  );
                }
              }}
            />

          </div>

          <button type="submit">
            Subir archivo
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
          Archivos registrados
        </h2>

        {archivos.length === 0 ? (

          <p>
            No hay archivos registrados.
          </p>

        ) : (

          <table>

            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Fecha de subida</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {archivos.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.nombreOriginal}
                  </td>

                  <td>
                    {item.tipo}
                  </td>

                  <td>
                    {convertirTamanio(
                      item.tamanio
                    )}
                  </td>

                  <td>
                    {new Date(
                      item.fechaSubida
                    ).toLocaleString()}
                  </td>

                  <td>

                    <button
                      type="button"
                      className="btn-ver"
                      onClick={() =>
                        setArchivoVista(item)
                      }
                    >
                      Ver
                    </button>

                    {' '}

                    <a
                      href={obtenerUrlArchivo(item)}
                      download={item.nombreOriginal}
                      className="btn-descargar"
                    >
                      Descargar
                    </a>

                    {' '}

                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() =>
                        eliminarArchivo(item.id)
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

        {archivoVista && (

          <div className="vista-previa">

            <div className="vista-previa-header">

              <h3>
                {archivoVista.nombreOriginal}
              </h3>

              <button
                type="button"
                className="btn-cerrar"
                onClick={() =>
                  setArchivoVista(null)
                }
              >
                Cerrar
              </button>

            </div>

            {archivoVista.tipo.startsWith('image/') && (

              <img
                src={obtenerUrlArchivo(archivoVista)}
                alt={archivoVista.nombreOriginal}
                className="preview-image"
              />

            )}

            {archivoVista.tipo.startsWith('audio/') && (

              <audio
                controls
                className="preview-media"
              >
                <source
                  src={obtenerUrlArchivo(archivoVista)}
                  type={archivoVista.tipo}
                />

                Su navegador no soporta audio.
              </audio>

            )}

            {archivoVista.tipo.startsWith('video/') && (

              <video
                controls
                className="preview-video"
              >
                <source
                  src={obtenerUrlArchivo(archivoVista)}
                  type={archivoVista.tipo}
                />

                Su navegador no soporta video.
              </video>

            )}

            {archivoVista.tipo === 'application/pdf' && (

              <iframe
                src={obtenerUrlArchivo(archivoVista)}
                title={archivoVista.nombreOriginal}
                className="preview-pdf"
              />

            )}

            {!archivoVista.tipo.startsWith('image/') &&
              !archivoVista.tipo.startsWith('audio/') &&
              !archivoVista.tipo.startsWith('video/') &&
              archivoVista.tipo !== 'application/pdf' && (

                <div className="sin-preview">

                  <p>
                    Este tipo de archivo no puede
                    previsualizarse directamente.
                  </p>

                  <a
                    href={obtenerUrlArchivo(archivoVista)}
                    download={archivoVista.nombreOriginal}
                  >
                    Descargar archivo
                  </a>

                </div>

              )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Archivos;