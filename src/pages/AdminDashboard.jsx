import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerResumenEstadisticas, listarTodasConsultas } from '../service/api';

export default function AdminDashboard() {
  const [stats,     setStats]     = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([obtenerResumenEstadisticas(), listarTodasConsultas()])
      .then(([s, c]) => {
        setStats(s);
        const sorted = Array.isArray(c)
          ? [...c].sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)).slice(0, 6)
          : [];
        setRecientes(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tarjetas = stats ? [
    { label: 'Total consultas',      valor: stats.totalConsultas,                       color: 'var(--primary)',       icon: '📋' },
    { label: 'Usuarios registrados', valor: stats.totalUsuarios,                        color: 'var(--purple)',        icon: '👥' },
    { label: 'Bloques de agenda',    valor: stats.totalBloquesAgenda,                   color: 'var(--teal)',          icon: '📅' },
    { label: 'Establecimientos',     valor: stats.totalEstablecimientos,                color: 'var(--warning-dark)',  icon: '🏥' },
    { label: 'Pendientes',           valor: stats.consultasPorEstado?.PENDIENTE || 0,   color: 'var(--warning)',       icon: '⏳' },
    { label: 'Atendidas',            valor: stats.consultasPorEstado?.ATENDIDA  || 0,   color: 'var(--success)',       icon: '✅' },
  ] : [];

  const DIST = {
    PENDIENTE:  { bg: 'var(--warning-light)', color: 'var(--warning-dark)' },
    AGENDADA:   { bg: 'var(--primary-light)', color: 'var(--primary-dark)' },
    REASIGNADA: { bg: 'var(--teal-light)',    color: 'var(--teal-dark)'    },
    CANCELADA:  { bg: 'var(--danger-light)',  color: 'var(--danger-dark)'  },
    ATENDIDA:   { bg: 'var(--success-light)', color: 'var(--success-dark)' },
  };

  const totalEstados = stats?.consultasPorEstado
    ? Object.values(stats.consultasPorEstado).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de control</h1>
          <p className="page-subtitle">Resumen en tiempo real del sistema RedNorte</p>
        </div>
      </div>

      {loading ? <div className="spinner">Cargando estadísticas...</div> : (
        <>
          {/* Stats */}
          <div className="grid-3 admin-stats-section">
            {tarjetas.map(t => (
              <div key={t.label} className="stat-card" style={{ borderTopColor: t.color }}>
                <div className="stat-icon">{t.icon}</div>
                <div className="stat-num" style={{ color: t.color }}>{t.valor ?? '—'}</div>
                <div className="stat-label">{t.label}</div>
              </div>
            ))}
          </div>

          {/* Distribución por estado */}
          {stats?.consultasPorEstado && (
            <div className="card admin-dist-card">
              <div className="card-header-bar">Distribución de consultas por estado</div>
              <div className="dist-bar">
                {Object.entries(stats.consultasPorEstado).map(([estado, count]) => {
                  const s   = DIST[estado] || { bg: 'var(--bg-soft)', color: 'var(--text-soft)' };
                  const pct = totalEstados ? Math.round((count / totalEstados) * 100) : 0;
                  return (
                    /* colores dinámicos por estado → inline */
                    <div key={estado} className="dist-item" style={{ background: s.bg }}>
                      <div className="dist-num"   style={{ color: s.color }}>{count}</div>
                      <div className="dist-label" style={{ color: s.color }}>{estado}</div>
                      <div className="dist-pct"   style={{ color: s.color }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Accesos rápidos */}
          <div className="grid-3 admin-shortcuts-section">
            {[
              { to: '/admin/consultas',        icon: '📋', label: 'Consultas',        desc: 'Gestionar todas las citas' },
              { to: '/admin/usuarios',         icon: '👥', label: 'Usuarios',         desc: 'Administrar cuentas' },
              { to: '/admin/establecimientos', icon: '🏥', label: 'Establecimientos', desc: 'Red de centros de salud' },
              { to: '/admin/agenda',           icon: '📅', label: 'Agenda',           desc: 'Bloques horarios' },
              { to: '/admin/reasignacion',     icon: '🔄', label: 'Reasignación',     desc: 'Cancelar y reasignar' },
              { to: '/admin/auditoria',        icon: '📜', label: 'Auditoría',        desc: 'Trazabilidad del sistema' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="shortcut-card">
                <span className="icon">{a.icon}</span>
                <h3>{a.label}</h3>
                <p>{a.desc}</p>
              </Link>
            ))}
          </div>

          {/* Últimas consultas */}
          <div className="card card-flush">
            <div className="card-header-bar">
              <span>🕐 Últimas consultas ingresadas</span>
              <Link to="/admin/consultas" className="card-header-link">Ver todas →</Link>
            </div>
            <table className="tabla">
              <thead>
                <tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Estado</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {recientes.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombrePaciente || '—'}</td>
                    <td className="td-capitalize">{c.especialidad}</td>
                    <td>
                      <span className={`badge-estado badge-estado-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                    </td>
                    <td className="td-muted">
                      {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                    </td>
                  </tr>
                ))}
                {recientes.length === 0 && (
                  <tr><td colSpan={5} className="td-empty">Sin consultas aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
