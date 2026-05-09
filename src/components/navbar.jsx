import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">RedNorte</Link>
      </div>
      
      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/nosotros">Nosotros</Link></li>
        <li><Link to="/contacto">Contacto</Link></li>

        {isLoggedIn && (
          <>
            <li><Link to="/notificaciones">Notificaciones</Link></li>
            <li><Link to="/reportes">Reportes</Link></li>
            <li><Link to="/perfil">Perfil</Link></li>
          </>
        )}
      </ul>

      <div className="navbar-auth">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">Entrar</Link>
            <Link to="/registro" className="btn-register">Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;