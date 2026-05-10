import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTodasConsultas, listarUsuarios } from '../service/api';
import '../css/Home.css';

const AdminDashboard = () => {
  const [consultas, setConsultas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([listarTodasConsultas(), listarUsuarios()])
      .then(([c, u]) => { setConsultas(c); setUsuarios(u); })
      .finally(() => setCargando(false));
  }, []);

  const contar = (estado) => consultas.filter(c => c.estado === estado).length;

  const stats = [
    { label: 'Total consultas', valor: consultas.length, color: '#2563EB' },
    { label: 'Pendientes',      valor: contar('PENDIENTE'),  color: '#d97706' },
    { label: 'Agendadas',       valor: contar('AGENDADA'),   color: '#0D9488' },
    { label: 'Atendidas',       valor: contar('ATENDIDA'),   color: '#059669' },
    { label: 'Usuarios',        valor: usuarios.length,      color: '#7c3aed' },
  ];

  return (
    <div className="home-page admin-home">
      <header className="hero-container" style={{ paddingBottom: 40 }}>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Panel de Control<br /><span style={{ color: '#0D9488' }}>Administrativo</span></h1>
            <p>Gestión de consultas, usuarios y reasignación de citas médicas.</p>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 5% 40px' }}>
        {/* Tarjetas de estadísticas */}
        {cargando ? (
          <p style={{ color: '#6b7280' }}>Cargando estadísticas...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 16, marginBottom: 32 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.valor}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Accesos rápidos */}
        <section className="shortcuts-container" style={{ padding: 0, marginTop: 0 }}>
          <div className="shortcuts-grid">
            <Link to="/admin/consultas" className="shortcut-card highlight">
              <div className="shortcut-icon">📋</div>
              <h3>Gestión de consultas</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>Ver y editar todas las consultas</p>
            </Link>
            <Link to="/admin/usuarios" className="shortcut-card">
              <div className="shortcut-icon">👥</div>
              <h3>Gestión de usuarios</h3>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Administrar cuentas</p>
            </Link>
            <Link to="/admin/citas" className="shortcut-card">
              <div className="shortcut-icon">📅</div>
              <h3>Reasignación de citas</h3>
              <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>Cancelar y reasignar bloques</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
