import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/navbar.css';

const Navbar = ({ isLoggedIn }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCitaClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  const goTo = (path) => {
    setShowModal(false);
    navigate(path);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/"><h1>RED<span>NORTE</span></h1></Link>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/nosotros">Nosotros</Link></li>
        </ul>
        <div className="navbar-cta">
          {!isLoggedIn && <Link to="/login" className="btn-login-text">Entrar</Link>}
          <Link to="/agendar" onClick={handleCitaClick} className="btn-cita">
            Pedir Cita
          </Link>
        </div>
      </nav>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon">⚠️</div>
            <h2>Acceso Restringido</h2>
            <p>Para agendar una hora médica, primero debes ingresar a tu cuenta.</p>
            <div className="modal-buttons">
              <button onClick={() => goTo('/login')} className="btn-modal-login">Iniciar Sesión</button>
              <button onClick={() => goTo('/registro')} className="btn-modal-register">Registrarse</button>
            </div>
            <button onClick={() => setShowModal(false)} className="btn-modal-close">Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;