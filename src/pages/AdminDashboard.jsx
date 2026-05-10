import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarTodasConsultas, listarUsuarios } from '../service/api';

export default function AdminDashboard() {
  const [consultas, setConsultas] = useState([]);
  const [usuarios,  setUsuarios]  = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([listarTodasConsultas(), listarUsuarios()])
      .then(([c, u]) => { setConsultas(c); setUsuarios(u); })
      .finally(() => setLoading(false));
  }, []);

  const n = (estado) => consultas.filter(c => c.estado === estado).length;
  const recientes = [...consultas].sort((a,b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)).slice(0, 5);

  const stats = [
    { label: 'Total consultas', valor: consultas.length, color: 'var(--primary)', icon: '📋' },
    { label: 'Pendientes',      valor: n('PENDIENTE'),   color: 'var(--warning)', icon: '⏳' },
    { label: 'Agendadas',       valor: n('AGENDADA'),    color: 'var(--teal)',    icon: '📅' },
    { label: 'Reasignadas',     valor: n('REASIGNADA'),  color: 'var(--success)', icon: '🔄' },
    { label: 'Atendidas',       valor: n('ATENDIDA'),    color: '#059669',        icon: '✅' },
    { label: 'Usuarios activos',valor: usuarios.filter(u => u.estado === 'ACTIVO').length, color: '#7C3AED', icon: '👥' },
  ];

  return (
    <div className="page">
      <h2 className="page-title">📊 Panel de control</h2>

      {loading ? <div className="spinner">Cargando estadísticas...</div> : (
        <>
          {/* Stats */}
          <div className="grid-3" style={{ marginBottom: 28 }}>
            {stats.map(s => (
              <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-num" style={{ color: s.color }}>{s.valor}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="grid-4" style={{ marginBottom: 28 }}>
            <Link to="/admin/consultas"    className="shortcut-card highlight"><span className="icon">📋</span><h3>Consultas</h3><p>Gestionar todas</p></Link>
            <Link to="/admin/usuarios"     className="shortcut-card"><span className="icon">👥</span><h3>Usuarios</h3><p>Administrar cuentas</p></Link>
            <Link to="/admin/reasignacion" className="shortcut-card"><span className="icon">🔄</span><h3>Reasignación</h3><p>Cancelar y reasignar</p></Link>
            <div className="shortcut-card" style={{ cursor: 'default' }}>
              <span className="icon">📈</span>
              <h3>{Math.round((n('ATENDIDA') / (consultas.length || 1)) * 100)}%</h3>
              <p>Tasa de atención</p>
            </div>
          </div>

          {/* Últimas consultas */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 15 }}>
              🕐 Últimas consultas ingresadas
            </div>
            <table className="tabla">
              <thead><tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {recientes.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombrePaciente || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.especialidad}</td>
                    <td>
                      <span className={`badge badge-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                    </td>
                  </tr>
                ))}
                {recientes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Sin consultas aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
