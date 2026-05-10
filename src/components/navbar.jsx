import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { cerrarSesion(); navigate('/login'); };

  const linkClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🏥 Red<span>Norte</span>
      </Link>

      <ul className="navbar-links">
        <li><NavLink to="/" className={linkClass} end>Inicio</NavLink></li>

        {usuario && !esAdmin && (
          <>
            <li><NavLink to="/mis-consultas"  className={linkClass}>Mis Consultas</NavLink></li>
            <li><NavLink to="/nueva-consulta" className={linkClass}>Nueva Consulta</NavLink></li>
            <li><NavLink to="/perfil"         className={linkClass}>Mi Perfil</NavLink></li>
          </>
        )}

        {esAdmin && (
          <>
            <li><NavLink to="/admin/dashboard"    className={linkClass}>Dashboard</NavLink></li>
            <li><NavLink to="/admin/consultas"    className={linkClass}>Consultas</NavLink></li>
            <li><NavLink to="/admin/usuarios"     className={linkClass}>Usuarios</NavLink></li>
            <li><NavLink to="/admin/reasignacion" className={linkClass}>Reasignación</NavLink></li>
          </>
        )}
      </ul>

      <div className="navbar-right">
        <button className="btn-theme" onClick={toggleTheme} title="Cambiar tema">
          {dark ? '☀️' : '🌙'}
        </button>

        {usuario ? (
          <button onClick={handleLogout} className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Salir
          </button>
        ) : (
          <Link to="/login" className="btn btn-sm"
            style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
}
