import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/navbar.css';

const Navbar = () => {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/"><h1>Red<span>Norte</span></h1></Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        {!usuario && <li><Link to="/nosotros">Nosotros</Link></li>}
        {!usuario && <li><Link to="/contacto">Contacto</Link></li>}

        {usuario && !esAdmin && (
          <>
            <li><Link to="/mis-consultas">Mis consultas</Link></li>
            <li><Link to="/nueva-consulta">Nueva consulta</Link></li>
          </>
        )}

        {esAdmin && (
          <>
            <li><Link to="/admin/dashboard">Panel</Link></li>
            <li><Link to="/admin/consultas">Consultas</Link></li>
            <li><Link to="/admin/usuarios">Usuarios</Link></li>
            <li><Link to="/admin/citas">Citas</Link></li>
          </>
        )}
      </ul>

      <div className="navbar-auth">
        {usuario ? (
          <button onClick={handleLogout} className="btn-primary">
            Cerrar sesión
          </button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Entrar</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
