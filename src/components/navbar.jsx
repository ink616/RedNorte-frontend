import React from 'react';
import { Link } from 'react-router-dom';
import '../css/css.css'; // Tu archivo de estilos globales

const Navbar = ({ isLoggedIn }) => {
  return (
    <nav className="navbar">
      {/* Izquierda: Logo */}
      <div className="navbar-logo">
        <Link to="/">
          <img src="https://via.placeholder.com/150x50?text=Clinica+Logo" alt="Logo" />
        </Link>
      </div>

      {/* Centro: Enlaces dinámicos */}
      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
        <li><Link to="/contacto">Contacto</Link></li>
        
        {/* Renderizado condicional según tu petición */}
        {isLoggedIn && (
          <>
            <li><Link to="/notificaciones">Notificaciones</Link></li>
            <li><Link to="/reportes">Reportes</Link></li>
          </>
        )}
      </ul>

      {/* Derecha: Acciones */}
      <div className="navbar-cta">
        {!isLoggedIn ? (
          <Link to="/login" className="btn-login-text">Iniciar Sesión</Link>
        ) : (
          <Link to="/perfil" className="btn-perfil-link">👤 Mi Perfil</Link>
        )}
        <Link to="/agendar" className="btn-cita">Pedir Cita</Link>
      </div>
    </nav>
  );
};

export default Navbar;