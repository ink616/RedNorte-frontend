import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarTodasConsultas, actualizarConsultaAdmin, notificarCambioEstado } from '../service/api';

const ESTADOS = ['PENDIENTE', 'AGENDADA', 'ATENDIDA', 'CANCELADA'];
export default function DoctorDashboard() {
  const { usuario } = useAuth();
  const [consultas, setConsultas]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [filtro, setFiltro]                 = useState('TODAS');
  const [consultaActiva, setConsultaActiva] = useState(null);
  const [nuevoEstado, setNuevoEstado]       = useState('');
  const [notas, setNotas]                   = useState('');
  const [guardando, setGuardando]           = useState(false);
  const [exito, setExito]                   = useState('');

  const p        = usuario?.persona;
  const nombre   = p ? `Dr. ${p.apellido1} ${p.apellido2 || ''}`.trim() : 'Doctor';
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
    total:      consultas.length,
    pendientes: consultas.filter(c => c.estado === 'PENDIENTE').length,
    agendadas:  consultas.filter(c => c.estado === 'AGENDADA').length,
    atendidas:  consultas.filter(c => c.estado === 'ATENDIDA').length,
  };

  const handleActualizar = async () => {
    if (!nuevoEstado) return;
    setGuardando(true);
    try {
      await actualizarConsultaAdmin(consultaActiva.id, {
        estado: nuevoEstado,
        notasAdmin: notas,
      });
      await notificarCambioEstado(
        consultaActiva.usuarioId,
        consultaActiva.id,
        consultaActiva.estado,
        nuevoEstado
      ).catch(() => {});
      setExito('Estado actualizado correctamente.');
      setConsultaActiva(null);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch {
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="page">

      {/* Header doctor */}
      <div className="doctor-header">
        <div className="doctor-avatar">{iniciales}</div>
        <div className="doctor-header-info">
          <div className="doctor-header-nombre">{nombre}</div>
          <div className="doctor-header-mail">{usuario?.mail}</div>
          <span className="doctor-header-badge">🩺 Médico — RedNorte Clínica Digital</span>
        </div>
        <div className="doctor-header-total">
          <div className="doctor-header-total-num">{stats.total}</div>
          <div className="doctor-header-total-label">Consultas totales</div>
        </div>
      </div>

      {exito && <div className="alert alert-success">{exito}</div>}

      {/* Stats */}
      <div className="doctor-stats-grid">
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">⏳</span>
          <div className="doctor-stat-num doctor-stat-pendiente">{stats.pendientes}</div>
          <div className="doctor-stat-label">Pendientes</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">📅</span>
          <div className="doctor-stat-num doctor-stat-agendada">{stats.agendadas}</div>
          <div className="doctor-stat-label">Agendadas</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">✅</span>
          <div className="doctor-stat-num doctor-stat-atendida">{stats.atendidas}</div>
          <div className="doctor-stat-label">Atendidas</div>
        </div>
        <div className="doctor-stat-card">
          <span className="doctor-stat-icon">📋</span>
          <div className="doctor-stat-num doctor-stat-total">{stats.total}</div>
          <div className="doctor-stat-label">Total</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="doctor-filtros">
        {['TODAS', ...ESTADOS].map(e => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`doctor-filtro-btn ${filtro === e ? 'activo' : ''}`}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="spinner">Cargando consultas...</div>
      ) : (
        <div className="card doctor-tabla-wrap">
          <table className="tabla">
            <thead>
              <tr>
                <th>N°</th><th>Paciente</th><th>Especialidad</th>
                <th>Síntomas</th><th>Estado</th><th>Fecha</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.length === 0 ? (
                <tr><td colSpan={7} className="doctor-tabla-vacia">Sin consultas.</td></tr>
              ) : (
                consultasFiltradas.map(c => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.nombrePaciente || '—'}</td>
                    <td className="doctor-td-especialidad">{c.especialidad}</td>
                    <td className="doctor-td-sintomas">
                      {c.sintomas?.slice(0, 60)}{c.sintomas?.length > 60 ? '...' : ''}
                    </td>
                    <td>
                      <span className={`badge-estado badge-estado-${c.estado?.toLowerCase()}`}>{c.estado}</span>
                    </td>
                    <td className="doctor-td-fecha">
                      {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString('es-CL') : '—'}
                    </td>
                    <td>
                      <button
                        className="btn-outline-teal btn-sm"
                        onClick={() => { setConsultaActiva(c); setNuevoEstado(c.estado); setNotas(c.notasAdmin || ''); }}
                      >
                        Actualizar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {consultaActiva && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-titulo">Actualizar consulta #{consultaActiva.id}</h3>
            <p className="modal-subtitulo">{consultaActiva.nombrePaciente} — {consultaActiva.especialidad}</p>

            <div className="modal-sintomas">
              <div className="modal-sintomas-label">Síntomas del paciente</div>
              <div className="modal-sintomas-texto">{consultaActiva.sintomas}</div>
            </div>

            <div className="form-group">
              <label>Nuevo estado</label>
              <select className="form-control" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Notas médicas</label>
              <textarea className="form-control" value={notas} onChange={e => setNotas(e.target.value)}
                placeholder="Observaciones, indicaciones, próximos pasos..." rows={4} />
            </div>

            <div className="modal-btns">
              <button onClick={handleActualizar} disabled={guardando} className="btn-primary">
                {guardando ? 'Guardando...' : '💾 Guardar cambios'}
              </button>
              <button onClick={() => setConsultaActiva(null)} className="btn-outline-teal">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
