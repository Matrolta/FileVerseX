import { useState } from 'react';

function Login() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const respuesta = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo,
            password
          })
        }
      );

const datos = await respuesta.json();

if (respuesta.ok) {
  setMensaje(datos.message);

  localStorage.setItem('token', datos.token);

  localStorage.setItem(
    'usuario',
    JSON.stringify(datos.usuario)
  );

} else {
  setMensaje(datos.message || 'Error al iniciar sesión');
}

    } catch (error) {
      console.error(error);
      setMensaje('No se pudo conectar con el servidor');
    }
  };

  return (
    <div className="form-container">
      <h1>Iniciar sesión</h1>

      <form onSubmit={iniciarSesion}>
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
            placeholder="Ingrese su contraseña"
            required
          />
        </div>

        <button type="submit">
          Iniciar sesión
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

export default Login;