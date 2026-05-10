import React, { useState, useEffect } from 'react';
import { listarTodasConsultas, actualizarConsultaAdmin, cancelarYReasignar } from '../service/api';

const BADGE = {
  PENDIENTE:  { bg: '#fef3c7', color: '#92400e' },
  AGENDADA:   { bg: '#dbeafe', color: '#1e40af' },
  REASIGNADA: { bg: '#d1fae5', color: '#065f46' },
  CANCELADA:  { bg: '#fee2e2', color: '#991b1b' },
  ATENDIDA:   { bg: '#f0fdf4', color: '#166534' },
};
const ESTADOS = ['PENDIENTE','AGENDADA','CANCELADA','REASIGNADA','ATENDIDA'];

const CitasPage = () => {
  const [consultas, setConsultas]   = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [editando, setEditando]     = useState(null);
  const [formAdmin, setFormAdmin]   = useState({ estado: '', fechaCita: '', notasAdmin: '' });
  const [motivoMap, setMotivoMap]   = useState({});
  const [procesando, setProcesando] = useState(null);
  const [error, setError]   = useState('');
  const [exito, setExito]   = useState('');

  const cargar = () => {
    setCargando(true);
    listarTodasConsultas().then(setConsultas).finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirEditor = (c) => {
    setEditando(c.id);
    setFormAdmin({ estado: c.estado, fechaCita: c.fechaCita ? c.fechaCita.slice(0,16) : '', notasAdmin: c.notasAdmin || '' });
  };

  const guardar = async () => {
    try {
      await actualizarConsultaAdmin(editando, {
        estado: formAdmin.estado,
        fechaCita: formAdmin.fechaCita ? formAdmin.fechaCita + ':00' : null,
        notasAdmin: formAdmin.notasAdmin,
      });
      setEditando(null); cargar();
    } catch { setError('Error al guardar.'); }
  };

  const handleReasignar = async (c) => {
    const motivo = motivoMap[c.id] || 'Cancelación administrativa';
    setProcesando(c.id); setError(''); setExito('');
    try {
      await actualizarConsultaAdmin(c.id, { estado: 'CANCELADA', notasAdmin: `Cancelada: ${motivo}` });
      await cancelarYReasignar(c.bloquesAgendaId, motivo);
      setExito(`Consulta #${c.id} cancelada y reasignada.`); cargar();
    } catch (e) { setError('Error en reasignación: ' + e.message);
    } finally { setProcesando(null); }
  };

  const agendadas  = consultas.filter(c => c.estado === 'AGENDADA' && c.bloquesAgendaId);
  const pendientes = consultas.filter(c => c.estado === 'PENDIENTE');

  const tdStyle = { padding: '12px 14px', borderBottom: '1px solid #f3f4f6', fontSize: 14 };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f9fafb' };

  return (
    <div style={{ padding: '40px 5%' }}>
      <h2 style={{ color: '#1F2937', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Gestión de citas</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>Administra todas las consultas y reasigna citas canceladas.</p>

      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{error}</div>}
      {exito && <div style={{ background: '#d1fae5', color: '#065f46', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{exito}</div>}

      {/* Todas las consultas */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 16, color: '#1F2937' }}>
          Todas las consultas
        </div>
        {cargando ? <p style={{ padding: 24, color: '#6b7280' }}>Cargando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['N°','Paciente','Especialidad','Estado','Fecha cita','Notas','Acciones'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {consultas.map(c => {
                const badge = BADGE[c.estado] || BADGE.PENDIENTE;
                return (
                  <React.Fragment key={c.id}>
                    <tr>
                      <td style={tdStyle}><strong>#{c.id}</strong></td>
                      <td style={tdStyle}>{c.nombrePaciente || '—'}</td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{c.especialidad}</td>
                      <td style={tdStyle}>
                        <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{c.estado}</span>
                      </td>
                      <td style={{ ...tdStyle, fontSize: 13, color: '#6b7280' }}>{c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL') : '—'}</td>
                      <td style={{ ...tdStyle, fontSize: 13, color: '#6b7280', maxWidth: 160 }}>{c.notasAdmin || '—'}</td>
                      <td style={tdStyle}>
                        <button onClick={() => abrirEditor(c)}
                          style={{ background: '#eff6ff', color: '#2563EB', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                          Editar
                        </button>
                      </td>
                    </tr>
                    {editando === c.id && (
                      <tr>
                        <td colSpan={7} style={{ background: '#eff6ff', padding: '20px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 600 }}>
                            <div>
                              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
                              <select value={formAdmin.estado} onChange={e => setFormAdmin({ ...formAdmin, estado: e.target.value })}
                                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fecha de cita</label>
                              <input type="datetime-local" value={formAdmin.fechaCita} onChange={e => setFormAdmin({ ...formAdmin, fechaCita: e.target.value })}
                                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ gridColumn: '1/-1' }}>
                              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Notas</label>
                              <textarea value={formAdmin.notasAdmin} onChange={e => setFormAdmin({ ...formAdmin, notasAdmin: e.target.value })}
                                style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, minHeight: 60, boxSizing: 'border-box' }} />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                            <button onClick={guardar} className="btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>Guardar</button>
                            <button onClick={() => setEditando(null)} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reasignación */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', fontWeight: 600, fontSize: 16, color: '#1F2937' }}>
          Cancelar y reasignar citas agendadas
        </div>
        {agendadas.length === 0 ? (
          <p style={{ padding: 24, color: '#6b7280', fontSize: 14 }}>No hay citas agendadas para reasignar.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['N°','Paciente','Especialidad','Fecha cita','Motivo cancelación','Acción'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {agendadas.map(c => (
                <tr key={c.id}>
                  <td style={tdStyle}><strong>#{c.id}</strong></td>
                  <td style={tdStyle}>{c.nombrePaciente || '—'}</td>
                  <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{c.especialidad}</td>
                  <td style={{ ...tdStyle, fontSize: 13, color: '#6b7280' }}>{c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL') : '—'}</td>
                  <td style={tdStyle}>
                    <input type="text" placeholder="Motivo..." value={motivoMap[c.id] || ''}
                      onChange={e => setMotivoMap({ ...motivoMap, [c.id]: e.target.value })}
                      style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleReasignar(c)} disabled={procesando === c.id}
                      style={{ background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
                      {procesando === c.id ? 'Procesando...' : 'Cancelar y reasignar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CitasPage;
