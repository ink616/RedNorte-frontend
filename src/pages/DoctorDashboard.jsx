import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarTodasConsultas, actualizarConsultaAdmin } from '../service/api';

const ESTADOS = ['PENDIENTE', 'AGENDADA', 'ATENDIDA', 'CANCELADA'];

const badgeColor = (estado) => {
  const map = {
    PENDIENTE: { bg: '#FAEEDA', color: '#854F0B' },
    AGENDADA:  { bg: '#E6F1FB', color: '#185FA5' },
    ATENDIDA:  { bg: '#E1F5EE', color: '#0F6E56' },
    CANCELADA: { bg: '#FCEBEB', color: '#A32D2D' },
    REASIGNADA:{ bg: '#EDE9FE', color: '#5B21B6' },
  };
  return map[estado] || { bg: '#F3F4F6', color: '#6B7280' };
};

export default function DoctorDashboard() {
  const { usuario } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODAS');
  const [consultaActiva, setConsultaActiva] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState('');

  const p = usuario?.persona;
  const nombre = p ? `Dr. ${p.apellido1} ${p.apellido2 || ''}`.trim() : 'Doctor';
  const iniciales = p ? (p.apellido1?.[0] || '') + (p.apellido2?.[0] || '') : 'DR';

  const cargar = () => {
    setLoading(true);
    listarTodasConsultas()
      .then(data => setConsultas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const consultasFiltradas = filtro === 'TODAS'
    ? consultas
    : consultas.filter(c => c.estado === filtro);

  const stats = {
    total: consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    agendadas: consultas.filter(c => c.estado === 'AGENDADA').length,
    atendidas: consultas.filter(c => c.estado === 'ATENDIDA').length,
  };

  const handleActualizar = async () => {
    if (!nuevoEstado) return;
    setGuardando(true);
    try {
      await actualizarConsultaAdmin(consultaActiva.id, {
        estado: nuevoEstado,
        notasAdmin: notas,
      });
      setExito('Estado actualizado correctamente.');
      setConsultaActiva(null);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {} finally { setGuardando(false); }
  };

  return (
    <div className="page">

      {/* Header doctor */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#0f766e)',
        borderRadius: 16, padding: '1.5rem 2rem', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 16, color: 'white',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700, flexShrink: 0,
          border: '3px solid rgba(255,255,255,0.4)',
        }}>{iniciales}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{nombre}</div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>{usuario?.mail}</div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 12px', borderRadius: 20, fontSize: 12, marginTop: 6, display: 'inline-block' }}>
            🩺 Médico — RedNorte Clínica Digital
          </span>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>Consultas totales</div>
        </div>
      </div>

      {exito && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {exito}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Pendientes', val: stats.pendientes, color: '#F59E0B', icon: '⏳' },
          { label: 'Agendadas',  val: stats.agendadas,  color: '#2563EB', icon: '📅' },
          { label: 'Atendidas',  val: stats.atendidas,  color: '#10B981', icon: '✅' },
          { label: 'Total',      val: stats.total,       color: '#7C3AED', icon: '📋' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['TODAS', ...ESTADOS].map(e => (
          <button key={e} onClick={() => setFiltro(e)} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filtro === e ? 700 : 400,
            background: filtro === e ? '#2563EB' : 'var(--color-background-secondary)',
            color: filtro === e ? 'white' : 'var(--color-text-secondary)',
            border: filtro === e ? 'none' : '0.5px solid var(--color-border-tertiary)',
          }}>{e}</button>
        ))}
      </div>

      {/* Tabla consultas */}
      {loading ? <div className="spinner">Cargando consultas...</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead>
              <tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Síntomas</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {consultasFiltradas.map(c => {
                const { bg, color } = badgeColor(c.estado);
                return (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombrePaciente || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.especialidad}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)', maxWidth: 200 }}>
                      {c.sintomas?.slice(0, 60)}{c.sintomas?.length > 60 ? '...' : ''}
                    </td>
                    <td>
                      <span style={{ background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td>
                      <button onClick={() => { setConsultaActiva(c); setNuevoEstado(c.estado); setNotas(c.notasAdmin || ''); }}
                        className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 12px' }}>
                        Actualizar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {consultasFiltradas.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-secondary)' }}>Sin consultas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal actualizar estado */}
      {consultaActiva && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 480, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#111827' }}>Actualizar consulta #{consultaActiva.id}</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>{consultaActiva.nombrePaciente} — {consultaActiva.especialidad}</p>

            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Síntomas del paciente</div>
              <div style={{ fontSize: 13, color: '#111827' }}>{consultaActiva.sintomas}</div>
            </div>

            <div className="form-group">
              <label style={{ color: '#374151' }}>Nuevo estado</label>
              <select className="form-control" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label style={{ color: '#374151' }}>Notas médicas</label>
              <textarea className="form-control" value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Observaciones, indicaciones, próximos pasos..." style={{ minHeight: 100 }} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={handleActualizar} disabled={guardando} className="btn btn-primary" style={{ flex: 1 }}>
                {guardando ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
              <button onClick={() => setConsultaActiva(null)} className="btn btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
