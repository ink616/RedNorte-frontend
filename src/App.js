import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar        from './components/navbar';
import Home          from './pages/home';
import Login         from './pages/login';
import MisConsultas  from './pages/MisConsultas';
import NuevaConsulta from './pages/NuevaConsulta';
import EditarConsulta from './pages/EditarConsulta';
import AdminDashboard from './pages/AdminDashboard';
import CitasPage     from './pages/CitasPage';
import UsuariosPage  from './pages/UsuariosPage';

import './css/css.css';
import './App.css';

// Rutas protegidas — requieren estar logueado
const RutaPrivada = () => {
  const { usuario } = useAuth();
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
};

// Rutas solo para admin
const RutaAdmin = () => {
  const { usuario, esAdmin } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/mis-consultas" replace />;
  return <Outlet />;
};

// Ruta pública — si ya está logueado, redirige al inicio correspondiente
const RutaPublica = ({ children }) => {
  const { usuario, esAdmin } = useAuth();
  if (usuario) return <Navigate to={esAdmin ? '/admin/dashboard' : '/mis-consultas'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />

          {/* Paciente */}
          <Route element={<RutaPrivada />}>
            <Route path="/mis-consultas"       element={<MisConsultas />} />
            <Route path="/nueva-consulta"      element={<NuevaConsulta />} />
            <Route path="/editar-consulta/:id" element={<EditarConsulta />} />
          </Route>

          {/* Admin */}
          <Route element={<RutaAdmin />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/consultas" element={<CitasPage />} />
            <Route path="/admin/citas"     element={<CitasPage />} />
            <Route path="/admin/usuarios"  element={<UsuariosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
