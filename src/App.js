import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar Componentes Globales
import Navbar from './components/navbar'; 
// Asegúrate de que el nombre del archivo coincida exactamente con tus mayúsculas/minúsculas

// Importar Páginas
import Home from './pages/home';
import Agendar from './pages/agendar';
import Contacto from './pages/contacto';
import Login from './pages/login';
import Nosotros from './pages/nosotros';
import Notificaciones from './pages/notificaciones';
import Perfil from './pages/perfil';
import Registro from './pages/registro';
import Reportes from './pages/reportes';

// Importar CSS Global (si es que tienes configuraciones ahí)
import './App.css';

function App() {
  return (
    <Router>
      {/* Colocamos el Navbar fuera de <Routes> para que aparezca en todas las páginas */}
      <Navbar />

      <div className="main-content">
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<Home />} />
          
          {/* Rutas públicas */}
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas privadas (ideales para usuarios registrados) */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/reportes" element={<Reportes />} />
          
          {/* Ruta 404 - Opcional, por si el usuario escribe una URL que no existe */}
          <Route path="*" element={<div style={{textAlign: 'center', padding: '50px'}}><h2>404 - Página no encontrada</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
