import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Componentes y Páginas
import Navbar from './components/navbar'; 
import Home from './pages/home';
import Login from './pages/login';
import Registro from './pages/registro';
import Agendar from './pages/agendar';
import Perfil from './pages/perfil';
import Reportes from './pages/reportes';
import UsuariosPage from './pages/UsuariosPage';
import CitasPage from './pages/CitasPage';

import './css/css.css';
import './App.css';

const PrivateRoutes = ({ isLoggedIn }) => {
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/registro" element={<Registro />} />

          <Route element={<PrivateRoutes isLoggedIn={isLoggedIn} />}>
            <Route path="/agendar" element={<Agendar />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
            <Route path="/admin/citas" element={<CitasPage />} />
          </Route>

          <Route path="*" element={<div className="text-center p-20"><h2>404 - No Encontrado</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;