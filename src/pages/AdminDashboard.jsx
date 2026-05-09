import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Home.css'; // Reutilizamos estilos de Home para consistencia

const AdminDashboard = () => {
  return (
    <div className="home-page admin-home">
      <header className="hero-container">
        <div className="hero-content">
          <h1>Panel de Control <br /> Administrativo</h1>
          <p>Bienvenido. Desde aquí puedes gestionar la integridad de los datos, usuarios y la disponibilidad de la agenda médica.</p>
        </div>
      </header>

      <section className="shortcuts-container">
        <div className="shortcuts-grid">
          <Link to="/admin/usuarios" className="shortcut-card highlight">
            <div className="shortcut-icon">👥</div>
            <h3>Gestión de Usuarios</h3>
            <p>Listar, editar y eliminar cuentas.</p>
          </Link>

          <Link to="/admin/citas" className="shortcut-card">
            <div className="shortcut-icon">📅</div>
            <h3>Gestión de Citas</h3>
            <p>Control de agenda y reasignaciones.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;