import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Registro from './pages/Registro';
import Login from './pages/Login';
import Archivos from './pages/Archivos';
import './App.css';
import Colecciones from './pages/Colecciones';
function App() {
  return (
    <BrowserRouter>

      <nav>
        <Link to="/registro">Registro</Link>
        {' | '}
        <Link to="/login">Login</Link>
        {' | '}
        <Link to="/archivos">Archivos</Link>
        {' | '}
        <Link to="/colecciones">Colecciones</Link>
      </nav>

      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/archivos" element={<Archivos />} />
        <Route path="/colecciones" element={<Colecciones />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;