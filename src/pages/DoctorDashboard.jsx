import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarTodasConsultas, actualizarConsultaAdmin, registrarAuditoria } from '../service/api';
import Badge from '../components/Badge';

const ESTADOS = ['PENDIENTE', 'AGENDADA', 'ATENDIDA', 'CANCELADA'];
// Estados que requieren asignar fecha y hora de atencion
const REQUIERE_FECHA = ['AGENDADA', 'REASIGNADA'];

export default function DoctorDashboard() {
  const { usuario } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODAS');
  const [consultaActiva, setConsultaActiva] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [fechaCita, setFechaCita] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const p = usuario?.persona;
  const nombre = p ? `Dr. ${p.apellido1} ${p.apellido2 || ''}`.trim() : 'Doctor';
  const iniciales = p ? (p.apellido1?.[0] || '') + (p.apellido2?.[0] || '') : 'DR';

  const cargar = () => {
    setLoading(true);
    listarTodasConsultas().then(d => setConsultas(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const filtradas = filtro === 'TODAS' ? consultas : consultas.filter(c => c.estado === filtro);

  const stats = {
    total: consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    agendadas: consultas.filter(c => c.estado === 'AGENDADA').length,
    atendidas: consultas.filter(c => c.estado === 'ATENDIDA').length,
  };

  const abrirModal = (c) => {
    setConsultaActiva(c);
    setNuevoEstado(c.estado);
    setFechaCita(c.fechaCita ? c.fechaCita.slice(0, 16) : '');
    setNotas(c.notasAdmin || '');
    setError('');
  };

  const actualizar = async () => {
    if (!nuevoEstado) return;
    // Si el nuevo estado requiere fecha y no hay una, avisar
    if (REQUIERE_FECHA.includes(nuevoEstado) && !fechaCita) {
      setError('Para agendar debes seleccionar la fecha y hora de atencion.');
      return;
    }
    setGuardando(true); setError('');
    try {
      await actualizarConsultaAdmin(consultaActiva.id, {
        estado: nuevoEstado,
        fechaCita: fechaCita ? fechaCita + ':00' : null,
        notasAdmin: notas,
      });
      registrarAuditoria({
        accion: 'ACTUALIZAR', modulo: 'CONSULTAS', usuarioId: usuario?.id ? String(usuario.id) : 'DOCTOR',
        usuarioRol: 'DOCTOR', recursoId: String(consultaActiva.id),
        descripcion: `Doctor actualizo consulta #${consultaActiva.id} a ${nuevoEstado}`, resultado: 'EXITOSO',
      }).catch(() => {});
      setExito('Consulta actualizada correctamente.');
      setConsultaActiva(null); cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
      setError('No se pudo guardar. Intenta nuevamente.');
    } finally { setGuardando(false); }
  };

  return (
    <div className="page">
      <div style={{
        background: 'linear-gradient(135deg,#1e3a8a,#0f766e)', borderRadius: 16,
        padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, color: 'white',
      }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700,
          flexShrink: 0, border: '3px solid rgba(255,255,255,0.4)' }}>{iniciales}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{nombre}</div>
          <div style={{ opacity: 0.8, fontSize: 13 }}>{usuario?.mail}</div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 12px', borderRadius: 20, fontSize: 12, marginTop: 6, display: 'inline-block' }}>
            Medico - RedNorte Clinica Digital
          </span>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <div><div style={{ fontSize: 32, fontWeight: 800 }}>{stats.total}</div><div style={{ opacity: 0.7, fontSize: 12 }}>Consultas totales</div></div>
          <Link to="/doctor/agenda" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none',
            padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Ver mi agenda</Link>
        </div>
      </div>

      {exito && <div className="alert alert-success">{exito}</div>}

      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { label: 'Pendientes', val: stats.pendientes, color: 'var(--warning)', bg: 'var(--warning-light)', icon: '⏳' },
          { label: 'Agendadas',  val: stats.agendadas,  color: 'var(--primary)', bg: 'var(--primary-light)', icon: '📅' },
          { label: 'Atendidas',  val: stats.atendidas,  color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
          { label: 'Total',      val: stats.total,      color: 'var(--purple)',  bg: 'var(--purple-light)',  icon: '📋' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div><div className="stat-num" style={{ color: s.color }}>{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['TODAS', ...ESTADOS].map(e => (
          <button key={e} className={`filter-chip ${filtro === e ? 'active' : ''}`} onClick={() => setFiltro(e)}>{e}</button>
        ))}
      </div>

      {loading ? <div className="spinner">Cargando consultas...</div> : (
        <div className="card card-pad-0">
          <div className="table-wrap">
            <table className="tabla">
              <thead><tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Síntomas</th><th>Estado</th><th>Fecha cita</th><th>Acción</th></tr></thead>
              <tbody>
                {filtradas.map(c => (
                  <tr key={c.id}>
                    <td className="tabla-id">#{c.id}</td>
                    <td style={{ fontWeight: 500 }}>{c.nombrePaciente || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.especialidad}</td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 200 }}>{c.sintomas?.slice(0, 60)}{c.sintomas?.length > 60 ? '...' : ''}</td>
                    <td><Badge estado={c.estado} /></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : <span style={{ color: 'var(--warning)' }}>Sin asignar</span>}
                    </td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => abrirModal(c)}>Actualizar</button></td>
                  </tr>
                ))}
                {filtradas.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Sin consultas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {consultaActiva && (
        <div className="modal-overlay" onClick={() => setConsultaActiva(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Actualizar consulta #{consultaActiva.id}</h2>
              <button className="modal-close" onClick={() => setConsultaActiva(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{consultaActiva.nombrePaciente} - {consultaActiva.especialidad}</p>
              <div style={{ background: 'var(--bg-soft)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Síntomas del paciente</div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>{consultaActiva.sintomas}</div>
              </div>

              {error && <div className="alert alert-error">⚠️ {error}</div>}

              <div className="form-group">
                <label>Nuevo estado</label>
                <select className="form-control" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* El campo de fecha/hora aparece solo cuando se agenda */}
              {REQUIERE_FECHA.includes(nuevoEstado) && (
                <div className="form-group">
                  <label>📅 Fecha y hora de atención <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input type="datetime-local" className="form-control" value={fechaCita}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={e => setFechaCita(e.target.value)} />
                  <p className="form-hint">Selecciona el dia y la hora en que atenderás al paciente.</p>
                </div>
              )}

              <div className="form-group">
                <label>Notas médicas</label>
                <textarea className="form-control" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Observaciones, indicaciones, proximos pasos..." style={{ minHeight: 90 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConsultaActiva(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={actualizar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
