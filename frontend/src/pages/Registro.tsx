import { useState } from 'react';

function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/auth/registro',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre,
            correo,
            password,
            descripcion
          })
        }
      );

      const datos = await respuesta.json();

      if (respuesta.ok) {
        setMensaje(datos.message);

        setNombre('');
        setCorreo('');
        setPassword('');
        setDescripcion('');
      } else {
        setMensaje(datos.message || 'Error al registrar usuario');
      }

    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="form-container">
      <h1>Registro de usuario</h1>

      <form onSubmit={registrar}>

        <div className="form-group">
          <label>Nombre</label>

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
            required
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>

          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese una contraseña"
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción personal</label>

          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Escriba una breve descripción"
          />
        </div>

        <div className="form-group">
          <label>Foto de perfil</label>

          <input
            type="file"
            accept="image/*"
          />
        </div>

        <button type="submit">
          Registrarse
        </button>

        {mensaje && (
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            {mensaje}
          </p>
        )}

      </form>
    </div>
  );
}

export default Registro;