import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarConsultasPorUsuario } from '../service/api';
import Badge from '@rednorte/badge';

export default function MisConsultasPage() {
  const { usuario } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('TODAS');

  useEffect(() => {
    listarConsultasPorUsuario(usuario.id)
      .then(d => setConsultas(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudieron cargar tus consultas.'))
      .finally(() => setLoading(false));
  }, [usuario]);

  const stats = {
    total: consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    agendadas: consultas.filter(c => c.estado === 'AGENDADA').length,
    atendidas: consultas.filter(c => c.estado === 'ATENDIDA').length,
  };

  const ESTADOS = ['TODAS', 'PENDIENTE', 'AGENDADA', 'ATENDIDA', 'CANCELADA'];
  const visibles = filtro === 'TODAS' ? consultas : consultas.filter(c => c.estado === filtro);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Mis consultas</h1>
          <p className="page-subtitle">Gestiona tus citas médicas en RedNorte</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/reservar-hora" className="btn btn-teal">🗓️ Reservar hora</Link>
          <Link to="/nueva-consulta" className="btn btn-primary">+ Nueva consulta</Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && consultas.length > 0 && (
        <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total',      val: stats.total,      color: 'var(--purple)',  bg: 'var(--purple-light)',  icon: '📋' },
            { label: 'Pendientes', val: stats.pendientes, color: 'var(--warning)', bg: 'var(--warning-light)', icon: '⏳' },
            { label: 'Agendadas',  val: stats.agendadas,  color: 'var(--primary)', bg: 'var(--primary-light)', icon: '📅' },
            { label: 'Atendidas',  val: stats.atendidas,  color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div><div className="stat-num" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="spinner">Cargando tus consultas...</div>
      ) : consultas.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📭</span>
          <h3>No tienes consultas aún</h3>
          <p style={{ marginBottom: 24 }}>Crea tu primera consulta médica o reserva una hora con un especialista.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/nueva-consulta" className="btn btn-primary">Crear consulta</Link>
            <Link to="/reservar-hora" className="btn btn-ghost">Reservar hora</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="filter-bar">
            {ESTADOS.map(e => (
              <button key={e} className={`filter-chip ${filtro === e ? 'active' : ''}`} onClick={() => setFiltro(e)}>{e}</button>
            ))}
          </div>

          <div className="card card-pad-0">
            <div className="table-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>N°</th><th>Especialidad</th><th>Síntomas</th>
                    <th>Estado</th><th>Fecha cita</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map(c => (
                    <tr key={c.id}>
                      <td className="tabla-id">#{c.id}</td>
                      <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{c.especialidad}</td>
                      <td style={{ maxWidth: 220, color: 'var(--text-muted)', fontSize: 13 }}>
                        {c.sintomas ? c.sintomas.slice(0, 60) + (c.sintomas.length > 60 ? '…' : '') : '—'}
                      </td>
                      <td><Badge estado={c.estado} /></td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {c.fechaCita
                          ? new Date(c.fechaCita).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : <span style={{ color: 'var(--warning)', fontWeight: 500 }}>Sin asignar</span>}
                      </td>
                      <td>
                        {(c.estado === 'PENDIENTE' || c.estado === 'AGENDADA') && (
                          <Link to={`/editar-consulta/${c.id}`} className="btn btn-ghost btn-sm">✏️ Editar</Link>
                        )}
                      </td>
                    </tr>
                  ))}
                  {visibles.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Sin consultas en este estado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
