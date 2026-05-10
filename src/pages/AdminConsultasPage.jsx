import React, { useEffect, useState } from 'react';
import { listarTodasConsultas, actualizarConsultaAdmin, eliminarConsulta } from '../service/api';
import Badge from '../components/Badge';

const ESTADOS = ['PENDIENTE','AGENDADA','CANCELADA','REASIGNADA','ATENDIDA'];

export default function AdminConsultasPage() {
  const [consultas,     setConsultas]     = useState([]);
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [filtroEsp,     setFiltroEsp]     = useState('');
  const [loading,       setLoading]       = useState(true);
  const [editando,      setEditando]      = useState(null);
  const [formAdmin,     setFormAdmin]     = useState({ estado: '', fechaCita: '', notasAdmin: '' });
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');
  const [exito,         setExito]         = useState('');

  const cargar = () => {
    setLoading(true);
    listarTodasConsultas().then(setConsultas).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const filtradas = consultas.filter(c => {
    if (filtroEstado && c.estado !== filtroEstado) return false;
    if (filtroEsp && !c.especialidad?.toLowerCase().includes(filtroEsp.toLowerCase())) return false;
    return true;
  });

  const abrirEditor = (c) => {
    setEditando(c.id);
    setFormAdmin({ estado: c.estado, fechaCita: c.fechaCita ? c.fechaCita.slice(0,16) : '', notasAdmin: c.notasAdmin || '' });
  };

  const guardar = async () => {
    setSaving(true); setError(''); setExito('');
    try {
      await actualizarConsultaAdmin(editando, {
        estado: formAdmin.estado,
        fechaCita: formAdmin.fechaCita ? formAdmin.fechaCita + ':00' : null,
        notasAdmin: formAdmin.notasAdmin,
      });
      setExito('✅ Consulta actualizada.'); setEditando(null); cargar();
    } catch { setError('Error al guardar.');
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta consulta?')) return;
    try { await eliminarConsulta(id); cargar(); } catch { setError('Error al eliminar.'); }
  };

  return (
    <div className="page">
      <h2 className="page-title">📋 Gestión de consultas</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ESTADO</label>
            <select className="form-control" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>ESPECIALIDAD</label>
            <input className="form-control" value={filtroEsp} onChange={e => setFiltroEsp(e.target.value)} placeholder="Buscar..." />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroEstado(''); setFiltroEsp(''); }}>Limpiar</button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>{filtradas.length} resultado{filtradas.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? <div className="spinner">Cargando...</div> : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead><tr>
              <th>N°</th><th>Paciente</th><th>Especialidad</th><th>Síntomas</th>
              <th>Estado</th><th>Fecha cita</th><th>Notas</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtradas.map(c => (
                <React.Fragment key={c.id}>
                  <tr>
                    <td><strong>#{c.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.nombrePaciente || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {c.usuarioId}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{c.especialidad}</td>
                    <td style={{ maxWidth: 160, fontSize: 13, color: 'var(--text-muted)' }}>
                      {c.sintomas ? c.sintomas.slice(0,60) + (c.sintomas.length > 60 ? '…' : '') : '—'}
                    </td>
                    <td><Badge estado={c.estado} /></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL', { day:'2-digit', month:'short', year:'numeric' }) : <span style={{ color: 'var(--warning)' }}>Sin asignar</span>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 120 }}>{c.notasAdmin || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => abrirEditor(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(c.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>

                  {editando === c.id && (
                    <tr>
                      <td colSpan={8} style={{ background: 'var(--primary-light)', padding: '20px 24px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--primary)' }}>
                          Editando consulta #{c.id}
                        </div>
                        <div className="grid-2" style={{ gap: 12, maxWidth: 620 }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>Estado</label>
                            <select className="form-control" value={formAdmin.estado} onChange={e => setFormAdmin({ ...formAdmin, estado: e.target.value })}>
                              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                          </div>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>Fecha de cita</label>
                            <input type="datetime-local" className="form-control" value={formAdmin.fechaCita} onChange={e => setFormAdmin({ ...formAdmin, fechaCita: e.target.value })} />
                          </div>
                          <div className="form-group" style={{ margin: 0, gridColumn: '1/-1' }}>
                            <label>Notas del administrador</label>
                            <textarea className="form-control" style={{ minHeight: 60 }} value={formAdmin.notasAdmin} onChange={e => setFormAdmin({ ...formAdmin, notasAdmin: e.target.value })} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                          <button className="btn btn-primary btn-sm" onClick={guardar} disabled={saving}>{saving ? 'Guardando...' : '💾 Guardar'}</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No hay consultas con esos filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
