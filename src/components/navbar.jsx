import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const { darkMode, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSalir = () => { cerrarSesion(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    padding: '6px 14px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: isActive(path) ? 600 : 400,
    color: isActive(path) ? 'white' : 'rgba(255,255,255,0.75)',
    background: isActive(path) ? 'rgba(255,255,255,0.18)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  });

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 60%, #0f766e 100%)',
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 500,
    }}>

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <img src="/logo.png" alt="RedNorte" style={{ height: 42, width: 'auto' }} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 19, letterSpacing: '-0.3px' }}>
            Red<span style={{ color: '#5eead4' }}>Norte</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Clínica Digital
          </div>
        </div>
      </Link>

      {/* Links */}
      {usuario && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {esAdmin ? (
            <>
              <Link to="/inicio" style={linkStyle('/inicio')}>Inicio</Link>
              <Link to="/admin/dashboard" style={linkStyle('/admin/dashboard')}>Dashboard</Link>
              <Link to="/admin/consultas" style={linkStyle('/admin/consultas')}>Consultas</Link>
              <Link to="/admin/usuarios" style={linkStyle('/admin/usuarios')}>Usuarios</Link>
              <Link to="/admin/reasignacion" style={linkStyle('/admin/reasignacion')}>Reasignación</Link>
            </>
          ) : (
            <>
              <Link to="/inicio" style={linkStyle('/inicio')}>Inicio</Link>
              <Link to="/mis-consultas" style={linkStyle('/mis-consultas')}>Mis Consultas</Link>
              <Link to="/nueva-consulta" style={linkStyle('/nueva-consulta')}>Nueva Consulta</Link>
              <Link to="/perfil" style={linkStyle('/perfil')}>Mi Perfil</Link>
            </>
          )}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={toggleDark} title={darkMode ? 'Modo claro' : 'Modo oscuro'} style={{
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        {usuario ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
              {usuario.mail?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleSalir} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20, padding: '6px 18px', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>Salir</button>
          </div>
        ) : (
          <Link to="/login" style={{
            background: 'white', borderRadius: 20, padding: '7px 20px',
            color: '#1e3a8a', fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
