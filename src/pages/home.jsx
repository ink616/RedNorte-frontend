import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css';

const Home = ({ isLoggedIn }) => {
  return (
    <div className="home-page">
      {/* Sección Hero (Inspirada en la imagen) */}
      <header className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Atención Médica <br /></h1>
            <p>Tecnología de última generación para diagnósticos más certeros, en menos tiempo y al mismo precio.</p>
            <button className="btn-secondary">Más Información</button>
          </div>
          <div className="hero-image">
            {/* Aquí va la imagen del doctor/resonador */}
            <img src="https://via.placeholder.com/600x400?text=Imagen+Clinica" alt="Servicios Médicos" />
          </div>
        </div>
      </header>

      {/* Sección de Botones Inferiores (Accesos Directos) */}
      <section className="shortcuts-container">
        <div className="shortcuts-grid">
          
          <Link to="/agendar" className="shortcut-card highlight">
            <div className="shortcut-icon">📅</div>
            <h3>Reservar hora</h3>
          </Link>

          <Link to="/contacto" className="shortcut-card">
            <div className="shortcut-icon">📞</div>
            <h3>Contacto</h3>
          </Link>

          <Link to="/nosotros" className="shortcut-card">
            <div className="shortcut-icon">🏥</div>
            <h3>Nosotros</h3>
          </Link>

          {/* Solo aparece si el usuario ingresó sus datos */}
          {isLoggedIn && (
            <Link to="/perfil" className="shortcut-card profile-card">
              <div className="shortcut-icon">👤</div>
              <h3>Mi Perfil</h3>
            </Link>
          )}

        </div>
      </section>
    </div>
  );
};

export default Home;