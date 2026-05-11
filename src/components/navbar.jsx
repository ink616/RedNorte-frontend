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
    padding: '7px 16px',
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
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 500,
    }}>

      {/* Logo más grande */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
        <img src="/logo.png" alt="RedNorte" style={{ height: 56, width: 'auto' }} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px' }}>
            Red<span style={{ color: '#5eead4' }}>Norte</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Clínica Digital
          </div>
        </div>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {!usuario && (
          <>
            <Link to="/" style={linkStyle('/')}>Inicio</Link>
            <Link to="/sobre-nosotros" style={linkStyle('/sobre-nosotros')}>Sobre nosotros</Link>
            <Link to="/registro" style={linkStyle('/registro')}>Registrarse</Link>
          </>
        )}
        {usuario && !esAdmin && (
          <>
            <Link to="/inicio" style={linkStyle('/inicio')}>Inicio</Link>
            <Link to="/mis-consultas" style={linkStyle('/mis-consultas')}>Mis Consultas</Link>
            <Link to="/nueva-consulta" style={linkStyle('/nueva-consulta')}>Nueva Consulta</Link>
            <Link to="/perfil" style={linkStyle('/perfil')}>Mi Perfil</Link>
            <Link to="/sobre-nosotros" style={linkStyle('/sobre-nosotros')}>Nosotros</Link>
          </>
        )}
        {usuario && esAdmin && (
          <>
            <Link to="/inicio" style={linkStyle('/inicio')}>Inicio</Link>
            <Link to="/admin/dashboard" style={linkStyle('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/consultas" style={linkStyle('/admin/consultas')}>Consultas</Link>
            <Link to="/admin/usuarios" style={linkStyle('/admin/usuarios')}>Usuarios</Link>
            <Link to="/admin/reasignacion" style={linkStyle('/admin/reasignacion')}>Reasignación</Link>
          </>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={toggleDark} title={darkMode ? 'Modo claro' : 'Modo oscuro'} style={{
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        {usuario ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
              {usuario.mail?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleSalir} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20, padding: '7px 20px', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            }}>Salir</button>
          </div>
        ) : (
          <Link to="/login" style={{
            background: 'white', borderRadius: 20, padding: '8px 22px',
            color: '#1e3a8a', fontWeight: 700, fontSize: 14, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
