import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import Navbar                from './components/Navbar';
import HomePage              from './pages/HomePage';
import LoginPage             from './pages/LoginPage';
import RegistroPage          from './pages/RegistroPage';
import SobreNosotrosPage     from './pages/SobreNosotrosPage';
import MisConsultasPage      from './pages/MisConsultasPage';
import NuevaConsultaPage     from './pages/NuevaConsultaPage';
import EditarConsultaPage    from './pages/EditarConsultaPage';
import PerfilPage            from './pages/PerfilPage';
import AdminDashboard        from './pages/AdminDashboard';
import AdminConsultasPage    from './pages/AdminConsultasPage';
import AdminUsuariosPage     from './pages/AdminUsuariosPage';
import AdminReasignacionPage from './pages/AdminReasignacionPage';
import DoctorDashboard       from './pages/DoctorDashboard';
import NotFoundPage          from './pages/NotFoundPage';

const RutaPrivada = () => {
  const { usuario } = useAuth();
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
};

const RutaAdmin = () => {
  const { usuario, esAdmin } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esAdmin) return <Navigate to="/mis-consultas" replace />;
  return <Outlet />;
};

const RutaDoctor = () => {
  const { usuario, esDoctor } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  if (!esDoctor) return <Navigate to="/mis-consultas" replace />;
  return <Outlet />;
};

const RutaPublica = ({ children }) => {
  const { usuario, esAdmin, esDoctor } = useAuth();
  if (usuario) {
    if (esAdmin) return <Navigate to="/admin/dashboard" replace />;
    if (esDoctor) return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/mis-consultas" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/inicio"         element={<HomePage />} />
        <Route path="/sobre-nosotros" element={<SobreNosotrosPage />} />
        <Route path="/login"          element={<RutaPublica><LoginPage /></RutaPublica>} />
        <Route path="/registro"       element={<RutaPublica><RegistroPage /></RutaPublica>} />

        <Route element={<RutaPrivada />}>
          <Route path="/mis-consultas"       element={<MisConsultasPage />} />
          <Route path="/nueva-consulta"      element={<NuevaConsultaPage />} />
          <Route path="/editar-consulta/:id" element={<EditarConsultaPage />} />
          <Route path="/perfil"              element={<PerfilPage />} />
        </Route>

        <Route element={<RutaAdmin />}>
          <Route path="/admin/dashboard"    element={<AdminDashboard />} />
          <Route path="/admin/consultas"    element={<AdminConsultasPage />} />
          <Route path="/admin/usuarios"     element={<AdminUsuariosPage />} />
          <Route path="/admin/reasignacion" element={<AdminReasignacionPage />} />
        </Route>

        <Route element={<RutaDoctor />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/perfil"    element={<PerfilPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
