import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin, esDoctor } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSalir = () => { cerrarSesion(); navigate('/'); };
  const isActive = (path) => location.pathname.startsWith(path) && path !== '/';
  const isExact  = (path) => location.pathname === path;

  const linkStyle = (path, exact = false) => {
    const active = exact ? isExact(path) : isActive(path);
    return {
      padding: '7px 12px', borderRadius: 20, fontSize: 12.5,
      fontWeight: active ? 600 : 400,
      color: active ? 'white' : 'rgba(255,255,255,0.75)',
      background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
      textDecoration: 'none', transition: 'all 0.2s', whiteSpace: 'nowrap',
    };
  };

  const p = usuario?.persona;
  const iniciales = p
    ? (p.apellido1?.[0] || '') + (p.apellido2?.[0] || '')
    : usuario?.mail?.[0]?.toUpperCase() || '?';
  const rolColor = esAdmin ? '#EF4444' : esDoctor ? '#10B981' : '#2563EB';
  const inicioLink = esAdmin ? '/admin/dashboard' : esDoctor ? '/doctor/dashboard' : '/';

  const ADMIN_LINKS = [
    { to: '/admin/dashboard',        label: 'Dashboard' },
    { to: '/admin/estadisticas',     label: 'Reportes' },
    { to: '/admin/consultas',        label: 'Consultas' },
    { to: '/admin/usuarios',         label: 'Usuarios' },
    { to: '/admin/establecimientos', label: 'Centros' },
    { to: '/admin/agenda',           label: 'Agenda' },
    { to: '/admin/reasignacion',     label: 'Reasignación' },
    { to: '/admin/auditoria',        label: 'Auditoría' },
  ];

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #0f172a 0%, #1e3a8a 60%, #0f766e 100%)',
      padding: '0 24px', height: 66,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
      position: 'sticky', top: 0, zIndex: 500,
    }}>

      <Link to={inicioLink} style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', flexShrink:0 }}>
        <img src="/logo.png" alt="RedNorte" style={{ height:56, width:'auto' }} />
        <div style={{ lineHeight:1.2 }}>
          <div style={{ color:'white', fontWeight:800, fontSize:22, letterSpacing:'-0.3px' }}>
            Red<span style={{ color:'#5eead4' }}>Norte</span>
          </div>
          <div style={{ color:'rgba(255,255,255,0.45)', fontSize:9, letterSpacing:'1.5px', textTransform:'uppercase' }}>
            Clínica Digital
          </div>
        </div>
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:2 }}>
        {!usuario && (
          <>
            <Link to="/"               style={linkStyle('/', true)}>Inicio</Link>
            <Link to="/sobre-nosotros" style={linkStyle('/sobre-nosotros')}>Sobre nosotros</Link>
            <Link to="/registro"       style={linkStyle('/registro')}>Registrarse</Link>
          </>
        )}

        {usuario && !esAdmin && !esDoctor && (
          <>
            <Link to="/"               style={linkStyle('/', true)}>Inicio</Link>
            <Link to="/mis-consultas"  style={linkStyle('/mis-consultas')}>Mis Consultas</Link>
            <Link to="/agendar"        style={linkStyle('/agendar')}>Agendar Cita</Link>
            <Link to="/perfil"         style={linkStyle('/perfil')}>Mi Perfil</Link>
          </>
        )}

        {esDoctor && (
          <>
            <Link to="/doctor/dashboard" style={linkStyle('/doctor/dashboard')}>Mis Pacientes</Link>
            <Link to="/doctor/agenda"    style={linkStyle('/doctor/agenda')}>Mi Agenda</Link>
            <Link to="/doctor/perfil"    style={linkStyle('/doctor/perfil')}>Mi Perfil</Link>
          </>
        )}

        {esAdmin && (
          <div style={{ display:'flex', alignItems:'center', gap:2 }}>
            {ADMIN_LINKS.map(a => (
              <Link key={a.to} to={a.to} style={linkStyle(a.to)} title={a.label}>{a.label}</Link>
            ))}
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <button onClick={toggleTheme} title={dark?'Modo claro':'Modo oscuro'} style={{
          background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:'50%', width:36, height:36, cursor:'pointer', fontSize:15,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          {dark ? '☀️' : '🌙'}
        </button>

        {usuario ? (
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%', background:rolColor,
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'white', fontSize:13, fontWeight:700,
              border:'2px solid rgba(255,255,255,0.3)', cursor:'default',
            }}>{iniciales}</div>
            <button onClick={handleSalir} style={{
              background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:20, padding:'6px 18px', color:'white',
              cursor:'pointer', fontSize:13, fontWeight:500,
            }}>Salir</button>
          </div>
        ) : (
          <Link to="/login" style={{
            background:'white', borderRadius:20, padding:'7px 20px',
            color:'#1e3a8a', fontWeight:700, fontSize:13, textDecoration:'none',
            boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
          }}>Ingresar</Link>
        )}
      </div>
    </nav>
  );
}
