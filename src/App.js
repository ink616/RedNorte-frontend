import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar Componentes
import Navbar from './components/navbar'; 

// Importar Páginas
import Home from './pages/home';
import Login from './pages/login';
import Registro from './pages/registro';
import Agendar from './pages/agendar';
import Perfil from './pages/perfil';
import Reportes from './pages/reportes';

// CSS Global
import './css/css.css';
import './App.css';

function App() {
  // Estado global para controlar si el usuario inició sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      {/* El Navbar recibe el estado para cambiar sus botones (Entrar vs Cerrar Sesión) */}
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          
          {/* Páginas de acceso con lógica de estado */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/registro" element={<Registro />} />
          
          {/* Rutas funcionales */}
          <Route path="/agendar" element={<Agendar />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/reportes" element={<Reportes />} />
          
          <Route path="*" element={<div style={{textAlign: 'center', padding: '100px'}}><h2>404 - No Encontrado</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;