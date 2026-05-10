import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { usuario, esAdmin } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <h1>Bienvenido a RedNorte</h1>
        <p>Plataforma inteligente de gestión de listas de espera para el sistema público de salud.</p>
        {!usuario && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: 16, padding: '12px 28px' }}>
              Iniciar sesión
            </Link>
            <Link to="/registro" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', fontSize: 16, padding: '12px 28px' }}>
              Registrarse
            </Link>
          </div>
        )}
      </div>

      <div className="page" style={{ marginTop: 32 }}>
        {/* Accesos rápidos paciente */}
        {usuario && !esAdmin && (
          <>
            <h2 style={{ marginBottom: 20, color: 'var(--text)' }}>¿Qué deseas hacer hoy?</h2>
            <div className="grid-3" style={{ marginBottom: 40 }}>
              <Link to="/nueva-consulta" className="shortcut-card highlight">
                <span className="icon">📋</span>
                <h3>Nueva consulta</h3>
                <p>Ingresa tus síntomas y especialidad</p>
              </Link>
              <Link to="/mis-consultas" className="shortcut-card">
                <span className="icon">📅</span>
                <h3>Mis consultas</h3>
                <p>Revisa el estado de tus citas</p>
              </Link>
              <Link to="/perfil" className="shortcut-card">
                <span className="icon">👤</span>
                <h3>Mi perfil</h3>
                <p>Actualiza tus datos personales</p>
              </Link>
            </div>
          </>
        )}

        {/* Accesos rápidos admin */}
        {esAdmin && (
          <>
            <h2 style={{ marginBottom: 20, color: 'var(--text)' }}>Panel administrativo</h2>
            <div className="grid-4" style={{ marginBottom: 40 }}>
              <Link to="/admin/dashboard"    className="shortcut-card highlight">
                <span className="icon">📊</span><h3>Dashboard</h3><p>Estadísticas generales</p>
              </Link>
              <Link to="/admin/consultas"    className="shortcut-card">
                <span className="icon">📋</span><h3>Consultas</h3><p>Gestionar todas las citas</p>
              </Link>
              <Link to="/admin/usuarios"     className="shortcut-card">
                <span className="icon">👥</span><h3>Usuarios</h3><p>Administrar cuentas</p>
              </Link>
              <Link to="/admin/reasignacion" className="shortcut-card">
                <span className="icon">🔄</span><h3>Reasignación</h3><p>Cancelar y reasignar</p>
              </Link>
            </div>
          </>
        )}

        {/* Info pública */}
        {!usuario && (
          <div className="grid-3">
            {[
              { icon: '🏥', title: 'Gestión de lista de espera', desc: 'Administra tus consultas médicas de forma digital y transparente.' },
              { icon: '📲', title: 'Seguimiento en tiempo real', desc: 'Consulta el estado de tu cita en cualquier momento.' },
              { icon: '🔄', title: 'Reasignación automática', desc: 'Si se cancela una cita, el sistema te reasigna automáticamente.' },
            ].map(c => (
              <div key={c.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{c.icon}</div>
                <h3 style={{ marginBottom: 8, fontSize: 16 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
