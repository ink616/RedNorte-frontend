import React, { useEffect, useState } from 'react';
import { listarTodasConsultas, actualizarConsultaAdmin, cancelarYReasignar } from '../service/api';
import Badge from '@rednorte/badge';

export default function AdminReasignacionPage() {
  const [consultas,   setConsultas]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [procesando,  setProcesando]  = useState(null);
  const [motivoMap,   setMotivoMap]   = useState({});
  const [error,       setError]       = useState('');
  const [exito,       setExito]       = useState('');

  const cargar = () => {
    setLoading(true);
    listarTodasConsultas().then(setConsultas).finally(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, []);

  const agendadas  = consultas.filter(c => c.estado === 'AGENDADA' && c.bloquesAgendaId);
  const pendientes = consultas.filter(c => c.estado === 'PENDIENTE');

  const handleReasignar = async (c) => {
    const motivo = motivoMap[c.id] || 'Cancelación administrativa';
    setProcesando(c.id); setError(''); setExito('');
    try {
      await actualizarConsultaAdmin(c.id, { estado: 'CANCELADA', notasAdmin: `Cancelada: ${motivo}` });
      await cancelarYReasignar(c.bloquesAgendaId, motivo);
      setExito(`✅ Consulta #${c.id} cancelada y reasignada exitosamente.`);
      cargar();
    } catch (e) { setError(`❌ Error: ${e.message}`);
    } finally { setProcesando(null); }
  };

  return (
    <div className="page">
      <h2 className="page-title">🔄 Reasignación de citas</h2>
      <p className="page-desc">
        Cancela una cita agendada y el sistema asigna automáticamente el bloque al siguiente paciente pendiente de esa especialidad.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {exito && <div className="alert alert-success">{exito}</div>}

      {/* Citas agendadas */}
      <div className="card card-flush card-mb">
        <div className="card-header-bar">📅 Citas agendadas — cancelar y reasignar</div>
        {loading ? <div className="spinner">Cargando...</div> : agendadas.length === 0 ? (
          <div className="card-empty">No hay citas agendadas para reasignar en este momento.</div>
        ) : (
          <table className="tabla">
            <thead><tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Fecha cita</th><th>Motivo cancelación</th><th>Acción</th></tr></thead>
            <tbody>
              {agendadas.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td>{c.nombrePaciente || '—'}</td>
                  <td className="td-capitalize">{c.especialidad}</td>
                  <td className="td-sm">{c.fechaCita ? new Date(c.fechaCita).toLocaleDateString('es-CL') : '—'}</td>
                  <td>
                    <input className="form-control input-sm"
                      placeholder="Motivo de cancelación..."
                      value={motivoMap[c.id] || ''}
                      onChange={e => setMotivoMap({ ...motivoMap, [c.id]: e.target.value })} />
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm" disabled={procesando === c.id} onClick={() => handleReasignar(c)}>
                      {procesando === c.id ? 'Procesando...' : '🔄 Cancelar y reasignar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pendientes */}
      <div className="card card-flush">
        <div className="card-header-bar">⏳ Consultas pendientes de asignación ({pendientes.length})</div>
        {loading ? <div className="spinner">Cargando...</div> : pendientes.length === 0 ? (
          <div className="card-empty">No hay consultas pendientes.</div>
        ) : (
          <table className="tabla">
            <thead><tr><th>N°</th><th>Paciente</th><th>Especialidad</th><th>Síntomas</th><th>Fecha solicitud</th><th>Estado</th></tr></thead>
            <tbody>
              {pendientes.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td>{c.nombrePaciente || '—'}</td>
                  <td className="td-capitalize" style={{ fontWeight: 500 }}>{c.especialidad}</td>
                  <td className="td-muted-max">
                    {c.sintomas ? c.sintomas.slice(0, 60) + (c.sintomas.length > 60 ? '…' : '') : '—'}
                  </td>
                  <td className="td-muted">
                    {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                  </td>
                  <td><Badge estado={c.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
